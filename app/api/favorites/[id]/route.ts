import { user, reply, failure, db, originOK } from '@/lib/server/runtime';
export async function DELETE(r: Request, { params }: {
    params: Promise<{
        id: string;
    }>;
}) { const uid = user(r); if (!uid)
    return failure('UNAUTHORIZED', 'Sign in to sync favorites.', 401); if (!originOK(r))
    return failure('ORIGIN', 'Request could not be verified.', 403); try {
    await db().prepare('DELETE FROM favorites WHERE user_id=? AND id=?').bind(uid, (await params).id).run();
    return reply({ ok: true });
}
catch {
    return failure('UNAVAILABLE', 'Could not remove favorite.', 503);
} }
