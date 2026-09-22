import { user, originOK, reply, failure, readBody } from '@/lib/server/runtime';
import { sqlite } from '@/lib/server/database';
import { seal, unseal } from '@/lib/server/settings';
import { z } from 'zod';

const byokSchema = z.object({
  provider: z.enum(['openai', 'claude', 'anthropic', 'openrouter', 'cheaperinference', 'replicate', 'custom']),
  apiKey: z.string().trim().max(1000).optional(),
  model: z.string().trim().max(100).optional().default(''),
  baseUrl: z.string().trim().max(500).optional().default(''),
  enabled: z.boolean().optional().default(true)
});

export async function GET(request: Request) {
  const uid = user(request);
  if (!uid) return reply({ configured: false, authenticated: false });

  try {
    const d = sqlite();
    const row = d.prepare('SELECT provider, api_key, model, base_url, enabled FROM user_byok WHERE user_id=?').get(uid) as {
      provider: string;
      api_key: string;
      model: string | null;
      base_url: string | null;
      enabled: number;
    } | undefined;

    if (!row) {
      return reply({ configured: false, authenticated: true });
    }

    let masked = '••••••••';
    try {
      const raw = unseal(row.api_key);
      if (raw.length > 8) {
        masked = raw.slice(0, 4) + '••••' + raw.slice(-4);
      }
    } catch {
      // ignore
    }

    return reply({
      configured: true,
      authenticated: true,
      provider: row.provider,
      model: row.model || '',
      baseUrl: row.base_url || '',
      enabled: Boolean(row.enabled),
      maskedKey: masked
    });
  } catch (e) {
    return failure('BYOK_ERROR', (e as Error).message, 500);
  }
}

export async function POST(request: Request) {
  if (!originOK(request)) return failure('ORIGIN', 'Request could not be verified.', 403);
  const uid = user(request);
  if (!uid) return failure('UNAUTHORIZED', 'Sign in to save your BYOK configuration.', 401);

  let body;
  try {
    body = byokSchema.parse(await readBody(request));
  } catch {
    return failure('INVALID_INPUT', 'Check your BYOK parameters.', 400);
  }

  try {
    const d = sqlite();
    const existing = d.prepare('SELECT api_key FROM user_byok WHERE user_id=?').get(uid) as { api_key: string } | undefined;

    let encryptedKey: string;
    if (body.apiKey && body.apiKey.trim()) {
      encryptedKey = seal(body.apiKey.trim());
    } else if (existing?.api_key) {
      encryptedKey = existing.api_key;
    } else {
      return failure('KEY_REQUIRED', 'An API key is required to configure BYOK.', 400);
    }

    d.prepare(`
      INSERT INTO user_byok (user_id, provider, api_key, model, base_url, enabled, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        provider=excluded.provider,
        api_key=excluded.api_key,
        model=excluded.model,
        base_url=excluded.base_url,
        enabled=excluded.enabled,
        updated_at=excluded.updated_at
    `).run(
      uid,
      body.provider,
      encryptedKey,
      body.model || '',
      body.baseUrl || '',
      body.enabled ? 1 : 0,
      new Date().toISOString()
    );

    return reply({ ok: true });
  } catch (e) {
    return failure('SAVE_FAILED', (e as Error).message, 500);
  }
}

export async function DELETE(request: Request) {
  if (!originOK(request)) return failure('ORIGIN', 'Request could not be verified.', 403);
  const uid = user(request);
  if (!uid) return failure('UNAUTHORIZED', 'Sign in first.', 401);

  try {
    const d = sqlite();
    d.prepare('DELETE FROM user_byok WHERE user_id=?').run(uid);
    return reply({ ok: true });
  } catch (e) {
    return failure('DELETE_FAILED', (e as Error).message, 500);
  }
}
