import { z } from 'zod';
import { defaultBrief, inputSchema, type Brief, type Tool } from './config';

export const draftSchema = inputSchema.extend({ idea: z.string().max(24000) });

export const starters: Record<Tool, { label: string; idea: string; context?: string }[]> = {
  // Writing & Editing
  'fix-grammar': [
    { label: 'Fix spelling & agreement', idea: 'Their going to announce the product tomorow, but we doesnt have the assets ready yet.' },
    { label: 'Fix punctuation', idea: 'However we cannot ship this sprint because of QA delays therefore we must postpone the demo' },
  ],
  'shift-tone': [
    { label: 'Warm & polite', idea: 'You missed the deadline again. We cannot finish the sprint without your PR.', context: 'Turn into a supportive, professional reminder.' },
    { label: 'Authoritative', idea: 'Maybe we should consider updating our pricing soon if everyone feels okay with it.' },
  ],
  'shorten-text': [
    { label: 'Trim announcement', idea: 'In view of the fact that the server deployment experienced several unexpected intermittent errors during the late evening maintenance window, we have elected to defer the production release.' },
    { label: 'Punchy bio', idea: 'I am a highly motivated software engineer with over seven years of extensive hands-on experience in building scalable cloud web applications.' },
  ],
  'expand-bullets': [
    { label: 'Feature bullets', idea: '- 3 new pricing tiers\n- grandfather existing users for 1 year\n- free credits reset daily at midnight UTC' },
    { label: 'Event rundown', idea: '- doors open 6 PM\n- keynotes start 7 PM\n- networking drinks afterwards on the rooftop' },
  ],
  'rsvp-reply': [
    { label: 'Polite decline', idea: 'Declining a dinner invitation from a client next Thursday due to a prior family commitment.' },
    { label: 'Enthusiastic yes', idea: 'Accepting an invitation to speak at a local tech meetup next month.' },
  ],
  headlines: [
    { label: 'Newsletter hook', idea: 'A newsletter with three practical ways to speed up a WordPress website without buying extra plugins.' },
    { label: 'Fresh launch', idea: 'A reusable water bottle with a leakproof lid and replaceable parts.' },
  ],
  social: [
    { label: 'A little launch', idea: 'Our neighbourhood bakery is launching a Saturday sourdough workshop. Beginners welcome; booking required.' },
    { label: 'Behind the scenes', idea: 'We make every ceramic mug by hand in our small studio. Each one is slightly different.' },
  ],
  rewrite: [
    { label: 'Less corporate', idea: 'We would like to inform you that we are currently in the process of updating our website. During this period, some pages may be temporarily unavailable.' },
    { label: 'Product polish', idea: 'Our backpack has a laptop pocket and it keeps rain out. It also has a side pocket for your water bottle.' },
  ],
  'active-voice': [
    { label: 'Deprecation notice', idea: 'A decision was made by our leadership team that the legacy server infrastructure would be deprecated.' },
    { label: 'Feature release', idea: 'New analytics dashboards have been added to the customer portal by our engineering team.' },
  ],
  'translate-snippet': [
    { label: 'Spanish welcome', idea: 'Translate to Spanish: We are thrilled to welcome you to our community. If you have any questions, our team is here 24/7.' },
    { label: 'German support', idea: 'Translate to German: Your subscription has been renewed successfully. Thank you for your support!' },
  ],

  // Summarization
  tldr: [
    { label: 'Email chain', idea: 'Thread discussing Q3 marketing budget reallocation, hiring freeze for sales, and upcoming brand redesign approval deadline on August 15.' },
    { label: 'Bug report', idea: 'Users on iOS 18 report sporadic session expiration when switching between Wi-Fi and 5G during checkout. Backend logs show 401 token mismatch.' },
  ],
  summarize: [
    { label: 'Meeting notes', idea: 'The team agreed to launch the beta on Friday. Existing customers will receive invitations first. Maya will prepare the onboarding email by Wednesday. Dev will check the payment flow on Thursday. Feedback will be collected for two weeks before a wider release.' },
    { label: 'Product update', idea: 'Our mobile app update adds offline reading for saved articles. Readers can download up to 20 articles while connected to Wi-Fi. Downloads remain available for seven days. Offline video is not included.' },
  ],
  'meeting-takeaways': [
    { label: 'Sprint retro', idea: 'Sarah will finalize the slide deck by Wednesday. Alex needs to confirm the API quotas with vendor before Friday. Team agreed to skip Thursday standup.' },
    { label: 'Client kickoff', idea: 'Client requested Figma wireframes by next Tuesday. John to share brand assets folder today. Weekly check-in set for Fridays at 11 AM.' },
  ],
  'explain-jargon': [
    { label: 'Finance jargon', idea: 'EBITDA margin expansion through synergistic headcount rationalization' },
    { label: 'Cloud tech', idea: 'Stateless idempotent microservice orchestration via event-driven messaging' },
  ],
  eli5: [
    { label: 'Quantum computing', idea: 'Quantum computing and why qubits can be both 0 and 1 at the same time.' },
    { label: 'Inflation', idea: 'Why printing more money causes prices of groceries and housing to rise.' },
  ],
  'book-summary': [
    { label: 'Atomic Habits', idea: 'Atomic Habits by James Clear: The 4 laws of behavior change.' },
    { label: 'Deep Work', idea: 'Deep Work by Cal Newport: Rules for focused success in a distracted world.' },
  ],
  'explain-code': [
    { label: 'Debounce function', idea: 'const debounce = (fn, ms) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; };' },
    { label: 'SQL JOIN', idea: 'SELECT u.name, SUM(o.amount) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;' },
  ],
  'review-pros-cons': [
    { label: 'Chair reviews', idea: '5 reviews of an ergonomic desk chair: 3 praise lumbar support and mesh fabric, 2 complain about armrest wobbling and slow customer service response.' },
    { label: 'Earbuds reviews', idea: 'Great noise cancellation and battery life, but ear tips hurt after 2 hours and microphone is muffled on calls.' },
  ],

  // Brainstorming & Ideation
  'gift-ideas': [
    { label: 'Plant & coffee lover', idea: 'Gift for a 32-year-old friend who loves indoor plants, espresso brewing, budget $40.' },
    { label: 'Tech hobbyist', idea: 'Birthday gift for a teenager interested in robotics and 3D printing, budget $75.' },
  ],
  'dinner-recipes': [
    { label: 'Fridge scramble', idea: 'Leftover brown rice, eggs, scallions, frozen edamame, sesame oil.' },
    { label: 'Pantry staples', idea: 'Canned chickpeas, diced tomatoes, coconut milk, curry powder, onions.' },
  ],
  'icebreakers': [
    { label: 'Monday sync', idea: 'Virtual team sync for a remote engineering team on Monday morning.' },
    { label: 'New hire welcome', idea: 'Casual icebreaker for a dinner introducing 3 new team members.' },
  ],
  tagline: [
    { label: 'Midnight coffee', idea: 'A coffee shop for students, open until 3 AM.' },
    { label: 'Pet people', idea: 'A dog walking service for busy people. We send a photo after every walk.' },
  ],
  'email-subjects': [
    { label: 'Summer sale', idea: 'Announcing our early summer sale with 30% off all productivity templates.' },
    { label: 'Product launch', idea: 'Introducing QuickieTime 2.0 with 50 AI micro-tools.' },
  ],
  analogies: [
    { label: 'Technical debt', idea: 'Explain technical debt to a non-technical CEO.' },
    { label: 'APIs', idea: 'Explain how REST APIs work to an elementary school student.' },
  ],
  'workout-alternatives': [
    { label: 'Barbell squat', idea: 'Alternative for barbell back squats because of a mild lower back strain.' },
    { label: 'Pull-up substitute', idea: 'Home workout replacement for pull-ups without a pull-up bar.' },
  ],
  'playlist-themes': [
    { label: 'Rainy coding', idea: 'Late-night coding in a rainy city with lo-fi beats and synthwave textures.' },
    { label: 'Morning focus', idea: 'Upbeat acoustic and warm instrumental music for starting a productive morning.' },
  ],
  'content-hooks': [
    { label: 'Productivity paradox', idea: 'Why 90% of to-do list apps actually decrease productivity instead of helping.' },
    { label: 'Remote work myth', idea: 'The counterintuitive reason open-plan offices reduce spontaneous collaboration.' },
  ],

  // Technical & Administrative Shortcuts
  'excel-formulas': [
    { label: 'Lookup latest date', idea: 'Find the latest purchase date for customer ID in Column A matching table on Sheet2.' },
    { label: 'Conditional sum', idea: 'Sum values in Column C if Column A is "Active" and Column B date is in current month.' },
  ],
  'regex-generator': [
    { label: 'Email extract', idea: 'Extract all email addresses from messy text, ignoring trailing punctuation.' },
    { label: 'Phone numbers', idea: 'Match US phone numbers in formats (123) 456-7890, 123-456-7890, or 1234567890.' },
  ],
  'format-converter': [
    { label: 'CSV to JSON', idea: 'Apples, 4, $2.50\nBananas, 6, $1.80\nOranges, 3, $3.00 -> convert to JSON array of objects' },
    { label: 'Text to Markdown table', idea: 'Name | Role | City -> Alice, Frontend, Seattle | Bob, Backend, Austin' },
  ],
  'sql-queries': [
    { label: 'Top revenue users', idea: 'Get total revenue per user for 2026 where orders were status "completed", ordered by revenue desc.' },
    { label: 'Dormant accounts', idea: 'Find users who signed up over 60 days ago but have zero recorded logins in the last 30 days.' },
  ],
  'placeholder-text': [
    { label: 'Coffee shop mockup', idea: 'Dummy text for a boutique coffee roaster eCommerce landing page hero and features.' },
    { label: 'SaaS analytics', idea: 'Realistic UI copy for a cloud security dashboard empty state.' },
  ],
  'dummy-data': [
    { label: 'Customer accounts', idea: '5 realistic SaaS customers with company name, contact person, email, tier, and signup date.' },
    { label: 'E-commerce orders', idea: '5 fake eCommerce orders with order ID, customer name, items count, and dollar total.' },
  ],
  'cron-syntax': [
    { label: 'Every MWF morning', idea: 'Run every Monday, Wednesday, and Friday at 6:30 AM UTC.' },
    { label: 'First day of month', idea: 'Trigger at midnight on the first day of every month.' },
  ],
  'css-fixes': [
    { label: 'Flex squishing', idea: '.container { display: flex; } .card { width: 300px; } - cards are shrinking and squishing text instead of wrapping.' },
    { label: 'Sticky footer', idea: 'Footer jumps up into the middle of the screen when page content is short.' },
  ],
  'cli-commands': [
    { label: 'Large files find', idea: 'Find all files larger than 100MB in the current directory and subdirectories on Ubuntu.' },
    { label: 'Kill port process', idea: 'Find and kill the process currently listening on port 3000 in macOS.' },
  ],

  // Professional Productivity & Organization
  'polite-declines': [
    { label: 'Speaking invitation', idea: 'Decline an invitation to speak at a conference because the schedule is currently full.' },
    { label: 'Scope creep', idea: 'Politely tell a freelance client that the requested feature is outside the agreed project scope.' },
  ],
  'meeting-agendas': [
    { label: 'Quarterly OKRs', idea: 'Quarterly OKR alignment meeting between marketing and product design, 30 minutes.' },
    { label: '1-on-1 check-in', idea: 'Bi-weekly 30-minute manager 1-on-1 discussing growth and unblocking sprint tasks.' },
  ],
  'resume-bullets': [
    { label: 'Customer support', idea: 'Managed customer onboarding and reduced tickets by writing docs and tutorials.' },
    { label: 'Web performance', idea: 'Optimized frontend bundle size and improved page load times for an e-commerce site.' },
  ],
  'cover-letter-openers': [
    { label: 'Senior Designer', idea: 'Applying for Senior Product Designer at a fast-growing fintech startup.' },
    { label: 'DevOps Engineer', idea: 'Applying for Lead Cloud Infrastructure Engineer at a healthcare analytics company.' },
  ],
  'bio-writer': [
    { label: 'Tech founder', idea: 'Full-stack developer with 8 years experience in Node, React, and distributed systems. Built 2 open-source developer tools.' },
    { label: 'Product marketer', idea: 'Growth marketer specializing in B2B SaaS lifecycle emails, conversion rate optimization, and community.' },
  ],
  'action-items': [
    { label: 'Messy voice notes', idea: 'Notes: Need to email Dave re invoices, check cloudflare DNS record, buy groceries (milk, bread), renew passport before June.' },
    { label: 'Meeting transcript', idea: 'Raw bullet points from sync: team to draft specs by Friday, John will handle mockups, need budget sign-off from VP.' },
  ],
  reply: [
    { label: 'Customer question', idea: 'Hi, can I change the delivery address for my order?', context: 'Ask for the order number. Address changes are possible only before dispatch. Do not promise that the change is confirmed.' },
    { label: 'Polite follow-up', idea: 'Could you send me the proposal we discussed?', context: 'The proposal will be ready by Thursday afternoon. Thank them for their patience.' },
  ],

  // Lifestyle, Learning & Fun
  'language-drills': [
    { label: 'Parisian bakery', idea: 'French: Ordering at a bakery in Paris in the morning.' },
    { label: 'Tokyo train station', idea: 'Japanese: Asking for directions to the nearest train station politely.' },
  ],
  'trivia-generator': [
    { label: '90s Gaming', idea: 'Trivia about 1990s video game history and consoles.' },
    { label: 'Space exploration', idea: 'Trivia about the Apollo moon landings and Mars rovers.' },
  ],
  'packing-checklist': [
    { label: 'Winter business trip', idea: '4-day business trip to Chicago in November with cold, windy weather.' },
    { label: 'Weekend hike', idea: '2-day weekend camping and hiking trip in mountain terrain with possible rain.' },
  ],
  'micro-habits': [
    { label: 'Reduce screen time', idea: 'Small habits to reduce screen time and improve focus during remote work.' },
    { label: 'Morning hydration', idea: 'Simple friction-free micro-habits to start the morning hydrated and energized.' },
  ],
  'devil-advocate': [
    { label: 'Remote work', idea: 'Opinion: Remote work is unconditionally superior to in-office work for every company.' },
    { label: 'Subscription fatigue', idea: 'Opinion: Every software company should adopt one-time payments instead of SaaS subscriptions.' },
  ],
  'math-solver': [
    { label: 'Discount math', idea: 'If a store offers 25% off an item, and you have an additional 10% coupon off the sale price, what is the effective total discount?' },
    { label: 'Split bill', idea: 'Bill is $142.50. Add 18% tip and divide evenly among 3 friends. How much does each person pay?' },
  ],
  'prompt-optimizer': [
    { label: 'Team communication', idea: 'Write me an email to my team about improving communication.' },
    { label: 'Code review prompt', idea: 'Review my python code and tell me if it has any bugs.' },
  ],
};

export const sampleLines: Record<Tool, { before: string; after: string; note: string }> = {
  // Writing & Editing
  'fix-grammar': { before: 'Their going to announce the product tomorow.', after: 'They’re going to announce the product tomorrow.', note: 'Flawless grammar with preserved natural voice.' },
  'shift-tone': { before: 'You missed the deadline again.', after: 'Just checking in on the deliverable so we can keep the sprint on track.', note: 'Shifted from aggressive to constructive.' },
  'shorten-text': { before: 'In view of the fact that the server experienced errors, we deferred the release.', after: 'Server errors delayed the release.', note: '70% shorter. Same clarity.' },
  'expand-bullets': { before: '- 3 tiers\n- grandfather 1 yr\n- daily resets', after: 'We are rolling out three new pricing tiers. All existing accounts will be grandfathered for a full year, with daily credits continuing to refresh at midnight UTC.', note: 'Cohesive, ready-to-publish narrative.' },
  'rsvp-reply': { before: 'Can’t make it to dinner on Thursday.', after: 'Thank you so much for the invitation! Unfortunately, I have a prior family commitment that evening and won’t be able to join. I hope you all have a wonderful time.', note: 'Warm, polite, and respectful.' },
  headlines: { before: 'How to make your WordPress site faster.', after: 'Three speed fixes. Zero new plugins.', note: 'Give readers a reason to open.' },
  social: { before: 'Handmade mugs. Each one is different.', after: 'Matching mugs? Not our thing. Every piece leaves our studio with its own little character.', note: 'Give the details a little personality.' },
  rewrite: { before: 'We are currently in the process of updating our website.', after: 'We’re updating our website.', note: 'Same meaning. Less heavy lifting.' },
  'active-voice': { before: 'A decision was made by our team that the server would be deprecated.', after: 'Our team decided to deprecate the server.', note: 'Direct, clear, and energized.' },
  'translate-snippet': { before: 'We are thrilled to welcome you to our community.', after: 'Estamos encantados de darte la bienvenida a nuestra comunidad.', note: 'Idiomatic and fluent translation.' },

  // Summarization
  tldr: { before: '3-paragraph email discussing budget reallocation and approvals.', after: '• Marketing budget reallocated to paid search\n• Sales hiring frozen for Q3\n• Brand redesign sign-off due Aug 15', note: '3 clean, actionable takeaways.' },
  summarize: { before: 'A page of meeting notes, decisions and deadlines.', after: 'Beta: Friday. Invitations: existing customers first. Feedback: two weeks.', note: 'The decisions deserve the spotlight.' },
  'meeting-takeaways': { before: 'Messy transcript from product roadmap sync.', after: '• Sarah: Finalize slides by Wednesday\n• Alex: Confirm API quotas by Friday\n• Team: Thursday standup cancelled', note: 'Clear owners and commitments.' },
  'explain-jargon': { before: 'EBITDA margin expansion through synergistic headcount rationalization', after: 'Increasing company profits by laying off overlapping staff after a merger.', note: 'Plain English without buzzwords.' },
  eli5: { before: 'Quantum superposition and computing.', after: 'Normal computers flip coins that land on heads or tails. A quantum computer spins coins that are both heads and tails until you stop them, letting it test millions of answers at once.', note: 'Simple everyday metaphor.' },
  'book-summary': { before: 'Atomic Habits by James Clear', after: 'Make good habits obvious, attractive, easy, and satisfying. Small 1% daily improvements compound into massive long-term results.', note: 'Core framework distilled in seconds.' },
  'explain-code': { before: 'const debounce = (fn, ms) => ...', after: 'This helper delays running a function until a certain amount of quiet time has passed, preventing repeated rapid clicks from overloading a server.', note: 'Practical execution breakdown.' },
  'review-pros-cons': { before: '5 raw customer reviews of an ergonomic chair.', after: 'PROS: Excellent lumbar support, breathable mesh fabric.\nCONS: Armrests wobble, slow support responses.', note: 'Unbiased balanced digest.' },

  // Brainstorming & Ideation
  'gift-ideas': { before: 'Friend who loves plants and espresso, $40.', after: '1. Hand-blown glass watering bulb + specialty Ethiopian beans\n2. Ceramic pour-over dripper with plant motif\n3. Precision pocket coffee scale\n4. Brass soil moisture meter & espresso cup set\n5. Rare indoor succulent in a terracotta pot', note: 'Thoughtful, targeted ideas.' },
  'dinner-recipes': { before: 'Leftover rice, eggs, scallions, edamame.', after: 'Quick Crispy Edamame Fried Rice: Sizzle cold rice in sesame oil, toss in steamed edamame and chopped scallions, push to the side and scramble eggs directly in the pan. Season with soy sauce.', note: '10-minute zero-waste dinner.' },
  'icebreakers': { before: 'Virtual team sync on Monday morning.', after: '1. What was the most unexpected highlight of your weekend?\n2. What is your go-to beverage to kick off Monday?\n3. If you could eliminate one recurring minor inconvenience forever, what would it be?\n4. What was the last thing that genuinely made you laugh?\n5. Which book, movie, or song has stayed with you recently?', note: 'Low-stakes, high-engagement prompts.' },
  tagline: { before: 'A coffee shop open until 3 AM.', after: 'Bedtime called. We declined.', note: 'A small line with a point of view.' },
  'email-subjects': { before: 'Announcing our early summer sale with 30% off.', after: '1. Early summer preview: 30% off inside\n2. Your summer toolkit just got cheaper\n3. Before the rush: early access open\n4. A little sunny surprise for your inbox\n5. 30% off our most-loved templates', note: 'High curiosity without spam triggers.' },
  analogies: { before: 'Explain technical debt to a non-technical CEO.', after: 'Taking on technical debt is like borrowing on a high-interest credit card to furnish a house quickly. You get to move in faster today, but if you don’t pay down the balance, the interest payments will eat up your entire monthly salary.', note: 'Instantly relatable mental model.' },
  'workout-alternatives': { before: 'Alternative for barbell squats due to back strain.', after: '1. Bulgarian Split Squats (high leg fatigue, minimal spinal compression)\n2. Goblet Squats with kettlebell\n3. Belt Squats or Leg Press', note: 'Safe, biomechanically sound options.' },
  'playlist-themes': { before: 'Late-night coding in a rainy city.', after: '1. Neon Rain: Downtempo synth and soft drum machines\n2. Midnight Terminal: Atmospheric lo-fi beats\n3. Cyber Chill: Gentle ambient pads and Rhodes chords', note: 'Atmospheric audio landscape.' },
  'content-hooks': { before: 'Why to-do list apps decrease productivity.', after: '1. You don’t have a productivity problem—you have a list-management addiction.\n2. Most to-do list apps are just organized anxiety.\n3. The most productive people I know use a single index card.', note: 'Scroll-stopping opening hooks.' },

  // Technical & Administrative Shortcuts
  'excel-formulas': { before: 'Find latest purchase date for customer ID.', after: '=XLOOKUP(A2, Sheet2!A:A, Sheet2!C:C, "Not found", 0, -1)\n\nExplanation: Searches Sheet2 from bottom to top to grab the most recent transaction date.', note: 'Exact syntax ready to paste.' },
  'regex-generator': { before: 'Extract all email addresses from text.', after: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\n\nExplanation: Matches standard username characters followed by @ and a valid domain and top-level extension.`, note: 'Tested pattern with regex explanation.' },
  'format-converter': { before: 'Apples, 4, $2.50\nBananas, 6, $1.80', after: '[\n  { "item": "Apples", "quantity": 4, "price": 2.50 },\n  { "item": "Bananas", "quantity": 6, "price": 1.80 }\n]', note: 'Validated structured data.' },
  'sql-queries': { before: 'Top revenue users in 2026.', after: `SELECT user_id, SUM(amount) AS total_revenue\nFROM orders\nWHERE status = 'completed' AND created_at >= '2026-01-01'\nGROUP BY user_id\nORDER BY total_revenue DESC;`, note: 'Clean standard ANSI SQL query.' },
  'placeholder-text': { before: 'Coffee roaster landing page copy.', after: 'Single-origin beans sourced with conscience. Roasted small, shipped fresh, brewed bold every morning.', note: 'Realistic contextual copy.' },
  'dummy-data': { before: '5 realistic SaaS customers.', after: `1. Elena Rostova | elena@vertexflow.io | Enterprise | 45 seats\n2. Marcus Chen | mchen@cloudpulse.tech | Pro | 12 seats\n3. Sophia Al-Mansoor | sophia@nexusbi.co | Enterprise | 120 seats\n4. Liam O'Connor | liam@galestock.com | Starter | 3 seats\n5. Priya Sharma | priya@zenithdata.in | Pro | 25 seats`, note: 'Realistic prototyping records.' },
  'cron-syntax': { before: 'Every Monday, Wednesday, Friday at 6:30 AM UTC.', after: `30 6 * * 1,3,5\n\nMinute: 30\nHour: 6 (06:00 UTC)\nDay of month: Any (*)\nMonth: Any (*)\nDay of week: 1,3,5 (Mon, Wed, Fri)`, note: 'Standard POSIX cron expression.' },
  'css-fixes': { before: 'Flex cards are squishing text instead of wrapping.', after: `.container {\n  display: flex;\n  flex-wrap: wrap; /* Fix: allow cards to wrap */\n  gap: 16px;\n}\n.card {\n  flex: 1 1 300px; /* Allow growth, base 300px */\n}`, note: 'Actionable bug fix with explanation.' },
  'cli-commands': { before: 'Find files larger than 100MB on Ubuntu.', after: 'find / -type f -size +100M -exec ls -lh {} + 2>/dev/null', note: 'Precise terminal command.' },

  // Professional Productivity & Organization
  'polite-declines': { before: 'Decline conference speaking invitation.', after: 'Thank you very much for the invitation to speak at the summit. While I am honored by the consideration, my schedule is fully committed through next quarter and I won’t be able to participate. I wish you and the attendees a fantastic event!', note: 'Gracious, firm professional refusal.' },
  'meeting-agendas': { before: 'Quarterly OKR alignment meeting, 30 minutes.', after: '• 00–05m: Review Q1 outcomes & key metrics\n• 05–15m: Propose top 3 joint initiatives for Q2\n• 15–25m: Identify dependencies & resource bottlenecks\n• 25–30m: Confirm owners, action items & next milestones', note: 'Strictly timed 30-minute agenda.' },
  'resume-bullets': { before: 'Managed onboarding and reduced tickets with docs.', after: '• Architected automated self-serve customer onboarding portal, reducing support ticket volume by 38% in the first quarter.\n• Authored 25+ technical documentation guides adopted by 14,000+ active customers.', note: 'Metric-driven resume statements.' },
  'cover-letter-openers': { before: 'Applying for Senior Product Designer at fintech.', after: 'When designing financial tools, clarity isn’t just aesthetic—it builds user trust. Over the past six years leading UX for high-volume banking platforms, I’ve specialized in turning complex transaction workflows into frictionless, transparent user journeys.', note: 'Engaging, authentic introduction.' },
  'bio-writer': { before: 'Full-stack developer with 8 years experience.', after: 'Alex Vance is a full-stack software engineer with eight years of experience building resilient cloud systems and developer tooling. Passionate about minimalism and sub-second performance, Alex has authored multiple open-source utilities and currently leads infrastructure architecture for distributed web platforms.', note: 'Crisp 150-word third-person profile.' },
  'action-items': { before: 'Notes: Email Dave, check DNS, buy milk, renew passport.', after: `High Priority:\n[ ] Email Dave regarding pending Q2 invoice reconciliation\n[ ] Verify Cloudflare DNS records for production domain\n\nPersonal / Administrative:\n[ ] Submit passport renewal paperwork before June deadline\n[ ] Grocery run: milk, whole-wheat bread`, note: 'Structured, prioritized checklist.' },
  reply: { before: 'Can I change my delivery address?', after: 'Please send your order number. We can check whether it’s still possible before dispatch.', note: 'Helpful. Human. No invented promises.' },

  // Lifestyle, Learning & Fun
  'language-drills': [
    { before: 'French bakery morning.', after: `1. "Bonjour ! Une baguette tradition bien cuite, s'il vous plaît." (A well-baked traditional baguette, please.)\n2. "Est-ce que vous avez encore des croissants aux amandes ?" (Do you still have almond croissants?)\n3. "Ce sera tout pour aujourd'hui, merci. Je paie par carte." (That will be all today, thank you. I'll pay by card.)`, note: 'Natural, idiomatic French phrasing.' },
  ][0],
  'trivia-generator': { before: '1990s video game trivia.', after: `1. Q: What was Nintendo's first 64-bit console codename before launch?\nA: Project Reality (later Ultra 64).\n\n2. Q: In what year did Sony release the original PlayStation in North America?\nA: 1995.\n\n3. Q: Which game popularized the survival horror genre in 1996?\nA: Resident Evil.`, note: '5 engaging trivia Q&As.' },
  'packing-checklist': { before: '4-day trip to Chicago in November.', after: `Clothing:\n[ ] 1 Heavy wool or down winter coat\n[ ] 2 Thermal base layer shirts\n[ ] 3 Button-down shirts or sweaters\n[ ] 1 Pair dress trousers & 1 pair warm denim\n[ ] 1 Warm beanie & windproof gloves\n\nFootwear & Tech:\n[ ] Waterproof walking boots\n[ ] Laptop, charger, and portable power bank\n\nToiletries:\n[ ] Travel moisturizer & lip balm (combats dry wind)`, note: 'Tailored weather-aware packing list.' },
  'micro-habits': { before: 'Reduce screen time during remote work.', after: '1. The 20-20-20 Gaze: Every 20 minutes, look at an object 20 feet away for 20 seconds to reset eye muscles.\n2. Phone Out of Arm’s Reach: Place your phone in a drawer across the room while in deep work blocks.\n3. Screen-Free Coffee: Take your morning coffee or tea without looking at a device for the first 5 minutes.', note: 'Low-friction sustainable micro-habits.' },
  'devil-advocate': { before: 'Remote work is unconditionally superior for all companies.', after: '1. Junior Onboarding & Apprenticeship: Informal osmosis learning from senior peers drops drastically without shared physical proximity.\n2. Spontaneous Innovation: Unplanned hallway conversations often spark cross-disciplinary ideas that rarely get scheduled on Zoom.\n3. Asymmetric Information Silos: In fast-changing early-stage pivots, alignment friction increases when context isn’t continuously shared in real time.', note: 'Sharp, objective counter-arguments.' },
  'math-solver': { before: '25% off then additional 10% coupon.', after: `Step 1: After 25% discount, you pay 75% of the original price (0.75).\nStep 2: The 10% coupon applies to the discounted price, so you pay 90% of that: 0.75 × 0.90 = 0.675.\nStep 3: Total effective price is 67.5% of original.\n\nTotal Discount: 100% - 67.5% = 32.5% effective total discount (not 35%).`, note: 'Step-by-step breakdown with final answer.' },
  'prompt-optimizer': { before: 'Write me an email to my team about improving communication.', after: `Role: Engineering Lead / Team Manager\nTask: Draft a concise, non-accusatory email addressing recent communication gaps.\nContext: Remote team across 3 time zones; critical updates are getting lost in Slack threads.\nConstraints:\n- Under 150 words\n- Encouraging and constructive tone\n- Introduce 2 clear action rules: document decisions in Jira, summarize daily progress asynchronously\n- Conclude with an open invitation for feedback`, note: 'High-leverage structured prompt.' },
};

export function readDrafts(raw: string | null): Partial<Record<Tool, Brief>> {
  const result: Partial<Record<Tool, Brief>> = {};
  try {
    const saved = JSON.parse(raw || '{}');
    for (const tool of Object.keys(starters) as Tool[]) {
      const parsed = draftSchema.safeParse(saved[tool]);
      if (parsed.success && parsed.data.tool === tool) result[tool] = parsed.data;
    }
  } catch {}
  return result;
}

export function nextDraft(tool: Tool, drafts: Partial<Record<Tool, Brief>>, project: string) {
  return drafts[tool] || { ...defaultBrief(tool), project };
}
