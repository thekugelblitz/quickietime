import Link from 'next/link';
import {PublicHeader} from '@/components/public-shell';
export default function NotFound(){return <><PublicHeader/><main id="page-content" className="auth-page"><span className="step-tag">404 / LOST FOR WORDS?</span><h1>That page isn’t here.</h1><p>The writing tools are still right where you left them.</p><Link href="/" className="primary-button">Back to the studio</Link><Link href="/tools" className="text-link">Explore all tools →</Link></main></>}
