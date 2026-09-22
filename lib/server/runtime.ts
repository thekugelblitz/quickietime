import {settingsConfig} from './settings';
import {database} from './database';
import {sessionUser,clientIp} from './session';
import type {AIConfig} from './provider';
export function runtime(){return {...process.env,...settingsConfig(),DB:database} as AIConfig & {DB:typeof database;ANON_DAILY_LIMIT?:string;AUTH_DAILY_LIMIT?:string;RATE_LIMIT_SALT?:string}}
export function db(){return database}
export function user(request:Request){return sessionUser(request.headers.get('cookie'))?.id||null}
export function reply(data: unknown, status = 200) { return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } }); }
export function failure(code: string, message: string, status: number) { return reply({ error: { code, message } }, status); }
export function originOK(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const siteUrl = (process.env.SITE_URL || '').replace(/['"]/g, '').trim();
    if (siteUrl && new URL(siteUrl).host.toLowerCase() === originHost) return true;
    if (new URL(request.url).host.toLowerCase() === originHost) return true;
    const fwd = request.headers.get('x-forwarded-host') || request.headers.get('host');
    if (fwd && fwd.split(':')[0].toLowerCase() === originHost.split(':')[0]) return true;
  } catch {}
  return false;
}
export async function readBody(request: Request) {
    if (!request.headers.get('content-type')?.startsWith('application/json'))
        throw new Error('BAD_BODY');
    const reader = request.body?.getReader();
    if (!reader)
        throw new Error('BAD_BODY');
    let bytes = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
        const r = await reader.read();
        if (r.done)
            break;
        bytes += r.value.length;
        if (bytes > 160000) {
            await reader.cancel();
            throw new Error('BAD_BODY');
        }
        chunks.push(r.value);
    }
    const all = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
        all.set(chunk, offset);
        offset += chunk.length;
    }
    const text = new TextDecoder().decode(all);
    if (!text.trim()) return {};
    return JSON.parse(text);
}
export async function usageKey(request: Request) { const identity = user(request); const ip = clientIp(request); const day = new Date().toISOString().slice(0, 10); const raw = `${process.env.AUTH_SECRET || 'local-development'}:${identity ? 'user:' + identity : 'ip:' + ip}:${day}`; const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)); return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join(''); }
export function limit(request: Request) { const n = Number(user(request) ? runtime().AUTH_DAILY_LIMIT || 20 : runtime().ANON_DAILY_LIMIT || 5); return Number.isFinite(n) && n > 0 ? Math.min(n, 1000) : 5; }
export async function reserve(key: string, max: number) {
    return db().prepare('INSERT INTO usage (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count < ? RETURNING count').bind(key, Date.now()+2*86400000, max).first<{
        count: number;
    }>();
}
