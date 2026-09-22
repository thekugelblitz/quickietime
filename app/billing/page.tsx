import {PublicPage} from '@/components/public-page';
import {BillingHistory} from '@/components/billing';
export const metadata={title:'Billing history — QuickieTime',robots:{index:false,follow:false}};
export default function Page(){return <PublicPage title="Your purchases, together." intro="View credit packs and verified payment status." path="/billing"><BillingHistory/></PublicPage>}
