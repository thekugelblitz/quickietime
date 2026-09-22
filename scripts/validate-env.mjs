import {createHash,randomBytes} from 'node:crypto';
import {validatePublic} from './validate-public-config.mjs';

validatePublic();

if(!process.env.AUTH_SECRET){
  process.env.AUTH_SECRET=randomBytes(32).toString('hex');
  console.warn('[WARN] AUTH_SECRET was missing; generated a random runtime secret.');
}else if(process.env.AUTH_SECRET.length<32){
  process.env.AUTH_SECRET=createHash('sha256').update(process.env.AUTH_SECRET).digest('hex');
  console.warn('[INFO] AUTH_SECRET adapted to 64-char hash for security compliance.');
}

if(!process.env.SETTINGS_ENCRYPTION_KEY||!/^[a-f0-9]{64}$/i.test(process.env.SETTINGS_ENCRYPTION_KEY)){
  const raw=process.env.SETTINGS_ENCRYPTION_KEY||process.env.AUTH_SECRET||'quickietimeappqtaiclick';
  process.env.SETTINGS_ENCRYPTION_KEY=createHash('sha256').update(raw).digest('hex');
  console.warn('[INFO] SETTINGS_ENCRYPTION_KEY derived into valid 64-character hex key.');
}

console.log('QuickieTime server configuration validated. Configure services through /bhai.');
