import { resultSchema } from '@/lib/config';
import { user, reply, failure, db, originOK, readBody } from '@/lib/server/runtime';
import { z } from 'zod';
export async function GET(r: Request) { const uid = user(r); if (!uid)
    return failure('UNAUTHORIZED', 'Sign in to sync favorites.', 401); try {
    const rows = await db().prepare('SELECT payload FROM favorites WHERE user_id=? LIMIT 500').bind(uid).all<{
        payload: string;
    }>();
    return reply({ results: rows.results.map(x => JSON.parse(x.payload)) });
}
catch {
    return failure('UNAVAILABLE', 'Could not load favorites.', 503);
} }
export async function POST(r: Request) { const uid = user(r); if (!uid)
    return failure('UNAUTHORIZED', 'Sign in to sync favorites.', 401); if (!originOK(r))
    return failure('ORIGIN', 'Request could not be verified.', 403); try {
    const value = resultSchema.extend({ id: z.string().uuid() }).parse(await readBody(r));
    await db().batch([db().prepare('DELETE FROM favorites WHERE user_id=? AND id=?').bind(uid, value.id), db().prepare('INSERT INTO favorites (id,user_id,payload) SELECT ?,?,? WHERE (SELECT COUNT(*) FROM favorites WHERE user_id=?) < 500').bind(value.id, uid, JSON.stringify(value), uid)]);
    return reply({ ok: true });
}
catch {
    return failure('SAVE_FAILED', 'Could not save this favorite.', 400);
} }
