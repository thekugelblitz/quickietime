import {reserveAllowance,refundAllowance,availableCredits,walletBalance} from './credits';
import {sqlite} from './database';
import {setting} from './settings';
import { inputSchema, transformSchema, validatePlan, isDocument } from '../config';
import { createProvider, ProviderError, providerSettings } from './provider';
import { runtime, db, user, reply, failure, originOK, readBody, usageKey, limit } from './runtime';
export async function generate(request: Request, transform = false) {
    if (!originOK(request))
        return failure('ORIGIN', 'This request could not be verified.', 403);
    let parsed;
    try {
        parsed = (transform ? transformSchema : inputSchema).safeParse(await readBody(request));
    }
    catch {
        return failure('INVALID_INPUT', 'Keep it brief. Check your idea and try again.', 400);
    }
    if (!parsed.success)
        return failure('INVALID_INPUT', 'Add an idea, pick 1–8 tones, and check your settings.', 400);
    const b=parsed.data;
    const action=transform&&'action' in b?String(b.action):undefined;
    const invalid=validatePlan(b,!!user(request),action);
    if(invalid)return failure('PLAN_LIMIT',invalid,400);
    if(isDocument(b.tool))b.count=1;
    let parent: {id:string;rootId?:string}|undefined;
    if(b.parentId&&user(request)){
      const row=await db().prepare('SELECT payload FROM generations WHERE id=? AND user_id=?').bind(b.parentId,user(request)).first<{payload:string}>();
      if(!row)return failure('NOT_FOUND','The original draft is unavailable.',404);
      parent=JSON.parse(row.payload);
    }
    const config = runtime();
    if (!providerSettings(config).key)
        return failure('AI_NOT_CONFIGURED', 'The creative department is not connected yet. An AI provider key is needed to generate your first Quickie.', 503);
    let key: string | undefined;
    let reservation:Awaited<ReturnType<typeof reserveAllowance>>=null;
    const started=Date.now(),uid=user(request);let inputTokens=0,outputTokens=0,estimated=false,sawUsage=false;const inputRate=Number(setting('INPUT_COST_PER_MILLION','0')),outputRate=Number(setting('OUTPUT_COST_PER_MILLION','0'));
    function event(status:string){try{sqlite().prepare('INSERT INTO generation_events VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(crypto.randomUUID(),uid,b.tool,config.AI_PROVIDER||'openai',providerSettings(config).model,status,inputTokens,outputTokens,(inputTokens*inputRate+outputTokens*outputRate)/1000000,!sawUsage?'unreported':estimated?'estimated':'provider',Date.now()-started,new Date().toISOString())}catch{console.error('Generation metrics unavailable')}}
    try {
        key = await usageKey(request);
        reservation = await reserveAllowance(key, limit(request),uid);
        if (!reservation)
            return failure('RATE_LIMIT', user(request) ? 'Your daily credits are used. Buy a credit pack or return after midnight UTC.' : 'Your 5 guest credits are used. Sign in or create an account for 20 daily credits.', 429);

        const provider = createProvider(config,fetch,u=>{sawUsage=true;inputTokens+=u.input;outputTokens+=u.output;estimated ||= u.estimated});

        const output = transform && 'text' in b && 'action' in b ? await provider.transformTagline(b, b.text as string, b.action as string, !!user(request)) : await provider.generateTaglines(b, !!user(request));
        const results = output.map(r => ({ ...r, id: crypto.randomUUID() }));
        const entry = { id: crypto.randomUUID(), parentId: parent?.id, rootId:parent?.rootId||parent?.id, kind:transform?'transform':'generation', title:b.idea.slice(0,70), brief: inputSchema.strip().parse(b), results, createdAt: new Date().toISOString() };

        if (uid) {
            await db().prepare('INSERT INTO generations (id,user_id,payload,created_at) VALUES (?,?,?,?)').bind(entry.id, uid, JSON.stringify(entry), entry.createdAt).run();
        }
        event('success');
        const remaining=availableCredits(key,limit(request),uid),paidCredits=walletBalance(uid);return reply({entry,remaining,paidCredits,dailyRemaining:remaining-Math.max(0,paidCredits)});
    }
    catch (error) {
        if(reservation)refundAllowance(reservation);
        event('failed');
        const code = error instanceof ProviderError ? error.code : 'GENERATION_FAILED';
        console.error(JSON.stringify({ event: 'generation_failed', code }));
        return failure(code, code === 'OUTPUT_LIMIT' ? 'The draft exceeded your requested length. Your credit was returned; try again or increase the length.' : code === 'CONTENT_REFUSED' ? 'That brief crossed a line. Try a different angle.' : 'Well, that went horribly. Something broke on our side. Try another Quickie.', 502);
    }
}
