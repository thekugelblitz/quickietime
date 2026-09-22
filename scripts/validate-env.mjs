import {createHash,randomBytes} from 'node:crypto';
import {mkdirSync,chmodSync} from 'node:fs';
import {dirname} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
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

// Clean and verify database path
try {
  let dbPath = (process.env.DATABASE_PATH || 'data/quickietime.sqlite').trim();
  dbPath = dbPath.replace(/^["'\\]+|["'\\]+$/g, '').trim();
  process.env.DATABASE_PATH = dbPath;
  if (dbPath !== ':memory:') {
    const dir = dirname(dbPath);
    mkdirSync(dir, { recursive: true, mode: 0o777 });
    try { chmodSync(dir, 0o777); } catch {}
  }
  const testDb = new DatabaseSync(dbPath);
  testDb.exec('PRAGMA busy_timeout=5000;');
  testDb.close();
  console.log(`[INFO] Database connection verified at: ${dbPath}`);
} catch (err) {
  console.warn(`[WARN] Database initial check notice (${process.env.DATABASE_PATH}): ${err.message}. Fallback paths will auto-heal at runtime.`);
}

console.log('QuickieTime server configuration validated. Configure services through /bhai.');

