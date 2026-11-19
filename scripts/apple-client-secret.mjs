import {createPrivateKey,sign} from 'node:crypto';
import {readFileSync,mkdirSync,writeFileSync,renameSync,chmodSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';

export function buildAppleClientSecret({teamId,keyId,clientId,privateKey,nowSeconds=Math.floor(Date.now()/1000),expiresInSeconds=180*24*60*60}){
 if(!/^[A-Z0-9]{10}$/.test(teamId??''))throw new Error('Team ID must contain 10 uppercase letters/digits.');
 if(!/^[A-Z0-9]{10}$/.test(keyId??''))throw new Error('Key ID must contain 10 uppercase letters/digits.');
 if(typeof clientId!=='string'||!/^[-A-Za-z0-9]+(?:\.[-A-Za-z0-9]+)+$/.test(clientId))throw new Error('A valid Services ID is required.');
 if(!Number.isInteger(nowSeconds)||nowSeconds<=0||!Number.isInteger(expiresInSeconds)||expiresInSeconds<1||expiresInSeconds>15777000)throw new Error('Invalid token lifetime.');
 const key=createPrivateKey(privateKey);
 if(key.asymmetricKeyType!=='ec'||key.asymmetricKeyDetails?.namedCurve!=='prime256v1')throw new Error('Apple requires an ES256 / P-256 key.');
 const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
 const header={alg:'ES256',kid:keyId,typ:'JWT'};
 const claims={iss:teamId,iat:nowSeconds,exp:nowSeconds+expiresInSeconds,aud:'https://appleid.apple.com',sub:clientId};
 const data=encode(header)+'.'+encode(claims);
 const signature=sign('sha256',Buffer.from(data),{key,dsaEncoding:'ieee-p1363'}).toString('base64url');
 return {token:data+'.'+signature,expiresAt:new Date(claims.exp*1000).toISOString()};
}
function main(){
 const args=process.argv.slice(2),options={};
 for(let i=0;i<args.length;i+=2){if(!args[i]?.startsWith('--')||!args[i+1])throw new Error('Use --team-id ID --key-id ID --key-file PATH [--client-id ID] [--out PATH].');options[args[i].slice(2)]=args[i+1];}
 const file=options['key-file'];if(!file)throw new Error('--key-file is required.');
 const {token,expiresAt}=buildAppleClientSecret({teamId:options['team-id'],keyId:options['key-id'],clientId:options['client-id']??'com.dmvsmartprep.auth',privateKey:readFileSync(file)});
 const output=resolve(options.out??'.secrets/apple-client-secret.jwt');
 mkdirSync(dirname(output),{recursive:true,mode:0o700});
 const temporary=output+'.'+process.pid+'.tmp';
 writeFileSync(temporary,token+'\n',{mode:0o600,flag:'wx'});renameSync(temporary,output);chmodSync(output,0o600);
 console.log('Apple Client Secret saved locally: '+output);
 console.log('Expires (UTC): '+expiresAt);
 console.log('The secret and private key were not printed.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){try{main();}catch(error){console.error('Could not generate Apple Client Secret: '+error.message);process.exitCode=1;}}
