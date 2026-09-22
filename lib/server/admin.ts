import {scryptSync,randomBytes,timingSafeEqual} from 'node:crypto';
import {sqlite} from './database';
import {hash} from './session';
export function equal(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}
export function passwordHash(password:string){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex')}
export function passwordOK(password:string,stored:string){const [salt,digest]=stored.split(':');return !!salt&&!!digest&&equal(scryptSync(password,salt,64).toString('hex'),digest)}
export function adminUser(r:Request){const token=r.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('qt_admin='))?.slice(9);if(!token||!/^[a-f0-9]{64}$/.test(token))return null;return sqlite().prepare('SELECT a.id,a.email FROM admin_sessions s JOIN admin_accounts a ON a.id=s.admin_id WHERE s.token_hash=? AND s.expires_at>?').get(hash(token),Date.now()) as {id:string;email:string}|undefined||null}
export function adminCookie(token:string,clear=false){return `qt_admin=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear?0:43200}${(process.env.SITE_URL||'').startsWith('https:')?'; Secure':''}`}
export function adminSession(id:string){const token=randomBytes(32).toString('hex');sqlite().prepare('INSERT INTO admin_sessions VALUES (?,?,?)').run(hash(token),id,Date.now()+43200000);return token}
export function audit(adminId:string,action:string,target:string){sqlite().prepare('INSERT INTO audit_log (admin_id,action,target,created_at) VALUES (?,?,?,?)').run(adminId,action,target,new Date().toISOString())}
