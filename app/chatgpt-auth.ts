import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {sessionUser,safeReturn} from '@/lib/server/session';
export async function requireChatGPTUser(returnTo:string){const h=await headers();const account=sessionUser(h.get('cookie'));if(!account)redirect('/auth?return_to='+encodeURIComponent(safeReturn(returnTo)));return {userId:account.id,email:account.email,displayName:account.email}}
