// Apple secrets/tokens stay on the server. A fresh native authorization code is
// exchanged once; validate its ID token subject before revoking any credential.
export async function revokeAppleAuthorization(options: {
  code: string; clientId: string; clientSecret: string; subjects: string[];
  verifyToken: (token: string, audience: string) => Promise<{ sub?: string }>;
  fetcher?: typeof fetch;
}) {
  const { code, clientId, clientSecret, subjects, verifyToken } = options;
  if (!code || !clientId || !clientSecret || !subjects.length) throw new Error('apple_revocation_unavailable');
  const request = options.fetcher ?? fetch;
  const response = await request('https://appleid.apple.com/auth/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, grant_type: 'authorization_code' }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('apple_exchange_failed');
  const tokens = await response.json();
  if (typeof tokens.id_token !== 'string') throw new Error('apple_invalid_token');
  const claims = await verifyToken(tokens.id_token, clientId);
  if (!claims.sub || !subjects.includes(claims.sub)) throw new Error('apple_subject_mismatch');
  const refresh = typeof tokens.refresh_token === 'string';
  const token = refresh ? tokens.refresh_token : tokens.access_token;
  if (typeof token !== 'string' || !token) throw new Error('apple_missing_token');
  const revoked = await request('https://appleid.apple.com/auth/revoke', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, token,
      token_type_hint: refresh ? 'refresh_token' : 'access_token' }),
    signal: AbortSignal.timeout(15000),
  });
  if (!revoked.ok) throw new Error('apple_revocation_failed');
}
