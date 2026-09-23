import type { APIRoute } from 'astro';
import { siteUrl } from '@/lib/site';
import { articles, faqItems } from '@/lib/content';

export const GET: APIRoute = async () => {
  const text =
    `# QuickieTime public writing guidance\n\nSource: ${siteUrl}\n\n` +
    articles
      .map(
        (a) =>
          `# ${a.title}\nSource: ${siteUrl}/guides/${a.slug}\n\n${a.intro}\n\n` +
          a.sections
            .map(
              (s) =>
                `## ${s.heading}\n\n${s.body.join('\n\n')}${s.example ? '\n\nIllustrative example:\n' + s.example : ''}`
            )
            .join('\n\n')
      )
      .join('\n\n---\n\n') +
    '\n\n# Frequently asked questions\n\n' +
    faqItems.map(([q, a]) => `## ${q}\n${a}`).join('\n\n');

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
