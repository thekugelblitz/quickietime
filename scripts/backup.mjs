import {DatabaseSync,backup} from 'node:sqlite';
import {mkdirSync,readdirSync,statSync,unlinkSync} from 'node:fs';
import {join} from 'node:path';
const directory=(process.env.BACKUP_DIR||'/app/backups').replace(/^["']|["']$/g,'').trim();mkdirSync(directory,{recursive:true});
const source=new DatabaseSync((process.env.DATABASE_PATH||'data/quickietime.sqlite').replace(/^["']|["']$/g,'').trim(),{readOnly:true});
const target=join(directory,'quickietime-'+new Date().toISOString().replace(/[:.]/g,'-')+'.sqlite');
await backup(source,target);source.close();
const check=new DatabaseSync(target,{readOnly:true});const result=check.prepare('PRAGMA integrity_check').get();check.close();if(result.integrity_check!=='ok')throw new Error('Backup integrity check failed.');
const days=Math.max(1,Number(process.env.BACKUP_RETENTION_DAYS)||30);
for(const file of readdirSync(directory)){if(!/^quickietime-\d{4}-.*\.sqlite$/.test(file))continue;const path=join(directory,file);if(statSync(path).mtimeMs<Date.now()-days*86400000)unlinkSync(path)}
console.log('Verified backup written to '+target);
