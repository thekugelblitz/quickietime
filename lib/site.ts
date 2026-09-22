/** Set SITE_URL at build and runtime to your public HTTPS origin. */
export const siteUrl=(process.env.SITE_URL||'https://qtai.click').replace(/\/$/,'');
export const siteName='QuickieTime';
export const contactEmail=process.env.CONTACT_EMAIL||'';
export const operator=process.env.SITE_OPERATOR||'QuickieTime';
export function jsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c')}
