import { user, failure } from '@/lib/server/runtime';
import { sqlite } from '@/lib/server/database';
import type { Entry, Result } from '@/lib/config';

function escapeCsv(val: unknown): string {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

export async function GET(request: Request) {
  const uid = user(request);
  if (!uid) return failure('UNAUTHORIZED', 'Sign in to export your library.', 401);

  const url = new URL(request.url);
  const format = (url.searchParams.get('format') || 'json').toLowerCase();
  const project = url.searchParams.get('project');
  const scope = url.searchParams.get('scope') || 'all';

  const d = sqlite();
  let entries: Entry[] = [];
  let favorites: Result[] = [];

  if (scope === 'favorites' || scope === 'all') {
    const favRows = d.prepare('SELECT payload FROM favorites WHERE user_id=?').all(uid) as { payload: string }[];
    favorites = favRows.map(r => JSON.parse(r.payload));
  }

  if (scope !== 'favorites') {
    let sql = 'SELECT payload FROM generations WHERE user_id=?';
    const params: (string | number | null)[] = [uid];
    if (project && project !== 'all') {
      sql += ` AND json_extract(payload, '$.brief.project') = ?`;
      params.push(project);
    }
    sql += ' ORDER BY created_at DESC';
    const rows = d.prepare(sql).all(...params) as { payload: string }[];
    entries = rows.map(r => JSON.parse(r.payload));
  }

  const dateStr = new Date().toISOString().slice(0, 10);

  if (format === 'csv') {
    const headers = ['ID', 'Date', 'Tool', 'Project', 'Title', 'Input Idea', 'Result Text', 'Style', 'Angle', 'Confidence', 'BYOK'];
    const lines: string[] = [headers.join(',')];

    if (scope !== 'favorites') {
      for (const e of entries) {
        for (const r of e.results) {
          lines.push([
            escapeCsv(r.id),
            escapeCsv(e.createdAt),
            escapeCsv(e.brief.tool || 'tagline'),
            escapeCsv(e.brief.project || 'Unfiled'),
            escapeCsv(e.title || ''),
            escapeCsv(e.brief.idea),
            escapeCsv(r.text),
            escapeCsv(r.style?.join('; ') || ''),
            escapeCsv(r.angle || ''),
            escapeCsv(r.confidence ?? 1),
            escapeCsv(e.byok ? 'Yes' : 'No')
          ].join(','));
        }
      }
    } else {
      for (const r of favorites) {
        lines.push([
          escapeCsv(r.id),
          escapeCsv(''),
          escapeCsv('favorite'),
          escapeCsv('Favorites'),
          escapeCsv('Favorite Result'),
          escapeCsv(''),
          escapeCsv(r.text),
          escapeCsv(r.style?.join('; ') || ''),
          escapeCsv(r.angle || ''),
          escapeCsv(r.confidence ?? 1),
          escapeCsv('No')
        ].join(','));
      }
    }

    return new Response(lines.join('\r\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="quickietime-export-${dateStr}.csv"`
      }
    });
  }

  if (format === 'txt' || format === 'text') {
    const lines: string[] = [
      `QuickieTime Export — ${dateStr}`,
      `================================================`,
      `Total Generations: ${entries.length}`,
      `Total Favorites: ${favorites.length}`,
      ``
    ];

    if (entries.length > 0) {
      lines.push(`--- SAVED GENERATIONS ---`);
      for (const e of entries) {
        lines.push(``);
        lines.push(`[${e.createdAt.slice(0, 19)}] Tool: ${e.brief.tool || 'tagline'} | Project: ${e.brief.project || 'Unfiled'}`);
        lines.push(`Input: ${e.brief.idea}`);
        if (e.brief.context) lines.push(`Context: ${e.brief.context}`);
        lines.push(`Results:`);
        e.results.forEach((r, idx) => {
          lines.push(`  ${idx + 1}. ${r.text} (${r.style?.join(', ') || ''})`);
        });
        lines.push(`----------------------------------------`);
      }
    }

    if (favorites.length > 0) {
      lines.push(``);
      lines.push(`--- FAVORITES & SNIPPETS ---`);
      favorites.forEach((r, idx) => {
        lines.push(`  ${idx + 1}. "${r.text}" [${r.style?.join(', ') || ''}]`);
      });
      lines.push(`----------------------------------------`);
    }

    return new Response(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="quickietime-export-${dateStr}.txt"`
      }
    });
  }

  // Default JSON export
  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), totalGenerations: entries.length, totalFavorites: favorites.length, entries, favorites }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="quickietime-export-${dateStr}.json"`
    }
  });
}
