import {validatePublic} from './validate-public-config.mjs';
validatePublic();
if(!process.env.AUTH_SECRET||process.env.AUTH_SECRET.length<32)throw new Error('AUTH_SECRET must contain at least 32 random characters.');
if(!/^[a-f0-9]{64}$/i.test(process.env.SETTINGS_ENCRYPTION_KEY||''))throw new Error('SETTINGS_ENCRYPTION_KEY must be 64 hex characters. Keep it stable and backed up.');
// AI, SMTP and payment credentials are configured securely in /bhai after first deployment.
console.log('QuickieTime server configuration validated. Configure services through /bhai.');
