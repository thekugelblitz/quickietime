import type { APIRoute } from 'astro';
import { siteUrl } from '@/lib/site';

export const GET: APIRoute = async () => {
  const disallowed =
    process.env.SITE_INDEXABLE === 'false'
      ? ['/']
      : [
          '/api/',
          '/dashboard',
          '/account',
          '/auth',
          '/bhai',
          '/checkout',
          '/billing',
          '/signin-with-chatgpt',
          '/signout-with-chatgpt',
        ];

  const content = `User-agent: *
${disallowed.map((d) => `Disallow: ${d}`).join('\n')}
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
