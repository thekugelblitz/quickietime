import {AuthForm} from '@/components/auth-form';
import {PublicHeader} from '@/components/public-shell';
export const metadata={title:'Sign in | QuickieTime',robots:{index:false,follow:false}};
export default function Page(){return <><PublicHeader/><main id="page-content" className="auth-page"><span className="step-tag">YOUR CREATIVE CORNER</span><h1>Good work deserves a home.</h1><p>Sign in with an email code for 20 daily credits, saved projects and your complete writing history.</p><AuthForm/></main></>}
