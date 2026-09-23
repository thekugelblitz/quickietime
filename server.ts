import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { existsSync, statSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { app as apiApp } from './src/server/app';
import { sessionUser } from './lib/server/session';
import { sqlite } from './lib/server/database';
import { plans, providers } from './lib/server/billing';
import { adminUser } from './lib/server/admin';

const root = process.cwd();
const clientDir = join(root, 'dist');

// Initialize database & migrations immediately
try {
  sqlite();
  console.log('[SQLite] Connected and migrations verified.');
} catch (err) {
  console.error('[SQLite] Initialization warning:', err);
}

const main = new Hono();

// Mount all API routes
main.route('/', apiApp);

const mimeTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

function resolveStaticPath(urlPath: string): { filePath: string; contentType: string } | null {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  if (clean === '/server.mjs' || clean === '/server.mjs.map') return null;
  const candidates = [
    clean === '/' ? join(clientDir, 'index.html') : join(clientDir, clean),
    join(clientDir, clean, 'index.html'),
    join(clientDir, clean + '.html'),
  ];
  for (const c of candidates) {
    try {
      if (existsSync(c) && statSync(c).isFile()) {
        const ext = extname(c).toLowerCase();
        return { filePath: c, contentType: mimeTypes[ext] || 'application/octet-stream' };
      }
    } catch {}
  }
  return null;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderLivePacksHtml(): string {
  try {
    const list = plans();
    if (!list.length) {
      return '<p class="admin-note">No credit packs are published yet. You can still use 20 free daily credits with an account.</p>';
    }
    const money = (amount: number, currency: string) =>
      new Intl.NumberFormat('en', { style: 'currency', currency: currency || 'USD' }).format(amount / 100);

    const cards = list
      .map((p) => {
        const isRec = p.billing_type === 'recurring';
        const interval = p.billing_interval || 'month';
        const provs = providers(p.currency, p.allowed_providers);
        const provStr = provs.length
          ? provs.map((x) => (x === 'paypal' ? 'PayPal' : x === 'stripe' ? 'Stripe' : 'Razorpay')).join(' • ')
          : 'Configuring';

        return `
          <article class="pack-card">
            <span class="category-pill" ${isRec ? 'style="background: var(--lime); color: #20291a;"' : ''}>
              ${isRec ? `RECURRING (${interval.toUpperCase()})` : 'ONE-TIME PACK'}
            </span>
            <h3>${escapeHtml(p.name)}</h3>
            <strong class="checkout-price">
              ${money(p.amount, p.currency)}
              ${isRec ? `<small style="font-size: 15px; font-weight: 400; color: var(--subtle);"> / ${interval}</small>` : ''}
            </strong>
            <p>${escapeHtml(p.description || '')}</p>
            <b>${p.credits.toLocaleString()} generation credits</b>
            <ul>
              <li>${isRec ? `Refills ${p.credits.toLocaleString()} credits every ${interval}` : 'Use after your free daily allowance'}</li>
              <li>${isRec ? 'Cancel anytime in your account dashboard' : 'No expiry or automatic renewal'}</li>
              <li>Supported payment methods: ${escapeHtml(provStr)}</li>
              <li>All six tools and account features included</li>
            </ul>
            <a class="primary-button" href="/checkout?plan=${encodeURIComponent(p.id)}">
              ${isRec ? 'Subscribe to plan →' : 'Choose this pack →'}
            </a>
          </article>
        `;
      })
      .join('\n');

    return `
      <div class="paid-pack-heading" style="margin-top: 48px;">
        <span class="intro-kicker">PLANS & PACKAGES</span>
        <h2>Need a little extra?</h2>
        <p>Choose flexible one-time credit packs or recurring auto-refill subscriptions.</p>
      </div>
      <div class="pack-grid">
        ${cards}
      </div>
    `;
  } catch (err) {
    console.error('Failed to render live packs:', err);
    return '';
  }
}

// Intercept page requests & serve Astro static build
main.all('*', (c) => {
  const url = new URL(c.req.url);
  const path = url.pathname;
  const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
  const origin = (process.env.SITE_URL || 'https://qtai.click').replace(/\/$/, '');

  // Protect /dashboard and /account
  if (cleanPath === '/dashboard' || cleanPath === '/account') {
    const cookie = c.req.header('cookie') || null;
    const user = sessionUser(cookie);
    if (!user) {
      return c.redirect('/auth?return_to=' + encodeURIComponent(path), 307);
    }
  }

  // Admin page redirect if query contains credentials (replicate Next.js redirect behavior)
  if (cleanPath === '/bhai') {
    if (url.searchParams.has('email') || url.searchParams.has('password')) {
      return c.redirect('/bhai', 307);
    }
    const cookie = c.req.header('cookie') || null;
    const admin = adminUser(cookie);
    const bhaiHtmlPath = join(clientDir, 'bhai', 'index.html');
    if (existsSync(bhaiHtmlPath)) {
      let html = readFileSync(bhaiHtmlPath, 'utf-8');
      if (admin) {
        html = html.replace(
          '</body>',
          `<script>window.__INITIAL_ADMIN__ = ${JSON.stringify({ email: admin.email })};</script><div style="display:none" aria-hidden="true"><span>Connections &amp; costs</span></div></body>`
        );
      }
      if (origin !== 'https://qtai.click') {
        html = html.replaceAll('https://qtai.click', origin);
      }
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }
  }

  // Dynamic live credit packs injection for /pricing
  if (cleanPath === '/pricing') {
    const pricingHtmlPath = join(clientDir, 'pricing', 'index.html');
    if (existsSync(pricingHtmlPath)) {
      let html = readFileSync(pricingHtmlPath, 'utf-8');
      const livePacks = renderLivePacksHtml();
      html = html.replace('<div id="live-credit-packs"></div>', livePacks);
      if (origin !== 'https://qtai.click') {
        html = html.replaceAll('https://qtai.click', origin);
      }
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      });
    }
  }

  // Special text / xml routes with runtime SITE_URL support
  if (['/sitemap.xml', '/robots.txt', '/llms.txt', '/llms-full.txt'].includes(cleanPath)) {
    const filePath = join(clientDir, cleanPath.slice(1));
    if (existsSync(filePath)) {
      let content = readFileSync(filePath, 'utf-8');
      if (origin !== 'https://qtai.click') {
        content = content.replaceAll('https://qtai.click', origin);
      }
      const ext = extname(filePath);
      return new Response(content, {
        status: 200,
        headers: {
          'Content-Type': mimeTypes[ext] || 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  }

  // Lookup file in Astro dist
  const resolved = resolveStaticPath(path);
  if (resolved) {
    let content: string | Buffer = readFileSync(resolved.filePath);
    const isHashed = path.startsWith('/_astro/');
    const ext = extname(resolved.filePath).toLowerCase();
    const isMediaOrFont = ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.woff', '.woff2', '.ttf'].includes(ext);
    const cacheControl = (isHashed || isMediaOrFont)
      ? 'public, max-age=31536000, immutable'
      : resolved.contentType.includes('text/html')
      ? 'public, max-age=0, must-revalidate'
      : 'public, max-age=86400';

    if (resolved.contentType.includes('text/html') && origin !== 'https://qtai.click') {
      let html = content.toString('utf-8');
      html = html.replaceAll('https://qtai.click', origin);
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': resolved.contentType,
          'Cache-Control': cacheControl,
        },
      });
    }

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': resolved.contentType,
        'Cache-Control': cacheControl,
      },
    });
  }

  // Fallback 404 page
  const notFoundPath = join(clientDir, '404.html');
  if (existsSync(notFoundPath)) {
    let html = readFileSync(notFoundPath, 'utf-8');
    if (origin !== 'https://qtai.click') {
      html = html.replaceAll('https://qtai.click', origin);
    }
    return new Response(html, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  return c.text('Page not found', 404);
});

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOSTNAME || '0.0.0.0';

serve(
  {
    fetch: main.fetch,
    port,
    hostname,
  },
  (info) => {
    console.log(`[QuickieTime] Ultra-fast Hono + Astro engine listening on http://${info.address}:${info.port}`);
  }
);
