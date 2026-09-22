import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/site';
import {toolCatalog} from '@/lib/config';
import {articles,useCases} from '@/lib/content';
import {publicPages} from '@/lib/public-pages';
export default function sitemap():MetadataRoute.Sitemap{return ['','/tools','/guides','/use-cases',...Object.keys(publicPages).map(s=>'/'+s),...toolCatalog.map(t=>'/tools/'+t.id),...articles.map(a=>'/guides/'+a.slug),...useCases.map(u=>'/use-cases/'+u.slug)].map(path=>({url:siteUrl+path,priority:path===''?1:0.7}))}
