import {z} from 'zod';
import {originOK,readBody,reply,failure} from '@/lib/server/runtime';
import {rateLimit,clientIp,codeHash} from '@/lib/server/session';
import {issueCode} from '@/lib/server/auth';
import {sendLoginCode} from '@/lib/server/mail';
export async function POST(r:Request){if(!originOK(r))return failure('ORIGIN','Request could not be verified.',403);try{const {email}=z.object({email:z.string().trim().email().max(254).transform(s=>s.toLowerCase())}).parse(await readBody(r));if(!rateLimit('email:'+codeHash(email,'rate'),5,15*60000)||!rateLimit('send:'+codeHash(clientIp(r),'rate'),20,3600000))return failure('RATE_LIMIT','Too many requests. Please try again later.',429);await sendLoginCode(email,issueCode(email));return reply({ok:true})}catch(e){console.error('[sendLoginCode error]',e);if(e instanceof z.ZodError)return failure('INVALID_INPUT','Enter a valid email address.',400);const msg=e instanceof Error?e.message:'Email delivery failed';return failure('EMAIL_UNAVAILABLE',`Email delivery failed: ${msg}. Please check SMTP configuration or try again.`,503)}}
