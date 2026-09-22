import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {AdminStation} from '@/components/admin-station';
import {adminUser} from '@/lib/server/admin';
export const dynamic='force-dynamic';
export const metadata={title:'Control station — QuickieTime',robots:{index:false,follow:false}};
export default async function Page({
  searchParams
}: {
  searchParams?: Promise<{email?: string; password?: string; [key: string]: string | string[] | undefined}>;
}){
  const sp = searchParams ? await searchParams : {};
  if (sp && (sp.email || sp.password || Object.keys(sp).length > 0)) {
    redirect('/bhai');
  }

  let admin = null;
  try {
    const h = await headers();
    admin = adminUser(h);
  } catch (err) {
    console.error('Error in /bhai page:', err);
  }
  return <AdminStation initialAdmin={admin?{email:admin.email}:null}/>;
}
