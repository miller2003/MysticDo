/* ============================================================
   MysticDo Quiz Library — v0.1
   Multi-quiz data: general (Do What Fits) + 4 category quizzes.
   Each quiz: { id, title, subtitle, questions[], results{} }
   Each question: { id, q, hint, options[{text, detail, score, [tags]}] }
   `score` is one or more keys (comma-sep) tallied per quiz.
   Designed as drafts — user will refine per-quiz question copy later.
   ============================================================ */
window.MYSTICDO_QUIZZES = {

  /* ----------------------------------------------------------
     1. GENERAL — "Do What Fits"
     For users who don't know what they need yet. 7 questions.
     Maps to a primary category + an intent archetype.
     ---------------------------------------------------------- */
  general: {
    id: 'general',
    title: 'Do What Fits',
    subtitle: 'Seven questions. No signup. We map you to the kind of spiritual guidance that actually fits — and the next step to take.',
    questions: [
      {
        id: 'pull',
        q: 'What\u2019s pulling at you most right now?',
        hint: 'Pick the one that feels closest, even if it\u2019s not exact.',
        options: [
          { text: 'A relationship', detail: 'love, an ex, a breakup, uncertainty', score: 'love' },
          { text: 'My work or career', detail: 'a job, a move, a direction', score: 'career' },
          { text: 'Money and security', detail: 'income, debt, a financial decision', score: 'money' },
          { text: 'Where my life is going', detail: 'purpose, big-picture direction', score: 'life' },
          { text: 'A loss', detail: 'someone who passed, an ending', score: 'loss' },
          { text: 'Something I can\u2019t name', detail: 'a feeling, a recurring pattern', score: 'spiritual' },
          { text: 'A specific decision I have to make', detail: 'between options, under pressure', score: 'decision' }
        ]
      },
      {
        id: 'mode',
        q: 'Are you trying to understand what\u2019s happening, or figure out what to do?',
        hint: 'Both is a real answer.',
        options: [
          { text: 'Understand what\u2019s happening', detail: 'clarity on the situation', score: 'understand' },
          { text: 'Figure out what to do', detail: 'a next action', score: 'decide' },
          { text: 'Both, honestly', detail: 'I want the picture and the path', score: 'both' }
        ]
      },
      {
        id: 'time',
        q: 'How soon does this need to resolve?',
        hint: 'Timing shapes which tool fits.',
        options: [
          { text: 'Now \u2014 days or weeks', detail: 'something pressing', score: 'now' },
          { text: 'This year', detail: 'a season or arc', score: 'year' },
          { text: 'The long arc of my life', detail: 'years, direction', score: 'long' },
          { text: 'No timeline \u2014 just clarity', detail: 'whenever it lands', score: 'none' }
        ]
      },
      {
        id: 'cat',
        q: 'When you imagine getting help, what sounds closest?',
        hint: 'If you genuinely don\u2019t know, pick the last option \u2014 we\u2019ll infer from your other answers.',
        options: [
          { text: 'A direct, conversational read on my question', detail: 'someone responds to me', score: 'psychic' },
          { text: 'A structured mirror to reflect with', detail: 'cards, symbols, a spread', score: 'tarot' },
          { text: 'Big-picture patterns, timing, compatibility', detail: 'birth chart, transits, arcs', score: 'astrology' },
          { text: 'A sense of connection or meaning around loss', detail: 'presence, closure', score: 'medium' },
          { text: 'I genuinely don\u2019t know', detail: 'help me figure it out', score: 'unknown' }
        ]
      },
      {
        id: 'exp',
        q: 'How much have you explored spiritual guidance before?',
        hint: 'This calibrates the recommendation\u2019s depth.',
        options: [
          { text: 'This is new to me', detail: 'never really tried anything', score: 'new' },
          { text: 'I\u2019ve read horoscopes or pulled cards casually', detail: 'light, occasional', score: 'casual' },
          { text: 'I\u2019ve had readings before', detail: 'a few real sessions', score: 'some' },
          { text: 'I mostly know what works for me', detail: 'I\u2019m refining, not exploring', score: 'experienced' }
        ]
      },
      {
        id: 'val',
        q: 'What would make this worth it for you?',
        hint: 'The value you\u2019re after shapes the fit.',
        options: [
          { text: 'A specific, actionable next step', detail: 'something I can do', score: 'action' },
          { text: 'A new perspective I couldn\u2019t reach alone', detail: 'a different angle', score: 'perspective' },
          { text: 'Feeling seen or understood', detail: 'someone gets it', score: 'seen' },
          { text: 'Reassurance about a decision', detail: 'permission to act', score: 'reassurance' }
        ]
      },
      {
        id: 'budget',
        q: 'What\u2019s your comfort zone for a first session?',
        hint: 'No wrong answer. This filters the provider tier.',
        options: [
          { text: 'Free or under $20', detail: 'try before I commit', score: 'low' },
          { text: '$20\u2013$60', detail: 'a real session, modest', score: 'mid' },
          { text: '$60\u2013$200', detail: 'investing in a good fit', score: 'high' },
          { text: 'Whatever\u2019s right, within reason', detail: 'fit matters more than price', score: 'flex' }
        ]
      }
    ],
    results: {
      /* Results are produced by the engine's resolve() function below,
         but we also provide the human-readable result templates here. */
      psychic: {
        path: 'A direct, conversational read',
        archetype: 'You\u2019re looking for a responsive outside perspective on a specific person or situation.',
        primary: { name: 'Psychic Reading', fit: 'when you want a direct, conversational read on a specific question', href: '/psychic/' },
        secondary: { name: 'Tarot Reading', fit: 'if you also want to reflect on the dynamics around it', href: '/tarot/' },
        before: '/guides/before-paying-psychic-reading',
        quiz: '/quiz/psychic'
      },
      tarot: {
        path: 'A structured reflection',
        archetype: 'You\u2019re looking to reflect on a dynamic or pattern rather than be told an answer.',
        primary: { name: 'Tarot Reading', fit: 'when you want a structured spread to surface angles you can\u2019t see alone', href: '/tarot/' },
        secondary: { name: 'Astrology Reading', fit: 'if timing or long-arc patterns are also part of the question', href: '/astrology/' },
        before: '/guides/psychic-vs-tarot',
        quiz: '/quiz/tarot'
      },
      astrology: {
        path: 'Patterns, timing, and the big picture',
        archetype: 'You\u2019re working with timing, compatibility, or a life-arc question \u2014 not a single moment.',
        primary: { name: 'Astrology Reading', fit: 'when timing, transits, and long-arc patterns are what you need', href: '/astrology/' },
        secondary: { name: 'Tarot Reading', fit: 'for a structured reflection on a specific decision within that arc', href: '/tarot/' },
        before: '/astrology/',
        quiz: '/quiz/astrology'
      },
      medium: {
        path: 'Connection and meaning around loss',
        archetype: 'You\u2019re navigating loss and looking for a sense of presence, meaning, or things left unsaid.',
        primary: { name: 'Medium Reading', fit: 'when you want to connect with someone who has passed', href: '/medium/' },
        secondary: { name: 'Psychic Reading', fit: 'if you also want intuitive clarity on unanswered questions', href: '/psychic/' },
        before: '/medium/',
        quiz: '/quiz/medium'
      }
    },
    /* Custom resolver: general quiz infers category from cat-question + cross-references */
    resolve: function (answers) {
      var cat = answers.cat; // psychic | tarot | astrology | medium | unknown
      var intent = answers.pull; // love | career | money | life | loss | spiritual | decision
      var mode = answers.mode;
      var time = answers.time;

      // If user explicitly picked a category, use it (with one redirect: patterns→tarot)
      if (cat !== 'unknown') {
        if (intent === 'spiritual' && cat === 'psychic') {
          // vague feeling + psychic → tarot often fits better
          return 'tarot';
        }
        return cat;
      }
      // Infer from intent + mode + time
      if (intent === 'loss') return 'medium';
      if (intent === 'spiritual') return 'tarot';
      if (intent === 'life' || (time === 'long')) return 'astrology';
      if (intent === 'love' && mode === 'understand') return 'tarot';
      if (intent === 'love' && mode === 'decide') return 'psychic';
      if (intent === 'career' || intent === 'money') {
        return (time === 'year' || time === 'long') ? 'astrology' : 'psychic';
      }
      if (intent === 'decision') {
        return (time === 'year' || time === 'long') ? 'astrology' : 'psychic';
      }
      // Fallback
      return 'psychic';
    }
  },

  /* ----------------------------------------------------------
     2. ASTROLOGY — for users already interested in astrology
     ---------------------------------------------------------- */
  astrology: {
    id: 'astrology',
    title: 'Which Astrology Reading Fits You?',
    subtitle: 'Five questions. We match you to the right kind of astrology reading \u2014 natal, transit, synastry, or solar return \u2014 and flag what you need first.',
    questions: [
      {
        id: 'birthtime',
        q: 'Do you know your exact birth time?',
        hint: 'Serious astrology needs it. Without it, houses and angles are approximate.',
        options: [
          { text: 'Yes, I have it', detail: 'from birth certificate or records', score: 'yes' },
          { text: 'Roughly \u2014 within an hour or two', detail: 'family memory', score: 'rough' },
          { text: 'No', detail: 'I don\u2019t know it', score: 'no' }
        ]
      },
      {
        id: 'goal',
        q: 'What do you want astrology to help with?',
        hint: 'Different goals map to different reading types.',
        options: [
          { text: 'Understanding myself', detail: 'tendencies, themes, blind spots', score: 'self' },
          { text: 'Timing', detail: 'when to act, when a window opens', score: 'timing' },
          { text: 'A relationship', detail: 'compatibility, dynamics', score: 'relationship' },
          { text: 'The year ahead', detail: 'themes and arcs for this year', score: 'year' }
        ]
      },
      {
        id: 'scope',
        q: 'Is the question mostly about you, a relationship, or a situation?',
        hint: 'Scope picks the reading\u2019s frame.',
        options: [
          { text: 'Me', detail: 'my chart, my patterns', score: 'self' },
          { text: 'A relationship', detail: 'two charts together', score: 'relationship' },
          { text: 'A situation or decision', detail: 'a crossroads', score: 'situation' }
        ]
      },
      {
        id: 'horizon',
        q: 'What time horizon are you thinking about?',
        hint: '',
        options: [
          { text: 'Right now / this month', detail: 'immediate', score: 'now' },
          { text: 'This year', detail: 'a season', score: 'year' },
          { text: 'My life arc', detail: 'years, direction', score: 'life' }
        ]
      },
      {
        id: 'format',
        q: 'How do you prefer to receive it?',
        hint: '',
        options: [
          { text: 'Live session with an astrologer', detail: 'conversational, responsive', score: 'live' },
          { text: 'A written report I can revisit', detail: 'reference document', score: 'report' },
          { text: 'An app I check on my phone', detail: 'low-stakes, ongoing', score: 'app' }
        ]
      }
    ],
    resolve: function (answers) {
      if (answers.birthtime === 'no') return 'no_birthtime';
      if (answers.format === 'app') return 'app_starter';
      if (answers.goal === 'relationship' || answers.scope === 'relationship') return 'synastry';
      if (answers.goal === 'year') return 'solar_return';
      if (answers.goal === 'timing' || answers.scope === 'situation') return 'transit';
      return 'natal';
    },
    results: {
      natal: {
        path: 'Natal Chart Reading',
        archetype: 'A natal reading maps your tendencies, themes, and blind spots from your birth chart. Best for self-understanding and life-arc questions.',
        primary: { name: 'Natal Chart Reading', fit: 'a 60\u201390 min session interpreting your birth chart', href: '/astrology/' },
        budget: '$80\u2013$250 / session',
        before: 'Bring your exact birth time, date, and place. Without it, the chart\u2019s houses are guesses.'
      },
      transit: {
        path: 'Transit Reading',
        archetype: 'A transit reading looks at how current planetary movements interact with your natal chart \u2014 best for \u201cwhen is the window open?\u201d questions.',
        primary: { name: 'Transit Reading', fit: 'shorter, focused on current timing', href: '/astrology/' },
        budget: '$60\u2013$180 / session',
        before: 'You\u2019ll need a natal chart first \u2014 if you don\u2019t have one, ask for a natal + transit combo session.'
      },
      synastry: {
        path: 'Synastry (Compatibility) Reading',
        archetype: 'Synastry compares two birth charts to describe how the people interact \u2014 dynamics, friction points, long-term patterns.',
        primary: { name: 'Synastry Reading', fit: 'for relationship dynamics and compatibility', href: '/astrology/' },
        budget: '$100\u2013$250 / session',
        before: 'You\u2019ll need both people\u2019s birth times. The other person\u2019s consent matters \u2014 consider whether they\u2019d want their chart read.'
      },
      solar_return: {
        path: 'Solar Return Reading',
        archetype: 'A solar return reading covers the themes and arcs of your personal year \u2014 best for \u201cwhat\u2019s this year about?\u201d',
        primary: { name: 'Solar Return Reading', fit: 'year-ahead themes', href: '/astrology/' },
        budget: '$80\u2013$200 / session',
        before: 'Run near your birthday. Needs an accurate natal chart first.'
      },
      app_starter: {
        path: 'App-based starter',
        archetype: 'A free or cheap chart-generation app is the lowest-stakes way to see your chart. Good for curiosity, not for a real question.',
        primary: { name: 'App-based astrology', fit: 'free chart generation + light interpretation', href: '/astrology/#providers' },
        budget: 'Free \u2013 $20/mo',
        before: 'Interpretation is generic. If a real question surfaces, upgrade to a live reading \u2014 see the other results here.'
      },
      no_birthtime: {
        path: 'Get your birth time first',
        archetype: 'Without your exact birth time, astrology\u2019s houses and angles can\u2019t be computed accurately. A serious reading will be limited.',
        primary: { name: 'Find your birth time', fit: 'birth certificate, hospital records, family', href: '/astrology/' },
        budget: 'Free to request',
        before: 'Once you have it, retake this quiz. In the meantime, sun-sign columns are the only astrology that doesn\u2019t need birth time \u2014 and they\u2019re the lowest-value product.'
      }
    }
  },

  /* ----------------------------------------------------------
     3. PSYCHIC — for users already considering a psychic reading
     ---------------------------------------------------------- */
  psychic: {
    id: 'psychic',
    title: 'Which Psychic Reading Fits You?',
    subtitle: 'Five questions. We match you to the right format and reader type \u2014 and redirect you to tarot if that\u2019s actually what fits.',
    questions: [
      {
        id: 'focus',
        q: 'Do you have a specific question, or more of a vague feeling?',
        hint: '',
        options: [
          { text: 'One specific question', detail: 'I know what I want to ask', score: 'specific' },
          { text: 'A vague feeling or situation', detail: 'I can\u2019t pin it down yet', score: 'vague' },
          { text: 'A few things', detail: 'more than one thread', score: 'multi' }
        ]
      },
      {
        id: 'about',
        q: 'What\u2019s the question mostly about?',
        hint: 'If it\u2019s about your own patterns, tarot often fits better \u2014 we\u2019ll redirect you.',
        options: [
          { text: 'A specific person', detail: 'partner, ex, family member, colleague', score: 'person' },
          { text: 'A decision', detail: 'job, move, offer', score: 'decision' },
          { text: 'A situation I can\u2019t read', detail: '\u201cwhat\u2019s going on here?\u201d', score: 'situation' },
          { text: 'My own patterns', detail: 'why do I keep\u2026', score: 'patterns' }
        ]
      },
      {
        id: 'want',
        q: 'What do you want from the reading?',
        hint: '',
        options: [
          { text: 'A direct perspective on what\u2019s going on', detail: 'an outside read', score: 'perspective' },
          { text: 'Clarity or reassurance on a decision', detail: 'permission to act', score: 'clarity' },
          { text: 'To feel seen or understood', detail: 'someone gets it', score: 'seen' },
          { text: 'Specific verifiable details', detail: 'facts I can check', score: 'details' }
        ]
      },
      {
        id: 'format',
        q: 'How do you want the session to feel?',
        hint: '',
        options: [
          { text: 'Quick, low-pressure, written', detail: 'chat / text-based', score: 'chat' },
          { text: 'Conversational, on the phone', detail: 'live voice, follow-up', score: 'phone' },
          { text: 'Face-to-face, video', detail: 'rapport, body language', score: 'video' },
          { text: 'In person', detail: 'local reader', score: 'inperson' }
        ]
      },
      {
        id: 'exp',
        q: 'Is this your first psychic reading?',
        hint: '',
        options: [
          { text: 'Yes, first time', detail: 'I\u2019ve never done this', score: 'new' },
          { text: 'I\u2019ve had a few', detail: 'some experience', score: 'some' },
          { text: 'I know what works for me', detail: 'I\u2019m refining', score: 'experienced' }
        ]
      }
    ],
    resolve: function (answers) {
      if (answers.about === 'patterns') return 'redirect_tarot';
      if (answers.want === 'details') return 'specialist';
      if (answers.format === 'chat' && answers.focus === 'specific') return 'chat_short';
      if (answers.format === 'phone') return 'phone_focused';
      if (answers.format === 'video' || answers.format === 'inperson') return 'video_session';
      if (answers.exp === 'experienced') return 'independent';
      return 'platform_intro';
    },
    results: {
      chat_short: {
        path: 'Chat-based psychic, short session',
        archetype: 'You have a specific question and want a low-pressure, written read. Chat format is the lowest-friction way in.',
        primary: { name: 'Chat-based psychic reading', fit: 'platform chat, 10\u201315 min', href: '/psychic/' },
        budget: '$1\u2013$10 / min \u2014 ~$15\u2013$30 first session',
        before: 'Sharpen the question first. Vague worries produce vague reads. See the Question Generator (coming soon).'
      },
      phone_focused: {
        path: 'Phone psychic, focused 15\u201320 min',
        archetype: 'Phone is the most common entry format \u2014 conversational, responsive, follow-up in real time.',
        primary: { name: 'Phone psychic reading', fit: 'live voice, 15\u201320 min focused session', href: '/psychic/' },
        budget: '$2\u2013$15 / min \u2014 ~$30\u2013$60 first session',
        before: 'Set a time budget before connecting. Read How to Choose a Psychic Reader first.'
      },
      video_session: {
        path: 'Video or in-person session',
        archetype: 'You want rapport and body language. Video and in-person suit users who want a face-to-face feel.',
        primary: { name: 'Video / in-person psychic reading', fit: 'for rapport and nuance', href: '/psychic/' },
        budget: '$3\u2013$20 / min (video); $60\u2013$300 / session (in-person)',
        before: 'Vet the reader more carefully \u2014 the medium matters less than the reader\u2019s fit. See How to Choose a Psychic Reader.'
      },
      independent: {
        path: 'Independent per-session reader',
        archetype: 'You\u2019ve had readings and know what works. Independent per-session readers offer longer, structured sessions.',
        primary: { name: 'Independent psychic reader', fit: 'per-session, 45\u201390 min, vetted', href: '/psychic/#providers' },
        budget: '$60\u2013$300 / session',
        before: 'Ask the three questions in How to Choose a Psychic Reader before booking.'
      },
      specialist: {
        path: 'Specialist reader \u2014 with verification',
        archetype: 'You want specific, verifiable details. That\u2019s the hardest ask in this category \u2014 it raises the fraud risk. Choose carefully.',
        primary: { name: 'Evidential / specialist psychic', fit: 'vetted independent reader with a track record of specifics', href: '/psychic/' },
        budget: '$100\u2013$300 / session',
        before: 'No responsible reader guarantees specifics. Bring the question, share minimal context, let them bring the detail. Read How to Choose a Psychic Reader\u2019s red flags first.'
      },
      platform_intro: {
        path: 'Platform with intro offers',
        archetype: 'First-time? A large platform with intro minutes and a clear refund policy is the safest entry point.',
        primary: { name: 'Platform intro offer', fit: 'first 3 min free or discounted, refund policy', href: '/psychic/#providers' },
        budget: '$10\u2013$30 first session',
        before: 'Treat free minutes as a sample, not a free reading. Read Before Paying for a Psychic Reading.'
      },
      redirect_tarot: {
        path: 'Actually, tarot may fit better',
        archetype: 'You\u2019re asking about your own patterns \u2014 and that\u2019s tarot\u2019s core strength, not psychic\u2019s. A psychic reads a person or situation; tarot reflects a pattern.',
        primary: { name: 'Take the Tarot quiz instead', fit: 'tarot fits pattern questions better than psychic', href: '/quiz/tarot' },
        budget: 'Free quiz',
        before: 'If you still want a psychic read on a specific person after the tarot quiz, come back here \u2014 but start with tarot.'
      }
    }
  },

  /* ----------------------------------------------------------
     4. TAROT — for users considering a tarot reading
     ---------------------------------------------------------- */
  tarot: {
    id: 'tarot',
    title: 'Which Tarot Reading Fits You?',
    subtitle: 'Five questions. We match you to the right spread and approach \u2014 and redirect you to astrology if you\u2019re actually asking about timing.',
    questions: [
      {
        id: 'focus',
        q: 'Do you have one question, or do you want to explore?',
        hint: '',
        options: [
          { text: 'One question', detail: 'I know what I\u2019m asking', score: 'one' },
          { text: 'Explore a situation', detail: 'see what\u2019s there', score: 'explore' },
          { text: 'A pattern I keep seeing', detail: 'recurring thread', score: 'pattern' }
        ]
      },
      {
        id: 'use',
        q: 'What\u2019s the spread for?',
        hint: 'If it\u2019s about timing, astrology often fits better \u2014 we\u2019ll redirect you.',
        options: [
          { text: 'A decision between options', detail: 'two paths', score: 'decision' },
          { text: 'A relationship dynamic', detail: 'what\u2019s the pattern here', score: 'relationship' },
          { text: 'Situational clarity', detail: '\u201cwhat\u2019s going on?\u201d', score: 'clarity' },
          { text: 'Self-reflection', detail: 'my tendencies', score: 'self' },
          { text: 'Timing \u2014 when something will happen', detail: 'a date', score: 'timing' }
        ]
      },
      {
        id: 'depth',
        q: 'How deep do you want to go?',
        hint: '',
        options: [
          { text: 'One card, a prompt', detail: 'lowest stakes', score: 'single' },
          { text: 'A small spread, 3\u20135 cards', detail: 'past/present/obstacle', score: 'small' },
          { text: 'A full spread, 10 cards', detail: 'Celtic Cross depth', score: 'full' }
        ]
      },
      {
        id: 'who',
        q: 'Self-read or work with a reader?',
        hint: '',
        options: [
          { text: 'I\u2019ll read myself', detail: 'free, reflective', score: 'self' },
          { text: 'A reader, please', detail: 'outside perspective', score: 'reader' },
          { text: 'Try self first, then a reader', detail: 'both', score: 'both' }
        ]
      },
      {
        id: 'budget',
        q: 'What\u2019s your budget for a first tarot session?',
        hint: '',
        options: [
          { text: 'Free / under $20', detail: 'sample first', score: 'low' },
          { text: '$20\u2013$60', detail: 'a real session', score: 'mid' },
          { text: '$60\u2013$150', detail: 'investing in a good fit', score: 'high' }
        ]
      }
    ],
    resolve: function (answers) {
      if (answers.use === 'timing') return 'redirect_astrology';
      if (answers.who === 'self' || (answers.who === 'both' && answers.depth === 'single')) return 'self_read';
      if (answers.budget === 'low') return 'daily_card';
      if (answers.use === 'relationship') return 'relationship_spread';
      if (answers.use === 'decision') return 'two_path';
      if (answers.depth === 'full') return 'celtic_cross';
      if (answers.budget === 'high') return 'independent_reader';
      return 'platform_short';
    },
    results: {
      self_read: {
        path: 'Self-read with the Daily Card',
        archetype: 'You want to reflect, free, on your own. Self-reads are a legitimate practice \u2014 the risk is reading toward the answer you want.',
        primary: { name: 'Daily Card Pull', fit: 'one free card with a reflective prompt, daily', href: '/tools/daily-card' },
        budget: 'Free',
        before: 'If a pattern keeps surfacing, a second reader\u2019s outside read still has value. Try the platform short session below.'
      },
      daily_card: {
        path: 'Daily Card + low-stakes platform',
        archetype: 'Start free, then try a short paid session if something surfaces.',
        primary: { name: 'Daily Card + platform short session', fit: 'free card first, then $15\u2013$30 platform read', href: '/tools/daily-card' },
        budget: 'Free \u2013 $30',
        before: 'Pull a card daily for a week. If the same thread surfaces, that\u2019s your question for a reader.'
      },
      relationship_spread: {
        path: 'Relationship spread (5\u20137 cards)',
        archetype: 'You\u2019re working with a relationship dynamic. A relationship spread maps the tension better than a single-card pull.',
        primary: { name: 'Relationship tarot spread', fit: '5\u20137 cards, with a reader', href: '/tarot/' },
        budget: '$30\u2013$90',
        before: 'Bring the dynamic, not a yes/no question (\u201cwill we get back together\u201d reads worse than \u201cwhat\u2019s the dynamic here\u201d).'
      },
      two_path: {
        path: 'Two-path / decision spread',
        archetype: 'You\u2019re choosing between options. A two-path spread lays out what each path actually involves.',
        primary: { name: 'Two-path decision spread', fit: '5\u20137 cards comparing options', href: '/tarot/' },
        budget: '$30\u2013$90',
        before: 'Tarot reflects; it doesn\u2019t decide. The spread gives you a richer view of each path \u2014 you still choose.'
      },
      celtic_cross: {
        path: 'Celtic Cross (10 cards)',
        archetype: 'A complex situation with multiple forces. The Celtic Cross is tarot\u2019s deepest standard spread.',
        primary: { name: 'Celtic Cross reading', fit: '10-card spread for complex situations', href: '/tarot/' },
        budget: '$60\u2013$150',
        before: 'Don\u2019t book a Celtic Cross for a yes/no question. It needs a real, layered question to pay off.'
      },
      independent_reader: {
        path: 'Independent per-session reader',
        archetype: 'You want depth and a relationship with one reader. Independent readers offer structured, longer sessions.',
        primary: { name: 'Independent tarot reader', fit: 'per-session, 45\u201390 min, vetted', href: '/tarot/#providers' },
        budget: '$60\u2013$150 / session',
        before: 'Ask how the reader interprets \u2014 literally, psychologically, or intuitively. The frame matters more than the deck.'
      },
      platform_short: {
        path: 'Platform short session',
        archetype: 'A per-minute platform read is the most flexible entry \u2014 you control length and budget.',
        primary: { name: 'Platform tarot reading', fit: 'per-minute, 15\u201320 min', href: '/tarot/#providers' },
        budget: '$15\u2013$50',
        before: 'Pick a reader who specializes in your question type. See How to Choose a Tarot Reader (planned).'
      },
      redirect_astrology: {
        path: 'Actually, astrology may fit better',
        archetype: 'You\u2019re asking about timing \u2014 when something will happen. Tarot isn\u2019t built for that. Astrology is.',
        primary: { name: 'Take the Astrology quiz instead', fit: 'astrology answers timing; tarot doesn\u2019t', href: '/quiz/astrology' },
        budget: 'Free quiz',
        before: 'If you still want a tarot reflection on the situation around the timing question, come back here. But start with astrology.'
      }
    }
  },

  /* ----------------------------------------------------------
     5. MEDIUM — for users navigating loss
     ---------------------------------------------------------- */
  medium: {
    id: 'medium',
    title: 'Is a Medium Reading Right for You \u2014 and Which Kind?',
    subtitle: 'Five questions. We help you decide whether a medium fits your stage of grief, what kind to look for, and when to wait.',
    questions: [
      {
        id: 'who',
        q: 'Who are you hoping to connect with?',
        hint: '',
        options: [
          { text: 'A specific person who passed', detail: 'I know who I\u2019m seeking', score: 'specific' },
          { text: 'More of a general sense of someone', detail: 'not one person', score: 'general' },
          { text: 'I\u2019m not sure \u2014 I\u2019m just navigating loss', detail: 'exploring', score: 'unsure' }
        ]
      },
      {
        id: 'stage',
        q: 'Where are you in the grief process?',
        hint: 'Honest answer. Mediums aren\u2019t a substitute for early grief support.',
        options: [
          { text: 'Recently \u2014 within weeks or months', detail: 'acute', score: 'early' },
          { text: 'Some time has passed', detail: 'I\u2019ve had time to process', score: 'mid' },
          { text: 'Longer ago \u2014 looking for meaning', detail: 'I\u2019m past the acute stage', score: 'meaning' }
        ]
      },
      {
        id: 'want',
        q: 'What would make this worthwhile?',
        hint: '',
        options: [
          { text: 'Specific verifiable details', detail: 'facts I can check', score: 'evidence' },
          { text: 'A sense of presence or connection', detail: 'a felt sense', score: 'presence' },
          { text: 'Saying / hearing things left unsaid', detail: 'closure', score: 'closure' },
          { text: 'Meaning around the loss', detail: 'what was this for me', score: 'meaning' }
        ]
      },
      {
        id: 'exp',
        q: 'Have you had a medium reading before?',
        hint: '',
        options: [
          { text: 'No, first time', detail: 'I\u2019ve never done this', score: 'new' },
          { text: 'Yes, once or twice', detail: 'some experience', score: 'some' },
          { text: 'I\u2019ve worked with mediums', detail: 'I know what I want', score: 'experienced' }
        ]
      },
      {
        id: 'support',
        q: 'Do you have a support system or grief counselor?',
        hint: 'This matters more than the other questions for early-stage grief.',
        options: [
          { text: 'Yes', detail: 'I\u2019m supported', score: 'yes' },
          { text: 'Some', detail: 'a bit', score: 'some' },
          { text: 'Not really', detail: 'I\u2019m largely on my own', score: 'no' }
        ]
      }
    ],
    resolve: function (answers) {
      if (answers.stage === 'early' && answers.support === 'no') return 'wait_support';
      if (answers.want === 'evidence') return 'evidential';
      if (answers.who === 'specific' && answers.want === 'closure') return 'individual_evidential';
      if (answers.exp === 'experienced') return 'vetted_independent';
      if (answers.exp === 'new') return 'vetted_first';
      return 'individual_vetted';
    },
    results: {
      wait_support: {
        path: 'Wait \u2014 build support first',
        archetype: 'You\u2019re in early grief and without support. A medium is not crisis care. The reading can surface feelings you\u2019re not yet equipped to hold.',
        primary: { name: 'Grief counseling / support first', fit: 'a licensed grief counselor or support group', href: '/medium/' },
        budget: 'Varies \u2014 many support groups are free',
        before: 'This isn\u2019t a no. It\u2019s a \u201cnot yet.\u201d Come back to a medium once you have support in place. The medium will still be there.'
      },
      evidential: {
        path: 'Evidential medium \u2014 with caution',
        archetype: 'You want specific, verifiable details. That\u2019s the hardest ask in this category and the highest fraud risk. Choose very carefully.',
        primary: { name: 'Evidential medium', fit: 'vetted independent reader with a track record of verifiable specifics', href: '/medium/#providers' },
        budget: '$120\u2013$300 / session',
        before: 'No responsible medium guarantees a specific connection. Bring an open name or initial \u2014 not a flood of detail. Let them bring specifics. Read the medium category red flags first.'
      },
      individual_evidential: {
        path: 'Individual evidential session',
        archetype: 'You want connection with a specific person and things left unsaid. An individual evidential session is the right frame.',
        primary: { name: 'Individual evidential medium', fit: 'one-on-one, vetted, 45\u201390 min', href: '/medium/#providers' },
        budget: '$120\u2013$250 / session',
        before: 'Bring an open initial and one or two things left unsaid. Let the medium bring the specifics. Have a support plan for after \u2014 readings can surface grief you didn\u2019t expect.'
      },
      individual_vetted: {
        path: 'Individual session, vetted medium',
        archetype: 'You\u2019re seeking presence or meaning, not necessarily specifics. A vetted individual medium suits this best.',
        primary: { name: 'Vetted individual medium', fit: 'one-on-one, 45\u201390 min', href: '/medium/#providers' },
        budget: '$120\u2013$250 / session',
        before: 'Read the medium category red flags. Refuse \u201ccurse\u201d or \u201cblockage\u201d upsells. Bring a support person if you want.'
      },
      vetted_first: {
        path: 'Vetted medium \u2014 first reading',
        archetype: 'First-time? Use a vetted independent medium or a reviewed platform \u2014 avoid marketplace cold reads for something this emotionally weighted.',
        primary: { name: 'Vetted medium (first reading)', fit: 'independent with reviews, or reviewed platform', href: '/medium/#providers' },
        budget: '$80\u2013$200 / session',
        before: 'Read Psychic vs Medium first to confirm a medium is actually what fits. Have a support plan for after.'
      },
      vetted_independent: {
        path: 'Vetted independent medium',
        archetype: 'You\u2019ve worked with mediums and know what you want. A vetted independent reader offers the depth you\u2019re after.',
        primary: { name: 'Vetted independent medium', fit: 'specialist, ongoing relationship possible', href: '/medium/#providers' },
        budget: '$150\u2013$300 / session',
        before: 'Still apply the methodology. Familiarity shouldn\u2019t drop the vetting bar.'
      }
    }
  }
};
