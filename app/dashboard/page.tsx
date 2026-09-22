import { requireChatGPTUser } from '../chatgpt-auth';
import { Dashboard } from '@/components/dashboard';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your dashboard — QuickieTime', robots: { index: false, follow: false } };
export default async function Page() { const user = await requireChatGPTUser('/dashboard'); return <Dashboard name={user.displayName}/>; }
