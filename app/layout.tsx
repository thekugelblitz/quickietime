import type { Metadata } from 'next';
import './globals.css';
import {siteUrl,operator,jsonLd} from '@/lib/site';
import {PublicFooter} from '@/components/public-shell';
const description = 'Fast AI writing micro-tools for quick tasks. Skip tedious chat prompts: instant taglines, paragraph rewrites, summaries, social captions, and email replies. Dual-engine: free daily credits or Bring Your Own Key (BYOK) for 100% free unlimited generation. Stored library and WordPress Hello Dolly embed widget.';
export const metadata: Metadata = {
  robots: {
    index: process.env.SITE_INDEXABLE !== 'false' && !siteUrl.includes('localhost'),
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1
  },
  metadataBase: new URL(siteUrl),
  title: "QuickieTime — Fast AI Writing Micro-Tools | No Chat, BYOK Unlimited",
  description,
  keywords: [
    'no-chat AI writing tools',
    'AI tagline generator',
    'paragraph rewriter online',
    'AI email reply generator',
    'social media caption writer',
    'BYOK AI writing',
    'WordPress Hello Dolly AI widget',
    'bring your own key AI writer',
    'headline generator',
    'fast slogan generator',
    'AI micro tools',
    'quick copywriter'
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'QuickieTime',
    title: 'QuickieTime — Small effort. Better words.',
    description,
    url: '/'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuickieTime — AI writing micro-tools with personality (BYOK supported)',
    description
  },
  icons: { icon: '/favicon.svg' }
};
export default function Layout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:`(function(){try{var d=localStorage.getItem('qt-dark');if(d==='true'||(d===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`}} /></head><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({'@context':'https://schema.org','@type':'Organization','@id':siteUrl+'/#organization',name:operator,url:siteUrl})}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'WebSite','@id':siteUrl+'/#website',name:'QuickieTime',url:siteUrl+'/',inLanguage:'en'})}}/>{children}<PublicFooter/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', '@id':siteUrl+'/#app', name: 'QuickieTime', url: siteUrl, applicationCategory: 'BusinessApplication', operatingSystem: 'Web browser', description, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Limited free daily credits or unlimited with BYOK' }, featureList: ['Tagline generator', 'Paragraph rewriter', 'Text summarizer', 'Reply writer', 'Social captions', 'Headlines and subject lines', 'BYOK API Key Support', 'WordPress Hello Dolly Embed Widget', 'CSV/JSON/TXT Data Export'] }) }}/></body></html>; }

