import {randomUUID,createHmac,timingSafeEqual} from 'node:crypto';
import {setting} from '@/lib/server/settings';
import {secret,sessionCookie,safeReturn,createSession} from '@/lib/server/session';
import {sqlite} from '@/lib/server/database';

function verifyState(raw: string): { returnTo: string } | null {
  try {
    const data = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (!data.payload || !data.sig) return null;
    const expected = createHmac('sha256', secret()).update(data.payload).digest('hex');
    if (!timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(data.sig, 'hex'))) return null;
    const parsed = JSON.parse(data.payload);
    if (Date.now() - parsed.ts > 600000) return null; // 10 min expiry
    return { returnTo: parsed.returnTo || '/?resume=1' };
  } catch {
    return null;
  }
}

export async function GET(r: Request) {
  const u = new URL(r.url);
  const code = u.searchParams.get('code');
  const stateRaw = u.searchParams.get('state');
  const error = u.searchParams.get('error');

  const siteUrl = (process.env.SITE_URL || `${u.protocol}//${u.host}`).replace(/['"]/g, '').replace(/\/+$/, '').trim();

  if (error || !code || !stateRaw) {
    return Response.redirect(`${siteUrl}/auth?error=${encodeURIComponent(error || 'missing_code')}`, 302);
  }

  const verified = verifyState(stateRaw);
  const returnTo = verified?.returnTo || '/?resume=1';

  const clientId = setting('GOOGLE_CLIENT_ID');
  const clientSecret = setting('GOOGLE_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    return Response.redirect(`${siteUrl}/auth?error=google_not_configured`, 302);
  }

  const host = r.headers.get('x-forwarded-host') || r.headers.get('host') || 'qtai.click';
  const proto = r.headers.get('x-forwarded-proto') || (process.env.SITE_URL?.startsWith('http:') ? 'http' : 'https');
  const baseOrigin = (process.env.SITE_URL || `${proto}://${host}`).replace(/['"]/g, '').replace(/\/+$/, '').trim();
  const redirectUri = `${baseOrigin}/api/auth/callback/google`;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenRes.ok) {
      console.error('[Google OAuth token error]', await tokenRes.text());
      return Response.redirect(`${siteUrl}/auth?error=token_exchange_failed`, 302);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const idToken = tokenData.id_token;

    let email = '';
    let emailVerified = false;

    if (idToken) {
      // Decode JWT payload without third-party library
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        email = payload.email || '';
        emailVerified = payload.email_verified === true || payload.email_verified === 'true';
      }
    }

    if (!email && accessToken) {
      const userRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (userRes.ok) {
        const profile = await userRes.json();
        email = profile.email || '';
        emailVerified = profile.email_verified === true || profile.email_verified === 'true';
      }
    }

    if (!email || !emailVerified) {
      return Response.redirect(`${siteUrl}/auth?error=unverified_email`, 302);
    }

    email = email.toLowerCase().trim();
    const d = sqlite();
    d.exec('BEGIN IMMEDIATE');
    try {
      d.prepare('INSERT INTO accounts (id,email,created_at) VALUES (?,?,?) ON CONFLICT(email) DO NOTHING').run(randomUUID(), email, new Date().toISOString());
      const account = d.prepare('SELECT id FROM accounts WHERE email=?').get(email) as {id: string};
      const token = createSession(account.id);
      d.exec('COMMIT');

      const target = safeReturn(returnTo);
      const res = Response.redirect(`${siteUrl}${target}`, 302);
      res.headers.set('Set-Cookie', sessionCookie(token));
      return res;
    } catch (e) {
      d.exec('ROLLBACK');
      throw e;
    }
  } catch (err) {
    console.error('[Google Callback Exception]', err);
    return Response.redirect(`${siteUrl}/auth?error=auth_failed`, 302);
  }
}
