import { toolCatalog, type Tool } from './config';
import { siteUrl } from './site';
export { siteUrl };

export const toolSeo: Record<Tool, { title: string; description: string; limit: string; input: string; bestFor: string }> = {
  // Writing & Editing
  'fix-grammar': {
    title: 'Free AI Grammar & Typo Fixer',
    description: 'Fix grammatical mistakes, spelling errors, and awkward phrasing instantly while preserving your authentic voice.',
    limit: 'Up to 300 guest / 700 signed-in words',
    input: 'Paste any text, draft, or email',
    bestFor: 'Essays, emails, articles, and documentation'
  },
  'shift-tone': {
    title: 'Free AI Tone Shifter',
    description: 'Instantly transform dry or harsh text into warm, polite, authoritative, or casual phrasing.',
    limit: 'Up to 300 guest / 700 signed-in words',
    input: 'Paste original draft and desired tone',
    bestFor: 'Sensitive emails, client updates, and workplace chats'
  },
  'shorten-text': {
    title: 'Free AI Text Shortener',
    description: 'Trim bloated sentences by 50-70% while keeping every vital point sharp and clear.',
    limit: 'Up to 300 guest / 700 signed-in words',
    input: 'Paste verbose or bloated text',
    bestFor: 'Slide decks, memos, and executive summaries'
  },
  'expand-bullets': {
    title: 'Free AI Bullet-to-Narrative Writer',
    description: 'Turn raw, fragmented bullet points into a smooth, cohesive narrative paragraph.',
    limit: 'Up to 300 guest / 700 signed-in words',
    input: 'List 2–5 bullet points or thoughts',
    bestFor: 'Project updates, newsletters, and announcements'
  },
  'rsvp-reply': {
    title: 'Free AI RSVP Response Generator',
    description: 'Draft polite, gracious declines or enthusiastic acceptances for event invitations.',
    limit: '1 concise response',
    input: 'Describe the invitation and your attendance status',
    bestFor: 'Weddings, client dinners, and conference invites'
  },
  headlines: {
    title: 'Free AI Headline & Email Subject Generator',
    description: 'Generate clear headlines and email subject lines with high curiosity and click-through appeal.',
    limit: '110 headline / 70 subject characters',
    input: 'Describe the article, offer, or announcement',
    bestFor: 'Newsletters, blog posts, and landing pages'
  },
  social: {
    title: 'Free AI Social Media Caption Generator',
    description: 'Write engaging Instagram, LinkedIn, or X captions with hooks and optional hashtags.',
    limit: 'X: 280 characters / Instagram & LinkedIn: 200 words',
    input: 'Describe the post idea, audience, and goal',
    bestFor: 'Launches, updates, and community posts'
  },
  rewrite: {
    title: 'Free AI Paragraph Rewriter',
    description: 'Rewrite paragraphs with your audience, purpose, and tone in mind. Choose shorter, similar, or expanded copy.',
    limit: 'Up to 300 guest / 700 signed-in words',
    input: 'Paste the original paragraph',
    bestFor: 'Announcements, product copy, and emails'
  },
  'active-voice': {
    title: 'Free AI Active Voice Converter',
    description: 'Convert passive voice sentences into direct, energized, and clear active phrasing.',
    limit: 'Up to 300 guest / 700 signed-in words',
    input: 'Paste sentences with passive construction',
    bestFor: 'Reports, technical writing, and business memos'
  },
  'translate-snippet': {
    title: 'Free AI Snippet Translator',
    description: 'Translate sentences and short paragraphs into any language with natural cultural nuance.',
    limit: 'Up to 300 guest / 700 signed-in words',
    input: 'Paste text and specify target language',
    bestFor: 'Customer messages, welcome emails, and social posts'
  },

  // Summarization
  tldr: {
    title: 'Free AI TL;DR 3-Bullet Summarizer',
    description: 'Distill long email chains, articles, or transcripts into exactly three high-impact bullet points.',
    limit: 'Exactly 3 bullet points',
    input: 'Paste email chain or article text',
    bestFor: 'Busy executives, inbox triage, and team updates'
  },
  summarize: {
    title: 'Free AI Text Summarizer',
    description: 'Summarize pasted text into a neutral, accurate paragraph or bullet list without fluff.',
    limit: 'Shorter than your source',
    input: 'Up to 1,500 guest / 3,000 signed-in characters',
    bestFor: 'Meeting notes, long articles, and reports'
  },
  'meeting-takeaways': {
    title: 'Free AI Meeting Takeaways Extractor',
    description: 'Extract clear decisions, key action items, and assigned owners from transcripts.',
    limit: 'Structured action list',
    input: 'Paste raw meeting transcript or notes',
    bestFor: 'Sprint retros, client calls, and team syncs'
  },
  'explain-jargon': {
    title: 'Free AI Jargon & Acronym Explainer',
    description: 'Demystify complex corporate or technical jargon with simple, intuitive everyday language.',
    limit: '1 clear explanation + metaphor',
    input: 'Enter jargon phrase or corporate term',
    bestFor: 'Cross-functional teams, onboarding, and students'
  },
  eli5: {
    title: 'Free AI Explain Like I’m 5 (ELI5) Generator',
    description: 'Break down complex, intimidating concepts into simple ideas that anyone can understand.',
    limit: '1 simplified explanation',
    input: 'Enter tough concept or technical topic',
    bestFor: 'Learning, presentations, and non-technical audiences'
  },
  'book-summary': {
    title: 'Free AI Book Frameworks & Summary',
    description: 'Extract the core thesis, top 3 mental models, and practical takeaways from non-fiction books.',
    limit: '1 structured summary',
    input: 'Book title and author',
    bestFor: 'Continuous learning, reading lists, and research'
  },
  'explain-code': {
    title: 'Free AI Code Snippet Explainer',
    description: 'Get plain-English explanations of unfamiliar code snippets, functions, and logic flows.',
    limit: 'Step-by-step breakdown',
    input: 'Paste code snippet (JS, Python, SQL, etc.)',
    bestFor: 'Code reviews, debugging, and junior developers'
  },
  'review-pros-cons': {
    title: 'Free AI Review Aggregator (Pros & Cons)',
    description: 'Synthesize customer reviews into an unbiased summary of top pros, cons, and overall consensus.',
    limit: 'Balanced pros & cons list',
    input: 'Paste customer reviews or testimonials',
    bestFor: 'Product research, competitive analysis, and feedback'
  },

  // Brainstorming & Ideation
  'gift-ideas': {
    title: 'Free AI Gift Recommendation Tool',
    description: 'Generate unique, creative, and personalized gift ideas tailored to recipient age and budget.',
    limit: '5 curated gift ideas',
    input: 'Recipient age, interests, and budget',
    bestFor: 'Birthdays, holidays, and colleague gifts'
  },
  'dinner-recipes': {
    title: 'Free AI Fridge Dinner Recipe Generator',
    description: 'Turn random ingredients sitting in your fridge into fast, delicious dinner recipes.',
    limit: '1–3 recipe outlines',
    input: 'List 3–5 ingredients you currently have',
    bestFor: 'Weeknight dinners, zero food waste, and quick cooking'
  },
  'icebreakers': {
    title: 'Free AI Team Icebreaker Prompt Generator',
    description: 'Create fun, engaging, low-pressure conversation starters for meetings and team gatherings.',
    limit: '5 prompt variations',
    input: 'Describe your team or event context',
    bestFor: 'Remote standups, workshops, and team socials'
  },
  tagline: {
    title: 'Free AI Tagline & Slogan Generator',
    description: 'Create short, memorable brand taglines and product slogans with distinct personality.',
    limit: '5, 10 or 16 words per idea',
    input: 'Describe your product and unique value',
    bestFor: 'Brand slogans, products, and campaigns'
  },
  'email-subjects': {
    title: 'Free AI Email Subject Line Generator',
    description: 'Generate high-open-rate subject lines designed to spark curiosity without spam triggers.',
    limit: '70 characters per subject',
    input: 'Describe email topic, audience, and offer',
    bestFor: 'Sales outreach, newsletters, and announcements'
  },
  analogies: {
    title: 'Free AI Analogy Generator',
    description: 'Create vivid, memorable analogies to explain abstract concepts to any audience.',
    limit: '3 creative analogies',
    input: 'Enter abstract concept and target audience',
    bestFor: 'Speeches, teaching, pitches, and writing'
  },
  'workout-alternatives': {
    title: 'Free AI Workout Exercise Substitute Tool',
    description: 'Find biomechanically sound substitute exercises for movements you dislike or cannot do.',
    limit: '3 targeted exercise alternatives',
    input: 'Exercise to replace and reason or equipment',
    bestFor: 'Home workouts, injury adaptations, and gym routines'
  },
  'playlist-themes': {
    title: 'Free AI Playlist Theme & Vibe Curator',
    description: 'Generate thematic music playlist concepts, song ideas, and genres for specific moods.',
    limit: '10 song/genre concepts',
    input: 'Describe mood, activity, or setting',
    bestFor: 'Focus sessions, road trips, and workout mixes'
  },
  'content-hooks': {
    title: 'Free AI Content Hook Generator',
    description: 'Create scroll-stopping opening lines for YouTube videos, speeches, presentations, or posts.',
    limit: '5 engaging opening hooks',
    input: 'Topic or main thesis of your content',
    bestFor: 'Video scripts, public speaking, and newsletters'
  },

  // Technical & Administrative Shortcuts
  'excel-formulas': {
    title: 'Free AI Excel & Google Sheets Formula Generator',
    description: 'Get the exact spreadsheet formula syntax you need with a clear step-by-step explanation.',
    limit: 'Exact formula + explanation',
    input: 'Describe what you want to calculate',
    bestFor: 'Spreadsheet models, data analysis, and office admin'
  },
  'regex-generator': {
    title: 'Free AI Regular Expression (Regex) Generator',
    description: 'Generate tested regular expressions with clear breakdown of pattern tokens and flags.',
    limit: 'Regex pattern + breakdown',
    input: 'Describe text pattern to match or extract',
    bestFor: 'Validation, data parsing, and scripting'
  },
  'format-converter': {
    title: 'Free AI Data Format Converter (JSON / CSV / Table)',
    description: 'Convert raw lists or unstructured text into clean JSON, Markdown tables, or CSV data.',
    limit: 'Structured data output',
    input: 'Paste raw unstructured text or list',
    bestFor: 'Data cleaning, documentation, and prototyping'
  },
  'sql-queries': {
    title: 'Free AI SQL Query Drafter',
    description: 'Turn plain English questions into clean, optimized ANSI SQL queries for any database.',
    limit: 'Clean SQL query syntax',
    input: 'Describe database tables and required query result',
    bestFor: 'Data analytics, backend development, and reporting'
  },
  'placeholder-text': {
    title: 'Free AI Industry Placeholder Copy Generator',
    description: 'Generate realistic, contextual placeholder text tailored to your industry instead of generic lorem ipsum.',
    limit: '1–3 mock paragraphs',
    input: 'Industry type and page section context',
    bestFor: 'UI/UX wireframes, web design, and client mockups'
  },
  'dummy-data': {
    title: 'Free AI Mock Data Generator',
    description: 'Generate realistic test records (names, emails, phones, dates) for database and UI prototyping.',
    limit: '5 realistic entity records',
    input: 'Specify fields needed (e.g. user, order, company)',
    bestFor: 'Frontend testing, QA, and demo sandboxes'
  },
  'cron-syntax': {
    title: 'Free AI Cron Job Syntax Generator',
    description: 'Generate standard 5-part cron expressions with human-readable schedule breakdowns.',
    limit: 'Cron expression + schedule breakdown',
    input: 'Describe desired schedule in plain English',
    bestFor: 'DevOps, background workers, and automation'
  },
  'css-fixes': {
    title: 'Free AI HTML & CSS Troubleshooter',
    description: 'Diagnose broken flexbox, grid, or responsive styling bugs and get clean, corrected CSS.',
    limit: 'Corrected CSS + diagnosis',
    input: 'Paste broken CSS and describe rendering bug',
    bestFor: 'Frontend styling, responsive design, and bug fixing'
  },
  'cli-commands': {
    title: 'Free AI CLI & Terminal Command Lookup',
    description: 'Lookup exact command-line syntax for Linux, macOS, or PowerShell administration tasks.',
    limit: 'Exact command + argument breakdown',
    input: 'Describe terminal task and OS (bash/zsh/pwsh)',
    bestFor: 'System administration, deployment, and scripting'
  },

  // Professional Productivity & Organization
  'polite-declines': {
    title: 'Free AI Polite Decline & Refusal Generator',
    description: 'Draft gracious, firm, and professional messages declining requests without burning bridges.',
    limit: '1 polite refusal draft',
    input: 'Describe request or invitation to decline',
    bestFor: 'Scope creep, speaking invites, and meeting declines'
  },
  'meeting-agendas': {
    title: 'Free AI 30-Minute Meeting Agenda Builder',
    description: 'Create timed meeting agenda structures with clear objectives, checkpoints, and outcomes.',
    limit: 'Timed agenda breakdown',
    input: 'Meeting purpose and key stakeholders',
    bestFor: 'Client kickoffs, sprint planning, and 1-on-1s'
  },
  'resume-bullets': {
    title: 'Free AI Resume Impact Bullet Point Generator',
    description: 'Transform basic responsibilities into high-impact, quantified resume bullet points.',
    limit: '3 action-driven bullet points',
    input: 'Describe duty, project, or metric achieved',
    bestFor: 'Resume updates, LinkedIn profiles, and job applications'
  },
  'cover-letter-openers': {
    title: 'Free AI Cover Letter Opener Generator',
    description: 'Craft strong, memorable opening paragraphs that immediately connect your background to the job.',
    limit: '1 compelling opening paragraph',
    input: 'Target job title, company, and background highlight',
    bestFor: 'Job applications, career pivots, and pitch emails'
  },
  'bio-writer': {
    title: 'Free AI Professional Bio Writer',
    description: 'Generate clean 150-word third-person professional bios for speaker decks, LinkedIn, or author pages.',
    limit: 'Up to 150 words',
    input: 'Career highlights, expertise, and achievements',
    bestFor: 'Speaker profiles, LinkedIn about section, and personal websites'
  },
  'action-items': {
    title: 'Free AI Note-to-Todo Action Item Formatter',
    description: 'Standardize chaotic personal notes or voice memos into a prioritized, actionable to-do checklist.',
    limit: 'Checklist with [ ] markers',
    input: 'Paste messy notes, transcript, or bullet list',
    bestFor: 'Daily task management, sprint planning, and inbox triage'
  },
  reply: {
    title: 'Free AI Email & Customer Reply Writer',
    description: 'Draft empathetic, human customer support responses and professional follow-up nudges.',
    limit: 'Up to 300 guest / 700 signed-in words',
    input: 'Paste received message and verified facts',
    bestFor: 'Customer support, follow-ups, and email outreach'
  },

  // Lifestyle, Learning & Fun
  'language-drills': {
    title: 'Free AI Daily Language Practice Drills',
    description: 'Get natural conversational phrases with pronunciations and usage tips for any language.',
    limit: '3 conversational phrases',
    input: 'Target language and real-world scenario',
    bestFor: 'Travel prep, language learning, and daily practice'
  },
  'trivia-generator': {
    title: 'Free AI Trivia Question Generator',
    description: 'Generate fun, challenging trivia questions with verified answers and fascinating factoids.',
    limit: '5 trivia Q&A items',
    input: 'Topic, era, or pop-culture category',
    bestFor: 'Pub quizzes, team games, and study breaks'
  },
  'packing-checklist': {
    title: 'Free AI Smart Travel Packing Checklist',
    description: 'Generate a categorized, weather-aware packing list based on destination, climate, and trip duration.',
    limit: 'Categorized checklist',
    input: 'Destination, month/weather, and duration',
    bestFor: 'Vacation planning, business trips, and camping'
  },
  'micro-habits': {
    title: 'Free AI 5-Minute Micro-Habit Generator',
    description: 'Discover friction-free, actionable 5-minute habits to easily build into your daily routine.',
    limit: '3 actionable micro-habits',
    input: 'Goal or area to improve (focus, energy, fitness)',
    bestFor: 'Morning routines, productivity, and wellness'
  },
  'devil-advocate': {
    title: 'Free AI Devil’s Advocate Simulator',
    description: 'Stress-test your assumptions with sharp, rigorous, and balanced counter-arguments.',
    limit: '3 sharp counter-arguments',
    input: 'State your opinion, pitch, or business thesis',
    bestFor: 'Strategic planning, debate prep, and decision-making'
  },
  'math-solver': {
    title: 'Free AI Math Word Problem Solver',
    description: 'Get step-by-step arithmetic explanations and exact calculations for everyday word problems.',
    limit: 'Step-by-step solution + answer',
    input: 'Type or paste word problem or percentage calculation',
    bestFor: 'Budgeting, discounts, tips, and homework help'
  },
  'prompt-optimizer': {
    title: 'Free AI Prompt Optimizer & Enhancer',
    description: 'Rewrite raw prompts with clear roles, rich context, strict constraints, and structured output formats.',
    limit: 'High-leverage prompt template',
    input: 'Paste basic or weak prompt draft',
    bestFor: 'LLM power users, prompt engineering, and workflow automation'
  }
};

export function toolMetadata(tool: string) {
  const t = toolCatalog.find((x) => x.id === tool);
  if (!t) return { title: 'Tool not found', robots: { index: false, follow: false } };
  const s = toolSeo[t.id];
  const title = `${s.title} | QuickieTime`;
  return {
    title,
    description: s.description,
    alternates: { canonical: `/tools/${tool}` },
    openGraph: {
      type: 'website' as const,
      title,
      description: s.description,
      url: `/tools/${tool}`,
      siteName: 'QuickieTime'
    },
    twitter: { card: 'summary' as const, title, description: s.description }
  };
}

export function toolStructuredData(tool: Tool) {
  const t = toolCatalog.find((x) => x.id === tool)!;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/tools/${tool}#page`,
        url: `${siteUrl}/tools/${tool}`,
        name: toolSeo[tool].title,
        description: toolSeo[tool].description,
        isPartOf: { '@id': `${siteUrl}/#website` },
        about: { '@id': `${siteUrl}/#app` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'QuickieTime', item: siteUrl + '/' },
          { '@type': 'ListItem', position: 2, name: t.name, item: `${siteUrl}/tools/${tool}` }
        ]
      }
    ]
  };
}
