import {originOK,reply,failure} from '@/lib/server/runtime';
import {sessionCookie,cookieName,hash} from '@/lib/server/session';
import {sqlite} from '@/lib/server/database';
export async function POST(r:Request){if(!originOK(r))return failure('ORIGIN','Request could not be verified.',403);const token=r.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(token)sqlite().prepare('DELETE FROM sessions WHERE token_hash=?').run(hash(token));const response=reply({ok:true});response.headers.set('Set-Cookie',sessionCookie('',true));return response}
