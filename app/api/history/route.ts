import { user, reply, failure, db, originOK, readBody } from '@/lib/server/runtime';
import {resultSchema,type Entry} from '@/lib/config';
import { z } from 'zod';
export async function GET(r: Request) {
    const uid = user(r);
    if (!uid)
        return failure('UNAUTHORIZED', 'Sign in to sync your history.', 401);
    try {
        const url = new URL(r.url);
        const page=Math.max(0,Math.floor(Math.min(100000,Number(url.searchParams.get('page'))||0)));
        const clauses=['user_id=?'];const args:(string|number)[]=[uid];
        const q=(url.searchParams.get('q')||'').slice(0,300),tool=url.searchParams.get('tool'),project=url.searchParams.get('project'),from=url.searchParams.get('from'),to=url.searchParams.get('to'),root=url.searchParams.get('root');
        if(q){clauses.push("(coalesce(json_extract(payload,'$.brief.idea'),'')||' '||coalesce(json_extract(payload,'$.brief.context'),'')||' '||coalesce(json_extract(payload,'$.results'),'')||' '||coalesce(json_extract(payload,'$.title'),'')) LIKE ? ESCAPE '\\'");args.push('%'+q.replace(/[\\%_]/g,'\\$&')+'%')}
        if(tool&&tool!=='all'){clauses.push("coalesce(json_extract(payload,'$.brief.tool'),'tagline')=?");args.push(tool)}
        if(project&&project!=='all'){clauses.push("coalesce(json_extract(payload,'$.brief.project'),'')=?");args.push(project==='Unfiled'?'':project)}
        if(from&&/^\d{4}-\d{2}-\d{2}$/.test(from)){clauses.push('created_at>=?');args.push(from)}
        if(to&&/^\d{4}-\d{2}-\d{2}$/.test(to)){clauses.push('created_at<?');args.push(to+'T23:59:59.999Z')}
        if(root){clauses.push("(id=? OR json_extract(payload,'$.rootId')=?)");args.push(root,root)}
        const where=clauses.join(' AND ');
        const rows=await db().prepare('SELECT payload FROM generations WHERE '+where+' ORDER BY created_at DESC,id DESC LIMIT 51 OFFSET ?').bind(...args,page*50).all<{payload:string}>();
        const total=await db().prepare('SELECT COUNT(*) AS total FROM generations WHERE '+where).bind(...args).first<{total:number}>();
        return reply({entries:rows.results.slice(0,50).map(x=>JSON.parse(x.payload)),hasMore:rows.results.length>50,total:total?.total||0});
    }
    catch {
        return failure('UNAVAILABLE', 'Could not load your history. Try again.', 503);
    }
}
export async function PATCH(r: Request) {
    const uid = user(r);
    if (!uid)
        return failure('UNAUTHORIZED', 'Sign in first.', 401);
    if (!originOK(r))
        return failure('ORIGIN', 'Request could not be verified.', 403);
    try {
        const data=z.object({id:z.string().uuid(),project:z.string().trim().max(80).optional(),format:z.enum(['plain','markdown','whatsapp']).optional(),results:z.array(resultSchema.extend({id:z.string().uuid()})).min(1).max(15).optional()}).strict().parse(await readBody(r));
        const row = await db().prepare('SELECT payload FROM generations WHERE id=? AND user_id=?').bind(data.id, uid).first<{
            payload: string;
        }>();
        if (!row)
            return failure('NOT_FOUND', 'That item is unavailable.', 404);
        const entry=JSON.parse(row.payload) as Entry;
        if(data.results){const next:Entry={...entry,id:crypto.randomUUID(),parentId:entry.id,rootId:entry.rootId||entry.id,kind:'edit',brief:{...entry.brief,format:data.format||entry.brief.format||'plain'},results:data.results.map(r=>({...r,id:crypto.randomUUID()})),createdAt:new Date().toISOString()};await db().prepare('INSERT INTO generations (id,user_id,payload,created_at) VALUES (?,?,?,?)').bind(next.id,uid,JSON.stringify(next),next.createdAt).run();return reply({entry:next})}
        if(data.project===undefined)return failure('INVALID_INPUT','Choose a project or save an edited draft.',400);
        entry.brief.project=data.project;
        await db().prepare('UPDATE generations SET payload=? WHERE id=? AND user_id=?').bind(JSON.stringify(entry), data.id, uid).run();
        return reply({ entry });
    }
    catch {
        return failure('SAVE_FAILED', 'Could not move this item.', 400);
    }
}
export async function DELETE(r: Request) { const uid = user(r); if (!uid)
    return failure('UNAUTHORIZED', 'Sign in first.', 401); if (!originOK(r))
    return failure('ORIGIN', 'Request could not be verified.', 403); const id = new URL(r.url).searchParams.get('id'); if (!id)
    return failure('INVALID_INPUT', 'Choose an item.', 400); try {
    await db().prepare('DELETE FROM generations WHERE id=? AND user_id=?').bind(id, uid).run();
    return reply({ ok: true });
}
catch {
    return failure('UNAVAILABLE', 'Could not delete this item.', 503);
} }
