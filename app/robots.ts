import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/site';
export default function robots():MetadataRoute.Robots{return {rules:[{userAgent:'*',allow:'/',disallow:process.env.SITE_INDEXABLE==='false'?['/']:['/api/','/dashboard','/account','/auth','/bhai','/checkout','/billing','/signin-with-chatgpt','/signout-with-chatgpt']}],sitemap:siteUrl+'/sitemap.xml'}}
