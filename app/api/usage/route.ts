import {walletBalance} from '@/lib/server/credits';
import {providerSettings} from '@/lib/server/provider';
import {user, reply, usageKey, limit, db, runtime} from '@/lib/server/runtime';

export const dynamic = 'force-dynamic';

export async function GET(r: Request) {
  try {
    const uid = user(r);
    let usedCount = 0;
    try {
      const key = await usageKey(r);
      const count = await db()
        .prepare('SELECT count FROM usage WHERE key=?')
        .bind(key)
        .first<{count: number}>();
      usedCount = count?.count || 0;
    } catch (err) {
      console.warn('[Usage count lookup warning]', err);
    }

    const c = runtime();
    let configured = false;
    try {
      configured = !!providerSettings(c).key;
    } catch {
      configured = false;
    }

    const userLimit = limit(r);
    const balance = walletBalance(uid);
    const dailyRemaining = Math.max(0, userLimit - usedCount);
    const remaining = dailyRemaining + Math.max(0, balance);

    return reply({
      authenticated: !!uid,
      remaining,
      paidCredits: balance,
      dailyRemaining,
      limit: userLimit,
      configured
    });
  } catch (err) {
    console.error('[GET /api/usage error]', err);
    return reply({
      authenticated: false,
      remaining: 5,
      paidCredits: 0,
      dailyRemaining: 5,
      limit: 5,
      configured: false
    });
  }
}
