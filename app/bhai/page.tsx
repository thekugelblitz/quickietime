import {headers} from 'next/headers';
import {AdminStation} from '@/components/admin-station';
import {adminUser} from '@/lib/server/admin';
export const dynamic='force-dynamic';
export const metadata={title:'Control station — QuickieTime',robots:{index:false,follow:false}};
export default async function Page(){
  let admin = null;
  try {
    const h = await headers();
    admin = adminUser(h);
  } catch (err) {
    console.error('Error in /bhai page:', err);
  }
  return <AdminStation initialAdmin={admin?{email:admin.email}:null}/>;
}
