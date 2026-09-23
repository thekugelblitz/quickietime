import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { generate } from '@/lib/server/generate';
import { GET as usageGet } from '@/app/api/usage/route';
import { POST as authRequest } from '@/app/api/auth/request/route';
import { POST as authVerify } from '@/app/api/auth/verify/route';
import { POST as authLogout } from '@/app/api/auth/logout/route';
import { GET as historyGet, PATCH as historyPatch, DELETE as historyDelete } from '@/app/api/history/route';
import { GET as favoritesGet, POST as favoritesPost } from '@/app/api/favorites/route';
import { GET as projectsGet, POST as projectsPost, PATCH as projectsPatch } from '@/app/api/projects/route';
import { GET as byokGet, POST as byokPost, DELETE as byokDelete } from '@/app/api/byok/route';
import { GET as exportGet } from '@/app/api/export/route';
import { GET as adminGet, POST as adminPost } from '@/app/api/admin/[action]/route';
import { GET as billingGet, POST as billingPost } from '@/app/api/billing/[action]/route';
import { POST as webhookPost } from '@/app/api/webhooks/[provider]/route';
import { sqlite } from '@/lib/server/database';
import { reply } from '@/lib/server/runtime';

export const app = new Hono();

// Global error handling & basic CORS
app.use('*', cors({ origin: (o) => o || '*' }));

// 1. Health
app.get('/api/health', (c) => {
  try {
    sqlite().prepare('SELECT 1').get();
    return c.json({ status: 'ok', time: new Date().toISOString() });
  } catch (err) {
    return c.json({ status: 'error', error: (err as Error).message }, 500);
  }
});

// 2. Usage
app.get('/api/usage', async (c) => {
  return usageGet(c.req.raw);
});

// 3. Generation & Transform
app.post('/api/generate', async (c) => {
  return generate(c.req.raw, false);
});

app.post('/api/transform', async (c) => {
  return generate(c.req.raw, true);
});

// 4. Auth
app.post('/api/auth/request', async (c) => authRequest(c.req.raw));
app.post('/api/auth/verify', async (c) => authVerify(c.req.raw));
app.post('/api/auth/logout', async (c) => authLogout(c.req.raw));
app.get('/api/auth/config', async (c) => {
  return reply({ googleAuthEnabled: Boolean(process.env.GOOGLE_CLIENT_ID) });
});

// 5. History, Favorites, Projects
app.get('/api/history', async (c) => historyGet(c.req.raw));
app.patch('/api/history', async (c) => historyPatch(c.req.raw));
app.delete('/api/history', async (c) => historyDelete(c.req.raw));

app.get('/api/favorites', async (c) => favoritesGet(c.req.raw));
app.post('/api/favorites', async (c) => favoritesPost(c.req.raw));

app.get('/api/projects', async (c) => projectsGet(c.req.raw));
app.post('/api/projects', async (c) => projectsPost(c.req.raw));
app.patch('/api/projects', async (c) => projectsPatch(c.req.raw));

// 6. BYOK & Export
app.get('/api/byok', async (c) => byokGet(c.req.raw));
app.post('/api/byok', async (c) => byokPost(c.req.raw));
app.delete('/api/byok', async (c) => byokDelete(c.req.raw));

app.get('/api/export', async (c) => exportGet(c.req.raw));

// 7. Admin ([action])
app.get('/api/admin/:action', async (c) => {
  return adminGet(c.req.raw, { params: Promise.resolve({ action: c.req.param('action') }) });
});
app.post('/api/admin/:action', async (c) => {
  return adminPost(c.req.raw, { params: Promise.resolve({ action: c.req.param('action') }) });
});

// 8. Billing ([action])
app.get('/api/billing/:action', async (c) => {
  return billingGet(c.req.raw, { params: Promise.resolve({ action: c.req.param('action') }) });
});
app.post('/api/billing/:action', async (c) => {
  return billingPost(c.req.raw, { params: Promise.resolve({ action: c.req.param('action') }) });
});

// 9. Webhooks ([provider])
app.post('/api/webhooks/:provider', async (c) => {
  return webhookPost(c.req.raw, { params: Promise.resolve({ provider: c.req.param('provider') }) });
});
