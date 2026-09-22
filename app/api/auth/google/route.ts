import {z} from 'zod';
import {randomUUID,createHmac} from 'node:crypto';
import {setting} from '@/lib/server/settings';
import {secret,sessionCookie,safeReturn,createSession} from '@/lib/server/session';
import {sqlite} from '@/lib/server/database';
import {reply,failure,readBody} from '@/lib/server/runtime';

function signState(payload: string) {
  const h = createHmac('sha256', secret()).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ payload, sig: h })).toString('base64url');
}

export async function GET(r: Request) {
  const u = new URL(r.url);
  const returnTo = safeReturn(u.searchParams.get('return_to') || '/?resume=1');
  const clientId = setting('GOOGLE_CLIENT_ID');
  if (!clientId) {
    return failure('GOOGLE_NOT_CONFIGURED', 'Google Sign In is not configured yet. Set GOOGLE_CLIENT_ID in admin or env.', 503);
  }

  const host = r.headers.get('x-forwarded-host') || r.headers.get('host') || 'qtai.click';
  const proto = r.headers.get('x-forwarded-proto') || (process.env.SITE_URL?.startsWith('http:') ? 'http' : 'https');
  const siteUrl = (process.env.SITE_URL || `${proto}://${host}`).replace(/['"]/g, '').replace(/\/+$/, '').trim();
  const redirectUri = `${siteUrl}/api/auth/callback/google`;

  const state = signState(JSON.stringify({ returnTo, ts: Date.now() }));
  const googleUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleUrl.searchParams.set('client_id', clientId);
  googleUrl.searchParams.set('redirect_uri', redirectUri);
  googleUrl.searchParams.set('response_type', 'code');
  googleUrl.searchParams.set('scope', 'openid email profile');
  googleUrl.searchParams.set('prompt', 'select_account');
  googleUrl.searchParams.set('state', state);

  return Response.redirect(googleUrl.toString(), 302);
}

export async function POST(r: Request) {
  try {
    const {credential, returnTo} = z.object({
      credential: z.string().min(10),
      returnTo: z.string().max(2000).default('/?resume=1')
    }).parse(await readBody(r));

    const clientId = setting('GOOGLE_CLIENT_ID');
    // Verify ID token using Google tokeninfo endpoint
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!verifyRes.ok) {
      return failure('INVALID_TOKEN', 'Failed to verify Google sign-in credentials.', 401);
    }
    const info = await verifyRes.json();
    if (clientId && info.aud !== clientId) {
      return failure('UNAUTHORIZED_CLIENT', 'Token audience mismatch.', 401);
    }
    if (!info.email || (info.email_verified !== 'true' && info.email_verified !== true)) {
      return failure('UNVERIFIED_EMAIL', 'A verified Google email address is required.', 400);
    }

    const email = String(info.email).toLowerCase().trim();
    const d = sqlite();
    d.exec('BEGIN IMMEDIATE');
    try {
      d.prepare('INSERT INTO accounts (id,email,created_at) VALUES (?,?,?) ON CONFLICT(email) DO NOTHING').run(randomUUID(), email, new Date().toISOString());
      const account = d.prepare('SELECT id FROM accounts WHERE email=?').get(email) as {id: string};
      const token = createSession(account.id);
      d.exec('COMMIT');

      const response = reply({ ok: true, redirect: safeReturn(returnTo) });
      response.headers.set('Set-Cookie', sessionCookie(token));
      return response;
    } catch (e) {
      d.exec('ROLLBACK');
      throw e;
    }
  } catch (e) {
    return failure('INVALID_REQUEST', e instanceof Error ? e.message : 'Google sign-in failed.', 400);
  }
}
