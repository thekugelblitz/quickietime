import { z } from "zod";

export const tones = [
  'Clever', 'Witty', 'Funny', 'Sarcastic', 'Playful', 'Chaotic', 'Unhinged',
  'Dark Humor', 'Absurd', 'Corporate BS', 'Gen Z', 'Dad Joke', 'Deadpan',
  'Savage', 'Premium', 'Minimal', 'Inspirational', 'Weird', 'Unexpected',
  'Double Meaning', 'Punny', 'Meme', 'Overdramatic', 'Fake Serious',
  'Internet Brain', 'Clear', 'Polite', 'Neutral', 'Professional', 'Warm',
  'Technical', 'Authoritative', 'Academic', 'Concise'
] as const;

export const chaosLabels = [
  'Safe', 'Playful', 'Cheeky', 'Spicy', 'Unhinged', 'Questionable',
  'HR may have questions', 'Absolutely unnecessary', 'What have we done?', 'You asked for this'
];

export const actions = [
  'Make it better', 'Make it worse', 'Go further', 'Make it clever',
  'Make it shorter', 'Make it safer', 'Make it professional',
  'Give me 5 more', 'Regenerate'
] as const;

export const toolCategories = [
  'Writing & Editing',
  'Summarization',
  'Brainstorming',
  'Technical & Admin',
  'Productivity',
  'Lifestyle & Fun'
] as const;

export type ToolCategory = typeof toolCategories[number];

export const toolIds = [
  // 1-10: Writing & Editing
  'fix-grammar', 'shift-tone', 'shorten-text', 'expand-bullets', 'rsvp-reply',
  'headlines', 'social', 'rewrite', 'active-voice', 'translate-snippet',
  // 11-18: Summarization
  'tldr', 'summarize', 'meeting-takeaways', 'explain-jargon', 'eli5',
  'book-summary', 'explain-code', 'review-pros-cons',
  // 19-27: Brainstorming & Ideation
  'gift-ideas', 'dinner-recipes', 'icebreakers', 'tagline', 'email-subjects',
  'analogies', 'workout-alternatives', 'playlist-themes', 'content-hooks',
  // 28-36: Technical & Admin
  'excel-formulas', 'regex-generator', 'format-converter', 'sql-queries',
  'placeholder-text', 'dummy-data', 'cron-syntax', 'css-fixes', 'cli-commands',
  // 37-43: Productivity
  'polite-declines', 'meeting-agendas', 'resume-bullets', 'cover-letter-openers',
  'bio-writer', 'action-items', 'reply',
  // 44-50: Lifestyle, Learning & Fun
  'language-drills', 'trivia-generator', 'packing-checklist', 'micro-habits',
  'devil-advocate', 'math-solver', 'prompt-optimizer'
] as const;

export type Tool = typeof toolIds[number];

export type ToolMeta = {
  id: Tool;
  name: string;
  category: ToolCategory;
  description: string;
  example: string;
};

export const toolCatalog: ToolMeta[] = [
  // Writing & Editing
  { id: 'fix-grammar', name: 'Fix Grammar & Typos', category: 'Writing & Editing', description: 'Make any paragraph grammatically perfect while preserving voice.', example: 'Their going to announce the product tomorow, but we doesnt have the assets ready yet.' },
  { id: 'shift-tone', name: 'Shift Tone', category: 'Writing & Editing', description: 'Change dry or harsh messages into warm, polite, or authoritative text.', example: 'You missed the deadline again. We cannot finish the sprint without your PR.' },
  { id: 'shorten-text', name: 'Shorten Text', category: 'Writing & Editing', description: 'Trim bloated copy down to a crisp, punchy length without losing core meaning.', example: 'In view of the fact that the server deployment experienced several unexpected intermittent errors during the late evening maintenance window, we have elected to defer the production release.' },
  { id: 'expand-bullets', name: 'Expand Bullets', category: 'Writing & Editing', description: 'Turn raw, messy thoughts into a cohesive narrative paragraph.', example: '- 3 new pricing tiers\n- grandfather existing users for 1 year\n- free credits reset daily at midnight UTC' },
  { id: 'rsvp-reply', name: 'RSVP Responder', category: 'Writing & Editing', description: 'Draft a polite decline or enthusiastic acceptance for event invitations.', example: 'Declining a dinner invitation from a client next Thursday due to prior family commitment.' },
  { id: 'headlines', name: 'Headline & Subject Lines', category: 'Writing & Editing', description: 'Concise headline and email subject alternatives with high curiosity.', example: 'A newsletter about simple ways to speed up a WordPress website.' },
  { id: 'social', name: 'Social Caption Writer', category: 'Writing & Editing', description: 'Turn an idea into an engaging post with hooks and relevant hashtags.', example: 'We just launched a midnight coffee delivery service for students. Announce the launch with a playful call to action.' },
  { id: 'rewrite', name: 'Paragraph Rewriter', category: 'Writing & Editing', description: 'Turn rough paragraphs into clear, polished, and natural copy.', example: 'We are making changes to our hosting plans. Existing customers keep their current price until renewal. Help us explain this clearly.' },
  { id: 'active-voice', name: 'Remove Passive Voice', category: 'Writing & Editing', description: 'Convert passive sentences into active, energetic phrasing.', example: 'A decision was made by our leadership team that the legacy server infrastructure would be deprecated.' },
  { id: 'translate-snippet', name: 'Snippet Translator', category: 'Writing & Editing', description: 'Translate a sentence or short paragraph into another language naturally.', example: 'Translate to Spanish: We are thrilled to welcome you to our community. If you have any questions, our team is here 24/7.' },

  // Summarization
  { id: 'tldr', name: 'TL;DR 3-Bullet Summary', category: 'Summarization', description: 'Extract exactly 3 essential bullet points from long email chains or notes.', example: 'Detailed email thread discussing Q3 marketing budget reallocation, hiring freeze for sales, and upcoming brand redesign approval deadline on August 15.' },
  { id: 'summarize', name: 'Text Summarizer', category: 'Summarization', description: 'Find the essentials and leave the waffle. Clean, neutral summary.', example: 'Our launch meeting covered three decisions: ship the beta on Friday, invite existing customers first, and collect feedback for two weeks before a wider release.' },
  { id: 'meeting-takeaways', name: 'Meeting Takeaways', category: 'Summarization', description: 'Pull out major action items, key decisions, and assigned owners.', example: 'Sarah will finalize the slide deck by Wednesday. Alex needs to confirm the API quotas with vendor before Friday. Team agreed to skip Thursday standup.' },
  { id: 'explain-jargon', name: 'Jargon Explainer', category: 'Summarization', description: 'Define complex corporate or technical jargon using simple metaphors.', example: 'Explain: "EBITDA margin expansion through synergistic headcount rationalization"' },
  { id: 'eli5', name: "Explain Like I'm 5 (ELI5)", category: 'Summarization', description: 'Break down tough, intimidating concepts into simple everyday ideas.', example: 'Quantum computing and why superposition makes it different from normal bits.' },
  { id: 'book-summary', name: 'Book Key Frameworks', category: 'Summarization', description: 'Extract core thesis, key mental models, and top takeaways from any book.', example: 'Atomic Habits by James Clear' },
  { id: 'explain-code', name: 'Code Explainer', category: 'Summarization', description: 'Plain English, line-by-line explanation of unfamiliar code snippets.', example: 'const debounce = (fn, ms) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; };' },
  { id: 'review-pros-cons', name: 'Review Aggregator', category: 'Summarization', description: 'Synthesize raw customer reviews into clear top pros, cons, and takeaways.', example: '5 customer reviews of an ergonomic desk chair: 3 praise lumbar support and mesh fabric, 2 complain about armrest wobbling and slow customer service response.' },

  // Brainstorming & Ideation
  { id: 'gift-ideas', name: 'Gift Recommendations', category: 'Brainstorming', description: 'Unique, thoughtful gift ideas tailored to age, budget, and interests.', example: 'Gift for a 32-year-old friend who loves indoor plants, espresso brewing, budget $40.' },
  { id: 'dinner-recipes', name: 'Fridge Dinner Outlines', category: 'Brainstorming', description: 'Quick, appetizing meal ideas from random ingredients in your kitchen.', example: 'Leftover brown rice, eggs, scallions, frozen edamame, sesame oil.' },
  { id: 'icebreakers', name: 'Icebreaker Prompts', category: 'Brainstorming', description: '5 fun, low-pressure questions to kick off team meetings or gatherings.', example: 'Virtual team sync for a remote engineering team on Monday morning.' },
  { id: 'tagline', name: 'Tagline & Naming', category: 'Brainstorming', description: 'Distinct brand names and punchy taglines with personality.', example: 'A coffee shop that stays open until 3 AM.' },
  { id: 'email-subjects', name: 'Email Subject Lines', category: 'Brainstorming', description: 'High-open-rate subject lines designed to spark curiosity without spam clichés.', example: 'Announcing our early summer sale with 30% off all productivity templates.' },
  { id: 'analogies', name: 'Analogy Generator', category: 'Brainstorming', description: 'Creative, vivid analogies to explain dry or abstract concepts to anyone.', example: 'Explain technical debt to a non-technical CEO.' },
  { id: 'workout-alternatives', name: 'Workout Variations', category: 'Brainstorming', description: 'Targeted exercise substitutes for movements you dislike or lack equipment for.', example: 'Alternative for barbell back squats because of a mild lower back strain.' },
  { id: 'playlist-themes', name: 'Playlist Themes', category: 'Brainstorming', description: '10 thematic song ideas, vibes, or genre blends for a specific mood.', example: 'Late-night coding in a rainy city with lo-fi beats and synthwave textures.' },
  { id: 'content-hooks', name: 'Content Hooks', category: 'Brainstorming', description: '5 captivating opening lines for a video, speech, presentation, or newsletter.', example: 'Why 90% of to-do list apps actually decrease productivity instead of helping.' },

  // Technical & Administrative Shortcuts
  { id: 'excel-formulas', name: 'Excel & Sheets Formulas', category: 'Technical & Admin', description: 'Exact formula syntax with a clear explanation for calculations.', example: 'Find the latest purchase date for customer ID in Column A matching table on Sheet2.' },
  { id: 'regex-generator', name: 'Regex Generator', category: 'Technical & Admin', description: 'Regular expressions for pattern matching with breakdown and test examples.', example: 'Extract all email addresses from messy text, ignoring trailing punctuation.' },
  { id: 'format-converter', name: 'Format Converter', category: 'Technical & Admin', description: 'Convert raw lists or unstructured text into clean JSON, Markdown, or CSV.', example: 'Apples, 4, $2.50\nBananas, 6, $1.80\nOranges, 3, $3.00 -> convert to JSON array of objects' },
  { id: 'sql-queries', name: 'SQL Query Drafter', category: 'Technical & Admin', description: 'Generate clean SQL queries from natural language descriptions.', example: 'Get total revenue per user for 2026 where orders were status "completed", ordered by revenue desc.' },
  { id: 'placeholder-text', name: 'Placeholder Text', category: 'Technical & Admin', description: 'Thematic, realistic Lorem Ipsum alternatives tailored to your industry.', example: 'Dummy text for a boutique coffee roaster eCommerce landing page hero and features.' },
  { id: 'dummy-data', name: 'Dummy Data Mockups', category: 'Technical & Admin', description: '5 realistic entity records (names, emails, dates) for UI prototyping.', example: '5 realistic SaaS customers with company name, tier, seats, and signup date.' },
  { id: 'cron-syntax', name: 'Cron Schedule Syntax', category: 'Technical & Admin', description: 'Standard 5-part cron expressions with human-readable explanations.', example: 'Run every Monday, Wednesday, and Friday at 6:30 AM UTC.' },
  { id: 'css-fixes', name: 'HTML & CSS Fixer', category: 'Technical & Admin', description: 'Identify layout bugs (flex, grid, clipping) and provide working CSS.', example: '.container { display: flex; } .card { width: 300px; } - cards are shrinking and squishing text instead of wrapping.' },
  { id: 'cli-commands', name: 'CLI Command Reminders', category: 'Technical & Admin', description: 'Exact terminal commands for Linux, macOS, or PowerShell tasks.', example: 'Find all files larger than 100MB in the current directory and subdirectories on Ubuntu.' },

  // Professional Productivity & Organization
  { id: 'polite-declines', name: 'Polite Declines', category: 'Productivity', description: 'Professional, graceful ways to say no to projects, meetings, or requests.', example: 'Decline an invitation to speak at a conference because the schedule is currently full.' },
  { id: 'meeting-agendas', name: 'Meeting Agenda Outlines', category: 'Productivity', description: 'Timed 30-minute agenda structure with objectives and checkpoints.', example: 'Quarterly OKR alignment meeting between marketing and product design.' },
  { id: 'resume-bullets', name: 'Resume Impact Bullets', category: 'Productivity', description: 'Transform raw tasks into high-impact, quantified resume bullet points.', example: 'Managed customer onboarding and reduced tickets by writing docs and tutorials.' },
  { id: 'cover-letter-openers', name: 'Cover Letter Openers', category: 'Productivity', description: 'Strong, memorable opening paragraphs connecting background with job title.', example: 'Applying for Senior Product Designer at a fast-growing fintech startup.' },
  { id: 'bio-writer', name: 'Bio Formatting', category: 'Productivity', description: 'Clean 150-word third-person professional bio for speaker decks or LinkedIn.', example: 'Full-stack developer with 8 years experience in Node, React, and distributed systems. Built 2 open-source developer tools.' },
  { id: 'action-items', name: 'Action Item Checklist', category: 'Productivity', description: 'Standardize chaotic personal notes into a structured to-do checklist.', example: 'Notes: Need to email Dave re invoices, check cloudflare DNS record, buy groceries (milk, bread), renew passport before June.' },
  { id: 'reply', name: 'Reply & Follow-Up Writer', category: 'Productivity', description: 'Customer replies and professional follow-up nudges that sound human.', example: 'A customer says their invoice payment failed. Ask for the error message and payment time so we can investigate. Do not promise a refund.' },

  // Lifestyle, Learning & Fun
  { id: 'language-drills', name: 'Quick Language Drills', category: 'Lifestyle & Fun', description: '3 natural conversational phrases to practice in any target language.', example: 'French: Ordering at a bakery in Paris in the morning.' },
  { id: 'trivia-generator', name: 'Trivia Generation', category: 'Lifestyle & Fun', description: '5 fun trivia questions with answers and interesting factoids.', example: 'Trivia about 1990s video game history and consoles.' },
  { id: 'packing-checklist', name: 'Travel Packing Checklist', category: 'Lifestyle & Fun', description: 'Tailored packing list based on destination, weather, and duration.', example: '4-day business trip to Chicago in November with cold, windy weather.' },
  { id: 'micro-habits', name: '5-Minute Micro-Habits', category: 'Lifestyle & Fun', description: 'Actionable, friction-free small habits to build into your daily routine.', example: 'Small habits to reduce screen time and improve focus during remote work.' },
  { id: 'devil-advocate', name: 'Devil’s Advocate Partner', category: 'Lifestyle & Fun', description: 'Sharp, balanced counter-arguments to stress-test your assumptions.', example: 'Opinion: Remote work is unconditionally superior to in-office work for every company.' },
  { id: 'math-solver', name: 'Math Word Problem Solver', category: 'Lifestyle & Fun', description: 'Step-by-step breakdown and exact calculations for word problems.', example: 'If a store offers 25% off an item, and you have an additional 10% coupon off the sale price, what is the effective total discount?' },
  { id: 'prompt-optimizer', name: 'AI Prompt Optimizer', category: 'Lifestyle & Fun', description: 'Rewrite weak or vague prompts for maximum clarity, precision, and output quality.', example: 'Write me an email to my team about improving communication.' },
];

export const planCaps = { guest: { words: 300, lines: 20, input: 1500 }, account: { words: 700, lines: 50, input: 3000 } };
export const MICRO_TASK_DISCLAIMER = "⚡ Quickie Micro-Tasks: Text boxes have tight character bounds by design to guarantee sub-second generation, zero timeouts, and minimal AI cost.";

export const inputSchema = z.object({
  idea: z.string().trim().min(2).max(5000),
  context: z.string().trim().max(500).default(''),
  tones: z.array(z.enum(tones)).min(1).max(8),
  chaos: z.number().int().min(1).max(10),
  count: z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(10), z.literal(15)]),
  avoid: z.array(z.string().max(8000)).max(15).default([]),
  tool: z.enum(toolIds).default('tagline'),
  format: z.enum(['plain', 'markdown', 'whatsapp']).default('plain'),
  maxWords: z.number().int().min(20).max(700).default(150),
  maxLines: z.number().int().min(0).max(50).default(0),
  project: z.string().trim().max(80).default(''),
  length: z.enum(['punchy', 'balanced', 'descriptive', 'short', 'standard', 'detailed', 'custom']).default('balanced'),
  audience: z.string().trim().max(150).default(''),
  purpose: z.string().trim().max(150).default(''),
  channel: z.enum(['general', 'email', 'support', 'chat', 'instagram', 'linkedin', 'x', 'headline', 'subject']).default('general'),
  structure: z.enum(['paragraph', 'bullets']).default('paragraph'),
  rewriteSize: z.enum(['shorter', 'similar', 'longer']).default('similar'),
  hashtags: z.boolean().default(false),
  parentId: z.string().uuid().optional(),
  useByok: z.boolean().optional(),
  byok: z.object({
    provider: z.string(),
    apiKey: z.string().optional(),
    model: z.string().optional(),
    baseUrl: z.string().optional()
  }).optional()
}).strict();

export const transformSchema = inputSchema.extend({ text: z.string().min(1).max(8000), action: z.enum(actions) });
export const resultSchema = z.object({ text: z.string().trim().min(1).max(8000), style: z.array(z.string().max(30)).min(1).max(3), angle: z.string().max(200), confidence: z.number().min(0).max(1) });
export type Brief = z.infer<typeof inputSchema>;
export type Result = z.infer<typeof resultSchema> & { id: string };
export type Entry = {
  id: string;
  brief: Brief;
  results: Result[];
  createdAt: string;
  parentId?: string;
  rootId?: string;
  kind?: 'generation' | 'transform' | 'edit';
  title?: string;
  byok?: boolean;
  provider?: string;
};
export const copyMessage = 'Stolen successfully.';

// Single draft generation tools
const singleDraftTools: ReadonlySet<Tool> = new Set([
  'rewrite', 'summarize', 'reply', 'fix-grammar', 'shift-tone', 'shorten-text',
  'expand-bullets', 'rsvp-reply', 'active-voice', 'translate-snippet',
  'tldr', 'meeting-takeaways', 'explain-jargon', 'eli5', 'book-summary',
  'explain-code', 'review-pros-cons', 'dinner-recipes', 'excel-formulas',
  'regex-generator', 'format-converter', 'sql-queries', 'placeholder-text',
  'dummy-data', 'cron-syntax', 'css-fixes', 'cli-commands', 'polite-declines',
  'meeting-agendas', 'resume-bullets', 'cover-letter-openers', 'bio-writer',
  'action-items', 'packing-checklist', 'micro-habits', 'devil-advocate',
  'math-solver', 'prompt-optimizer'
]);

export const isDocument = (t: Tool) => singleDraftTools.has(t);
export const creativeTool = (t: Tool) => ['tagline', 'social', 'headlines', 'analogies', 'content-hooks', 'playlist-themes', 'icebreakers'].includes(t);

export function countOptions(t: Tool, auth: boolean): number[] {
  if (t === 'tagline') return auth ? [3, 5, 10, 15] : [3, 5];
  if (t === 'headlines' || t === 'email-subjects' || t === 'content-hooks') return auth ? [3, 5, 10] : [3, 5];
  if (['social', 'gift-ideas', 'icebreakers', 'analogies', 'workout-alternatives', 'playlist-themes', 'language-drills', 'trivia-generator'].includes(t)) {
    return auth ? [1, 3, 5] : [1, 3];
  }
  return [1];
}

export function inputLimit(t: Tool, auth: boolean): number {
  if (['summarize', 'review-pros-cons', 'meeting-takeaways', 'format-converter', 'css-fixes', 'tldr', 'action-items'].includes(t)) {
    return auth ? 3000 : 1500;
  }
  if (['rewrite', 'fix-grammar', 'shift-tone', 'shorten-text', 'explain-code', 'prompt-optimizer'].includes(t)) {
    return auth ? 2000 : 1000;
  }
  if (['reply', 'expand-bullets', 'translate-snippet', 'eli5', 'sql-queries', 'bio-writer', 'math-solver', 'devil-advocate'].includes(t)) {
    return auth ? 1500 : 800;
  }
  if (['social', 'excel-formulas', 'regex-generator', 'polite-declines', 'meeting-agendas', 'resume-bullets', 'cover-letter-openers', 'packing-checklist'].includes(t)) {
    return auth ? 1000 : 600;
  }
  return auth ? 500 : 300;
}

export const wordCount = (text: string) => text.trim() ? text.trim().split(/\s+/u).length : 0;

export function defaultBrief(tool: Tool): Brief {
  let defaultTones: (typeof tones)[number][] = ['Clear'];
  if (tool === 'summarize' || tool === 'tldr' || tool === 'meeting-takeaways' || tool === 'format-converter') defaultTones = ['Neutral'];
  else if (tool === 'reply' || tool === 'rsvp-reply' || tool === 'polite-declines') defaultTones = ['Clear', 'Polite'];
  else if (creativeTool(tool)) defaultTones = ['Clever'];
  else if (['excel-formulas', 'regex-generator', 'sql-queries', 'cron-syntax', 'cli-commands', 'explain-code', 'math-solver'].includes(tool)) defaultTones = ['Technical'];

  return {
    ...inputSchema.parse({
      idea: 'draft',
      tool,
      tones: defaultTones,
      chaos: creativeTool(tool) ? 4 : 1,
      count: isDocument(tool)
        ? 1
        : tool === 'social'
          ? 1
          : ['gift-ideas', 'icebreakers', 'analogies', 'workout-alternatives', 'playlist-themes', 'language-drills', 'trivia-generator'].includes(tool)
            ? 3
            : 5,
      length: tool === 'tagline' ? 'balanced' : 'standard',
      channel: tool === 'reply' ? 'email' : tool === 'social' ? 'instagram' : tool === 'headlines' ? 'headline' : 'general',
      maxWords: 150
    }),
    idea: ''
  };
}

export function allowedActions(tool: Tool): readonly typeof actions[number][] {
  if (tool === 'social') return actions.filter(a => a !== 'Give me 5 more');
  if (creativeTool(tool)) return actions;
  return ['Make it better', 'Make it shorter', 'Make it professional', 'Regenerate'];
}

export function outputBudget(b: Brief, auth: boolean, action?: string) {
  const count = action ? (action === 'Give me 5 more' ? 5 : 1) : isDocument(b.tool) ? 1 : b.count;
  const plan = auth ? 700 : 300;

  if (b.tool === 'tagline') {
    const per = b.length === 'punchy' ? 5 : b.length === 'descriptive' ? 16 : 10;
    return { count, words: per * count, perWords: per, characters: 160, lines: 0 };
  }
  if (b.tool === 'headlines' || b.tool === 'email-subjects') {
    return { count, words: 15 * count, perWords: 15, characters: b.channel === 'subject' || b.tool === 'email-subjects' ? 70 : 110, lines: 0 };
  }
  if (b.tool === 'content-hooks') {
    return { count, words: 25 * count, perWords: 25, characters: 180, lines: 0 };
  }

  const target = b.length === 'custom' ? b.maxWords : b.length === 'short' ? 80 : b.length === 'detailed' ? plan : Math.min(200, plan);
  let words = Math.min(target, plan);

  if (b.tool === 'summarize' || b.tool === 'tldr') words = Math.min(words, Math.max(1, Math.floor(wordCount(b.idea) * 0.65)));
  if ((b.tool === 'rewrite' || b.tool === 'shorten-text') && b.length !== 'custom') {
    words = Math.min(words, Math.max(20, Math.ceil(wordCount(b.idea) * (b.rewriteSize === 'shorter' || b.tool === 'shorten-text' ? 0.6 : b.rewriteSize === 'longer' ? 1.6 : 1.1))));
  }

  return {
    count,
    words,
    perWords: Math.max(1, Math.floor(words / count)),
    characters: b.tool === 'social' && b.channel === 'x' ? 280 : 8000,
    lines: ['reply', 'social'].includes(b.tool) ? b.maxLines : 0
  };
}

export function validatePlan(b: Brief, auth: boolean, action?: string): string | null {
  if (b.idea.length > inputLimit(b.tool, auth)) {
    return `This tool accepts up to ${inputLimit(b.tool, auth).toLocaleString()} input characters on your plan.`;
  }
  if (!isDocument(b.tool) && !countOptions(b.tool, auth).includes(b.count)) {
    return 'Choose an available number of alternatives for your plan.';
  }
  if (isDocument(b.tool) && action === 'Give me 5 more') {
    return 'This tool creates one complete draft at a time.';
  }
  if (b.length === 'custom' && isDocument(b.tool) && b.maxWords > (auth ? 700 : 300)) {
    return 'Custom output exceeds your plan’s word allowance.';
  }
  if (b.tool === 'social' && b.length === 'custom' && b.maxWords > (auth ? 700 : 300)) {
    return 'Custom output exceeds your plan’s word allowance.';
  }
  if (['reply', 'social'].includes(b.tool) && b.maxLines > (auth ? 50 : 20)) {
    return 'The requested line target exceeds your plan.';
  }
  if (['reply', 'social'].includes(b.tool) && b.maxLines > 0 && b.maxLines < outputBudget(b, auth, action).count) {
    return 'Allow at least one line per result.';
  }
  if (action && !allowedActions(b.tool).includes(action as typeof actions[number])) {
    return 'That transformation is not available for this tool.';
  }
  return null;
}
