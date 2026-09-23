export const guides: Record<string, {
    use: string;
    tips: string[];
    output: string;
    note: string;
}> = {
    // 1-10: Writing & Editing
    'fix-grammar': {
        use: 'Correct punctuation, spelling, syntax, and awkward phrasing while preserving your natural tone and style.',
        tips: [
            'Paste complete sentences so the model can grasp context and subject-verb agreement.',
            'Specify in context if you prefer American, British, or Canadian spelling conventions.',
            'Review the corrected text to ensure intended domain jargon was not altered.'
        ],
        output: 'They are going to announce the product tomorrow, but we do not have the assets ready yet.',
        note: 'Always double-check brand names, abbreviations, and industry terms before publishing.'
    },
    'shift-tone': {
        use: 'Transform dry, blunt, or awkward messages into warm, polite, executive, or playful copy.',
        tips: [
            'Provide the original message and specify the recipient (e.g. client, direct report, executive).',
            'Select tones like Warm, Professional, or Sarcastic to steer the intensity.',
            'Keep core facts, requests, and deadlines intact during the rewrite.'
        ],
        output: 'Hi Alex, following up on sprint progress. Could you let us know when the PR will be ready so we can keep our target release on track?',
        note: 'Tone shifts adapt emotional framing; verify that critical requirements remain unambiguous.'
    },
    'shorten-text': {
        use: 'Condense wordy, bloated prose into crisp, punchy sentences without sacrificing vital meaning.',
        tips: [
            'Paste long paragraphs or convoluted explanations to trim the filler words.',
            'Specify in context whether you want a single sentence or a compact paragraph.',
            'Check that dates, metrics, and conditional clauses were preserved.'
        ],
        output: 'Due to server errors during maintenance, the production release is postponed.',
        note: 'When eliminating filler, confirm that necessary qualifications or disclaimers remain intact.'
    },
    'expand-bullets': {
        use: 'Turn rough, disjointed bullet points into a smooth, narrative paragraph ready for reports or emails.',
        tips: [
            'Provide chronological or logically grouped bullets for best flow.',
            'Specify the target audience (e.g. customers, board members, team mates) in context.',
            'Choose Markdown format if you want styled formatting in the output.'
        ],
        output: 'We are rolling out three new pricing tiers while grandfathering existing users for a full year. In addition, daily free credits will automatically reset every midnight UTC.',
        note: 'Check that logical connectors between bullets accurately represent actual causality.'
    },
    'rsvp-reply': {
        use: 'Draft an elegant, courteous response accepting or declining invitations to dinners, weddings, or meetings.',
        tips: [
            'Mention dietary restrictions, plus-ones, or scheduling constraints in context.',
            'State clearly whether you are accepting or declining.',
            'Select Warm or Polite tone for personal events, or Professional for corporate invitations.'
        ],
        output: 'Thank you so much for the dinner invitation next Thursday. Regrettably, I have a prior family commitment and will not be able to attend, but I hope you have a wonderful evening.',
        note: 'Confirm dates, locations, and time zones in the drafted response before sending.'
    },
    'headlines': {
        use: 'Explore short headline alternatives or email subject lines for the same idea. Compare different angles without generating an entire article.',
        tips: [
            'Describe the actual content so the headlines stay accurate.',
            'Give the target audience and the intended benefit.',
            'Avoid implying guarantees, urgency or facts that the source does not support.'
        ],
        output: 'Your WordPress site, minus the waiting.\nA faster site starts with smaller fixes.\nSpeed up WordPress without the guesswork.\nWhat is slowing your website down?\nSmall changes. Shorter load times.',
        note: 'Choose the clearest accurate hook. A catchy subject line should still match what the reader finds inside.'
    },
    'social': {
        use: 'Turn an announcement or idea into a concise social post. Describe the platform, audience and next action to make the caption useful.',
        tips: [
            'Include the actual offer and any conditions.',
            'Ask for a specific call to action in the context field.',
            'Select the platform and number of captions; X captions have a 280-character ceiling.'
        ],
        output: 'Your deadline is awake. So are we. Midnight coffee delivery for students has landed. Order your late-night backup.',
        note: 'Review offers and availability before publishing. The tool drafts text; it does not publish to social accounts.'
    },
    'rewrite': {
        use: 'Paste a rough paragraph and explain who will read it. The rewriter adjusts clarity, structure and tone while keeping the supplied facts.',
        tips: [
            'Include the full paragraph rather than isolated fragments.',
            'Use context to specify the audience and information that must stay unchanged.',
            'Choose Markdown for documents or WhatsApp for a paste-ready message.'
        ],
        output: 'We’re updating our hosting plans. Your current price stays the same until your next renewal.',
        note: 'Compare dates, names, prices and commitments against your original text before sending. Rewriting should not change what you promised.'
    },
    'active-voice': {
        use: 'Identify and convert passive voice structures into direct, vigorous, active voice sentences.',
        tips: [
            'Paste sentences where subjects and actions feel buried or detached.',
            'Provide the responsible actor if the passive original hid who performed the action.',
            'Use Clear or Professional tone for straightforward business documentation.'
        ],
        output: 'Our leadership team decided to deprecate the legacy server infrastructure.',
        note: 'In legal disclaimers or scientific reporting, passive voice is sometimes intentional; review before replacing.'
    },
    'translate-snippet': {
        use: 'Translate a sentence or short paragraph into another language with natural colloquial fluency.',
        tips: [
            'Name the target language explicitly in your input or context.',
            'Provide conversational context (e.g. formal customer support vs casual chat).',
            'Check idiomatic expressions against a native speaker when publishing high-stakes copy.'
        ],
        output: '¡Nos emociona darle la bienvenida a nuestra comunidad! Si tiene alguna pregunta, nuestro equipo está a su disposición las 24 horas del día.',
        note: 'Machine translation may overlook nuanced cultural idioms; verify critical legal or medical translations.'
    },

    // 11-18: Summarization
    'tldr': {
        use: 'Distill lengthy text, email threads, or articles into exactly three actionable, bite-sized bullet points.',
        tips: [
            'Paste the core content of the message thread or article.',
            'Specify in context whether financial figures or dates must be highlighted.',
            'Review bullet points to confirm no critical dependency was overlooked.'
        ],
        output: '• Q3 marketing budget has been reallocated toward high-converting paid search.\n• A temporary hiring freeze is enacted for outbound sales.\n• All team leads must approve final brand redesign drafts by August 15.',
        note: 'TL;DR summaries omit background deliberations; retain the source document for context.'
    },
    'summarize': {
        use: 'Condense notes, an announcement or a long paragraph into the key points. Choose a paragraph or bullet points using the structure control.',
        tips: [
            'Paste the source text, not a URL: this tool does not fetch web pages.',
            'Choose Brief for essentials or Detailed for more supporting points.',
            'Ask for actions and deadlines only when the source includes them.'
        ],
        output: 'Beta launches Friday. Existing customers receive the first invitations. Feedback will be collected for two weeks before wider release.',
        note: 'Summaries can omit nuance. Keep the original available when the details matter.'
    },
    'meeting-takeaways': {
        use: 'Convert raw meeting notes or transcripts into structured decisions, key discussion points, and next steps.',
        tips: [
            'Paste rough notes with speaker names or timestamps if available.',
            'Mention specific projects or deadlines in context to ensure they are captured.',
            'Share the generated list with attendees for quick asynchronous sign-off.'
        ],
        output: 'Decisions:\n- Team agreed to skip Thursday standup.\n\nAction Items:\n- Sarah: Finalize the slide deck by Wednesday.\n- Alex: Confirm API vendor quotas by Friday.',
        note: 'Verify assigned owners and dates with participants to avoid misunderstandings.'
    },
    'explain-jargon': {
        use: 'Deconstruct dense corporate buzzwords, technical acronyms, or legalese into plain, conversational English.',
        tips: [
            'Include the phrase and the surrounding sentence for accurate contextual definition.',
            'Use Playful or Sarcastic tones if you want humorous, unvarnished interpretations.',
            'Great for onboarding documents, glossary pages, and cross-team knowledge sharing.'
        ],
        output: '“EBITDA margin expansion through synergistic headcount rationalization” simply means: The company is cutting staff to make its quarterly operational profit percentage look higher.',
        note: 'Jargon sometimes carries precise contractual meaning; verify before simplifying in formal contracts.'
    },
    'eli5': {
        use: 'Explain complex, intimidating concepts (e.g. quantum physics, crypto, inflation) as if explaining to a 5-year-old.',
        tips: [
            'State the concept you want explained in simple terms.',
            'Add context about the learner’s background if helpful.',
            'Select Warm or Playful tones to generate relatable, fun real-world analogies.'
        ],
        output: 'Imagine regular computers are like light switches that can only be OFF (0) or ON (1). A quantum computer has magic switches that can spin around in between both at the same time, letting it solve giant puzzles much faster.',
        note: 'Extreme simplification sacrifices mathematical or technical edge cases for intuitive conceptual grasp.'
    },
    'book-summary': {
        use: 'Extract the core thesis, top mental models, and actionable frameworks from any non-fiction book.',
        tips: [
            'Provide the book title and author, plus any specific chapters you are interested in.',
            'Use context to request practical daily exercises or executive takeaways.',
            'Compare the generated frameworks against your reading notes for reinforcement.'
        ],
        output: 'Core Thesis: Small, incremental 1% improvements compound exponentially over time. Systems beat goals.\nKey Frameworks:\n1. Cue, Craving, Response, Reward habit loop.\n2. Environment design over sheer willpower.\n3. Two-minute rule to defeat initial friction.',
        note: 'A framework summary captures key concepts but does not replace the depth of the original text.'
    },
    'explain-code': {
        use: 'Get a clean, plain-English breakdown of code snippets, explaining algorithms, parameters, and potential edge cases.',
        tips: [
            'Paste clean, self-contained functions or blocks of code.',
            'Specify the language (e.g. TypeScript, Python, Rust) if not obvious from syntax.',
            'Add context if you want explanations focused on performance, security, or readability.'
        ],
        output: 'This function creates a debounce wrapper: it delays executing the inner function until a specified number of milliseconds (ms) have passed without any new calls, resetting the timer on every invocation.',
        note: 'AI explanations reflect code syntax; always test code thoroughly in a sandbox environment.'
    },
    'review-pros-cons': {
        use: 'Synthesize scattered customer reviews or testimonials into clear pros, cons, and a purchasing verdict.',
        tips: [
            'Paste multiple authentic customer reviews or feedback snippets.',
            'State the product category and target user persona in context.',
            'Use the output to inform product design, marketing copy, or purchasing decisions.'
        ],
        output: 'Pros:\n• Excellent lumbar support and breathable mesh seating.\n• Easy assembly in under 20 minutes.\n\nCons:\n• Armrests exhibit noticeable wobble over time.\n• Customer support response takes 3–5 business days.\n\nVerdict: Great ergonomics for the price, but build quality on moving parts is mediocre.',
        note: 'Review synthesis depends on input quality; ensure you provide a representative sample of user feedback.'
    },

    // 19-27: Brainstorming & Ideation
    'gift-ideas': {
        use: 'Brainstorm creative, non-generic gift recommendations tailored to age, hobbies, and budget.',
        tips: [
            'Include the recipient’s age, specific interests, and your approximate spending limit.',
            'Mention items they already own to avoid duplicate suggestions.',
            'Use Playful or Clever tone for quirky, memorable gift concepts.'
        ],
        output: '1. Handcrafted Ceramic Espresso Cup Set ($35) — Unique textured glaze for coffee rituals.\n2. Rare Mini Monstera Plant in Terracotta Pot ($28) — Easy care for indoor greenery lovers.\n3. Precision Coffee Scale with Timer ($38) — Great upgrade for manual brewing.',
        note: 'Prices and item availability vary by retailer; use suggestions as thematic starting points.'
    },
    'dinner-recipes': {
        use: 'Generate quick, delicious meal ideas based strictly on ingredients currently in your fridge and pantry.',
        tips: [
            'List all available ingredients, seasonings, and staple oils.',
            'Specify time constraints (e.g. "under 20 minutes") or dietary needs in context.',
            'Choose Markdown for step-by-step cooking instructions.'
        ],
        output: 'Crispy Garlic-Egg Fried Rice:\n1. Sauté sliced scallions in sesame oil until fragrant.\n2. Push scallions to the side, scramble the eggs, then fold in cold brown rice and edamame.\n3. Season with soy sauce and top with crispy scallion greens. Total time: 12 minutes.',
        note: 'Ensure perishable items are fresh; adjust cooking times based on your stove and cookware.'
    },
    'icebreakers': {
        use: 'Generate fun, inclusive, low-stakes questions to break the ice in meetings, workshops, or social gatherings.',
        tips: [
            'Specify the setting (e.g. remote Monday morning standup, cross-functional workshop, casual party).',
            'Indicate preferred vibe (e.g. lighthearted, reflective, geeky).',
            'Select Playful or Clever tone for engaging prompts that avoid corporate cringe.'
        ],
        output: '1. What is a weirdly specific purchase under $20 that improved your daily life?\n2. What is the most useless skill you are secretly proud of possessing?\n3. If you could eliminate one minor everyday chore forever, what would it be?',
        note: 'Keep group dynamics in mind and avoid sensitive or intrusive personal questions.'
    },
    'tagline': {
        use: 'Create a short, memorable line for a business, product or event. Name the audience and one concrete difference before choosing a tone.',
        tips: [
            'Describe what makes your offer different, not just its industry.',
            'Mix two or three compatible tones for a focused result.',
            'Use Make it shorter to sharpen a strong concept; Make it worse explores a more absurd version.'
        ],
        output: 'Your bedtime called. We declined.',
        note: 'A tagline should be easy to say aloud. Check that the wording is suitable for your brand and does not closely resemble another company’s slogan.'
    },
    'email-subjects': {
        use: 'Generate high-converting, curiosity-piquing email subject lines without resort to spam triggers.',
        tips: [
            'Describe the email offer, announcement, or newsletter topic.',
            'Specify whether you want punchy (under 35 chars) or informative subject lines.',
            'Include the target reader (e.g. developers, founders, newsletter subscribers).'
        ],
        output: '• Stop rebuilding the same UI twice\n• 30% off productivity templates (ends Friday)\n• The one habit that doubled our team throughput',
        note: 'Always A/B test subject lines against your own list to measure actual open rates.'
    },
    'analogies': {
        use: 'Create vivid, relatable analogies to explain difficult, abstract, or technical ideas to any audience.',
        tips: [
            'State the complex concept and the background of who you are explaining it to.',
            'Choose Playful or Clever tones for colorful everyday parallels.',
            'Great for pitch decks, customer presentations, and documentation.'
        ],
        output: 'Technical debt is like cooking dinner in a rush without washing the dishes. It feels fast tonight, but tomorrow you can’t make breakfast until you spend an hour scrubbing pots.',
        note: 'Analogies illustrate concepts effectively but break down at deep technical boundaries.'
    },
    'workout-alternatives': {
        use: 'Find exercise substitutions for movements you cannot perform due to injuries, lack of equipment, or preferences.',
        tips: [
            'List the original movement and your limiting factor (e.g. no barbell, lower back sensitivity).',
            'Specify available equipment (e.g. dumbbells, resistance bands, bodyweight).',
            'Mention target muscle group to keep training stimulus aligned.'
        ],
        output: '1. Bulgarian Split Squats with dumbbells — Shifts load off the lower spine while hitting quads and glutes.\n2. Goblet Squats with kettlebell — Keeps torso upright, drastically reducing spinal shear forces.\n3. Leg Press or Hack Squat machine — Provides high quad tension with zero spinal loading.',
        note: 'Consult a physician or physical therapist for serious injuries or acute pain.'
    },
    'playlist-themes': {
        use: 'Design evocative playlist concepts, mood boards, and track curation ideas for focused work, fitness, or relaxation.',
        tips: [
            'Describe the vibe, activity, or atmospheric setting (e.g. neon-lit rainy night drive).',
            'Specify genres (e.g. synthwave, ambient lo-fi, acoustic indie).',
            'Use the generated themes as tracklist anchors for Spotify or Apple Music playlists.'
        ],
        output: 'Theme: "Midnight Terminal Glow"\nVibe: Moody, hypnotic, distraction-free electronic.\nSonic Elements: Warm analog synthesizers, gentle downtempo 85 BPM beats, subtle rain field recordings, zero vocals.',
        note: 'Curate actual streaming rights and track licenses when producing commercial media.'
    },
    'content-hooks': {
        use: 'Generate irresistible hooks and opening lines for short-form video, LinkedIn articles, or newsletter intros.',
        tips: [
            'Provide the core surprising insight or counter-intuitive thesis.',
            'State the platform (e.g. TikTok, YouTube, LinkedIn, Substack).',
            'Select Chaotic or Spicy tones for bold, provocative statements that halt scrolling.'
        ],
        output: '1. Almost every productivity guru is lying to you about morning routines.\n2. We spent $50,000 on ads last month so you don’t have to make the same mistake.\n3. If your website takes longer than 2 seconds to load, half your visitors are already gone.',
        note: 'Ensure your content delivers on the premise promised in the hook to avoid clickbait complaints.'
    },

    // 28-36: Technical & Administrative Shortcuts
    'excel-formulas': {
        use: 'Generate exact, syntactically correct Excel and Google Sheets formulas from plain-English descriptions.',
        tips: [
            'Specify column letters, sheet names, and the exact condition you are calculating.',
            'Indicate if you use Excel 365 / Google Sheets (for modern functions like XLOOKUP or FILTER).',
            'Verify range boundaries (e.g. A2:A100 vs entire column A:A).'
        ],
        output: '=XLOOKUP(A2, Sheet2!A:A, Sheet2!C:C, "Not Found", 0)',
        note: 'Always test formulas on dummy rows before running them across production financial models.'
    },
    'regex-generator': {
        use: 'Create regular expressions for pattern validation, string extraction, and text replacement with clear explanations.',
        tips: [
            'Provide sample matching strings and non-matching strings to test edges.',
            'Specify regex flavor (JavaScript/TypeScript, Python, PCRE) if using lookaheads.',
            'Use the provided breakdown to understand each token.'
        ],
        output: 'Regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/\nMatches standard email format with valid domain extensions.',
        note: 'Regex can be prone to catastrophic backtracking on large strings; test against regex analyzers.'
    },
    'format-converter': {
        use: 'Convert unformatted text, lists, or tables into structured JSON, clean Markdown tables, or CSV data.',
        tips: [
            'Paste your raw text or tab-delimited records.',
            'Specify target output format (e.g. JSON array, CSV, or Markdown).',
            'Review key names and property datatypes for consistency.'
        ],
        output: '[\n  { "item": "Apples", "quantity": 4, "price": 2.50 },\n  { "item": "Bananas", "quantity": 6, "price": 1.80 },\n  { "item": "Oranges", "quantity": 3, "price": 3.00 }\n]',
        note: 'Verify numeric parsing and escape special characters like quotation marks when pasting into databases.'
    },
    'sql-queries': {
        use: 'Draft clean, optimized SQL queries from plain-language requirements for PostgreSQL, MySQL, SQLite, or BigQuery.',
        tips: [
            'Mention table names, relevant columns, and filtering criteria.',
            'Specify SQL dialect (e.g. PostgreSQL, MySQL, BigQuery) for specific date functions.',
            'Request indexes or performance notes in the context field if querying high-volume tables.'
        ],
        output: 'SELECT user_id, SUM(amount) AS total_revenue\nFROM orders\nWHERE status = \'completed\' AND EXTRACT(YEAR FROM created_at) = 2026\nGROUP BY user_id\nORDER BY total_revenue DESC;',
        note: 'Always review queries with EXPLAIN ANALYZE on large tables before running in production.'
    },
    'placeholder-text': {
        use: 'Generate rich, thematic placeholder text and realistic UI copy tailored to your industry instead of generic Latin.',
        tips: [
            'State the domain or product theme (e.g. artisanal bakery, SaaS analytics, travel booking).',
            'Specify desired length (e.g. single headline, card paragraph, hero section).',
            'Makes prototype mockups feel real and polished for stakeholder reviews.'
        ],
        output: 'Single-origin beans roasted in micro-batches every Tuesday morning. Notes of wild blueberry, honeycomb, and dark cocoa, packaged with zero single-use plastics.',
        note: 'Remember to swap placeholder content for verified copy before launching production sites.'
    },
    'dummy-data': {
        use: 'Generate realistic test records (names, email addresses, dates, status codes) formatted as JSON or CSV for prototypes.',
        tips: [
            'Specify the entity fields required (e.g. id, fullName, email, role, signupDate).',
            'Choose the number of records (e.g. 5 or 10 rows).',
            'Specify desired output format (JSON objects, array, or CSV).'
        ],
        output: '[\n  { "id": "usr_01", "name": "Elena Rostova", "role": "Owner", "tier": "Enterprise", "joined": "2026-01-14" },\n  { "id": "usr_02", "name": "Marcus Vance", "role": "Member", "tier": "Pro", "joined": "2026-02-03" }\n]',
        note: 'Use synthetic dummy data only; never paste real customer PII into public AI prompts.'
    },
    'cron-syntax': {
        use: 'Generate standard 5-field UNIX cron schedule syntax with human-readable explanations.',
        tips: [
            'Describe the desired schedule in natural English (e.g. "every Monday at 8 AM UTC").',
            'Specify whether your runtime supports 5-field (standard) or 6-field (with seconds) cron.',
            'Check time zone assumptions (server UTC vs local daylight savings).'
        ],
        output: 'Cron Expression: 30 6 * * 1,3,5\nExplanation: Runs at 06:30 UTC on every Monday, Wednesday, and Friday.',
        note: 'Always verify whether your scheduling engine runs on UTC or local server time.'
    },
    'css-fixes': {
        use: 'Troubleshoot layout bugs, flexbox misalignment, grid overflow, and responsive CSS styling problems.',
        tips: [
            'Paste your current HTML structure and CSS classes.',
            'Explain the unexpected behavior (e.g. child items wrapping unexpectedly or container clipping).',
            'Review cross-browser compatibility for modern properties like subgrid or aspect-ratio.'
        ],
        output: '.container {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 16px;\n}\n.card {\n  flex: 1 1 300px;\n  min-width: 0; /* Prevents text overflow blowouts */\n}',
        note: 'Test layout changes in browser responsive mode across mobile, tablet, and desktop viewports.'
    },
    'cli-commands': {
        use: 'Find exact terminal and shell commands for Linux, macOS, bash, or PowerShell administrative tasks.',
        tips: [
            'State your operating system and shell environment (e.g. Ubuntu bash, macOS zsh, Windows PowerShell).',
            'Describe the file operation, process management, or network check needed.',
            'Review command flags before running commands that modify or delete files.'
        ],
        output: 'find . -type f -size +100M -exec ls -lh {} \\;\nExplaining: Recursively searches current directory for files exceeding 100 megabytes and prints human-readable sizes.',
        note: 'Take extreme care when executing commands with sudo, rm, or chmod flags.'
    },

    // 37-43: Professional Productivity & Organization
    'polite-declines': {
        use: 'Draft professional, graceful refusals to speaking invites, sales pitches, extra projects, or meetings.',
        tips: [
            'Specify the request you are declining and any relationship context.',
            'Mention if you want to leave the door open for future collaboration or make a hard stop.',
            'Select Warm or Professional tone.'
        ],
        output: 'Thank you for thinking of me for this speaking opportunity. Due to existing project commitments, I am unable to take on additional engagements this quarter. I wish you every success with the event.',
        note: 'Polite declines protect your time while preserving professional bridges.'
    },
    'meeting-agendas': {
        use: 'Create structured, time-blocked meeting agendas with explicit objectives and decision checkpoints.',
        tips: [
            'List the main topic, meeting duration (e.g. 30 or 45 mins), and required stakeholders.',
            'State the desired outcome (e.g. decision reached vs brainstorm only).',
            'Circulate the agenda 24 hours prior to the call.'
        ],
        output: 'Objective: Align on Q3 OKR deliverables between Product and Design.\n• 00-05m: Objective context & key metrics review\n• 05-20m: Review proposed priority items and design blockers\n• 20-25m: Agreement on final roadmap commitments\n• 25-30m: Next steps and task assignments',
        note: 'Assign a designated timekeeper to keep the meeting strictly within allotted blocks.'
    },
    'resume-bullets': {
        use: 'Transform mundane daily responsibilities into metric-driven, high-impact resume bullet points.',
        tips: [
            'Provide the role, what you did, and any quantifiable metrics (%, $, time saved).',
            'If exact metrics are unknown, mention the scale of customers, users, or codebase size.',
            'Use active action verbs (e.g. Orchestrated, Engineered, Streamlined).'
        ],
        output: '• Spearheaded customer onboarding redesign, creating self-serve tutorials that decreased incoming support tickets by 34% within 90 days.\n• Authored comprehensive developer documentation utilized by 1,200+ monthly active enterprise engineers.',
        note: 'Ensure all numbers and claims in your resume are accurate and defensible in interviews.'
    },
    'cover-letter-openers': {
        use: 'Craft memorable, personalized opening paragraphs for job applications that hook hiring managers immediately.',
        tips: [
            'Provide the target role, company name, and one concrete reason you admire their work.',
            'Mention your most relevant qualification or recent career achievement.',
            'Avoid generic clichés like "I am writing to express my interest in..."'
        ],
        output: 'Having spent the past four years architecting resilient fintech payment flows at scale, I was thrilled to see Stripe expanding its billing infrastructure team. Your commitment to developer ergonomics matches the exact standards I prioritize in every production system I ship.',
        note: 'Customize every cover letter to the specific company culture and job requirements.'
    },
    'bio-writer': {
        use: 'Format professional third-person bios tailored for conferences, company websites, social media, or publications.',
        tips: [
            'List your current role, years of experience, key achievements, and one personal detail.',
            'Specify target length (e.g. 50 words for Twitter, 150 words for conference speaker decks).',
            'Use Clear or Authoritative tone for executive polish.'
        ],
        output: 'Marcus Vance is a senior systems architect with eight years of experience designing high-throughput cloud infrastructure. He has built open-source developer tools used by thousands of engineering teams globally. When not optimizing query performance, he mentors early-career engineers and brews pour-over coffee in Seattle.',
        note: 'Keep bios updated yearly with recent accomplishments and current affiliations.'
    },
    'action-items': {
        use: 'Convert messy, unstructured brain dumps and stream-of-consciousness notes into an organized task checklist.',
        tips: [
            'Paste your raw notes, reminders, and scattered thoughts without organizing them first.',
            'Specify if you want tasks sorted by urgency or category.',
            'Check off items as completed in your favorite task manager.'
        ],
        output: 'High Priority:\n[ ] Email Dave regarding unpaid Q2 invoice\n[ ] Renew passport before June expiration\n\nAdministrative & Tech:\n[ ] Verify Cloudflare DNS SSL record\n\nPersonal:\n[ ] Grocery run: Milk, whole wheat bread',
        note: 'Review prioritized action items against your calendar to allocate adequate focus time.'
    },
    'reply': {
        use: 'Draft a customer response or email from a message and the facts you provide. Add the desired next step and the tone in the context field.',
        tips: [
            'Remove passwords, payment details and other secrets before pasting.',
            'State what is confirmed and what still needs investigation.',
            'Specify a greeting, closing or call to action in context if needed.'
        ],
        output: 'Hi, thanks for letting us know. Please share the error message and the time of your payment attempt so we can investigate.',
        note: 'The writer cannot inspect orders, server logs or payments. Provide verified facts and review the reply before sending.'
    },

    // 44-50: Lifestyle, Learning & Fun
    'language-drills': {
        use: 'Generate authentic conversational phrases and cultural nuances for real-world scenarios in any language.',
        tips: [
            'Name the language and the specific situation (e.g. ordering in a Tokyo sushi bar, booking a train in Berlin).',
            'Request phonetic pronunciation guides if learning a non-Latin script.',
            'Practice speaking the generated lines aloud.'
        ],
        output: 'French Bakery Scenario:\n1. "Bonjour ! Une baguette tradition bien cuite, s’il vous plaît." (A well-baked traditional baguette, please)\n2. "Avez-vous des croissants chauds ?" (Do you have hot croissants?)\n3. "Ce sera tout pour aujourd’hui, merci !" (That will be all for today, thank you!)',
        note: 'Always check pronunciation with native audio recordings when learning spoken fluency.'
    },
    'trivia-generator': {
        use: 'Generate engaging trivia questions with multiple-choice options, verified answers, and bonus background facts.',
        tips: [
            'Specify the topic, era, or theme (e.g. 90s video games, space exploration, world cinema).',
            'Indicate difficulty level (easy, intermediate, or pub-quiz expert).',
            'Great for team socials, game nights, and newsletter engagement.'
        ],
        output: 'Question: What was the first home video game console to utilize CD-ROM media as its primary storage format?\nAnswer: The PC Engine / TurboGrafx-CD (1988), beating the Sega CD and PlayStation.\nBonus Fact: CDs allowed full orchestral soundtracks and anime voice-overs previously impossible on 16-bit cartridges.',
        note: 'Double-check trivia answers if hosting competitive events with stakes or prizes.'
    },
    'packing-checklist': {
        use: 'Build an ultra-organized, category-based packing list tailored to your destination, climate, and itinerary.',
        tips: [
            'Provide destination, month of travel, trip length, and primary activities (business, hiking, beach).',
            'Mention if you are traveling carry-on only to prioritize lightweight versatility.',
            'Check off items physically as you place them in your luggage.'
        ],
        output: '4-Day Chicago Autumn Trip (Cold & Windy):\nClothing:\n• 1 Windproof winter coat, 1 warm scarf, thermal gloves\n• 3 Layerable knit sweaters, 2 pairs warm trousers\n• Weatherproof walking boots\n\nElectronics & Essentials:\n• Portable phone battery charger (cold drains batteries fast)\n• Travel steamer, noise-canceling headphones, lip balm',
        note: 'Check airline carry-on liquid and weight limits before leaving for the airport.'
    },
    'micro-habits': {
        use: 'Discover high-leverage 2-to-5-minute micro-habits designed for zero friction and effortless daily consistency.',
        tips: [
            'Mention the area of life you want to improve (e.g. hydration, focus, mindfulness, mobility).',
            'Anchor the habit to an existing routine (e.g. "after I pour morning coffee").',
            'Focus on consistency over intensity for the first 30 days.'
        ],
        output: '1. The 20-Second Water Anchor: Drink one full glass of water immediately after turning on the kettle.\n2. Visual Reset: Clear all desktop app windows before closing your laptop lid at the end of the day.\n3. The Doorframe Stretch: Place both hands on the doorframe and take 3 deep breaths whenever walking into your kitchen.',
        note: 'Start with only one micro-habit at a time until it becomes completely automatic.'
    },
    'devil-advocate': {
        use: 'Stress-test your business decisions, product features, and beliefs with rigorous, constructive counter-arguments.',
        tips: [
            'State your proposed hypothesis or decision clearly and candidly.',
            'Ask for the biggest risks, blind spots, or alternative explanations.',
            'Use the output in team pre-mortems to preempt costly mistakes.'
        ],
        output: 'Premise: "Remote work is unconditionally superior for every company."\nCounter-Points to Consider:\n1. Onboarding velocity for junior hires drops without incidental desk-side observation.\n2. Cross-functional serendipity and spontaneous innovation are severely dampened.\n3. Subtle cultural drift and feelings of isolation can increase attrition silently.',
        note: 'A devil’s advocate perspective tests hypotheses; it does not replace empirical user testing.'
    },
    'math-solver': {
        use: 'Solve math word problems with clear, step-by-step arithmetic explanations and verifiable calculations.',
        tips: [
            'Paste the full word problem with all given values and units.',
            'Ask for step-by-step breakdown rather than just the final number.',
            'Review each step to understand the underlying mathematical principle.'
        ],
        output: 'Problem: 25% off item, plus extra 10% coupon on sale price.\nStep 1: After initial 25% discount, you pay 100% - 25% = 75% (0.75) of original price.\nStep 2: The 10% coupon applies to the sale price: 10% of 75% = 7.5%.\nStep 3: Total discount = 25% + 7.5% = 32.5%.\nFinal Answer: The effective discount is 32.5% (not 35%).',
        note: 'Always verify complex engineering, financial, or statistical equations independently.'
    },
    'prompt-optimizer': {
        use: 'Upgrade weak, vague AI prompts into structured, highly effective prompts with roles, context, and constraints.',
        tips: [
            'Paste your draft prompt and state what kind of model or output you want.',
            'Specify the desired format (e.g. JSON, markdown, bullet points).',
            'Notice how the optimized prompt defines persona, constraints, and evaluation criteria.'
        ],
        output: 'Optimized Prompt:\n"You are an executive communications director. Draft a 150-word internal email to an engineering team addressing recent communication bottlenecks. Emphasize clarity and asynchronous documentation without sounding accusatory. Include 3 concrete action steps and end with an open invitation for 1-on-1 feedback."',
        note: 'Test optimized prompts and iterate on specific constraints based on the model’s replies.'
    }
};
