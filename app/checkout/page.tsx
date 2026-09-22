import {PublicPage} from '@/components/public-page';
import {Checkout} from '@/components/billing';
export const metadata={title:'Secure checkout — QuickieTime',robots:{index:false,follow:false}};
export default function Page(){return <PublicPage title="A little more creative fuel." intro="Extra credits, on your terms." path="/checkout"><Checkout/></PublicPage>}
