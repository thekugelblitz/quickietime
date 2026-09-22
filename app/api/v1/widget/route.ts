import { sqlite } from '@/lib/server/database';
import type { Entry } from '@/lib/config';

export const dynamic = 'force-dynamic';

const fallbackSnippets = [
  { id: '1', text: 'Tomorrow can wait. Better coffee now.', tool: 'tagline', style: ['Punchy'] },
  { id: '2', text: 'Bedtime called. We respectfully declined.', tool: 'tagline', style: ['Witty'] },
  { id: '3', text: 'Fast words for quick thinkers.', tool: 'tagline', style: ['Minimal'] },
  { id: '4', text: 'Skip the prompts. Keep the polish.', tool: 'tagline', style: ['Clever'] },
  { id: '5', text: 'Small effort. Better words.', tool: 'tagline', style: ['Punchy'] },
  { id: '6', text: 'No chat. No waffle. Just what you needed to say.', tool: 'tagline', style: ['Clear'] }
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = (url.searchParams.get('format') || 'json').toLowerCase();
  const project = url.searchParams.get('project');
  const userId = url.searchParams.get('user');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=30'
  };

  const d = sqlite();
  let snippets: { id: string; text: string; tool: string; title?: string; style?: string[] }[] = [];

  try {
    let sql = 'SELECT payload FROM generations';
    const params: (string | number | null)[] = [];
    const conditions: string[] = [];

    if (userId) {
      conditions.push('user_id = ?');
      params.push(userId);
    }
    if (project && project !== 'all') {
      conditions.push("json_extract(payload, '$.brief.project') = ?");
      params.push(project);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC LIMIT 30';

    const rows = d.prepare(sql).all(...params) as { payload: string }[];
    for (const row of rows) {
      const entry = JSON.parse(row.payload) as Entry;
      for (const res of entry.results || []) {
        if (res.text && res.text.trim()) {
          snippets.push({
            id: res.id,
            text: res.text,
            tool: entry.brief?.tool || 'tagline',
            title: entry.title || '',
            style: res.style
          });
        }
      }
    }
  } catch {
    // database fallback
  }

  if (snippets.length === 0) {
    snippets = fallbackSnippets;
  }

  // Pick random snippet for the Hello Dolly experience
  const randomIndex = Math.floor(Math.random() * snippets.length);
  const selected = snippets[randomIndex];

  if (format === 'text' || format === 'txt') {
    return new Response(selected.text, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      snippet: selected,
      allSnippets: snippets.slice(0, 15),
      totalAvailable: snippets.length,
      poweredBy: 'QuickieTime (https://qtai.click)'
    }),
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8'
      }
    }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
