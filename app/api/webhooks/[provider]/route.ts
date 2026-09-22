import {webhook} from '@/lib/server/gateways';
import {reply,failure} from '@/lib/server/runtime';
export async function POST(r:Request,{params}:{params:Promise<{provider:string}>}){const {provider}=await params;if(!['stripe','paypal','razorpay'].includes(provider))return failure('NOT_FOUND','Not found.',404);try{await webhook(provider as 'stripe'|'paypal'|'razorpay',r);return reply({received:true})}catch{console.error(JSON.stringify({event:'webhook_failed',provider}));return failure('WEBHOOK_FAILED','Could not verify or process payment event. Retry required.',400)}}
