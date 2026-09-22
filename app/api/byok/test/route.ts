import { user, originOK, reply, failure, readBody } from '@/lib/server/runtime';
import { sqlite } from '@/lib/server/database';
import { unseal } from '@/lib/server/settings';
import { createProvider, type AIConfig } from '@/lib/server/provider';
import { inputSchema } from '@/lib/config';

export async function POST(request: Request) {
  if (!originOK(request)) return failure('ORIGIN', 'Request could not be verified.', 403);
  
  let body: {
    provider?: string;
    apiKey?: string;
    model?: string;
    baseUrl?: string;
  };
  try {
    body = (await readBody(request)) as typeof body;
  } catch {
    return failure('INVALID_INPUT', 'Check request body.', 400);
  }

  const prov = (body.provider || 'openai').toLowerCase();
  let key = body.apiKey?.trim();

  // If no key provided in body, check if user has a saved key in database
  if (!key) {
    const uid = user(request);
    if (uid) {
      try {
        const row = sqlite().prepare('SELECT api_key FROM user_byok WHERE user_id=?').get(uid) as { api_key: string } | undefined;
        if (row?.api_key) {
          key = unseal(row.api_key);
        }
      } catch {}
    }
  }

  if (!key) {
    return failure('KEY_REQUIRED', 'Please enter your API key to test the connection.', 400);
  }

  const aiConfig: AIConfig = {
    AI_PROVIDER: prov,
    AI_MODEL: body.model || undefined,
    BASE_URL: body.baseUrl || undefined,
    BYOK_API_KEY: key,
    OPENAI_API_KEY: prov === 'openai' ? key : undefined,
    OPENROUTER_API_KEY: prov === 'openrouter' ? key : undefined,
    CHEAPERINFERENCE_API_KEY: prov === 'cheaperinference' ? key : undefined,
    ANTHROPIC_API_KEY: prov === 'claude' || prov === 'anthropic' ? key : undefined,
    REPLICATE_API_TOKEN: prov === 'replicate' ? key : undefined,
    CUSTOM_API_KEY: prov === 'custom' ? key : undefined
  };

  try {
    const provider = createProvider(aiConfig);
    const testBrief = inputSchema.parse({
      idea: 'Quick connection test',
      tool: 'tagline',
      tones: ['Clever'],
      chaos: 1,
      count: 1,
      format: 'plain'
    });

    const results = await provider.generateTaglines(testBrief, false);
    if (results && results.length > 0) {
      return reply({
        ok: true,
        message: `Successfully connected to ${prov}! Test generation succeeded.`,
        sample: results[0].text
      });
    }
    return reply({ ok: true, message: `Connected to ${prov}!` });
  } catch (error) {
    return failure('TEST_FAILED', `Could not connect to ${prov}: ${(error as Error).message}`, 400);
  }
}
