import { z } from "zod";
export const tones = ['Clever', 'Witty', 'Funny', 'Sarcastic', 'Playful', 'Chaotic', 'Unhinged', 'Dark Humor', 'Absurd', 'Corporate BS', 'Gen Z', 'Dad Joke', 'Deadpan', 'Savage', 'Premium', 'Minimal', 'Inspirational', 'Weird', 'Unexpected', 'Double Meaning', 'Punny', 'Meme', 'Overdramatic', 'Fake Serious', 'Internet Brain', 'Clear', 'Polite', 'Neutral', 'Professional', 'Warm'] as const;
export const chaosLabels = ['Safe', 'Playful', 'Cheeky', 'Spicy', 'Unhinged', 'Questionable', 'HR may have questions', 'Absolutely unnecessary', 'What have we done?', 'You asked for this'];
export const actions = ['Make it better', 'Make it worse', 'Go further', 'Make it clever', 'Make it shorter', 'Make it safer', 'Make it professional', 'Give me 5 more', 'Regenerate'] as const;
export const toolIds = ['tagline', 'rewrite', 'summarize', 'reply', 'social', 'headlines'] as const;
export const toolCatalog = [
    { id: 'tagline', name: 'Tagline generator', description: 'Distinct slogans with a little personality.', example: 'A coffee shop that stays open until 3 AM.' },
    { id: 'rewrite', name: 'Paragraph rewriter', description: 'Turn rough paragraphs into clear, polished copy.', example: 'We are making changes to our hosting plans. Existing customers keep their current price until renewal. Help us explain this clearly.' },
    { id: 'summarize', name: 'Text summarizer', description: 'Find the essentials. Leave the waffle.', example: 'Our launch meeting covered three decisions: ship the beta on Friday, invite existing customers first, and collect feedback for two weeks before a wider release.' },
    { id: 'reply', name: 'Reply writer', description: 'Customer replies and emails that sound human.', example: 'A customer says their invoice payment failed. Ask for the error message and payment time so we can investigate. Do not promise a refund.' },
    { id: 'social', name: 'Social caption writer', description: 'Turn an idea into a post worth reading.', example: 'We just launched a midnight coffee delivery service for students. Announce the launch with a playful call to action.' },
    { id: 'headlines', name: 'Headline & subject lines', description: 'Concise headline and email subject alternatives.', example: 'A newsletter about simple ways to speed up a WordPress website.' },
] as const;
export const planCaps = {guest:{words:300,lines:20,input:4000},account:{words:700,lines:50,input:10000}};
export const inputSchema = z.object({
 idea:z.string().trim().min(3).max(24000), context:z.string().trim().max(3000).default(''),
 tones:z.array(z.enum(tones)).min(1).max(8), chaos:z.number().int().min(1).max(10),
 count:z.union([z.literal(1),z.literal(3),z.literal(5),z.literal(10),z.literal(15)]),
 avoid:z.array(z.string().max(8000)).max(15).default([]),tool:z.enum(toolIds).default('tagline'),
 format:z.enum(['plain','markdown','whatsapp']).default('plain'),maxWords:z.number().int().min(20).max(700).default(150),
 maxLines:z.number().int().min(0).max(50).default(0),project:z.string().trim().max(80).default(''),
 length:z.enum(['punchy','balanced','descriptive','short','standard','detailed','custom']).default('balanced'),
 audience:z.string().trim().max(200).default(''),purpose:z.string().trim().max(300).default(''),
 channel:z.enum(['general','email','support','chat','instagram','linkedin','x','headline','subject']).default('general'),
 structure:z.enum(['paragraph','bullets']).default('paragraph'),rewriteSize:z.enum(['shorter','similar','longer']).default('similar'),
 hashtags:z.boolean().default(false),parentId:z.string().uuid().optional()
}).strict();
export const transformSchema=inputSchema.extend({text:z.string().min(1).max(8000),action:z.enum(actions)});
export const resultSchema=z.object({text:z.string().trim().min(1).max(8000),style:z.array(z.string().max(30)).min(1).max(3),angle:z.string().max(200),confidence:z.number().min(0).max(1)});
export type Brief = z.infer<typeof inputSchema>;
export type Result = z.infer<typeof resultSchema> & {
    id: string;
};
export type Entry = {
    id: string;
    brief: Brief;
    results: Result[];
    createdAt: string;
    parentId?:string; rootId?:string; kind?:'generation'|'transform'|'edit'; title?:string;
};
export const copyMessage = 'Stolen successfully.';

export type Tool=typeof toolIds[number];
export const isDocument=(t:Tool)=>['rewrite','summarize','reply'].includes(t);
export const creativeTool=(t:Tool)=>['tagline','social','headlines'].includes(t);
export function countOptions(t:Tool,auth:boolean):number[]{return t==='tagline'?(auth?[3,5,10,15]:[3,5]):t==='headlines'?(auth?[3,5,10]:[3,5]):t==='social'?(auth?[1,3,5]:[1,3]):[1]}
export function inputLimit(t:Tool,auth:boolean){return t==='summarize'?(auth?24000:12000):['rewrite','reply'].includes(t)?(auth?16000:8000):4000}
export const wordCount=(text:string)=>text.trim()?text.trim().split(/\s+/u).length:0;
export function defaultBrief(tool:Tool):Brief{return {...inputSchema.parse({idea:'draft',tool,tones:tool==='summarize'?['Neutral']:tool==='reply'?['Clear','Polite']:tool==='rewrite'?['Clear']:['Clever'],chaos:creativeTool(tool)?4:1,count:isDocument(tool)?1:tool==='social'?1:5, length:tool==='tagline'?'balanced':'standard',channel:tool==='reply'?'email':tool==='social'?'instagram':tool==='headlines'?'headline':'general',maxWords:150}),idea:''}}

export function allowedActions(tool:Tool):readonly typeof actions[number][]{return tool==='social'?actions.filter(a=>a!=='Give me 5 more'):creativeTool(tool)?actions:['Make it better','Make it shorter','Make it professional','Regenerate']}
export function outputBudget(b:Brief,auth:boolean,action?:string){
 const count=action?(action==='Give me 5 more'?5:1):isDocument(b.tool)?1:b.count;
 const plan=auth?700:300;
 if(b.tool==='tagline'){const per=b.length==='punchy'?5:b.length==='descriptive'?16:10;return {count,words:per*count,perWords:per,characters:160,lines:0}}
 if(b.tool==='headlines')return {count,words:15*count,perWords:15,characters:b.channel==='subject'?70:110,lines:0};
 const target=b.length==='custom'?b.maxWords:b.length==='short'?80:b.length==='detailed'?plan:Math.min(200,plan);
 let words=Math.min(target,plan);
 if(b.tool==='summarize')words=Math.min(words,Math.max(1,Math.floor(wordCount(b.idea)*0.65)));
 if(b.tool==='rewrite'&&b.length!=='custom')words=Math.min(words,Math.max(20,Math.ceil(wordCount(b.idea)*(b.rewriteSize==='shorter'?0.7:b.rewriteSize==='longer'?1.6:1.1))));
 return {count,words,perWords:Math.max(1,Math.floor(words/count)),characters:b.tool==='social'&&b.channel==='x'?280:8000,lines:['reply','social'].includes(b.tool)?b.maxLines:0};
}
export function validatePlan(b:Brief,auth:boolean,action?:string):string|null{
 if(b.idea.length>inputLimit(b.tool,auth))return `This tool accepts up to ${inputLimit(b.tool,auth).toLocaleString()} input characters on your plan.`;
 if(!isDocument(b.tool)&&!countOptions(b.tool,auth).includes(b.count))return 'Choose an available number of alternatives for your plan.';
 if(isDocument(b.tool)&&action==='Give me 5 more')return 'This tool creates one complete draft at a time.';
 if(b.length==='custom'&&isDocument(b.tool)&&b.maxWords>(auth?700:300))return 'Custom output exceeds your plan’s word allowance.';
 if(b.tool==='social'&&b.length==='custom'&&b.maxWords>(auth?700:300))return 'Custom output exceeds your plan’s word allowance.';
 if(['reply','social'].includes(b.tool)&&b.maxLines>(auth?50:20))return 'The requested line target exceeds your plan.';
 if(['reply','social'].includes(b.tool)&&b.maxLines>0&&b.maxLines<outputBudget(b,auth,action).count)return 'Allow at least one line per result.';
 if(action&&!allowedActions(b.tool).includes(action as typeof actions[number]))return 'That transformation is not available for this tool.';
 return null;
}
