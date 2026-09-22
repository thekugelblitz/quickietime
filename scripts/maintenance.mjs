import {DatabaseSync} from 'node:sqlite';
const d=new DatabaseSync((process.env.DATABASE_PATH||'data/quickietime.sqlite').replace(/^["']|["']$/g,'').trim());
d.exec('PRAGMA busy_timeout=5000');
for(const table of ['sessions','admin_sessions','login_codes','rate_limits','usage'])d.prepare(`DELETE FROM ${table} WHERE expires_at<=?`).run(Date.now());
d.exec('PRAGMA wal_checkpoint(PASSIVE)');d.close();console.log('Expired authentication and rate-limit records removed.');
