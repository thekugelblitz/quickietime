import {database,sqlite} from '../lib/server/database';
import {createSession,cookieName} from '../lib/server/session';
process.env.DATABASE_PATH=':memory:';process.env.AUTH_SECRET='test-only-secret-at-least-thirty-two-characters';process.env.OPENAI_API_KEY='test-only';process.env.AI_PROVIDER='openai';process.env.SITE_URL='https://quickie.test';
const tokens=new Map<string,string>();
export function testCookie(id:string){if(!tokens.has(id)){sqlite().prepare('INSERT INTO accounts (id,email,created_at) VALUES (?,?,?) ON CONFLICT(id) DO NOTHING').run(id,id+'@example.test',new Date().toISOString());tokens.set(id,createSession(id))}return cookieName+'='+tokens.get(id)}
export const env={DB:database,get OPENAI_API_KEY(){return process.env.OPENAI_API_KEY},set OPENAI_API_KEY(value:string|undefined){process.env.OPENAI_API_KEY=value}};
