import type { APIRoute } from 'astro';
import { siteUrl } from '@/lib/site';
import { toolCatalog } from '@/lib/config';
import { articles, useCases } from '@/lib/content';
import { publicPages } from '@/lib/public-pages';

export const GET: APIRoute = async () => {
  const paths = [
    '',
    '/tools',
    '/guides',
    '/use-cases',
    ...Object.keys(publicPages).map((s) => '/' + s),
    ...toolCatalog.map((t) => '/tools/' + t.id),
    ...articles.map((a) => '/guides/' + a.slug),
    ...useCases.map((u) => '/use-cases/' + u.slug),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (path) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <priority>${path === '' ? '1.0' : '0.7'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
