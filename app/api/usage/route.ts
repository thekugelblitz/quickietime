import {walletBalance} from '@/lib/server/credits';
import {providerSettings} from '@/lib/server/provider';
import { user, reply, failure, usageKey, limit, db, runtime } from '@/lib/server/runtime';
export async function GET(r: Request) { try {
    const count = await db().prepare('SELECT count FROM usage WHERE key=?').bind(await usageKey(r)).first<{
        count: number;
    }>();
    const c = runtime();
    return reply({ authenticated: !!user(r), remaining: Math.max(0, limit(r) - (count?.count || 0))+Math.max(0,walletBalance(user(r))), paidCredits:walletBalance(user(r)), dailyRemaining:Math.max(0, limit(r) - (count?.count || 0)), limit: limit(r), configured: !!providerSettings(c).key });
}
catch {
    return failure('UNAVAILABLE', 'Usage is temporarily unavailable.', 503);
} }
