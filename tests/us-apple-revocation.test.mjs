import test from 'node:test';
import assert from 'node:assert/strict';
import { revokeAppleAuthorization } from '../supabase/functions/_shared/apple-revocation.ts';
const options={code:'one-use-code',clientId:'com.test.us',clientSecret:'server-only-secret',subjects:['apple-sub'],verifyToken:async()=>({sub:'apple-sub'})};
test('Apple code exchange and revocation use only server secrets and verified linked subject',async()=>{
 const calls=[];
 await revokeAppleAuthorization({...options,fetcher:async(url,request)=>{
  calls.push({url,body:Object.fromEntries(request.body)});
  return calls.length===1?Response.json({id_token:'signed-token',refresh_token:'server-refresh'}):new Response(null,{status:200});
 }});
 assert.equal(calls[0].body.grant_type,'authorization_code');assert.equal(calls[1].body.token_type_hint,'refresh_token');assert.equal(calls[1].body.token,'server-refresh');
});
test('an unlinked Apple subject cannot revoke another authorization',async()=>{
 let calls=0;
 await assert.rejects(revokeAppleAuthorization({...options,verifyToken:async()=>({sub:'another-user'}),fetcher:async()=>{calls++;return Response.json({id_token:'wrong-user-token',refresh_token:'secret'});}}),/subject_mismatch/);
 assert.equal(calls,1);
});
