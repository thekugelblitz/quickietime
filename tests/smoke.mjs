import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {mkdtempSync,cpSync,existsSync,readdirSync,realpathSync,readlinkSync,unlinkSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {randomBytes,createHmac} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
const root=process.cwd(),serverFile=resolve('dist/server.mjs'),temp=mkdtempSync(join(tmpdir(),'quickietime-smoke-'));
assert(existsSync(serverFile),'Run the production build first (pnpm build).');
const origin=process.env.SMOKE_SITE_URL||'https://qtai.click',port=Number(process.env.SMOKE_PORT||3187),base=`http://127.0.0.1:${port}`,secret=randomBytes(32).toString('hex'),dbPath=join(temp,'db.sqlite');
const child=spawn(process.execPath,[serverFile],{cwd:root,env:{...process.env,NODE_ENV:'production',HOSTNAME:'127.0.0.1',PORT:String(port),SITE_URL:origin,AUTH_SECRET:secret,SETTINGS_ENCRYPTION_KEY:'c'.repeat(64),ADMIN_SETUP_TOKEN:secret,DATABASE_PATH:dbPath,TRUST_PROXY:'true',OPENAI_API_KEY:'',CHEAPERINFERENCE_API_KEY:'',OPENROUTER_API_KEY:'',SMTP_HOST:''},stdio:['ignore','pipe','pipe']});
let log='';child.stdout.on('data',d=>{log+=d});child.stderr.on('data',d=>{log+=d});
async function request(path,{body,method='GET',cookie,headers={}}={}){return fetch(base+path,{method,redirect:'manual',headers:{origin,...(body?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{}),...headers},body:body?JSON.stringify(body):undefined})}
try{
 let ready=false;for(let i=0;i<60;i++){try{const r=await request('/api/health');if(r.ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,300));}assert(ready,'Standalone server failed: '+log.slice(-2000));
 const sitemap=await(await request('/sitemap.xml')).text();const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]);assert.equal(urls.length,76);const paths=new Set(urls.map(u=>new URL(u).pathname));
 for(const url of urls){assert(url.startsWith(origin),'Stale sitemap origin: '+url);const r=await request(new URL(url).pathname);assert.equal(r.status,200,url);const html=await r.text();assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,url+' needs one H1');const canonical=html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1];assert.equal(canonical?.replace(/\/$/,''),url.replace(/\/$/,''),'Canonical mismatch: '+url);assert(html.includes('name="description"'),'Description missing');assert(!html.includes('quickietime.hosting.chatgpt.site'),'Old-host URL leaked');for(const tag of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs))JSON.parse(tag[1]);for(const link of html.matchAll(/<a[^>]+href="([^"]+)"/g)){const href=link[1];if(!href.startsWith('/')||href.startsWith('//'))continue;const path=new URL(href,origin).pathname;if(['/auth','/account','/dashboard','/billing','/checkout','/bhai'].includes(path)||path.startsWith('/api/'))continue;assert(paths.has(path),'Broken internal route '+path+' on '+url)}}
 console.log('PASS: '+urls.length+' public pages, H1s, descriptions, canonicals, structured data and internal links.');
 for(const path of ['/llms.txt','/llms-full.txt','/robots.txt']){const r=await request(path);assert.equal(r.status,200);const text=await r.text();assert(!text.includes('hosting.chatgpt.site'));assert(text.length>150)}
 assert.equal((await request('/not-a-real-page')).status,404);
 assert.equal((await request('/api/history',{headers:{'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'owner@example.test'}})).status,401);
 assert.equal((await request('/dashboard')).status,307);
 const guest=await(await request('/api/usage')).json();assert.equal(guest.limit,5);assert.equal(guest.authenticated,false);
 assert.equal((await request('/api/auth/verify',{method:'POST',headers:{origin:'https://evil.test'},body:{email:'qa@example.test',code:'123456'}})).status,403);
 const database=new DatabaseSync(dbPath);const email='qa@example.test',code='123456';const digest=createHmac('sha256',secret).update(email+':'+code).digest('hex');database.prepare('INSERT INTO login_codes (email,code_hash,expires_at,attempts) VALUES (?,?,?,0)').run(email,digest,Date.now()+600000);
 const verified=await request('/api/auth/verify',{method:'POST',body:{email,code,returnTo:'//evil.test'}});assert.equal(verified.status,200);const cookie=verified.headers.get('set-cookie').split(';')[0];assert(verified.headers.get('set-cookie').includes('HttpOnly'));assert(verified.headers.get('set-cookie').includes('Secure'));assert.equal((await verified.json()).redirect,'/?resume=1');
 assert.equal((await request('/api/auth/verify',{method:'POST',body:{email,code}})).status,400);
 const account=await(await request('/api/usage',{cookie})).json();assert.equal(account.limit,20);assert.equal(account.authenticated,true);
 assert.equal((await request('/dashboard',{cookie})).status,200);
 assert.equal((await request('/api/projects',{method:'POST',cookie,body:{name:'Smoke project'}})).status,200);assert((await(await request('/api/projects',{cookie})).json()).projects.includes('Smoke project'));
 assert.equal((await request('/api/generate',{method:'POST',cookie,body:{idea:'A midnight coffee shop',tones:['Clever'],chaos:3,count:3}})).status,503);
 assert.equal((await(await request('/api/usage',{cookie})).json()).remaining,20);
 assert.equal((await request('/api/auth/logout',{method:'POST',cookie,body:{}})).status,200);assert.equal((await request('/api/projects',{cookie})).status,401);
 const setup=await request('/api/admin/setup',{method:'POST',body:{email:'admin@example.test',password:'testing-admin-password-only',token:secret}});assert.equal(setup.status,200);const adminCookie=setup.headers.get('set-cookie').split(';')[0];
 assert.equal((await request('/api/admin/settings',{cookie})).status,401);
 assert.equal((await request('/api/admin/settings',{method:'POST',cookie:adminCookie,body:{STRIPE_SECRET_KEY:'sk_test_isolated',STRIPE_WEBHOOK_SECRET:'whsec_isolated',INPUT_COST_PER_MILLION:'0.5',OUTPUT_COST_PER_MILLION:'1.5'}})).status,200);
 const settings=await(await request('/api/admin/settings',{cookie:adminCookie})).json();assert.deepEqual(settings.settings.STRIPE_SECRET_KEY,{configured:true});assert(!JSON.stringify(settings).includes('sk_test_isolated'));
 const published=await request('/api/admin/plans',{method:'POST',cookie:adminCookie,body:{name:'Smoke credit pack',description:'Isolated production test',amount:900,credits:50,currency:'USD',active:true}});assert.equal(published.status,200);assert((await(await request('/pricing')).text()).includes('Smoke credit pack'));
 const adminPage=await request('/bhai',{cookie:adminCookie});assert.equal(adminPage.status,200,log.slice(-1600));assert((await adminPage.text()).includes('Connections &amp; costs'));
 const metrics=await(await request('/api/admin/metrics',{cookie:adminCookie})).json();assert.equal(metrics.users,1);assert.equal((await request('/api/admin/coupons',{method:'POST',cookie:adminCookie,body:{code:'SMOKE10',percent:10,max_uses:2,expires_at:'2099-01-01T00:00:00.000Z',active:true}})).status,200);
 assert.equal((await request('/api/admin/logout',{method:'POST',cookie:adminCookie,body:{}})).status,200);assert.equal((await request('/api/admin/orders',{cookie:adminCookie})).status,401);
 console.log('PASS: production admin isolation, setup, encrypted settings, plans on pricing, coupons, metrics and logout.');
 database.close();const backup=spawnSync(process.execPath,['scripts/backup.mjs'],{cwd:root,env:{...process.env,DATABASE_PATH:dbPath,BACKUP_DIR:join(temp,'backups')},encoding:'utf8'});assert.equal(backup.status,0,backup.stderr);console.log('PASS: consistent backup and integrity check.');console.log('PASS: real HTTP auth, replay rejection, redirects, 5/20 quotas, projects, logout and missing-provider behavior.');
}finally{child.kill('SIGTERM');if(child.exitCode===null)await new Promise(r=>child.once('exit',r));process.chdir(root)}
