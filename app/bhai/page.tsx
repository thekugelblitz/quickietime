import {headers} from 'next/headers';
import {AdminStation} from '@/components/admin-station';
import {adminUser} from '@/lib/server/admin';
import {sqlite} from '@/lib/server/database';
export const dynamic='force-dynamic';
export const metadata={title:'Control station — QuickieTime',robots:{index:false,follow:false}};
export default async function Page(){
  let admin = null;
  let setup = true;
  try {
    const h = await headers();
    admin = adminUser(h);
    setup = !sqlite().prepare('SELECT 1 FROM admin_accounts LIMIT 1').get();
  } catch (err) {
    console.error('Error in /bhai page:', err);
  }
  return <AdminStation initialAdmin={admin?{email:admin.email}:null} initialSetup={setup}/>;
}
