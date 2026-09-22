import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inputSchema, transformSchema, validatePlan, outputBudget, defaultBrief, allowedActions, inputLimit } from '../lib/config';
import { createProvider } from '../lib/server/provider';
import { reserve, originOK, readBody, user } from '../lib/server/runtime';
import { generate } from '../lib/server/generate';
import { GET as getHistory } from '../app/api/history/route';
import { GET as getFavorites, POST as saveFavorite } from '../app/api/favorites/route';
import { DELETE as removeFavorite } from '../app/api/favorites/[id]/route';
import { env,testCookie } from './env';
const brief = { idea: 'A midnight coffee shop', tones: ['Clever'], chaos: 4, count: 3, context: '', avoid: [] };
const output = { results: Array.from({ length: 3 }, (_, i) => ({ text: ['Tomorrow can wait.', 'Bedtime called. We declined.', 'Caffeine after curfew.'][i], style: ['Clever'], angle: 'A short contrast.', confidence: .9 })) };
const fixtureFetch = async () => Response.json({ choices: [{ message: { content: JSON.stringify(output) } }] });
function request(body: unknown, uid?: string) { return new Request('https://quickie.test/api/generate', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://quickie.test', ...(uid ? {cookie:testCookie(uid)} : {}) }, body: JSON.stringify(body) }); }
test('validates limits, quantities and known tones', () => {
    assert(inputSchema.safeParse(brief).success);
    for (const invalid of [{ ...brief, count: 20 }, { ...brief, idea: 'x' }, { ...brief, chaos: 11 }, { ...brief, tones: ['Unknown'] }, { ...brief, tones: [] }, { ...brief, admin: true }])
        assert(!inputSchema.safeParse(invalid).success);
});
test('transform requires an allowed action and source', () => { assert(!transformSchema.safeParse(brief).success); assert(transformSchema.safeParse({ ...brief, text: 'A tagline', action: 'Make it shorter' }).success); });
test('provider sends structured schema and parses results', async () => { let sent = ''; const provider = createProvider({ OPENAI_API_KEY: 'test' }, async (_url, init) => { sent = String(init?.body); return fixtureFetch(); }); const results = await provider.generateTaglines(inputSchema.parse(brief)); assert.equal(results.length, 3); assert(sent.includes('json_schema')); assert(sent.includes('distinct')); });
test('missing key fails rather than using canned outputs', async () => { await assert.rejects(createProvider({}).generateTaglines(inputSchema.parse(brief)), /AI_NOT_CONFIGURED/); });
test('malformed provider output rejected', async () => { await assert.rejects(createProvider({ OPENAI_API_KEY: 'test' }, async () => Response.json({ choices: [{ message: { content: 'oops' } }] })).generateTaglines(inputSchema.parse(brief)), /INVALID_AI_OUTPUT/); });
test('provider outage and refusal surfaced', async () => { await assert.rejects(createProvider({ OPENAI_API_KEY: 'test' }, async () => new Response('', { status: 500 })).generateTaglines(inputSchema.parse(brief)), /PROVIDER_UNAVAILABLE/); await assert.rejects(createProvider({ OPENAI_API_KEY: 'test' }, async () => Response.json({ choices: [{ message: { refusal: 'No' } }] })).generateTaglines(inputSchema.parse(brief)), /CONTENT_REFUSED/); });
test('cross-origin writes are rejected', async () => { const r = new Request('https://quickie.test/api/generate', { method: 'POST', headers: { origin: 'https://evil.test' } }); assert(!originOK(r)); assert.equal((await generate(r)).status, 403); });
test('request size cap is enforced', async () => { await assert.rejects(readBody(request({ idea: 'x'.repeat(170000) })), /BAD_BODY/); });
test('identity requires a valid server session and ignores platform headers', () => { assert.equal(user(new Request('https://quickie.test', { headers: { 'oai-authenticated-user-id': 'a' } })), null); assert.equal(user(request(brief, 'a')), 'a'); });
test('atomic SQL quota holds under concurrent requests', async () => { const results = await Promise.all(Array.from({ length: 12 }, () => reserve('quota-test', 5))); assert.equal(results.filter(Boolean).length, 5); });
test('anonymous history and cloud favorites require auth', async () => { assert.equal((await getHistory(request(brief))).status, 401); assert.equal((await getFavorites(request(brief))).status, 401); });
test('favorite CRUD is isolated by user', async () => {
    const favorite = { ...output.results[0], id: crypto.randomUUID() };
    assert.equal((await saveFavorite(request(favorite, 'alice'))).status, 200);
    const a = await (await getFavorites(request({}, 'alice'))).json() as {
        results: unknown[];
    };
    const b = await (await getFavorites(request({}, 'bob'))).json() as {
        results: unknown[];
    };
    assert.equal(a.results.length, 1);
    assert.equal(b.results.length, 0);
    await removeFavorite(request({}, 'bob'), { params: Promise.resolve({ id: favorite.id }) });
    assert.equal(((await (await getFavorites(request({}, 'alice'))).json()) as {
        results: unknown[];
    }).results.length, 1);
    await removeFavorite(request({}, 'alice'), { params: Promise.resolve({ id: favorite.id }) });
    assert.equal(((await (await getFavorites(request({}, 'alice'))).json()) as {
        results: unknown[];
    }).results.length, 0);
});
test('generation persists authenticated history and refunds provider failures', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = fixtureFetch;
    try {
        const response = await generate(request(brief, 'flow'));
        assert.equal(response.status, 200);
        const data = await response.json() as {
            entry: {
                results: unknown[];
            };
            remaining: number;
        };
        assert.equal(data.entry.results.length, 3);
        assert.equal(data.remaining, 19);
        const history = await (await getHistory(request({}, 'flow'))).json() as {
            entries: unknown[];
        };
        assert.equal(history.entries.length, 1);
        globalThis.fetch = async () => new Response('', { status: 502 });
        assert.equal((await generate(request(brief, 'flow'))).status, 502);
        globalThis.fetch = fixtureFetch;
        const retry = await (await generate(request(brief, 'flow'))).json() as {
            remaining: number;
        };
        assert.equal(retry.remaining, 18);
    }
    finally {
        globalThis.fetch = original;
    }
});
test('invalid API input fails before provider', async () => { assert.equal((await generate(request({ ...brief, count: 999 }))).status, 400); });
test('unconfigured API returns actionable 503', async () => {
    env.OPENAI_API_KEY = '';
    try {
        assert.equal((await generate(request(brief))).status, 503);
    }
    finally {
        env.OPENAI_API_KEY = 'test-only';
    }
});
test('CheaperInference uses the requested host, model and its own secret', async () => {
    let capturedUrl = '';
    let capturedBody = '';
    let auth = '';
    const provider = createProvider({ AI_PROVIDER: 'cheaperinference', CHEAPERINFERENCE_API_KEY: 'ci-test', OPENAI_API_KEY: 'wrong-provider-key' }, async (url, init) => { capturedUrl = String(url); capturedBody = String(init?.body); auth = new Headers(init?.headers).get('Authorization') || ''; return fixtureFetch(); });
    await provider.generateTaglines(inputSchema.parse(brief));
    assert.equal(capturedUrl, 'https://api.cheaperinference.com/v1/chat/completions');
    assert.equal(JSON.parse(capturedBody).model, 'gpt-5.6-luna');
    assert.equal(auth, 'Bearer ci-test');
    await assert.rejects(createProvider({ AI_PROVIDER: 'cheaperinference', OPENAI_API_KEY: 'not-a-fallback' }).generateTaglines(inputSchema.parse(brief)), /AI_NOT_CONFIGURED/);
});
test('all writing tools request correct output count and format', async () => {
    for (const tool of ['rewrite', 'summarize', 'reply', 'social', 'headlines'] as const) {
        let sent: Record<string, unknown> = {};
        const count = tool === 'headlines' ? 5 : 1;
        const provider = createProvider({ OPENAI_API_KEY: 'test' }, async (_u, init) => { sent = JSON.parse(String(init?.body)); return Response.json({ choices: [{ message: { content: JSON.stringify({ results: Array.from({ length: count }, (_, i) => ({ ...output.results[0], text: `Useful output number ${i}.` })) }) } }] }); });
        const result = await provider.generateTaglines(inputSchema.parse({ ...brief, idea:'We open at eight and close at nine every day. Coffee and tea are available.',tool,count, format: 'whatsapp' }));
        assert.equal(result.length, count);
        assert(JSON.stringify(sent).includes('*bold*'));
        assert.equal(typeof sent.max_completion_tokens, 'number');
    }
});
test('word and line ceilings reject oversized AI output', async () => { for (const text of ['word '.repeat(21), 'a\nb\nc']) {
    const provider = createProvider({ OPENAI_API_KEY: 'test' }, async () => Response.json({ choices: [{ message: { content: JSON.stringify({ results: [{ ...output.results[0], text }] }) } }] }));
    await assert.rejects(provider.generateTaglines(inputSchema.parse({ ...brief, tool: 'reply', length:'custom', maxWords: 20, maxLines: 2 })), /OUTPUT_LIMIT/);
} });
test('guest cannot claim account length limits',()=>{for(const extra of [{maxWords:700},{maxLines:50}])assert(validatePlan(inputSchema.parse({...brief,tool:'reply',length:'custom',...extra}),false));assert(validatePlan(inputSchema.parse({...brief,idea:'a'.repeat(4001)}),false));assert(validatePlan(inputSchema.parse({...brief,count:10}),false));});
test('guest quota ends with a sign-in invitation', async () => { const original = globalThis.fetch; globalThis.fetch = fixtureFetch; try {
    for (let i = 0; i < 5; i++)
        assert.equal((await generate(request(brief))).status, 200);
    const response = await generate(request(brief));
    assert.equal(response.status, 429);
    assert((await response.text()).includes('Sign in'));
}
finally {
    globalThis.fetch = original;
} });
test('project updates and deletion are scoped to owner', async () => { const { PATCH, DELETE } = await import('../app/api/history/route'); const original = globalThis.fetch; globalThis.fetch = fixtureFetch; try {
    const response = await generate(request({ ...brief, project: 'Launch' }, 'project-owner'));
    const { entry } = await response.json() as {
        entry: {
            id: string;
        };
    };
    assert.equal((await PATCH(request({ id: entry.id, project: 'Other' }, 'someone-else'))).status, 404);
    assert.equal((await PATCH(request({ id: entry.id, project: 'Website' }, 'project-owner'))).status, 200);
    const list = await (await getHistory(request({}, 'project-owner'))).json() as {
        entries: {
            brief: {
                project: string;
            };
        }[];
    };
    assert.equal(list.entries[0].brief.project, 'Website');
    const other = request({}, 'someone-else');
    await DELETE(new Request('https://quickie.test/api/history?id=' + entry.id, { method: 'DELETE', headers: other.headers }));
    assert.equal(((await (await getHistory(request({}, 'project-owner'))).json()) as {
        entries: unknown[];
    }).entries.length, 1);
    const own = request({}, 'project-owner');
    await DELETE(new Request('https://quickie.test/api/history?id=' + entry.id, { method: 'DELETE', headers: own.headers }));
    assert.equal(((await (await getHistory(request({}, 'project-owner'))).json()) as {
        entries: unknown[];
    }).entries.length, 0);
}
finally {
    globalThis.fetch = original;
} });
test('history retains over 50 records and paginates', async () => { for (let i = 0; i < 53; i++) {
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO generations (id,user_id,payload,created_at) VALUES (?,?,?,?)').bind(id, 'pagination', JSON.stringify({ id, brief }), new Date(1000 * i).toISOString()).run();
} const headers = request({}, 'pagination').headers; const first = await (await getHistory(new Request('https://quickie.test/api/history', { headers }))).json() as {
    entries: unknown[];
    hasMore: boolean;
}; assert.equal(first.entries.length, 50); assert(first.hasMore); const second = await (await getHistory(new Request('https://quickie.test/api/history?page=1', { headers }))).json() as {
    entries: unknown[];
    hasMore: boolean;
}; assert.equal(second.entries.length, 3); assert(!second.hasMore); });

test('taglines ignore legacy global word and line limits and use per-idea lengths',()=>{const b=inputSchema.parse({...brief,count:15,maxWords:20,maxLines:1,length:'punchy'});assert.equal(validatePlan(b,true),null);const budget=outputBudget(b,true);assert.equal(budget.lines,0);assert.equal(budget.count,15);assert.equal(budget.perWords,5);assert.equal(budget.words,75)});
test('tool defaults and transformations are task-specific',()=>{assert.deepEqual(defaultBrief('summarize').tones,['Neutral']);assert.equal(defaultBrief('summarize').count,1);assert(!allowedActions('summarize').includes('Make it worse'));assert(!allowedActions('reply').includes('Give me 5 more'));assert(allowedActions('tagline').includes('Make it worse'));assert(inputLimit('summarize',false)>inputLimit('tagline',false));assert(outputBudget(inputSchema.parse({...brief,tool:'summarize'}),false).words<brief.idea.split(' ').length)});
test('captions and subjects use different limits',()=>{const caption=inputSchema.parse({...brief,tool:'social',channel:'x',count:3,length:'detailed'});const cap=outputBudget(caption,false);assert.equal(cap.words,300);assert.equal(cap.characters,280);assert.equal(cap.perWords,100);assert.equal(outputBudget(inputSchema.parse({...brief,tool:'headlines',channel:'subject'}),false).characters,70)});
test('invalid output is repaired once within one provider call',async()=>{let calls=0;const provider=createProvider({OPENAI_API_KEY:'test'},async()=>{calls++;return Response.json({choices:[{message:{content:JSON.stringify(calls===1?{results:[{...output.results[0],text:'too long '.repeat(80)}]}:output)}}]})});assert.equal((await provider.generateTaglines(inputSchema.parse(brief))).length,3);assert.equal(calls,2)});
test('server search includes older records and literal percent signs, scoped to owner',async()=>{const id=crypto.randomUUID();const entry={id,brief:{...brief,idea:'Historical needle 100%_accurate',tool:'rewrite',project:'Research'},results:output.results,createdAt:'2000-01-01T00:00:00Z'};await env.DB.prepare('INSERT INTO generations (id,user_id,payload,created_at) VALUES (?,?,?,?)').bind(id,'pagination',JSON.stringify(entry),entry.createdAt).run();const headers=request({},'pagination').headers;const data=await (await getHistory(new Request('https://quickie.test/api/history?q=100%25_accurate&tool=rewrite&project=Research&from=1999-01-01&to=2001-01-01',{headers}))).json() as {total:number;entries:{id:string}[]};assert.equal(data.total,1);assert.equal(data.entries[0].id,id);const other=await(await getHistory(new Request('https://quickie.test/api/history?q=Historical',{headers:request({},'another-user').headers}))).json() as {total:number};assert.equal(other.total,0)});
test('projects can be created empty and renamed across owned history only',async()=>{const {POST,PATCH,GET}=await import('../app/api/projects/route');assert.equal((await POST(request({name:'Launch'},'pm'))).status,200);assert.equal((await POST(request({name:'Launch'},'pm'))).status,200);assert.deepEqual((await(await GET(request({},'pm'))).json() as {projects:string[]}).projects,['Launch']);assert.equal((await PATCH(request({from:'Launch',to:'Renamed'},'other'))).status,404);const id=crypto.randomUUID();await env.DB.prepare('INSERT INTO generations (id,user_id,payload,created_at) VALUES (?,?,?,?)').bind(id,'pm',JSON.stringify({id,brief:{...brief,project:'Launch'},results:output.results}),new Date().toISOString()).run();assert.equal((await PATCH(request({from:'Launch',to:'Renamed'},'pm'))).status,200);const rows=await(await getHistory(request({},'pm'))).json() as {entries:{brief:{project:string}}[]};assert.equal(rows.entries[0].brief.project,'Renamed');assert.deepEqual((await(await GET(request({},'other'))).json() as {projects:string[]}).projects,[])});
test('free edits create a new owned version and keep original content',async()=>{const {PATCH}=await import('../app/api/history/route');const id=crypto.randomUUID();const entry={id,brief:inputSchema.parse(brief),results:output.results.map(r=>({...r,id:crypto.randomUUID()})),createdAt:new Date().toISOString()};await env.DB.prepare('INSERT INTO generations (id,user_id,payload,created_at) VALUES (?,?,?,?)').bind(id,'editor',JSON.stringify(entry),entry.createdAt).run();const results=entry.results.map(r=>({...r,text:'Edited '+r.text}));const data=await(await PATCH(request({id,results,format:'markdown'},'editor'))).json() as {entry:{id:string;rootId:string;parentId:string;kind:string;brief:{format:string}}};assert.notEqual(data.entry.id,id);assert.equal(data.entry.rootId,id);assert.equal(data.entry.parentId,id);assert.equal(data.entry.kind,'edit');assert.equal(data.entry.brief.format,'markdown');const versions=await(await getHistory(new Request('https://quickie.test/api/history?root='+id,{headers:request({},'editor').headers}))).json() as {entries:{id:string;results:{text:string}[]}[]};assert.equal(versions.entries.length,2);assert.equal(versions.entries.find(e=>e.id===id)?.results[0].text,output.results[0].text);assert.equal((await PATCH(request({id,results},'stranger'))).status,404)});

test('draft recovery ignores corrupted and cross-tool data while preserving valid briefs', async()=>{
 const {readDrafts,nextDraft}=await import('../lib/studio');
 assert.deepEqual(readDrafts('{broken'),{});assert.equal(readDrafts(JSON.stringify({rewrite:defaultBrief('rewrite')})).rewrite?.idea,'');
 const b={...defaultBrief('tagline'),idea:'A friendly coffee shop'};
 const drafts=readDrafts(JSON.stringify({tagline:b,rewrite:b,social:{tool:'social'}}));
 assert.deepEqual(Object.keys(drafts),['tagline']);
 assert.equal(nextDraft('tagline',drafts,'New').idea,b.idea);
 assert.equal(nextDraft('rewrite',drafts,'New').project,'New');
});
test('every starter is valid for its tool and guest plan',async()=>{
 const {starters}=await import('../lib/studio');
 for(const [tool,examples] of Object.entries(starters))for(const example of examples){
 const b=inputSchema.parse({...defaultBrief(tool as Parameters<typeof defaultBrief>[0]),idea:example.idea,context:example.context||''});
 assert.equal(validatePlan(b,false),null);
 }
});
test('public tool metadata is unique and matches its canonical and breadcrumb',async()=>{
 const {toolMetadata,toolStructuredData,siteUrl}=await import('../lib/seo');
 const titles=new Set();
 for(const tool of ['tagline','rewrite','summarize','reply','social','headlines'] as const){
 const metadata=toolMetadata(tool);titles.add(metadata.title);
 assert.equal(metadata.alternates?.canonical,`/tools/${tool}`);
 assert.equal(metadata.twitter?.title,metadata.title);
 const json=toolStructuredData(tool);assert.equal(json['@graph'][1].itemListElement?.[1].item,`${siteUrl}/tools/${tool}`);
 }
 assert.equal(titles.size,6);assert.equal(toolMetadata('missing').robots?.index,false);
});

test('forged platform identity and random session cookies never authenticate',()=>{
 assert.equal(user(new Request('https://quickie.test',{headers:{'oai-authenticated-user-id':'alice','oai-authenticated-user-email':'alice@example.test'}})),null);
 assert.equal(user(new Request('https://quickie.test',{headers:{cookie:'qt_session='+'a'.repeat(64)}})),null);
});
test('email codes expire, lock after five mistakes and cannot be replayed',async()=>{
 const {issueCode,verifyCode}=await import('../lib/server/auth');const {sqlite}=await import('../lib/server/database');
 const good=issueCode('verified@example.test');assert(verifyCode('verified@example.test',good));assert.equal(verifyCode('verified@example.test',good),null);
 const locked=issueCode('locked@example.test');const wrong=locked==='000000'?'111111':'000000';for(let i=0;i<5;i++)assert.equal(verifyCode('locked@example.test',wrong),null);assert.equal(verifyCode('locked@example.test',locked),null);
 const expired=issueCode('expired@example.test');sqlite().prepare('UPDATE login_codes SET expires_at=0 WHERE email=?').run('expired@example.test');assert.equal(verifyCode('expired@example.test',expired),null);
});
test('expired sessions fail, sign-out clears session, redirects cannot leave the site',async()=>{
 const {sqlite}=await import('../lib/server/database');const {hash,safeReturn,sessionCookie}=await import('../lib/server/session');const {POST}=await import('../app/api/auth/logout/route');
 const cookie=testCookie('logout-user');assert.equal(user(new Request('https://quickie.test',{headers:{cookie}})),'logout-user');assert.equal((await POST(request({},'logout-user'))).status,200);assert.equal(user(new Request('https://quickie.test',{headers:{cookie}})),null);
 const expired=testCookie('expired-user');sqlite().prepare('UPDATE sessions SET expires_at=0 WHERE token_hash=?').run(hash(expired.split('=')[1]));assert.equal(user(new Request('https://quickie.test',{headers:{cookie:expired}})),null);
 for(const path of ['https://evil.test','//evil.test','/\\evil.test'])assert.equal(safeReturn(path),'/?resume=1');assert.equal(safeReturn('/dashboard'),'/dashboard');assert(sessionCookie('x').includes('HttpOnly'));assert(sessionCookie('x').includes('Secure'));
});
test('account export is scoped and deletion removes saved data and sessions',async()=>{
 const {GET,DELETE}=await import('../app/api/account/route');const {sqlite}=await import('../lib/server/database');const d=sqlite();testCookie('delete-owner');testCookie('keep-owner');
 d.prepare('INSERT INTO projects (id,user_id,name) VALUES (?,?,?)').run('delete-project','delete-owner','Private project');
 const exported=await(await GET(request({},'delete-owner'))).json();assert.equal(exported.account.email,'delete-owner@example.test');assert.equal(exported.projects.length,1);
 assert.equal((await DELETE(request({confirm:'no'},'delete-owner'))).status,400);assert.equal((await DELETE(request({confirm:'DELETE'},'delete-owner'))).status,200);assert.equal(d.prepare('SELECT 1 FROM projects WHERE user_id=?').get('delete-owner'),undefined);assert.equal(user(request({},'delete-owner')),null);assert.equal(user(request({},'keep-owner')),'keep-owner');
});
test('rate limits are atomic and allow a new window',async()=>{const {rateLimit}=await import('../lib/server/session');const {sqlite}=await import('../lib/server/database');assert(rateLimit('test-window',2,10000));assert(rateLimit('test-window',2,10000));assert(!rateLimit('test-window',2,10000));sqlite().prepare('UPDATE rate_limits SET expires_at=0 WHERE key=?').run('test-window');assert(rateLimit('test-window',2,10000))});

import {shareCardFilename,wrapCardText} from '../lib/share';
test('share cards have unique safe names even for repeated downloads',()=>{const a=shareCardFilename('../saved/result'),b=shareCardFilename('../saved/result');assert.notEqual(a,b);assert.match(a,/^quickietime-savedresult-[a-f0-9-]+\.png$/)});
test('share cards preserve paragraphs and wrap unbroken text without clipping',()=>{const lines=wrapCardText('hello world\n\nabcdefghijk',s=>s.length,5);assert.deepEqual(lines,['hello','world','','abcde','fghij','k']);assert(lines.every(s=>s.length<=5))});

import {sqlite as commerceDb} from '../lib/server/database';
import {saveSettings,setting,publicSettings,seal,unseal} from '../lib/server/settings';
import {makeOrder,fulfill,recordRefund,providers} from '../lib/server/billing';
import {walletBalance,reserveAllowance,refundAllowance,ledger} from '../lib/server/credits';
import {verifyHmac,reconcile,startCheckout} from '../lib/server/gateways';
import {GET as adminGet,POST as adminPost} from '../app/api/admin/[action]/route';
import {POST as billingPost} from '../app/api/billing/[action]/route';
import {createHmac} from 'node:crypto';
process.env.SETTINGS_ENCRYPTION_KEY='a'.repeat(64);process.env.ADMIN_SETUP_TOKEN='test-admin-setup-token-32-characters-minimum';
const actionContext=(action:string)=>({params:Promise.resolve({action})});
function adminRequest(body:unknown,cookie=''){return new Request('https://quickie.test/api/admin/setup',{method:'POST',headers:{origin:'https://quickie.test','content-type':'application/json',cookie},body:JSON.stringify(body)})}
let adminTestCookie='';
test('admin setup requires its secret and cannot be repeated; customer sessions cannot access admin',async()=>{assert.equal((await adminPost(adminRequest({email:'boss@example.test',password:'a-secure-test-password',token:'wrong'}),actionContext('setup'))).status,401);const r=await adminPost(adminRequest({email:'boss@example.test',password:'a-secure-test-password',token:process.env.ADMIN_SETUP_TOKEN}),actionContext('setup'));assert.equal(r.status,200);adminTestCookie=r.headers.get('set-cookie')!.split(';')[0];assert.match(r.headers.get('set-cookie')!,/HttpOnly; SameSite=Strict/);assert.equal((await adminPost(adminRequest({email:'other@example.test',password:'a-secure-test-password',token:process.env.ADMIN_SETUP_TOKEN}),actionContext('setup'))).status,400);assert.equal((await adminGet(request({},'ordinary'),actionContext('users'))).status,401);assert.equal((await adminGet(adminRequest({},adminTestCookie),actionContext('users'))).status,200)});
test('settings are encrypted, authenticated and secret values are masked',async()=>{saveSettings({STRIPE_SECRET_KEY:'sk_test_private',STRIPE_WEBHOOK_SECRET:'whsec_test',RAZORPAY_KEY_ID:'rzp_test',RAZORPAY_KEY_SECRET:'rzp_secret',RAZORPAY_WEBHOOK_SECRET:'rzp_hook',PAYPAL_CLIENT_ID:'pp_id',PAYPAL_CLIENT_SECRET:'pp_secret',PAYPAL_WEBHOOK_ID:'WH_test'});const row=commerceDb().prepare('SELECT value FROM settings WHERE key=?').get('STRIPE_SECRET_KEY');assert(!String(row?.value).includes('sk_test_private'));assert.equal(setting('STRIPE_SECRET_KEY'),'sk_test_private');assert.deepEqual(publicSettings().STRIPE_SECRET_KEY,{configured:true});assert.equal(unseal(seal('secret')),'secret');assert.throws(()=>unseal('broken'));assert.equal((await adminPost(request({AI_MODEL:'unauthorized'},'ordinary'),actionContext('settings'))).status,401);assert.equal((await adminPost(new Request('https://quickie.test',{method:'POST',headers:{origin:'https://evil.test',cookie:adminTestCookie}}),actionContext('settings'))).status,403)});
function commercePlan(currency='USD'){const id=crypto.randomUUID();commerceDb().prepare('INSERT INTO plans VALUES (?,?,?,?,?,?,?,?)').run(id,'Test credits','Test only',100,1000,currency,1,new Date().toISOString());return id}
test('server snapshots plan price and credits; coupon bounds, ownership and single claim are enforced',()=>{testCookie('buyer');testCookie('buyer2');const p=commercePlan();commerceDb().prepare('INSERT INTO coupons VALUES (?,?,?,?,1)').run('SAVE20',20,1,'2099-01-01T00:00:00.000Z');const key=crypto.randomUUID(),o=makeOrder('buyer',p,'stripe','SAVE20',key);assert.equal(o.amount,800);assert.equal(o.credits,100);assert.equal(makeOrder('buyer',p,'stripe','SAVE20',key).id,o.id);assert.throws(()=>makeOrder('buyer2',p,'stripe','SAVE20',crypto.randomUUID()));assert.throws(()=>makeOrder('buyer',p,'stripe','EXPIRED',crypto.randomUUID()));assert(!providers('INR').includes('paypal'));commerceDb().prepare('UPDATE plans SET amount=5000,credits=2 WHERE id=?').run(p);assert.equal(o.amount,800);assert.equal(o.credits,100)});
test('fulfillment checks amount, currency and provider reference and is idempotent',()=>{const o=makeOrder('buyer',commercePlan(),'stripe','',crypto.randomUUID());commerceDb().prepare('UPDATE orders SET provider_id=? WHERE id=?').run('cs_fulfill',o.id);assert.throws(()=>fulfill(o.id,'wrong',1000,'USD'));assert.throws(()=>fulfill(o.id,'cs_fulfill',1,'USD'));assert.throws(()=>fulfill(o.id,'cs_fulfill',1000,'INR'));assert(fulfill(o.id,'cs_fulfill',1000,'USD'));assert(!fulfill(o.id,'cs_fulfill',1000,'USD'));assert.equal(walletBalance('buyer'),100);recordRefund(o.id,500);assert.equal(walletBalance('buyer'),50);recordRefund(o.id,500);assert.equal(walletBalance('buyer'),50);recordRefund(o.id,1000);assert.equal(walletBalance('buyer'),0);assert.throws(()=>recordRefund(o.id,1001))});
test('daily credits are spent before purchased credits and failures return the correct allowance',async()=>{testCookie('credit-buyer');ledger('credit-buyer',2,'test');const a=await reserveAllowance('paid-test',1,'credit-buyer');assert.equal(a?.kind,'daily');assert.equal(walletBalance('credit-buyer'),2);const b=await reserveAllowance('paid-test',1,'credit-buyer');assert.equal(b?.kind,'paid');assert.equal(walletBalance('credit-buyer'),1);refundAllowance(b!);assert.equal(walletBalance('credit-buyer'),2);refundAllowance(a!);assert.equal((await reserveAllowance('paid-test',1,'credit-buyer'))?.kind,'daily')});
test('Stripe and Razorpay webhook signatures reject tampering and Stripe rejects stale events',()=>{const body='{"id":"evt_test"}',t=Math.floor(Date.now()/1000);const sig=createHmac('sha256','whsec_test').update(t+'.'+body).digest('hex');assert(verifyHmac('stripe',body,`t=${t},v1=${sig}`));assert(!verifyHmac('stripe',body+' ',`t=${t},v1=${sig}`));assert(!verifyHmac('stripe',body,`t=${t},v1=${sig}`,Date.now()+600000));const razor=createHmac('sha256','rzp_hook').update(body).digest('hex');assert(verifyHmac('razorpay',body,razor));assert(!verifyHmac('razorpay',body,'wrong'))});
test('checkout authentication and order ownership are enforced',async()=>{assert.equal((await billingPost(request({}),actionContext('checkout'))).status,401);const o=makeOrder('buyer',commercePlan(),'stripe','',crypto.randomUUID());assert.equal((await billingPost(request({id:o.id},'buyer2'),actionContext('verify'))).status,404)});
test('all three gateways create hosted checkout and only grant verified paid orders',async()=>{const original=globalThis.fetch;try{for(const provider of ['stripe','paypal','razorpay'] as const){testCookie('gateway-'+provider);const order=makeOrder('gateway-'+provider,commercePlan(),provider,'',crypto.randomUUID());const pid=provider+'_remote';let paid=false;const seen:string[]=[];globalThis.fetch=async(url,init)=>{const path=String(url);seen.push(path);if(path.endsWith('/oauth2/token'))return Response.json({access_token:'test-token'});if(init?.method==='POST'&&!path.endsWith('/capture'))return Response.json(provider==='stripe'?{id:pid,url:'https://checkout.stripe.com/test'}:provider==='paypal'?{id:pid,links:[{rel:'payer-action',href:'https://www.sandbox.paypal.com/checkoutnow?token=test'}]}:{id:pid,short_url:'https://rzp.io/i/test'});return Response.json(provider==='stripe'?{id:pid,payment_status:paid?'paid':'unpaid',client_reference_id:order.id,amount_total:order.amount,currency:order.currency}:provider==='razorpay'?{id:pid,status:paid?'paid':'created',reference_id:order.id,amount:order.amount,amount_paid:paid?order.amount:0,currency:order.currency}:{id:pid,status:paid?'COMPLETED':'CREATED',purchase_units:[{reference_id:order.id,payments:{captures:paid?[{id:'capture-test',status:'COMPLETED',amount:{value:(order.amount/100).toFixed(2),currency_code:order.currency}}]:[]}}]})};const url=await startCheckout(order);assert(url.startsWith('https:'));await reconcile(order.id);assert.equal(walletBalance('gateway-'+provider),0);paid=true;await reconcile(order.id);await reconcile(order.id);assert.equal(walletBalance('gateway-'+provider),100);assert(seen.length>=3)}}finally{globalThis.fetch=original}});
test('suspended accounts lose sessions and cannot access saved data',async()=>{const id=crypto.randomUUID();testCookie(id);const r=await adminPost(adminRequest({id,suspended:true,reason:'test suspension'},adminTestCookie),actionContext('users'));assert.equal(r.status,200);assert.equal(user(request({},id)),null);assert.equal((await getHistory(request({},id))).status,401)});
test('webhook handler rejects forged events and processes signed Stripe events once',async()=>{const {webhook}=await import('../lib/server/gateways');const o=makeOrder('buyer2',commercePlan(),'stripe','',crypto.randomUUID());commerceDb().prepare('UPDATE orders SET provider_id=? WHERE id=?').run('cs_webhook',o.id);const body=JSON.stringify({id:'evt_success_test',type:'checkout.session.completed',data:{object:{id:'cs_webhook'}}});await assert.rejects(()=>webhook('stripe',new Request('https://quickie.test/api/webhooks/stripe',{method:'POST',body,headers:{'stripe-signature':'bad'}})));const before=walletBalance('buyer2'),t=Math.floor(Date.now()/1000),sig=createHmac('sha256','whsec_test').update(t+'.'+body).digest('hex'),original=globalThis.fetch;globalThis.fetch=async()=>Response.json({id:'cs_webhook',client_reference_id:o.id,payment_status:'paid',amount_total:o.amount,currency:o.currency});try{for(let i=0;i<2;i++)await webhook('stripe',new Request('https://quickie.test/api/webhooks/stripe',{method:'POST',body,headers:{'stripe-signature':`t=${t},v1=${sig}`}}));assert.equal(walletBalance('buyer2'),before+100)}finally{globalThis.fetch=original}});
test('PayPal webhook verification is checked server-side before processing',async()=>{const {verifyPaypal}=await import('../lib/server/gateways');const original=globalThis.fetch;try{globalThis.fetch=async(url)=>Response.json(String(url).endsWith('/oauth2/token')?{access_token:'test'}:{verification_status:'FAILURE'});assert.equal(await verifyPaypal(new Headers(),{id:'fake-event'}),false)}finally{globalThis.fetch=original}});
