// Deploy only to the US project. No credentials or provider tokens are logged.
import { createClient } from 'npm:@supabase/supabase-js@2.95.3';
import { createRemoteJWKSet, jwtVerify } from 'npm:jose@6.2.15';
import { revokeAppleAuthorization } from '../_shared/apple-revocation.ts';
const appleKeys = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));
Deno.serve(async (request: Request) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info' };
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: cors });
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (request.method !== 'POST') return reply({ error: 'method_not_allowed' }, 405);
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return reply({ error: 'unauthorized' }, 401);
  let body: { confirm?: boolean; appleAuthorizationCode?: string };
  try { body = await request.json(); } catch { return reply({ error: 'invalid_request' }, 400); }
  if (body?.confirm !== true) return reply({ error: 'confirmation_required' }, 400);
  const url = Deno.env.get('SUPABASE_URL')!, anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const caller = createClient(url, anon, { auth: { persistSession: false }, global: { headers: { Authorization: header } } });
  const { data, error } = await caller.auth.getUser();
  if (error || !data.user) return reply({ error: 'unauthorized' }, 401);
  const appleIdentities = (data.user.identities ?? []).filter((identity) => identity.provider === 'apple');
  let appleRevoked: boolean | null = null;
  if (appleIdentities.length) {
    appleRevoked = false;
    try {
      await revokeAppleAuthorization({
        code: typeof body.appleAuthorizationCode === 'string' ? body.appleAuthorizationCode : '',
        clientId: Deno.env.get('US_APPLE_CLIENT_ID') || '',
        clientSecret: Deno.env.get('US_APPLE_CLIENT_SECRET') || '',
        subjects: appleIdentities.map((identity) => identity.identity_data?.sub).filter((sub): sub is string => typeof sub === 'string'),
        verifyToken: async (token, audience) => (await jwtVerify(token, appleKeys, {
          issuer: 'https://appleid.apple.com', audience, algorithms: ['RS256'],
        })).payload,
      });
      appleRevoked = true;
    } catch {
      // Apple TN3194: fulfill account deletion even when no revocable token is
      // available. The client explains how to remove the remaining Apple grant.
    }
  }
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const deleted = await admin.auth.admin.deleteUser(data.user.id);
  if (deleted.error) return reply({ error: 'deletion_failed' }, 500);
  return reply({ deleted: true, appleRevoked });
});
