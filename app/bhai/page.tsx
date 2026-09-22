import {headers} from 'next/headers';
import {AdminStation} from '@/components/admin-station';
import {adminUser} from '@/lib/server/admin';
import {sqlite} from '@/lib/server/database';
export const dynamic='force-dynamic';
export const metadata={title:'Control station — QuickieTime',robots:{index:false,follow:false}};
export default async function Page(){const h=await headers();const admin=adminUser(new Request('https://qtai.click/bhai',{headers:h}));const setup=!sqlite().prepare('SELECT 1 FROM admin_accounts LIMIT 1').get();return <AdminStation initialAdmin={admin?{email:admin.email}:null} initialSetup={setup}/>}
