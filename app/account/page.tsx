import {requireChatGPTUser} from '@/app/chatgpt-auth';
import {PublicHeader} from '@/components/public-shell';
import {AccountSettings} from '@/components/account-settings';
export const dynamic='force-dynamic';
export const metadata={title:'Account settings | QuickieTime',robots:{index:false,follow:false}};
export default async function Page(){const user=await requireChatGPTUser('/account');return <><PublicHeader/><main id="page-content" className="guide-page"><h1>Your account</h1><p>{user.email}</p><AccountSettings/></main></>}
