import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,verify} from 'node:crypto';
import {buildAppleClientSecret} from '../scripts/apple-client-secret.mjs';
const {privateKey,publicKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'});
const options={teamId:'TEAMID1234',keyId:'KEYID12345',clientId:'com.dmvsmartprep.auth',privateKey:privateKey.export({format:'pem',type:'pkcs8'}),nowSeconds:1800000000};
test('Apple secret has correct audience, service ID, expiry and verifiable ES256 signature',()=>{
 const {token}=buildAppleClientSecret(options);const [head,body,signature]=token.split('.');const header=JSON.parse(Buffer.from(head,'base64url')),claims=JSON.parse(Buffer.from(body,'base64url'));
 assert.equal(header.alg,'ES256');assert.equal(header.kid,options.keyId);assert.equal(claims.iss,options.teamId);assert.equal(claims.sub,options.clientId);assert.equal(claims.aud,'https://appleid.apple.com');assert.equal(claims.exp-claims.iat,180*86400);
 assert.equal(Buffer.from(signature,'base64url').length,64);assert.equal(verify('sha256',Buffer.from(head+'.'+body),{key:publicKey,dsaEncoding:'ieee-p1363'},Buffer.from(signature,'base64url')),true);
});
test('Invalid identifiers, excessive lifetime and wrong key curves are rejected',()=>{
 assert.throws(()=>buildAppleClientSecret({...options,teamId:'wrong'}));assert.throws(()=>buildAppleClientSecret({...options,keyId:''}));assert.throws(()=>buildAppleClientSecret({...options,expiresInSeconds:15777001}));
 const other=generateKeyPairSync('ec',{namedCurve:'secp384r1'}).privateKey.export({format:'pem',type:'pkcs8'});assert.throws(()=>buildAppleClientSecret({...options,privateKey:other}),/P-256/);
});
