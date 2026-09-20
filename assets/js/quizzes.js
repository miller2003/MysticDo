/* ============================================================
   MysticDo Quiz Library — v0.2
   Multi-quiz data: general (Do What Fits) + 4 category quizzes
   + high-intent question quizzes (does-he-love-me, …).
   Each quiz: { id, title, subtitle, questions[], results{} }
   Each question: { id, q, hint, options[{text, detail, score, [tags]}] }
   `score` is one or more keys (comma-sep) tallied per quiz.
   v0.2: shared pattern-result renderer (mysticdoPatternResult) —
   high-intent quizzes delegate customResult to it in one line.
   ============================================================ */

/* ---- Shared pattern-result renderer (engine hook implementation) ----
   Renders the three fixed blocks (suggest / don't-tell / watch-next),
   an optional underneath current, the practice match (primary +
   secondary + optional choose-guide link + before-you-pay note), an
   optional negative-pattern honesty tip, and the email capture.
   Usage in a quiz object:
     customResult: function (ctx) {
       window.mysticdoPatternResult(ctx, '<quiz-slug>', {
         emailTitle: '…', emailText: '…',
         negativePatternTip: { pattern: 'uneven', text: '…' }   // optional
       });
     }
   The quiz object must provide: questions, resolve, results (each with
   path/summary/suggest(a)/dontTell/watchIntro/watch(a)), underneath,
   practice (each with name/fit/href/cta/secondary/fit-note + optional
   choose{name,href}), matchPractice. */
window.mysticdoPatternResult = function (ctx, slug, opts) {
  opts = opts || {};
  var QZ = window.MYSTICDO_QUIZZES[slug];
  var a = ctx.answers;
  var patternKey = QZ.resolve(a);
  var r = QZ.results[patternKey];
  var under = QZ.underneath(a, patternKey);
  var practiceKey = QZ.matchPractice(a);
  var p = QZ.practice[practiceKey];

  function optionText(qid, val) {
    for (var i = 0; i < QZ.questions.length; i++) {
      if (QZ.questions[i].id !== qid) continue;
      var os = QZ.questions[i].options;
      for (var j = 0; j < os.length; j++) if (os[j].score === val) return os[j].text;
    }
    return '';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function star() {
    return '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z"/></svg>';
  }
  function list(items) {
    return '<ul>' + items.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
  }

  var html = '<div class="quiz-result love-result">';

  /* Head */
  html += '<div class="love-result-head">'
    + '<div class="result-path-badge">' + star() + ' Your pattern</div>'
    + '<h2>' + esc(r.path) + '</h2>'
    + '<p class="love-summary">' + esc(r.summary) + '</p>'
    + '</div>';

  /* Block 1 — what your answers suggest */
  html += '<div class="love-block">'
    + '<h3>What your answers suggest</h3>'
    + '<p>' + esc(r.suggest(a)) + '</p>'
    + '</div>';

  /* Block 2 — what they don't tell you */
  html += '<div class="love-block">'
    + '<h3>What they don\u2019t tell you</h3>'
    + '<p>' + esc(r.dontTell) + '</p>'
    + '</div>';

  /* Block 3 — what to look at next */
  html += '<div class="love-block">'
    + '<h3>What to look at next</h3>'
    + '<p>' + esc(r.watchIntro) + '</p>'
    + list(r.watch(a))
    + '</div>';

  /* Optional underneath current */
  if (under) {
    html += '<div class="love-underneath">'
      + '<h3>' + esc(under.label) + '</h3>'
      + '<p>' + esc(under.text) + '</p>'
      + '</div>';
  }

  /* Practice match */
  var wantText = optionText('want', a.want);
  html += '<div class="love-match">'
    + '<h3 class="love-match-title">Where a practice fits \u2014 and where it doesn\u2019t</h3>'
    + '<p class="love-match-intro">You said what you most want to know is: \u201C' + esc(wantText) + '\u201D Your next useful step, mapped honestly:</p>'
    + '<div class="result-primary-card">'
    + '<span class="badge badge-gold" style="margin-bottom:0.75rem">A useful starting point</span>'
    + '<div class="love-practice-name">' + esc(p.name) + '</div>'
    + '<p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:var(--s4)">' + esc(p.fit) + '</p>'
    + '<a class="btn btn-outline-gold btn-sm" data-love-cta href="' + p.href + '">' + esc(p.cta) + ' &rarr;</a>'
    + '</div>'
    + '<div class="result-secondary-card">'
    + '<span class="badge badge-violet" style="margin-bottom:0.6rem">Also consider</span>'
    + '<div style="font-weight:600;color:var(--ink-900);margin-bottom:0.25rem">' + esc(p.secondary.name) + '</div>'
    + '<p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:var(--s3)">' + esc(p.secondary.fit) + '</p>'
    + '<a style="font-size:0.88rem;color:var(--accent-link);font-weight:600" href="' + p.secondary.href + '">Learn more &rarr;</a>'
    + '</div>'
    + (p.choose
        ? '<p style="font-size:0.88rem;color:var(--text-muted);margin:var(--s3) 0 0">When you\u2019re ready to choose: <a style="color:var(--accent-link);font-weight:600" href="' + p.choose.href + '">' + esc(p.choose.name) + '</a> \u2014 the vetting framework and the red flags.</p>'
        : '')
    + '<div class="result-tip mt-3"><strong>Before you pay:</strong> ' + esc(p.note) + '</div>';

  /* Optional negative-pattern honesty tip */
  if (opts.negativePatternTip && patternKey === opts.negativePatternTip.pattern
      && practiceKey !== 'free_first' && practiceKey !== 'general') {
    html += '<div class="result-tip mt-3"><strong>One thing worth naming:</strong> ' + esc(opts.negativePatternTip.text) + '</div>';
  }
  html += '</div>';

  /* Divider + email capture */
  html += '<div class="divider-mystic mt-6">' + star() + '</div>'
    + '<div class="text-center mt-4">'
    + '<h3 style="margin-bottom:0.45rem;font-size:1.5rem">' + esc(opts.emailTitle || 'Get guidance tuned to this question by email') + '</h3>'
    + '<p style="color:var(--text-muted);margin-bottom:var(--s5);font-size:0.92rem;max-width:46ch;margin-inline:auto">' + esc(opts.emailText || 'One weekly note — a decision guide, a free tool, one honest recommendation. No spam, unsubscribe anytime.') + '</p>'
    + ctx.emailFormHTML()
    + '</div>'
    + '<p class="text-center" style="margin-top:var(--s6)"><button type="button" class="btn btn-ghost btn-sm" data-love-retake>Start over</button></p>';

  html += '</div>';

  ctx.body.innerHTML = html;
  ctx.bindEmailForms();

  var retakeBtn = ctx.body.querySelector('[data-love-retake]');
  if (retakeBtn) retakeBtn.addEventListener('click', function () { ctx.restart(); });

  var cta = ctx.body.querySelector('[data-love-cta]');
  if (cta) cta.addEventListener('click', function () {
    try {
      if (window.posthog && typeof window.posthog.capture === 'function') {
        window.posthog.capture('quiz_cta_click', { quiz: slug, practice: practiceKey });
      }
    } catch (err) {}
  });

  /* First-party intent signal (see the KPI system) */
  try {
    if (window.posthog && typeof window.posthog.capture === 'function') {
      window.posthog.capture('quiz_completed', {
        quiz: slug,
        pattern: patternKey,
        status: a.status,
        trigger: a.trigger,
        want: a.want,
        underneath: under ? under.key : null,
        practice: practiceKey
      });
    }
  } catch (err) {}
};

/* ---- Shared love-cluster helpers ----
   The six love-relationship quizzes share the same scoring skeleton
   (four signal questions scored -2..+2, uncertain answers count as
   "unclear"), the same 7-practice set, and the same matchPractice
   logic. Only the question text, the five pattern names, and the
   underneath currents change per quiz. These helpers keep each quiz
   definition down to the parts that actually differ. */
window.loveResolve = function (patterns) {
  var S = {
    communication: { consistent: 2, frequent: 1, reactive: 0, hotcold: -1, convenient: -2, quieter: -1, barely: -2 },
    effort:        { him: 2, equal: 1, variable: 0, me: -2, rarely: -2, hard: null },
    space:         { notices: 2, stays: 1, nothing: -1, worse: -2, returns: -1, notell: null },
    alignment:     { very: 2, usually: 1, sometimes: 0, notvery: -1, contradict: -2, dontknow: null }
  };
  return function (answers) {
    var keys = ['communication', 'effort', 'space', 'alignment'];
    var sum = 0, uncertain = 0;
    for (var i = 0; i < keys.length; i++) {
      var v = S[keys[i]][answers[keys[i]]];
      if (v === null || typeof v === 'undefined') { uncertain++; continue; }
      sum += v;
    }
    if (uncertain >= 2 && Math.abs(sum) < 3) return patterns.uncertain;
    if (answers.effort === 'me' && sum <= 0) return patterns.low;
    if (sum >= 4)  return patterns.high;
    if (sum >= 2)  return patterns.midHigh;
    if (sum >= -2) return patterns.mid;
    return patterns.low;
  };
};

window.loveMatchPractice = function (answers) {
  var w = answers.want, h = answers.help;
  if (w === 'wait') return 'tarot_decision';
  if (w === 'still' || (answers.status === 'exes' && w === 'feelings')) return 'closure';
  if (h === 'interpret') return 'free_first';
  if (w === 'feelings' || w === 'why' || h === 'insight') return 'psychic';
  if (w === 'going' || w === 'commit' || h === 'heading') return 'tarot_relationship';
  if (w === 'beneath' || h === 'deeper') return 'tarot_deep';
  if (h === 'guidance') return 'tarot_decision';
  return 'general';
};

window.lovePracticeSet = function (slug) {
  var A = {
    'does-he-love-me': 'his feelings',
    'does-he-think-about-me': 'whether he thinks about you',
    'does-my-crush-like-me-back': 'whether he likes you back',
    'is-he-the-one': 'whether he\u2019s the one for you',
    'does-he-miss-me': 'whether he misses you',
    'is-he-serious-about-me': 'whether he\u2019s serious about you'
  }[slug] || 'your situation';
  return {
    psychic: {
      name: 'Psychic reading',
      fit: 'An outside, conversational perspective on a specific person and situation \u2014 something to weigh against what you already observe, never a verdict on ' + A + '.',
      href: '/psychic/',
      cta: 'Explore psychic readings',
      secondary: { name: 'Tarot \u2014 relationship spread', fit: 'if what you actually want is to understand the dynamic, not him', href: '/tarot/' },
      choose: { name: 'How to Choose a Psychic Reader', href: '/guides/how-to-choose-psychic-reader' },
      note: 'Know what you\u2019re buying before you connect: the format, per-minute vs per-session pricing, and your total cap. Start with Before Paying for a Psychic Reading \u2014 it\u2019s the guide written for exactly this moment.'
    },
    tarot_relationship: {
      name: 'Tarot \u2014 relationship spread',
      fit: 'A structured reflection on the connection\u2019s dynamic: where it stands, what feeds it, where it\u2019s tending.',
      href: '/tarot/',
      cta: 'Explore tarot readings',
      secondary: { name: 'Psychic reading', fit: 'if you want a direct read on him rather than the dynamic', href: '/psychic/' },
      choose: { name: 'How to Choose a Tarot Reader', href: '/guides/how-to-choose-tarot-reader' },
      note: 'Frame the dynamic, not a verdict \u2014 \u201Cwhat\u2019s the pattern between us\u201D reads far better than a yes/no question.'
    },
    tarot_decision: {
      name: 'Tarot \u2014 two-path spread',
      fit: 'A structured look at both paths \u2014 what waiting actually involves, what moving on actually involves \u2014 so the decision stands on more than fatigue.',
      href: '/tarot/',
      cta: 'Explore tarot readings',
      secondary: { name: 'Do What Fits \u2014 the full matcher', fit: 'if you want the complete practice match first', href: '/do-what-fits' },
      choose: { name: 'How to Choose a Tarot Reader', href: '/guides/how-to-choose-tarot-reader' },
      note: 'The spread can give each path a shape; it can\u2019t and shouldn\u2019t choose for you. Any reader who offers to make this decision for you is selling certainty nobody has.'
    },
    tarot_deep: {
      name: 'Tarot \u2014 full spread',
      fit: 'For the whole picture: a full spread reflects the situation in depth \u2014 the forces in it, not just the surface question.',
      href: '/tarot/',
      cta: 'Explore tarot readings',
      secondary: { name: 'Astrology \u2014 synastry reading', fit: 'if long-term patterns between you are the real question', href: '/astrology/' },
      choose: { name: 'How to Choose a Tarot Reader', href: '/guides/how-to-choose-tarot-reader' },
      note: 'Depth costs more per session \u2014 set the budget first, and give the reader your actual question, not a softened version of it.'
    },
    closure: {
      name: 'Closure-framed reading or reflection',
      fit: 'Support framed on what this relationship was and what it means now \u2014 not on predicting his return.',
      href: '/tarot/',
      cta: 'Explore tarot readings',
      secondary: { name: 'Love & Relationships \u2014 all question guides', fit: 'the full set of relationship decision guides', href: '/questions/love-relationships/' },
      choose: { name: 'How to Choose a Tarot Reader', href: '/guides/how-to-choose-tarot-reader' },
      note: 'If you do book a reading about an ending, frame it on closure. Readings that keep predicting reunion tend to keep the question open \u2014 and keep you paying.'
    },
    free_first: {
      name: 'This framework + the free Daily Card',
      fit: 'You said a clearer interpretation of his behavior would help most \u2014 and that, this page can give you for free. The Daily Card adds a small reflective practice, still free.',
      href: '/tools/daily-card',
      cta: 'Try the free Daily Card',
      secondary: { name: 'Do What Fits \u2014 the full matcher', fit: 'if a real question surfaces and you want the complete match', href: '/do-what-fits' },
      note: 'If, after a week or two of watching the pattern, a real question surfaces \u2014 that\u2019s your question, and that\u2019s when a reading earns its cost.'
    },
    general: {
      name: 'Do What Fits \u2014 the matcher',
      fit: 'You\u2019re not sure what you\u2019re asking yet, which is a fine and common place to start. The seven-question matcher maps your situation to the practice that fits it \u2014 or to none of them.',
      href: '/do-what-fits',
      cta: 'Take Do What Fits',
      secondary: { name: 'Psychic vs Tarot', fit: 'the decision rule for relationship questions', href: '/guides/psychic-vs-tarot' },
      note: 'Free, two minutes, and it ends with a next step either way.'
    }
  };
};

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
  },

  /* ----------------------------------------------------------
     6. LOVE SIGNAL CHECK — "Does he love me?"
     The first high-intent question page (/questions/love-relationships/
     does-he-love-me). Eight questions in three layers:
       context   — status, trigger
       pattern   — communication, effort, space, alignment (scored)
       intent    — want, help (drive the practice match)
     Result = one of five behavior patterns (never a "love score"),
     rendered via customResult with three fixed blocks — what your
     answers suggest / what they don't tell you / what to look at
     next — plus an optional "underneath" current and a practice match.
     Design rule: the quiz personalizes the page; it never replaces it.
     ---------------------------------------------------------- */
  'does-he-love-me': {
    id: 'does-he-love-me',
    title: 'Read His Pattern',
    subtitle: 'Eight questions, about two minutes. A personalized read of what the pattern may suggest \u2014 what it says, what it doesn\u2019t, and what to watch next. No score, no verdict, no signup.',

    questions: [
      {
        id: 'status',
        q: 'What\u2019s your relationship with him right now?',
        hint: 'This matters more than it sounds \u2014 the same behavior means different things in different situations.',
        options: [
          { text: 'We\u2019re in a relationship', detail: 'together, official', score: 'together' },
          { text: 'We\u2019re dating, but it\u2019s not official', detail: 'seeing each other regularly', score: 'dating' },
          { text: 'We\u2019re talking or getting to know each other', detail: 'early days', score: 'talking' },
          { text: 'We\u2019re friends, but there might be more', detail: 'a line that keeps almost being crossed', score: 'friends' },
          { text: 'We\u2019re separated or taking space', detail: 'a pause of some kind', score: 'separated' },
          { text: 'We\u2019re exes', detail: 'it ended at some point', score: 'exes' },
          { text: 'It\u2019s complicated', detail: 'even this question is hard to answer', score: 'complicated' }
        ]
      },
      {
        id: 'trigger',
        q: 'What made you start wondering whether he loves you?',
        hint: '',
        options: [
          { text: 'He\u2019s become more distant', detail: 'less present than he was', score: 'distant' },
          { text: 'His behavior feels inconsistent', detail: 'warm, then not', score: 'inconsistent' },
          { text: 'He says he cares, but I\u2019m not sure', detail: 'words without weight', score: 'words' },
          { text: 'We had an argument or a hard period', detail: 'and something shifted', score: 'conflict' },
          { text: 'He\u2019s not taking things forward', detail: 'comfortable, but not moving', score: 'stalled' },
          { text: 'I don\u2019t know what he really feels', detail: 'I can\u2019t get a clear read', score: 'unknown' },
          { text: 'Something about us feels different', detail: 'I can\u2019t name it', score: 'changed' },
          { text: 'No specific reason \u2014 I just want clarity', detail: 'the question itself', score: 'clarity' }
        ]
      },
      {
        id: 'communication',
        q: 'How would you describe his communication with you?',
        hint: '',
        options: [
          { text: 'Consistent and engaged', detail: 'steady, responsive', score: 'consistent' },
          { text: 'Frequent, but sometimes unpredictable', detail: 'a lot, in waves', score: 'frequent' },
          { text: 'Mostly when I reach out first', detail: 'he responds, rarely initiates', score: 'reactive' },
          { text: 'Hot and cold', detail: 'very close, then gone', score: 'hotcold' },
          { text: 'Mostly when he wants something', detail: 'contact follows his needs', score: 'convenient' },
          { text: 'He\u2019s become noticeably quieter', detail: 'recently, without explanation', score: 'quieter' },
          { text: 'We barely communicate', detail: 'long silences between exchanges', score: 'barely' }
        ]
      },
      {
        id: 'effort',
        q: 'When it comes to keeping the connection going, who usually takes the lead?',
        hint: '',
        options: [
          { text: 'Mostly him', detail: 'he plans, initiates, circles back', score: 'him' },
          { text: 'About equally', detail: 'it flows both ways', score: 'equal' },
          { text: 'Mostly me', detail: 'I hold most of it', score: 'me' },
          { text: 'It changes back and forth', detail: 'no steady pattern', score: 'variable' },
          { text: 'We rarely make plans', detail: 'the connection lives in messages', score: 'rarely' },
          { text: 'It\u2019s difficult to tell', detail: 'I genuinely can\u2019t say', score: 'hard' }
        ]
      },
      {
        id: 'space',
        q: 'What usually happens when you give him a little space?',
        hint: 'Distance is one of the clearer tests of a connection \u2014 not the only one, but a real one.',
        options: [
          { text: 'He notices and reaches out', detail: 'space doesn\u2019t break contact', score: 'notices' },
          { text: 'He gives me space but stays connected', detail: 'present, patient', score: 'stays' },
          { text: 'Nothing really changes', detail: 'silence stays silence', score: 'nothing' },
          { text: 'He becomes even more distant', detail: 'space becomes distance', score: 'worse' },
          { text: 'He comes back only when I contact him', detail: 'he returns, but on my call', score: 'returns' },
          { text: 'We haven\u2019t had enough distance to tell', detail: 'too early, or never tested', score: 'notell' }
        ]
      },
      {
        id: 'alignment',
        q: 'How closely do his actions match what he tells you?',
        hint: '',
        options: [
          { text: 'Very closely', detail: 'he does what he says', score: 'very' },
          { text: 'Usually, but not always', detail: 'solid, with lapses', score: 'usually' },
          { text: 'Sometimes', detail: 'it depends on the week', score: 'sometimes' },
          { text: 'Not very closely', detail: 'more talk than follow-through', score: 'notvery' },
          { text: 'They often contradict each other', detail: 'warm words, distant actions', score: 'contradict' },
          { text: 'I honestly don\u2019t know', detail: 'I can\u2019t track it', score: 'dontknow' }
        ]
      },
      {
        id: 'want',
        q: 'What do you most want to know?',
        hint: 'Be honest with this one \u2014 it decides what actually helps you next.',
        options: [
          { text: 'Does he genuinely have feelings for me?', detail: 'the question on the surface', score: 'feelings' },
          { text: 'Why is he acting differently?', detail: 'something changed; I want to understand what', score: 'why' },
          { text: 'Is this relationship going anywhere?', detail: 'direction, not just feeling', score: 'going' },
          { text: 'Is he likely to commit?', detail: 'I want to know where the floor is', score: 'commit' },
          { text: 'Does he still have feelings for me?', detail: 'after the ending', score: 'still' },
          { text: 'Should I wait, or move on?', detail: 'I\u2019m stuck between two futures', score: 'wait' },
          { text: 'What\u2019s really going on beneath the surface?', detail: 'I sense something I can\u2019t name', score: 'beneath' },
          { text: 'I just want clarity', detail: 'whatever clarity looks like', score: 'justclarity' }
        ]
      },
      {
        id: 'help',
        q: 'What would help you most right now?',
        hint: '',
        options: [
          { text: 'A clearer interpretation of his behavior', detail: 'reading the signs better', score: 'interpret' },
          { text: 'Insight into what he may be feeling', detail: 'his side of it', score: 'insight' },
          { text: 'Understanding where this is heading', detail: 'the trajectory', score: 'heading' },
          { text: 'Guidance on what I should do next', detail: 'a next step', score: 'guidance' },
          { text: 'A deeper reading of the relationship', detail: 'the whole picture', score: 'deeper' },
          { text: 'I\u2019m not sure \u2014 I just want to understand', detail: 'help me find the question', score: 'unsure' }
        ]
      }
    ],

    /* ---- Pattern scoring ----
       Four signal questions are scored -2..+2 (uncertain answers score
       nothing and count as "uncertain"). The model is deliberately
       transparent and is documented on the page: patterns, not points. */
    resolve: function (answers) {
      var S = {
        communication: { consistent: 2, frequent: 1, reactive: 0, hotcold: -1, convenient: -2, quieter: -1, barely: -2 },
        effort:        { him: 2, equal: 1, variable: 0, me: -2, rarely: -2, hard: null },
        space:         { notices: 2, stays: 1, nothing: -1, worse: -2, returns: -1, notell: null },
        alignment:     { very: 2, usually: 1, sometimes: 0, notvery: -1, contradict: -2, dontknow: null }
      };
      var keys = ['communication', 'effort', 'space', 'alignment'];
      var sum = 0, uncertain = 0;
      for (var i = 0; i < keys.length; i++) {
        var v = S[keys[i]][answers[keys[i]]];
        if (v === null || typeof v === 'undefined') { uncertain++; continue; }
        sum += v;
      }
      if (uncertain >= 2 && Math.abs(sum) < 3) return 'not-enough-evidence';
      if (answers.effort === 'me' && sum <= 0) return 'uneven';
      if (sum >= 4)  return 'consistent';
      if (sum >= 2)  return 'genuine-connection';
      if (sum >= -2) return 'mixed';
      return 'uneven';
    },

    /* ---- The five patterns ---- */
    results: {
      'consistent': {
        path: 'Consistent emotional investment',
        summary: 'Steady engagement, effort from both sides, words and actions that track.',
        suggest: function (a) {
          var s = 'Across what you\u2019ve described, his engagement holds up on more than one front.';
          if (a.communication === 'consistent') s += ' Communication stays steady rather than arriving in waves.';
          if (a.effort === 'him' || a.effort === 'equal') s += ' Effort flows from both sides, not mainly from you.';
          if (a.alignment === 'very' || a.alignment === 'usually') s += ' And what he does tracks what he says.';
          s += ' In the five-signal framework, that\u2019s the strongest pattern observable behavior can show \u2014 and it usually looks quieter than a grand gesture, and considerably more reliable.';
          return s;
        },
        dontTell: 'Consistency shows investment \u2014 it can\u2019t read his mind. Some people stay present for years without wanting the same future you want; consistency alone doesn\u2019t tell you which kind of person you\u2019re with. That part only a direct conversation can answer.',
        watchIntro: 'Worth watching over the coming weeks:',
        watch: function () {
          return [
            'Whether his effort holds up during his own hard weeks \u2014 investment that survives inconvenience is the strongest signal there is.',
            'Whether the two of you talk about the future, not just the weekend. Consistency is present-tense; direction is the question it can\u2019t answer for you.'
          ];
        }
      },
      'genuine-connection': {
        path: 'Genuine connection, unclear intentions',
        summary: 'The connection is visible; the direction isn\u2019t.',
        suggest: function (a) {
          var s = 'Your answers describe a real connection: contact happens and holds, effort exists, words and behavior mostly line up.';
          if (a.status === 'dating' || a.status === 'talking' || a.status === 'friends') s += ' But the relationship itself isn\u2019t defined yet \u2014 and an undefined relationship can\u2019t produce a defined answer.';
          s += ' The pattern doesn\u2019t yet say where it\u2019s going, and that gap between connection and definition is often the actual source of the question. It\u2019s not that there are no signs; it\u2019s that the signs don\u2019t add up to an answer about the future.';
          return s;
        },
        dontTell: 'Connection and intention are different things. He can feel genuinely close and still be unsure about committing \u2014 or be ready to commit and bad at showing it. Your answers can\u2019t separate those two. Only he can.',
        watchIntro: 'Worth watching over the coming weeks:',
        watch: function () {
          return [
            'Who moves things forward \u2014 who defines the relationship, raises what it is, initiates the next step.',
            'If that keeps being you, it isn\u2019t proof he doesn\u2019t care; it is information about how the two of you handle definition.'
          ];
        }
      },
      'mixed': {
        path: 'Mixed signals',
        summary: 'Enough connection to continue; not enough consistency to rest.',
        suggest: function (a) {
          var s = 'Your answers show a real gap between connection and consistency \u2014 enough warmth to keep the relationship going, not enough steadiness to feel safe in it.';
          if (a.communication === 'hotcold') s += ' The hot-and-cold rhythm is the clearest example.';
          if (a.alignment === 'contradict' || a.alignment === 'notvery') s += ' So is the distance between his words and his actions.';
          s += ' This is the hardest pattern to read from inside, because each good stretch resets the question and each cold stretch reopens it.';
          return s;
        },
        dontTell: 'Mixed behavior has many possible causes: ambivalence, stress, avoidance, another priority, or a communication style that simply runs in waves. The pattern can\u2019t tell you which one it is \u2014 and it can\u2019t tell you what he feels, only how the connection behaves.',
        watchIntro: 'Try a simple observation window:',
        watch: function () {
          return [
            'For the next few weeks, note privately who initiates contact and how long the gaps run \u2014 no tests, no experiments, just watching.',
            'A pattern that\u2019s still mixed after a month of ordinary contact isn\u2019t a phase. It\u2019s the relationship\u2019s current shape, and it deserves a direct conversation rather than another round of decoding.'
          ];
        }
      },
      'uneven': {
        path: 'Uneven investment',
        summary: 'The connection runs on your effort.',
        suggest: function (a) {
          var s = 'Much of the visible effort in this connection appears to come from your side.';
          if (a.communication === 'reactive' || a.communication === 'convenient') s += ' He responds more than he initiates.';
          if (a.effort === 'me') s += ' You\u2019re the one holding the thread.';
          if (a.space === 'returns') s += ' And contact resumes when you make it.';
          s += ' That doesn\u2019t reveal how he feels. What it does reveal is something just as important: the relationship, as it currently runs, depends on you to exist.';
          return s;
        },
        dontTell: 'One-sided effort doesn\u2019t prove he doesn\u2019t love you \u2014 some people only engage under structure, and some are simply passive. But it doesn\u2019t prove he does, either. The honest signal here isn\u2019t about his feelings. It\u2019s about the shape you\u2019re maintaining, and what it costs you.',
        watchIntro: 'Over the next few weeks:',
        watch: function () {
          return [
            'Let one thing go quiet that you\u2019d normally carry \u2014 one plan, one check-in \u2014 and watch what happens to the connection. Not as a test; as information.',
            'Sit with the question behind the question: not only \u201Cdoes he love me,\u201D but \u201Cis this relationship meeting my needs as it actually is \u2014 not as it might become?\u201D'
          ];
        }
      },
      'not-enough-evidence': {
        path: 'Not enough evidence yet',
        summary: 'Too early, or too close, to read \u2014 which is information too.',
        suggest: function () {
          return 'Several of your answers say \u201CI don\u2019t know\u201D \u2014 and that\u2019s worth taking seriously rather than papering over. Right now there isn\u2019t enough observable pattern to read, which usually means one of two things: the connection is genuinely too new, or you\u2019re standing too close to see its shape.';
        },
        dontTell: 'An unclear pattern isn\u2019t a negative one. It means the data isn\u2019t in yet. At this stage, hunting for one more \u201Csign\u201D tends to produce noise \u2014 every small gesture gets recruited as evidence for whichever answer you\u2019re already leaning toward.',
        watchIntro: 'Give it a defined window:',
        watch: function () {
          return [
            'Three or four weeks of ordinary contact, watching only two things: who initiates, and whether his behavior stays steady across different weeks.',
            'Then come back and retake this check. With more pattern to read, the result will be sharper.'
          ];
        }
      }
    },

    /* ---- What may be underneath the question ----
       Optional, one at most, offered as an observation \u2014 never a
       diagnosis. Returns { key, label, text } or null. */
    underneath: function (answers, pattern) {
      var a = answers;
      if ((a.status === 'exes' || a.status === 'separated') &&
          (a.trigger === 'distant' || a.trigger === 'changed' || a.trigger === 'conflict' || a.want === 'still')) {
        return {
          key: 'closure',
          label: 'What may be underneath: the closure question',
          text: 'When something ends without a full explanation, the mind tends to keep the question open \u2014 \u201Cdoes he still care\u201D can quietly become a way of keeping the connection alive. If that lands, the more useful frame is closure \u2014 what this chapter was and what it means now \u2014 rather than what he\u2019s doing tonight. Readings that keep re-opening the question tend to cost more than they give.'
        };
      }
      if (a.status === 'complicated' && (pattern === 'mixed' || pattern === 'uneven')) {
        return {
          key: 'cycle',
          label: 'What may be underneath: the cycle question',
          text: 'You described the relationship as complicated, and your answers show a gap between connection and consistency. If this is the second or third time you\u2019ve asked where you stand \u2014 with him, or with someone who felt like him \u2014 the more useful question may not be about his feelings this round. It may be about the cycle itself: why unclear love keeps feeling like the love worth waiting for. That\u2019s a pattern question, and pattern questions have better tools than \u201Cdoes he love me.\u201D'
        };
      }
      if (a.want === 'wait') {
        return {
          key: 'decision',
          label: 'What may be underneath: the decision question',
          text: '\u201CShould I wait or move on\u201D isn\u2019t really a feelings question \u2014 it\u2019s a decision you\u2019re carrying, and it may be the actual question underneath. Two honest notes: a reading can give you a richer view of each path, but the decision stays yours; and any reader who offers to make it for you \u2014 or to tell you what he\u2019s \u201Cdestined\u201D to do \u2014 is selling certainty nobody has. Watch for that.'
        };
      }
      if (a.trigger === 'unknown' && (pattern === 'consistent' || pattern === 'genuine-connection')) {
        return {
          key: 'reassurance',
          label: 'What may be underneath: the reassurance question',
          text: 'Worth noticing: your answers describe a mostly steady connection, and the doubt didn\u2019t come from his behavior \u2014 it came from not being able to see inside it. When the question keeps returning even while things are good, it\u2019s sometimes about anxiety rather than evidence: the mind scanning for a certainty no relationship can supply. If reassurance is what\u2019s being sought, no single reading can hold it for long \u2014 and that\u2019s information about the question, not a reason to keep booking reads on him.'
        };
      }
      if (a.want === 'beneath' || (a.want === 'justclarity' && a.help === 'deeper')) {
        return {
          key: 'meaning',
          label: 'What may be underneath: the meaning question',
          text: 'You said you want to understand what\u2019s really going on beneath the surface \u2014 which suggests the answer you need isn\u2019t a yes or a no, it\u2019s a frame. That\u2019s closer to what reflective practices are actually built for: not verdicts, but a structured way to see a situation you\u2019re standing too close to.'
        };
      }
      return null;
    },

    /* ---- Practice matching (honest, not salesy) ---- */
    practice: {
      psychic: {
        name: 'Psychic reading',
        fit: 'An outside, conversational perspective on a specific person and situation. Something to weigh against what you already observe \u2014 never a verdict on what he privately feels.',
        href: '/psychic/',
        cta: 'Explore psychic readings',
        secondary: { name: 'Tarot \u2014 relationship spread', fit: 'if what you actually want is to understand the dynamic, not him', href: '/tarot/' },
        choose: { name: 'How to Choose a Psychic Reader', href: '/guides/how-to-choose-psychic-reader' },
        note: 'Know what you\u2019re buying before you connect: the format, per-minute vs per-session pricing, and your total cap. Start with Before Paying for a Psychic Reading \u2014 it\u2019s the guide written for exactly this moment.'
      },
      tarot_relationship: {
        name: 'Tarot \u2014 relationship spread',
        fit: 'A structured reflection on the relationship\u2019s dynamic: where it stands, what feeds it, where it\u2019s tending. You bring the pattern; the spread gives it a shape.',
        href: '/tarot/',
        cta: 'Explore tarot readings',
        secondary: { name: 'Psychic reading', fit: 'if you want a direct read on him rather than the dynamic', href: '/psychic/' },
        choose: { name: 'How to Choose a Tarot Reader', href: '/guides/how-to-choose-tarot-reader' },
        note: 'Frame the dynamic, not a verdict \u2014 \u201Cwhat\u2019s the pattern between us\u201D reads far better than \u201Cdoes he love me.\u201D'
      },
      tarot_decision: {
        name: 'Tarot \u2014 two-path spread',
        fit: 'A structured look at both paths \u2014 what waiting actually involves, what moving on actually involves \u2014 so the decision stands on more than fatigue.',
        href: '/tarot/',
        cta: 'Explore tarot readings',
        secondary: { name: 'Do What Fits \u2014 the full matcher', fit: 'if you want the complete practice match first', href: '/do-what-fits' },
        choose: { name: 'How to Choose a Tarot Reader', href: '/guides/how-to-choose-tarot-reader' },
        note: 'The spread can give each path a shape; it can\u2019t and shouldn\u2019t choose for you. Any reader who offers to make this decision for you is selling certainty nobody has.'
      },
      tarot_deep: {
        name: 'Tarot \u2014 full spread',
        fit: 'For the whole picture: a full spread reflects the situation in depth \u2014 the forces in it, not just the surface question.',
        href: '/tarot/',
        cta: 'Explore tarot readings',
        secondary: { name: 'Astrology \u2014 synastry reading', fit: 'if long-term patterns between you are the real question', href: '/astrology/' },
        choose: { name: 'How to Choose a Tarot Reader', href: '/guides/how-to-choose-tarot-reader' },
        note: 'Depth costs more per session \u2014 set the budget first, and give the reader your actual question, not a softened version of it.'
      },
      closure: {
        name: 'Closure-framed reading or reflection',
        fit: 'Support framed on what this relationship was and what it means now \u2014 not on predicting his return. Tarot for structured reflection works well here; some choose a psychic read framed on \u201Cwhat is this chapter telling me.\u201D',
        href: '/tarot/',
        cta: 'Explore tarot readings',
        secondary: { name: 'Love & Relationships \u2014 all question guides', fit: 'the full set of relationship decision guides', href: '/questions/love-relationships/' },
        choose: { name: 'How to Choose a Tarot Reader', href: '/guides/how-to-choose-tarot-reader' },
        note: 'If you do book a reading about an ex, frame it on closure. Readings that keep predicting reunion tend to keep the question open \u2014 and keep you paying.'
      },
      free_first: {
        name: 'This framework + the free Daily Card',
        fit: 'You said a clearer interpretation of his behavior would help most \u2014 and that, this page can give you for free: the five signals above and your result are most of it. The Daily Card adds a small reflective practice, still free.',
        href: '/tools/daily-card',
        cta: 'Try the free Daily Card',
        secondary: { name: 'Do What Fits \u2014 the full matcher', fit: 'if a real question surfaces and you want the complete match', href: '/do-what-fits' },
        note: 'If, after a week or two of watching the pattern, a real question surfaces \u2014 that\u2019s your question, and that\u2019s when a reading earns its cost.'
      },
      general: {
        name: 'Do What Fits \u2014 the matcher',
        fit: 'You\u2019re not sure what you\u2019re asking yet, which is a fine and common place to start. The seven-question matcher maps your situation to the practice that fits it \u2014 or to none of them.',
        href: '/do-what-fits',
        cta: 'Take Do What Fits',
        secondary: { name: 'Psychic vs Tarot', fit: 'the decision rule for relationship questions', href: '/guides/psychic-vs-tarot' },
        note: 'Free, two minutes, and it ends with a next step either way.'
      }
    },

    matchPractice: function (answers) {
      var w = answers.want, h = answers.help;
      if (w === 'wait') return 'tarot_decision';
      if (w === 'still' || (answers.status === 'exes' && w === 'feelings')) return 'closure';
      if (h === 'interpret') return 'free_first';
      if (w === 'feelings' || w === 'why' || h === 'insight') return 'psychic';
      if (w === 'going' || w === 'commit' || h === 'heading') return 'tarot_relationship';
      if (w === 'beneath' || h === 'deeper') return 'tarot_deep';
      if (h === 'guidance') return 'tarot_decision';
      return 'general';
    },

    /* ---- Custom result renderer (engine hook) ----
       One-line delegation to the shared pattern-result renderer
       (window.mysticdoPatternResult, top of this file). */
    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'does-he-love-me', {
        emailTitle: 'Get relationship-tuned guidance by email',
        emailText: 'One weekly note for people navigating exactly this \u2014 a decision guide, a free tool, one honest recommendation. No spam, unsubscribe anytime.',
        negativePatternTip: {
          pattern: 'uneven',
          text: 'when effort is this one-sided, a reading about his feelings can quietly become a more expensive way of holding the connection together. If you book one, frame it on your situation \u2014 not on him.'
        }
      });
    }
  },

  /* ============================================================
     2. DOES HE THINK ABOUT ME
     Mental presence in absence: four signals (initiation,
     contextual recall, gap behavior, response quality).
     Five patterns: actively-reaching / contextually-connected /
     gap-dependent / one-sided / unclear.
     ============================================================ */
  'does-he-think-about-me': {
    id: 'does-he-think-about-me',
    title: 'Read His Presence Pattern',
    subtitle: 'Eight questions, about two minutes. A read of what the pattern of contact and recall may suggest \u2014 and where it stops. No score, no verdict, no signup.',
    questions: [
      { id: 'status', q: 'What\u2019s your relationship with him right now?', hint: 'This matters more than it sounds \u2014 the same behavior means different things in different situations.', options: [
        { text: 'We\u2019re in a relationship', detail: 'together, official', score: 'together' },
        { text: 'We\u2019re dating, but it\u2019s not official', detail: 'seeing each other regularly', score: 'dating' },
        { text: 'We\u2019re talking or getting to know each other', detail: 'early days', score: 'talking' },
        { text: 'We\u2019re friends, but there might be more', detail: 'a line that keeps almost being crossed', score: 'friends' },
        { text: 'We\u2019re separated or taking space', detail: 'a pause of some kind', score: 'separated' },
        { text: 'We\u2019re exes', detail: 'it ended at some point', score: 'exes' },
        { text: 'It\u2019s complicated', detail: 'even this question is hard to answer', score: 'complicated' }
      ]},
      { id: 'trigger', q: 'What made you start wondering whether he thinks about you?', hint: '', options: [
        { text: 'He\u2019s become more distant', detail: 'less contact than there was', score: 'distant' },
        { text: 'His contact feels inconsistent', detail: 'warm, then not', score: 'inconsistent' },
        { text: 'He says he thinks of me, but I\u2019m not sure', detail: 'words without weight', score: 'words' },
        { text: 'We had a disagreement and something shifted', detail: 'and the gap grew', score: 'conflict' },
        { text: 'The connection feels stuck', detail: 'comfortable, but not moving', score: 'stalled' },
        { text: 'I don\u2019t know what he really thinks', detail: 'I can\u2019t get a clear read', score: 'unknown' },
        { text: 'Something about us feels different', detail: 'I can\u2019t name it', score: 'changed' },
        { text: 'No specific reason \u2014 I just want clarity', detail: 'the question itself', score: 'clarity' }
      ]},
      { id: 'communication', q: 'How would you describe his contact with you when you\u2019re apart?', hint: '', options: [
        { text: 'Consistent and engaged', detail: 'steady, responsive', score: 'consistent' },
        { text: 'Frequent, but sometimes unpredictable', detail: 'a lot, in waves', score: 'frequent' },
        { text: 'Mostly when I reach out first', detail: 'he responds, rarely initiates', score: 'reactive' },
        { text: 'Hot and cold', detail: 'very close, then gone', score: 'hotcold' },
        { text: 'Mostly when he wants something', detail: 'contact follows his needs', score: 'convenient' },
        { text: 'He\u2019s become noticeably quieter', detail: 'recently, without explanation', score: 'quieter' },
        { text: 'We barely communicate', detail: 'long silences between exchanges', score: 'barely' }
      ]},
      { id: 'effort', q: 'When it comes to reaching out across the distance, who usually takes the lead?', hint: '', options: [
        { text: 'Mostly him', detail: 'he initiates, circles back', score: 'him' },
        { text: 'About equally', detail: 'it flows both ways', score: 'equal' },
        { text: 'Mostly me', detail: 'I hold most of it', score: 'me' },
        { text: 'It changes back and forth', detail: 'no steady pattern', score: 'variable' },
        { text: 'We rarely make contact', detail: 'the connection lives in messages', score: 'rarely' },
        { text: 'It\u2019s difficult to tell', detail: 'I genuinely can\u2019t say', score: 'hard' }
      ]},
      { id: 'space', q: 'What usually happens when you don\u2019t reach out for a while?', hint: 'Distance is one of the clearer tests of mental engagement \u2014 not the only one, but a real one.', options: [
        { text: 'He notices and reaches out', detail: 'the gap doesn\u2019t break contact', score: 'notices' },
        { text: 'He gives me space but stays connected', detail: 'present, patient', score: 'stays' },
        { text: 'Nothing really changes', detail: 'silence stays silence', score: 'nothing' },
        { text: 'He becomes even more distant', detail: 'space becomes distance', score: 'worse' },
        { text: 'He comes back only when I contact him', detail: 'he returns, but on my call', score: 'returns' },
        { text: 'We haven\u2019t had enough distance to tell', detail: 'too early, or never tested', score: 'notell' }
      ]},
      { id: 'alignment', q: 'How closely does what he does match what he says about thinking of you?', hint: '', options: [
        { text: 'Very closely', detail: 'he backs it up', score: 'very' },
        { text: 'Usually, but not always', detail: 'solid, with lapses', score: 'usually' },
        { text: 'Sometimes', detail: 'it depends on the week', score: 'sometimes' },
        { text: 'Not very closely', detail: 'more talk than follow-through', score: 'notvery' },
        { text: 'They often contradict each other', detail: 'warm words, distant actions', score: 'contradict' },
        { text: 'I honestly don\u2019t know', detail: 'I can\u2019t track it', score: 'dontknow' }
      ]},
      { id: 'want', q: 'What do you most want to know?', hint: 'Be honest with this one \u2014 it decides what actually helps you next.', options: [
        { text: 'Whether he thinks about me', detail: 'the question on the surface', score: 'feelings' },
        { text: 'Why his contact pattern changed', detail: 'something shifted; I want to understand what', score: 'why' },
        { text: 'Whether this connection is going anywhere', detail: 'direction, not just presence', score: 'going' },
        { text: 'Whether he\u2019s invested enough to stay engaged', detail: 'I want to know where the floor is', score: 'commit' },
        { text: 'Whether he still thinks about me', detail: 'after the ending', score: 'still' },
        { text: 'Should I reach out, or wait?', detail: 'I\u2019m stuck between two moves', score: 'wait' },
        { text: 'What\u2019s really going on beneath the surface?', detail: 'I sense something I can\u2019t name', score: 'beneath' },
        { text: 'I just want clarity', detail: 'whatever clarity looks like', score: 'justclarity' }
      ]},
      { id: 'help', q: 'What would help you most right now?', hint: '', options: [
        { text: 'A clearer interpretation of his behavior', detail: 'reading the pattern better', score: 'interpret' },
        { text: 'Insight into what he may be thinking', detail: 'his side of it', score: 'insight' },
        { text: 'Understanding where this is heading', detail: 'the trajectory', score: 'heading' },
        { text: 'Guidance on what I should do next', detail: 'a next step', score: 'guidance' },
        { text: 'A deeper reading of the connection', detail: 'the whole picture', score: 'deeper' },
        { text: 'I\u2019m not sure \u2014 I just want to understand', detail: 'help me find the question', score: 'unsure' }
      ]}
    ],
    resolve: window.loveResolve({ high: 'actively-reaching', midHigh: 'contextually-connected', mid: 'gap-dependent', low: 'one-sided', uncertain: 'unclear' }),
    results: {
      'actively-reaching': {
        path: 'Actively reaching',
        summary: 'He initiates contact unprompted, recalls what you share, and bridges the gaps.',
        suggest: function (a) {
          var s = 'Across what you\u2019ve described, he reaches toward you across distance without needing a prompt.';
          if (a.communication === 'consistent') s += ' Contact stays steady rather than arriving in waves.';
          if (a.effort === 'him' || a.effort === 'equal') s += ' The reaching flows from both sides.';
          if (a.alignment === 'very' || a.alignment === 'usually') s += ' And what he does tracks what he says.';
          s += ' Unprompted initiation is the clearest behavioral signal that you cross his mind \u2014 though it still can\u2019t tell you how often, or what the thoughts are about.';
          return s;
        },
        dontTell: 'Unprompted reaching shows mental engagement; it can\u2019t prove the nature of the thoughts. He can think about you often without it being romantic, or rarely without it meaning less when he does. The frequency of contact and the frequency of thought are only loosely coupled.',
        watchIntro: 'Worth watching over the coming weeks:',
        watch: function () {
          return [
            'Whether the unprompted reaching holds across different weeks and contexts, not just one active stretch.',
            'Whether what he reaches with carries warmth, or is purely social \u2014 content and quality matter as much as timing.'
          ];
        }
      },
      'contextually-connected': {
        path: 'Contextually connected',
        summary: 'You surface in his mind in specific contexts \u2014 songs, places, things you said.',
        suggest: function (a) {
          var s = 'Your answers show contextual recall: he references things you shared, sends content that made him think of you, connects external cues to you.';
          if (a.alignment === 'usually' || a.alignment === 'sometimes') s += ' The connection isn\u2019t perfect, but it\u2019s real.';
          s += ' That suggests you have a stable place in his associative memory \u2014 the mental representation is active enough to be triggered by the world around him, not just by direct contact.';
          return s;
        },
        dontTell: 'Contextual recall shows you\u2019re in his memory; it can\u2019t prove how often you\u2019re in his thoughts between those moments. Memory of what you said and sustained thinking about you are different systems \u2014 both are real, neither proves the other.',
        watchIntro: 'Worth watching over the coming weeks:',
        watch: function () {
          return [
            'Whether the contextual connections come with warmth, or are purely associative \u2014 a song reminder isn\u2019t the same as missing you.',
            'Whether the pattern holds across time, or is concentrated in one active stretch that may fade.'
          ];
        }
      },
      'gap-dependent': {
        path: 'Gap-dependent',
        summary: 'The connection lives mainly in scheduled or prompted exchanges.',
        suggest: function (a) {
          var s = 'Your answers describe a connection that depends on structure \u2014 contact happens when there\u2019s a reason, but doesn\u2019t bridge the gaps on its own.';
          if (a.communication === 'reactive') s += ' He responds more than he initiates.';
          if (a.space === 'nothing' || a.space === 'returns') s += ' And the gaps fill only when you fill them.';
          s += ' That doesn\u2019t mean you\u2019re not on his mind; it means the behavioral evidence of mental engagement is thinner than it could be, and the connection runs on prompted contact rather than unprompted reaching.';
          return s;
        },
        dontTell: 'A gap-dependent pattern has many explanations: busyness, a different communication style, an avoidant attachment pattern, or simply a connection that hasn\u2019t deepened enough yet. The pattern can\u2019t tell you which \u2014 only he can.',
        watchIntro: 'Try a simple observation window:',
        watch: function () {
          return [
            'For two or three weeks, note who initiates when there\u2019s no reason to \u2014 the gaps between prompted contact are where the real signal lives.',
            'Whether contextual recall appears even when contact is sparse \u2014 he can think about you without reaching out, and that\u2019s the gap this check can\u2019t close.'
          ];
        }
      },
      'one-sided': {
        path: 'One-sided mental engagement',
        summary: 'The reaching runs mostly from your side.',
        suggest: function (a) {
          var s = 'Much of the visible reaching in this connection appears to come from you.';
          if (a.communication === 'reactive' || a.communication === 'convenient') s += ' He responds more than he initiates.';
          if (a.effort === 'me') s += ' You\u2019re the one holding the thread.';
          if (a.space === 'returns') s += ' And contact resumes when you make it.';
          s += ' That doesn\u2019t reveal whether he thinks about you. What it does reveal is that the behavioral evidence is running in one direction, and the connection runs largely on your effort to maintain it.';
          return s;
        },
        dontTell: 'One-sided reaching doesn\u2019t prove he doesn\u2019t think about you \u2014 some people think constantly and never reach out, especially those with avoidant attachment. But it does mean the observable evidence is thin, and that\u2019s worth being honest about.',
        watchIntro: 'Over the next few weeks:',
        watch: function () {
          return [
            'Let one unprompted reach go quiet that you\u2019d normally make, and watch what happens to the gap. Not as a test; as information.',
            'Consider whether the question you\u2019re really asking is about him, or about your own preoccupation \u2014 the two questions have different honest answers.'
          ];
        }
      },
      'unclear': {
        path: 'Unclear pattern',
        summary: 'Not enough behavioral evidence to read yet.',
        suggest: function () {
          return 'Several of your answers say \u201CI don\u2019t know\u201D \u2014 and that\u2019s worth taking seriously rather than filling with hope. Right now there isn\u2019t enough observable pattern to read, which usually means the connection is genuinely too new, or you\u2019re standing too close to see its shape.';
        },
        dontTell: 'An unclear pattern isn\u2019t a negative one. At this stage, hunting for one more \u201Csign\u201D tends to produce noise \u2014 every small gesture gets recruited as evidence for whichever answer you\u2019re already leaning toward.',
        watchIntro: 'Give it a defined window:',
        watch: function () {
          return [
            'Three or four weeks of ordinary contact, watching only two things: who initiates unprompted, and whether contextual recall appears.',
            'Then come back and retake this check. With more pattern to read, the result will be sharper.'
          ];
        }
      }
    },
    underneath: function (answers, pattern) {
      var a = answers;
      if ((a.status === 'exes' || a.status === 'separated') &&
          (a.trigger === 'distant' || a.trigger === 'changed' || a.want === 'still')) {
        return { key: 'closure', label: 'What may be underneath: the closure question', text: 'When something ends without a full explanation, the mind tends to keep the question open \u2014 \u201Cdoes he still think about me\u201D can quietly become a way of keeping the connection alive. If that lands, the more useful frame is closure \u2014 what this chapter was and what it means now \u2014 rather than what he\u2019s doing tonight.' };
      }
      if (a.want === 'wait') {
        return { key: 'reach-out', label: 'What may be underneath: the reach-out question', text: '\u201CShould I reach out or wait\u201D isn\u2019t really about whether he thinks about you \u2014 it\u2019s a decision you\u2019re carrying. His pattern of response over time is more useful information than a reading about what\u2019s in his mind. The decision stays yours.' };
      }
      if (a.trigger === 'unknown' && (pattern === 'actively-reaching' || pattern === 'contextually-connected')) {
        return { key: 'reassurance', label: 'What may be underneath: the reassurance question', text: 'Worth noticing: your answers describe a connection with real mental engagement, and the doubt didn\u2019t come from his behavior \u2014 it came from not being able to see inside it. When the question keeps returning even while signs are present, it\u2019s sometimes about anxiety rather than evidence.' };
      }
      if (a.want === 'beneath' || (a.want === 'justclarity' && a.help === 'deeper')) {
        return { key: 'preoccupation', label: 'What may be underneath: the preoccupation question', text: 'Sometimes the question inverts: you\u2019re asking about his thoughts because your own won\u2019t quiet down. That\u2019s a different question entirely \u2014 one about your own mental engagement and attachment. If the preoccupation is significant, a licensed therapist is the more honest match than a reading about him.' };
      }
      if (pattern === 'one-sided' || pattern === 'gap-dependent') {
        return { key: 'reciprocity', label: 'What may be underneath: the reciprocity question', text: 'When the reaching runs mostly from your side, the real question may not be \u201Cdoes he think about me\u201D but \u201Cis this connection mutual, or am I carrying it alone?\u201D That\u2019s a reciprocity question, and it has a clearer honest answer than the mind-reading one.' };
      }
      return null;
    },
    practice: window.lovePracticeSet('does-he-think-about-me'),
    matchPractice: window.loveMatchPractice,
    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'does-he-think-about-me', {
        emailTitle: 'Get presence-pattern guidance by email',
        emailText: 'One weekly note for people navigating exactly this \u2014 a decision guide, a free tool, one honest recommendation. No spam, unsubscribe anytime.',
        negativePatternTip: {
          pattern: 'one-sided',
          text: 'when the reaching is this one-sided, a reading about what he\u2019s thinking can quietly become a more expensive way of holding the connection together. If you book one, frame it on the dynamic between you \u2014 not on his mind.'
        }
      });
    }
  },

  /* ============================================================
     3. DOES MY CRUSH LIKE ME BACK
     Early-stage mutual interest: three signals (specificity,
     unprompted initiative, response to openings) + one honest
     action. Five patterns: clear-mutual / promising-unconfirmed /
     friendly-no-direction / unclear-direction / not-enough-data.
     ============================================================ */
  'does-my-crush-like-me-back': {
    id: 'does-my-crush-like-me-back',
    title: 'Read the Early-Stage Pattern',
    subtitle: 'Eight questions, about two minutes. A read of what the signals available so far may honestly suggest \u2014 and where they stop. No score, no verdict, no signup.',
    questions: [
      { id: 'status', q: 'What\u2019s your situation with him right now?', hint: 'This matters more than it sounds \u2014 early signals mean something different in week one than month three.', options: [
        { text: 'We\u2019re in a relationship', detail: 'together, official', score: 'together' },
        { text: 'We\u2019re dating, but it\u2019s not official', detail: 'seeing each other regularly', score: 'dating' },
        { text: 'We\u2019re talking or getting to know each other', detail: 'early days', score: 'talking' },
        { text: 'We\u2019re friends, but there might be more', detail: 'a line that keeps almost being crossed', score: 'friends' },
        { text: 'We\u2019re separated or taking space', detail: 'a pause of some kind', score: 'separated' },
        { text: 'We\u2019re exes', detail: 'it ended at some point', score: 'exes' },
        { text: 'It\u2019s complicated', detail: 'even this question is hard to answer', score: 'complicated' }
      ]},
      { id: 'trigger', q: 'What made you start wondering whether he likes you back?', hint: '', options: [
        { text: 'He\u2019s become more distant', detail: 'less engaged than he was', score: 'distant' },
        { text: 'His behavior feels inconsistent', detail: 'warm, then not', score: 'inconsistent' },
        { text: 'He says he cares, but I\u2019m not sure', detail: 'words without weight', score: 'words' },
        { text: 'We had a moment, then nothing', detail: 'a charged exchange, then silence', score: 'conflict' },
        { text: 'Things feel stuck', detail: 'friendly, but not moving', score: 'stalled' },
        { text: 'I don\u2019t know if he\u2019s interested', detail: 'I can\u2019t get a clear read', score: 'unknown' },
        { text: 'Something about us feels different', detail: 'I can\u2019t name it', score: 'changed' },
        { text: 'No specific reason \u2014 I just want clarity', detail: 'the question itself', score: 'clarity' }
      ]},
      { id: 'communication', q: 'How would you describe his communication with you?', hint: '', options: [
        { text: 'Consistent and engaged', detail: 'he reaches out steadily', score: 'consistent' },
        { text: 'Frequent, but sometimes unpredictable', detail: 'a lot, in waves', score: 'frequent' },
        { text: 'Mostly when I reach out first', detail: 'he responds, rarely initiates', score: 'reactive' },
        { text: 'Hot and cold', detail: 'very close, then distant', score: 'hotcold' },
        { text: 'Mostly when it\u2019s convenient for him', detail: 'contact follows his needs', score: 'convenient' },
        { text: 'He\u2019s become noticeably quieter', detail: 'recently, without explanation', score: 'quieter' },
        { text: 'We barely communicate', detail: 'long silences between exchanges', score: 'barely' }
      ]},
      { id: 'effort', q: 'When it comes to initiating contact or plans, who usually takes the lead?', hint: '', options: [
        { text: 'Mostly him', detail: 'he reaches out, makes plans', score: 'him' },
        { text: 'About equally', detail: 'it flows both ways', score: 'equal' },
        { text: 'Mostly me', detail: 'I hold most of it', score: 'me' },
        { text: 'It changes back and forth', detail: 'no steady pattern', score: 'variable' },
        { text: 'We rarely make plans', detail: 'the connection lives in messages', score: 'rarely' },
        { text: 'It\u2019s difficult to tell', detail: 'I genuinely can\u2019t say', score: 'hard' }
      ]},
      { id: 'space', q: 'What usually happens when you create a small opening \u2014 a question, an invitation, a natural pause?', hint: 'Response to natural openings is often more diagnostic than any passively observed signal.', options: [
        { text: 'He leans in', detail: 'engages, adds to it', score: 'notices' },
        { text: 'He meets me there', detail: 'present, responsive', score: 'stays' },
        { text: 'Nothing really changes', detail: 'polite but flat', score: 'nothing' },
        { text: 'He pulls back', detail: 'the opening makes him distant', score: 'worse' },
        { text: 'He responds, but on his terms', detail: 'he returns, but on his timing', score: 'returns' },
        { text: 'We haven\u2019t had enough interaction to tell', detail: 'too early to judge', score: 'notell' }
      ]},
      { id: 'alignment', q: 'How does his behavior with you compare to how he is with others?', hint: 'This is the most diagnostic single observation in early dynamics \u2014 it controls for his baseline.', options: [
        { text: 'Clearly different \u2014 warmer, more attentive', detail: 'I stand out to him', score: 'very' },
        { text: 'Somewhat different', detail: 'there\u2019s something, but it\u2019s subtle', score: 'usually' },
        { text: 'About the same', detail: 'he treats me like everyone else', score: 'sometimes' },
        { text: 'Less engaged than with others', detail: 'I might be on the outside', score: 'notvery' },
        { text: 'It contradicts itself \u2014 warm words, distant actions', detail: 'I can\u2019t read it', score: 'contradict' },
        { text: 'I honestly don\u2019t know', detail: 'I haven\u2019t seen enough to compare', score: 'dontknow' }
      ]},
      { id: 'want', q: 'What do you most want to know?', hint: 'Be honest with this one \u2014 it decides what actually helps you next.', options: [
        { text: 'Does he actually like me back?', detail: 'the question on the surface', score: 'feelings' },
        { text: 'Why does he act differently with me?', detail: 'something shifted; I want to understand what', score: 'why' },
        { text: 'Is this going anywhere?', detail: 'direction, not just interest', score: 'going' },
        { text: 'Would he actually want to date me?', detail: 'I want to know his intention', score: 'commit' },
        { text: 'Is the interest still there, or fading?', detail: 'after a shift', score: 'still' },
        { text: 'Should I make a move, or wait?', detail: 'I\u2019m stuck between two moves', score: 'wait' },
        { text: 'What\u2019s really going on between us?', detail: 'I sense something I can\u2019t name', score: 'beneath' },
        { text: 'I just want to know where I stand', detail: 'whatever clarity looks like', score: 'justclarity' }
      ]},
      { id: 'help', q: 'What would help you most right now?', hint: '', options: [
        { text: 'A clearer interpretation of his behavior', detail: 'reading the signals better', score: 'interpret' },
        { text: 'Insight into what he may be feeling', detail: 'his side of it', score: 'insight' },
        { text: 'Understanding where this is heading', detail: 'the trajectory', score: 'heading' },
        { text: 'Guidance on what I should do next', detail: 'a next step', score: 'guidance' },
        { text: 'A deeper reading of the connection', detail: 'the whole picture', score: 'deeper' },
        { text: 'I\u2019m not sure \u2014 I just want to understand', detail: 'help me find the question', score: 'unsure' }
      ]}
    ],
    resolve: window.loveResolve({ high: 'clear-mutual', midHigh: 'promising-unconfirmed', mid: 'friendly-no-direction', low: 'unclear-direction', uncertain: 'not-enough-data' }),
    results: {
      'clear-mutual': {
        path: 'Clear mutual signals',
        summary: 'His attention is specific, his initiative is sustained, and his behavior differs from how he is with others.',
        suggest: function (a) {
          var s = 'Across what you\u2019ve described, the signals point in the same direction.';
          if (a.communication === 'consistent') s += ' He reaches out steadily, not just when prompted.';
          if (a.effort === 'him' || a.effort === 'equal') s += ' Initiative flows from both sides.';
          if (a.alignment === 'very') s += ' And his behavior with you is clearly different from how he is with others \u2014 the most diagnostic single observation in early dynamics.';
          s += ' That\u2019s the strongest pattern early-stage behavior can show. It still can\u2019t prove his intention \u2014 but it gives you real information to work with.';
          return s;
        },
        dontTell: 'Clear mutual signals show interest; they can\u2019t prove intention. Someone can be genuinely interested and not ready to act on it \u2014 or ready to act and bad at showing it. The signals narrow the uncertainty; they don\u2019t close it.',
        watchIntro: 'The most reliable next step:',
        watch: function () {
          return [
            'Create a low-stakes natural opening \u2014 a casual invitation, a direct question that opens the door \u2014 and watch what he does with it. Not a declaration; an opening.',
            'His response to a real, specific invitation gives you more information than any amount of passive signal-reading. The signs point; the invitation tests.'
          ];
        }
      },
      'promising-unconfirmed': {
        path: 'Promising but unconfirmed',
        summary: 'There are real signals, but not yet enough pattern to read with confidence.',
        suggest: function (a) {
          var s = 'Your answers show some real signals \u2014 contact happens, effort exists \u2014 but the pattern isn\u2019t consistent enough to read clearly yet.';
          if (a.communication === 'frequent' || a.communication === 'reactive') s += ' The contact is there, but its rhythm is uneven.';
          if (a.alignment === 'usually' || a.alignment === 'sometimes') s += ' And the specificity \u2014 whether his attention is different with you than with others \u2014 isn\u2019t clear enough yet.';
          s += ' That\u2019s normal for early dynamics, where the behavioral history hasn\u2019t had time to reveal a pattern. It\u2019s not a negative reading; it\u2019s an incomplete one.';
          return s;
        },
        dontTell: 'Promising signals can reflect interest, warmth, or simple social comfort \u2014 and the interpretive pressure of having a crush makes all three look the same. The signals haven\u2019t had enough time to separate.',
        watchIntro: 'Give it a defined window:',
        watch: function () {
          return [
            'Two or three more natural interactions, watching one thing: does his attention differ specifically toward you, or is it how he is with everyone?',
            'If you\u2019re ready, create one low-stakes opening. His response to a real invitation produces more information than another week of passive observation.'
          ];
        }
      },
      'friendly-no-direction': {
        path: 'Friendly without directional signal',
        summary: 'Warmth is present, but it doesn\u2019t point anywhere specific.',
        suggest: function (a) {
          var s = 'Your answers describe warmth without direction \u2014 contact happens, but it doesn\u2019t carry the specificity or sustained initiative that would distinguish romantic interest from general friendliness.';
          if (a.alignment === 'sometimes' || a.alignment === 'notvery') s += ' His behavior with you isn\u2019t noticeably different from how he is with others.';
          if (a.communication === 'reactive' || a.effort === 'me') s += ' And the initiative runs mostly from your side.';
          s += ' That\u2019s not a rejection. It\u2019s information: the behavioral record doesn\u2019t yet show the kind of specific, directional signal that early romantic interest usually produces.';
          return s;
        },
        dontTell: 'Friendly warmth and romantic interest produce many of the same behaviors \u2014 eye contact, laughter, engagement. The difference is specificity and initiative, not warmth itself. Without specificity, warmth can be genuine and still platonic.',
        watchIntro: 'The honest test:',
        watch: function () {
          return [
            'Create one low-stakes opening and watch the quality of his response \u2014 not just whether he says yes, but whether he engages, adds to it, meets you there.',
            'If the response is polite but flat across two or three openings, that\u2019s information too. Not a verdict, but a signal that the directional interest may not be there.'
          ];
        }
      },
      'unclear-direction': {
        path: 'Unclear direction',
        summary: 'The signals conflict, or run in one direction only.',
        suggest: function (a) {
          var s = 'Your answers show a gap between connection and consistency \u2014 enough warmth to keep things going, not enough steadiness or specificity to read a direction.';
          if (a.communication === 'hotcold') s += ' The hot-and-cold rhythm is the clearest example.';
          if (a.alignment === 'contradict') s += ' So is the distance between his words and his actions.';
          s += ' This is the hardest pattern to read from inside, because each good stretch resets the question and each cold stretch reopens it. The pattern itself is the information.';
          return s;
        },
        dontTell: 'Conflicting signals have many causes: ambivalence, stress, avoidance, another priority, or a communication style that runs in waves. The pattern can\u2019t tell you which \u2014 and it can\u2019t tell you what he feels, only how the connection behaves.',
        watchIntro: 'Try a simple observation window:',
        watch: function () {
          return [
            'For two or three weeks, note privately who initiates and whether his behavior differs with you versus others \u2014 no tests, no experiments, just watching.',
            'A pattern that\u2019s still conflicting after a month of ordinary contact isn\u2019t a phase. It\u2019s the dynamic\u2019s current shape, and it deserves a direct conversation rather than another round of decoding.'
          ];
        }
      },
      'not-enough-data': {
        path: 'Not enough data yet',
        summary: 'Too early, or too sparse, to read \u2014 which is information too.',
        suggest: function () {
          return 'Several of your answers say \u201CI don\u2019t know\u201D \u2014 and in early dynamics, that\u2019s often the honest answer. The behavioral history hasn\u2019t had enough time or variation to reveal a pattern. Right now, the most useful thing isn\u2019t more signs; it\u2019s more interactions.';
        },
        dontTell: 'An unclear pattern isn\u2019t a negative one. At this stage, every small gesture gets recruited as evidence for whichever answer you\u2019re already leaning toward. The interpretive pressure of having a crush is real \u2014 and it\u2019s exactly what makes early signs so unreliable.',
        watchIntro: 'Give it a defined window:',
        watch: function () {
          return [
            'Two or three more natural interactions, in different contexts if possible. Watch for specificity: is his attention different with you, or is it how he is with everyone?',
            'Then come back and retake this check. With more behavioral history, the result will be sharper \u2014 or you\u2019ll have created a natural opening that gave you the answer directly.'
          ];
        }
      }
    },
    underneath: function (answers, pattern) {
      var a = answers;
      if ((a.status === 'exes' || a.status === 'separated') && (a.want === 'still' || a.trigger === 'distant')) {
        return { key: 'closure', label: 'What may be underneath: the closure question', text: 'When the question is about someone from before, \u201Cdoes he like me back\u201D can quietly become a way of reopening what ended. If that lands, the more useful frame is closure \u2014 what this was and what it means now \u2014 rather than whether the feeling has returned.' };
      }
      if (a.want === 'wait') {
        return { key: 'safety', label: 'What may be underneath: the safety question', text: '\u201CShould I make a move or wait\u201D is often really about the fear of rejection \u2014 which is reasonable, but one that signs-reading can\u2019t answer. The honest question is whether the risk of being direct is worth taking, and a low-stakes natural opening is almost always lower-risk than it feels.' };
      }
      if (a.trigger === 'unknown' && (pattern === 'clear-mutual' || pattern === 'promising-unconfirmed')) {
        return { key: 'projection', label: 'What may be underneath: the projection question', text: 'Worth noticing: your answers show some real signals, but the doubt comes from not being sure you\u2019re reading them right. That\u2019s the self-calibration question \u2014 and the most useful check is comparing his behavior with you to his behavior with others, not searching for one more sign.' };
      }
      if (a.want === 'beneath' || (a.want === 'justclarity' && a.help === 'deeper')) {
        return { key: 'pattern', label: 'What may be underneath: the pattern question', text: 'If this isn\u2019t the first time you\u2019ve been reading signals, waiting, not acting, wondering \u2014 the more useful question may be about the pattern rather than this person. Why unclear interest keeps feeling like the interest worth waiting for is a question that has better tools than another round of sign-reading.' };
      }
      if (a.help === 'guidance' && (pattern === 'unclear-direction' || pattern === 'friendly-no-direction')) {
        return { key: 'confession', label: 'What may be underneath: the confession question', text: 'You said you want guidance on what to do next \u2014 and sometimes the real question underneath is whether to tell him how you feel. A direct expression is the cleanest signal you can send, but it changes the dynamic regardless of the response. A low-stakes opening usually produces most of the same information with less exposure.' };
      }
      return null;
    },
    practice: window.lovePracticeSet('does-my-crush-like-me-back'),
    matchPractice: window.loveMatchPractice,
    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'does-my-crush-like-me-back', {
        emailTitle: 'Get early-stage guidance by email',
        emailText: 'One weekly note for people navigating exactly this \u2014 a decision guide, a free tool, one honest recommendation. No spam, unsubscribe anytime.',
        negativePatternTip: {
          pattern: 'unclear-direction',
          text: 'when signals are this conflicting, a reading about whether he likes you can quietly become a more expensive way of staying in the uncertainty. If you book one, frame it on your own clarity \u2014 not on his feelings.'
        }
      });
    }
  },

  /* ============================================================
     4. IS HE THE ONE
     Long-term compatibility and \u201Crightness\u201D: four signals
     (consistency, initiative, investment, alignment of values).
     Five patterns: strong-foundation / genuine-open-questions /
     direction-uncertainty / identity-hesitation / not-enough-evidence.
     ============================================================ */
  'is-he-the-one': {
    id: 'is-he-the-one',
    title: 'Read the Foundation Pattern',
    subtitle: 'Eight questions, about two minutes. A read of what the relationship\u2019s behavioral material may suggest about rightness \u2014 and where it can\u2019t answer. No score, no verdict, no signup.',
    questions: [
      { id: 'status', q: 'What\u2019s your relationship with him right now?', hint: 'This matters more than it sounds \u2014 \u201Cthe one\u201D means different things in week three and year three.', options: [
        { text: 'We\u2019re in a relationship', detail: 'together, official', score: 'together' },
        { text: 'We\u2019re dating, but it\u2019s not official', detail: 'seeing each other regularly', score: 'dating' },
        { text: 'We\u2019re talking or getting to know each other', detail: 'early days', score: 'talking' },
        { text: 'We\u2019re friends, but there might be more', detail: 'a line that keeps almost being crossed', score: 'friends' },
        { text: 'We\u2019re separated or taking space', detail: 'a pause of some kind', score: 'separated' },
        { text: 'We\u2019re exes', detail: 'it ended at some point', score: 'exes' },
        { text: 'It\u2019s complicated', detail: 'even this question is hard to answer', score: 'complicated' }
      ]},
      { id: 'trigger', q: 'What made you start wondering whether he\u2019s the one?', hint: '', options: [
        { text: 'He\u2019s become more distant', detail: 'less present than he was', score: 'distant' },
        { text: 'His commitment feels inconsistent', detail: 'warm, then not', score: 'inconsistent' },
        { text: 'He says I\u2019m the one, but I\u2019m not sure', detail: 'words without weight', score: 'words' },
        { text: 'We had a conflict that shifted something', detail: 'and now I\u2019m questioning', score: 'conflict' },
        { text: 'Things feel stuck', detail: 'comfortable, but not moving forward', score: 'stalled' },
        { text: 'I don\u2019t know if we\u2019re right for the long term', detail: 'I can\u2019t get a clear read', score: 'unknown' },
        { text: 'Something about us feels different', detail: 'I can\u2019t name it', score: 'changed' },
        { text: 'No specific reason \u2014 I just want clarity', detail: 'the question itself', score: 'clarity' }
      ]},
      { id: 'communication', q: 'How would you describe the consistency of your connection?', hint: '', options: [
        { text: 'Consistent and steady', detail: 'reliable across weeks and moods', score: 'consistent' },
        { text: 'Strong, but with some waves', detail: 'mostly steady, occasionally uneven', score: 'frequent' },
        { text: 'Mostly when I initiate depth', detail: 'he engages when I push for it', score: 'reactive' },
        { text: 'Hot and cold', detail: 'very close, then distant', score: 'hotcold' },
        { text: 'Mostly when it\u2019s convenient', detail: 'depth follows his mood', score: 'convenient' },
        { text: 'It\u2019s become noticeably thinner', detail: 'recently, without explanation', score: 'quieter' },
        { text: 'We barely connect deeply', detail: 'the surface is fine, the depth is missing', score: 'barely' }
      ]},
      { id: 'effort', q: 'When it comes to building the relationship forward, who usually takes the lead?', hint: '', options: [
        { text: 'Mostly him', detail: 'he plans, initiates, pushes forward', score: 'him' },
        { text: 'About equally', detail: 'it flows both ways', score: 'equal' },
        { text: 'Mostly me', detail: 'I hold the direction', score: 'me' },
        { text: 'It changes back and forth', detail: 'no steady pattern', score: 'variable' },
        { text: 'We rarely talk about the future', detail: 'the relationship lives in the present', score: 'rarely' },
        { text: 'It\u2019s difficult to tell', detail: 'I genuinely can\u2019t say', score: 'hard' }
      ]},
      { id: 'space', q: 'What usually happens when you step back and let him lead?', hint: 'Who carries the relationship\u2019s direction is one of the clearer tests of \u201Cthe one.\u201D', options: [
        { text: 'He steps up', detail: 'the gap doesn\u2019t break the forward motion', score: 'notices' },
        { text: 'He holds the thread', detail: 'present, patient, engaged', score: 'stays' },
        { text: 'Nothing really changes', detail: 'the pause stays a pause', score: 'nothing' },
        { text: 'He drifts further', detail: 'space becomes distance', score: 'worse' },
        { text: 'He returns only when I re-engage', detail: 'he follows, but on my lead', score: 'returns' },
        { text: 'We haven\u2019t tested it', detail: 'too early, or never tried', score: 'notell' }
      ]},
      { id: 'alignment', q: 'How closely do your values, directions, and visions for life align?', hint: '', options: [
        { text: 'Very closely', detail: 'we want similar things', score: 'very' },
        { text: 'Usually, with some gaps', detail: 'aligned on the big things, working on the rest', score: 'usually' },
        { text: 'Sometimes \u2014 it depends on the topic', detail: 'aligned in places, not in others', score: 'sometimes' },
        { text: 'Not very closely', detail: 'more friction than alignment', score: 'notvery' },
        { text: 'They often pull in different directions', detail: 'warm feelings, different futures', score: 'contradict' },
        { text: 'I honestly don\u2019t know', detail: 'we haven\u2019t gone deep enough to tell', score: 'dontknow' }
      ]},
      { id: 'want', q: 'What do you most want to know?', hint: 'Be honest with this one \u2014 it decides what actually helps you next.', options: [
        { text: 'Is he the right person for me?', detail: 'the question on the surface', score: 'feelings' },
        { text: 'Why do I keep questioning it?', detail: 'something inside me won\u2019t settle', score: 'why' },
        { text: 'Are we right for the long term?', detail: 'direction, not just feeling', score: 'going' },
        { text: 'Is this built to last?', detail: 'I want to know if the foundation holds', score: 'commit' },
        { text: 'After everything, is he still the one?', detail: 'after a shift or an ending', score: 'still' },
        { text: 'Should I commit, or keep my options open?', detail: 'I\u2019m stuck between two futures', score: 'wait' },
        { text: 'What\u2019s really underneath my doubt?', detail: 'I sense something I can\u2019t name', score: 'beneath' },
        { text: 'I just want clarity about us', detail: 'whatever clarity looks like', score: 'justclarity' }
      ]},
      { id: 'help', q: 'What would help you most right now?', hint: '', options: [
        { text: 'A clearer interpretation of our pattern', detail: 'reading the foundation better', score: 'interpret' },
        { text: 'Insight into whether we\u2019re compatible', detail: 'the long-term picture', score: 'insight' },
        { text: 'Understanding where this is heading', detail: 'the trajectory', score: 'heading' },
        { text: 'Guidance on what I should do next', detail: 'a next step', score: 'guidance' },
        { text: 'A deeper reading of the relationship', detail: 'the whole picture', score: 'deeper' },
        { text: 'I\u2019m not sure \u2014 I just want to understand', detail: 'help me find the question', score: 'unsure' }
      ]}
    ],
    resolve: window.loveResolve({ high: 'strong-foundation', midHigh: 'genuine-open-questions', mid: 'direction-uncertainty', low: 'identity-hesitation', uncertain: 'not-enough-evidence' }),
    results: {
      'strong-foundation': {
        path: 'Strong foundation',
        summary: 'Consistent engagement, mutual effort, aligned values, and a direction that holds.',
        suggest: function (a) {
          var s = 'Across what you\u2019ve described, the relationship\u2019s behavioral foundation holds up on more than one front.';
          if (a.communication === 'consistent') s += ' The connection is steady across weeks and moods, not just in good stretches.';
          if (a.effort === 'him' || a.effort === 'equal') s += ' Effort and direction flow from both sides.';
          if (a.alignment === 'very' || a.alignment === 'usually') s += ' And your values and visions for life align on the things that matter.';
          s += ' That\u2019s the strongest pattern observable behavior can show for the \u201Cis he the one\u201D question \u2014 though it still can\u2019t settle the question completely, because \u201Cthe one\u201D is partly a decision, not only a detection.';
          return s;
        },
        dontTell: 'A strong foundation shows the relationship has the material for longevity \u2014 it can\u2019t guarantee the outcome. \u201CThe one\u201D is a concept that blends compatibility, timing, and choice. Behavior can show the first; the other two are partly yours to decide.',
        watchIntro: 'Worth watching over the coming months:',
        watch: function () {
          return [
            'Whether the foundation holds during his hard weeks \u2014 investment that survives inconvenience is the strongest signal there is.',
            'Whether the two of you can have the hard conversations \u2014 about the future, about differences, about what each of you needs. A foundation that can\u2019t hold disagreement isn\u2019t a foundation yet.'
          ];
        }
      },
      'genuine-open-questions': {
        path: 'Genuine connection with open questions',
        summary: 'The connection is real; the long-term answer isn\u2019t settled yet.',
        suggest: function (a) {
          var s = 'Your answers describe a real connection with genuine engagement \u2014 but the long-term question hasn\u2019t been fully tested yet.';
          if (a.alignment === 'usually' || a.alignment === 'sometimes') s += ' Your values align in places, with gaps that haven\u2019t been explored.';
          if (a.effort === 'variable' || a.effort === 'equal') s += ' And while effort exists, the direction of the relationship isn\u2019t clearly being built by both of you.';
          s += ' That\u2019s not a problem \u2014 it\u2019s the normal state of a relationship that hasn\u2019t yet been tested at the depth the \u201Cis he the one\u201D question requires.';
          return s;
        },
        dontTell: 'A genuine connection with open questions is the most common state for a developing relationship. The question \u201Cis he the one\u201D asks more of the relationship than it has yet been asked to show \u2014 and that\u2019s information about the question\u2019s timing, not about the relationship\u2019s worth.',
        watchIntro: 'Worth watching over the coming months:',
        watch: function () {
          return [
            'Whether the open questions get addressed \u2014 through conversation, through time, through testing the relationship in new contexts.',
            'Whether you\u2019re asking \u201Cis he the one\u201D because the relationship is ready for that question, or because anxiety is asking it before the relationship is.'
          ];
        }
      },
      'direction-uncertainty': {
        path: 'Direction uncertainty',
        summary: 'The connection is present; the direction isn\u2019t clear.',
        suggest: function (a) {
          var s = 'Your answers show a gap between the quality of the connection and the clarity of its direction.';
          if (a.communication === 'frequent' || a.communication === 'reactive') s += ' There\u2019s engagement, but it doesn\u2019t consistently build toward anything.';
          if (a.alignment === 'sometimes' || a.alignment === 'notvery') s += ' And the alignment on values and vision isn\u2019t clear enough to read with confidence.';
          s += ' The \u201Cis he the one\u201D question asks the relationship to have a direction it hasn\u2019t yet established \u2014 which is why the question feels so hard to answer from inside it.';
          return s;
        },
        dontTell: 'Direction uncertainty has many causes: the relationship is still developing, one or both of you aren\u2019t ready to commit to a direction, or the compatibility is real but the timing isn\u2019t. The pattern can\u2019t tell you which.',
        watchIntro: 'Try a direct conversation:',
        watch: function () {
          return [
            'The \u201Cis he the one\u201D question is partly a detection problem (read the signs) and partly a decision problem (choose a direction). Naming which one you\u2019re in is most of the work.',
            'A direct conversation about where the relationship is heading \u2014 not a quiz of his feelings, but an honest exchange about direction \u2014 gives you more information than another month of pattern-reading.'
          ];
        }
      },
      'identity-hesitation': {
        path: 'Identity-level hesitation',
        summary: 'Something deeper than behavior is keeping the question open.',
        suggest: function (a) {
          var s = 'Your answers show a pattern that runs thin on more than one front \u2014 consistency, effort, or alignment all suggest a relationship that isn\u2019t yet built to carry the weight \u201Cthe one\u201D implies.';
          if (a.effort === 'me') s += ' You\u2019re carrying most of the direction.';
          if (a.alignment === 'contradict' || a.alignment === 'notvery') s += ' And your values or visions pull in different directions.';
          s += ' That doesn\u2019t mean the relationship is wrong. It means the behavioral material doesn\u2019t yet support the question you\u2019re asking it \u2014 and the question may be about something deeper than signs can show.';
          return s;
        },
        dontTell: 'Identity-level hesitation \u2014 the sense that something fundamental doesn\u2019t fit \u2014 is real and worth taking seriously. It\u2019s also the kind of question that no framework or reading can settle. It\u2019s a question about who you are and what you need, and it belongs to you.',
        watchIntro: 'Sit with the real question:',
        watch: function () {
          return [
            'Whether the hesitation is about him specifically, or about the kind of relationship you\u2019re in \u2014 the two questions have different answers.',
            'If the hesitation is persistent and runs deeper than behavior, a licensed therapist or counselor is a more honest match than a spiritual reading. The question is about identity, not prediction.'
          ];
        }
      },
      'not-enough-evidence': {
        path: 'Not enough evidence yet',
        summary: 'Too early, or too close, to read \u2014 which is information too.',
        suggest: function () {
          return 'Several of your answers say \u201CI don\u2019t know\u201D \u2014 and for the \u201Cis he the one\u201D question, that\u2019s often the honest answer. The relationship hasn\u2019t been tested at the depth the question requires, or you\u2019re standing too close to see its shape. Right now, the question is asking more of the evidence than the evidence can give.';
        },
        dontTell: 'An unclear pattern isn\u2019t a negative one. It means the relationship hasn\u2019t yet produced the kind of behavioral history that \u201Cthe one\u201D question needs \u2014 across time, across contexts, across stress. That\u2019s a timing issue, not a verdict.',
        watchIntro: 'Give it a defined window:',
        watch: function () {
          return [
            'Several months of ordinary relationship life, watching whether consistency, effort, and alignment hold across different conditions.',
            'Then come back and retake this check. With more foundation to read, the result will be sharper \u2014 or the question will have answered itself.'
          ];
        }
      }
    },
    underneath: function (answers, pattern) {
      var a = answers;
      if ((a.status === 'exes' || a.status === 'separated') && (a.want === 'still' || a.trigger === 'distant')) {
        return { key: 'closure', label: 'What may be underneath: the closure question', text: 'When the question is about someone from before, \u201Cis he the one\u201D can quietly become a way of reopening what ended. If that lands, the more useful frame is what this chapter was and what it means now \u2014 not whether he was the one after all.' };
      }
      if (a.want === 'wait') {
        return { key: 'decision', label: 'What may be underneath: the decision question', text: '\u201CShould I commit or keep my options open\u201D isn\u2019t really a detection problem \u2014 it\u2019s a decision you\u2019re carrying. A reading can give you a richer view of each path, but the decision stays yours. Any reader who offers to make it for you is selling certainty nobody has.' };
      }
      if (a.trigger === 'unknown' && (pattern === 'strong-foundation' || pattern === 'genuine-open-questions')) {
        return { key: 'doubt', label: 'What may be underneath: the doubt question', text: 'Worth noticing: your answers describe a relationship with real foundation, and the doubt didn\u2019t come from his behavior \u2014 it came from not being able to settle the question inside yourself. When \u201Cis he the one\u201D keeps returning even while things are good, it\u2019s sometimes about anxiety rather than evidence.' };
      }
      if (a.want === 'beneath' || (a.want === 'justclarity' && a.help === 'deeper')) {
        return { key: 'identity', label: 'What may be underneath: the identity question', text: 'You said you want to understand what\u2019s really underneath your doubt \u2014 which suggests the answer isn\u2019t about him, it\u2019s about you. \u201CIs he the one\u201D is sometimes really asking \u201Cwho am I, and what do I need?\u201D That\u2019s an identity question, and identity questions have better tools than readings.' };
      }
      if (a.want === 'why' && (pattern === 'direction-uncertainty' || pattern === 'identity-hesitation')) {
        return { key: 'comparison', label: 'What may be underneath: the comparison question', text: 'You\u2019re asking why you keep questioning it \u2014 and sometimes the honest answer is that you\u2019re comparing this relationship to an ideal, or to other possibilities, rather than reading it on its own terms. Comparison is a real and useful human faculty; it\u2019s also one that can make a good relationship feel insufficient without offering a better one.' };
      }
      return null;
    },
    practice: window.lovePracticeSet('is-he-the-one'),
    matchPractice: window.loveMatchPractice,
    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'is-he-the-one', {
        emailTitle: 'Get foundation-pattern guidance by email',
        emailText: 'One weekly note for people navigating exactly this \u2014 a decision guide, a free tool, one honest recommendation. No spam, unsubscribe anytime.',
        negativePatternTip: {
          pattern: 'identity-hesitation',
          text: 'when the hesitation runs this deep, a reading about whether he\u2019s \u201Cthe one\u201D can quietly become a way of outsourcing a decision that belongs to you. If you book one, frame it on your own clarity \u2014 not on a verdict about him.'
        }
      });
    }
  },

  /* ============================================================
     5. DOES HE MISS ME
     Behavior across absence: four signals (initiation, recall,
     gap behavior, response quality). Five patterns:
     actively-reaching-back / connection-continuity /
     gap-dependent / suppressed-avoidant / not-enough-evidence.
     ============================================================ */
  'does-he-miss-me': {
    id: 'does-he-miss-me',
    title: 'Read His Absence Pattern',
    subtitle: 'Eight questions, about two minutes. A read of what behavior across distance may honestly suggest \u2014 and where it stops. No score, no verdict, no signup.',
    questions: [
      { id: 'status', q: 'What\u2019s your situation with him right now?', hint: 'This matters more than it sounds \u2014 absence means different things at different stages.', options: [
        { text: 'We\u2019re in a relationship', detail: 'together, but apart right now', score: 'together' },
        { text: 'We\u2019re dating, but it\u2019s not official', detail: 'seeing each other, now separated', score: 'dating' },
        { text: 'We\u2019re talking or getting to know each other', detail: 'early days, now a gap', score: 'talking' },
        { text: 'We\u2019re friends, but there might be more', detail: 'a line that keeps almost being crossed', score: 'friends' },
        { text: 'We\u2019re separated or taking space', detail: 'a pause of some kind', score: 'separated' },
        { text: 'We\u2019re exes', detail: 'it ended, and I wonder if he misses me', score: 'exes' },
        { text: 'It\u2019s complicated', detail: 'even this question is hard to answer', score: 'complicated' }
      ]},
      { id: 'trigger', q: 'What made you start wondering whether he misses you?', hint: '', options: [
        { text: 'He\u2019s become distant', detail: 'less present than he was', score: 'distant' },
        { text: 'His contact feels inconsistent', detail: 'warm, then not', score: 'inconsistent' },
        { text: 'He says he misses me, but I\u2019m not sure', detail: 'words without weight', score: 'words' },
        { text: 'We had a conflict and something shifted', detail: 'and the distance grew', score: 'conflict' },
        { text: 'Things feel stuck', detail: 'comfortable, but not moving', score: 'stalled' },
        { text: 'I don\u2019t know if the distance means something', detail: 'I can\u2019t get a clear read', score: 'unknown' },
        { text: 'Something about the gap feels different', detail: 'I can\u2019t name it', score: 'changed' },
        { text: 'No specific reason \u2014 I just want clarity', detail: 'the question itself', score: 'clarity' }
      ]},
      { id: 'communication', q: 'How would you describe his contact with you across the distance?', hint: '', options: [
        { text: 'Consistent and engaged', detail: 'he reaches across the gap', score: 'consistent' },
        { text: 'Frequent, but sometimes unpredictable', detail: 'a lot, in waves', score: 'frequent' },
        { text: 'Mostly when I reach out first', detail: 'he responds, rarely initiates', score: 'reactive' },
        { text: 'Hot and cold', detail: 'very close, then gone', score: 'hotcold' },
        { text: 'Mostly when he wants something', detail: 'contact follows his needs', score: 'convenient' },
        { text: 'He\u2019s become noticeably quieter', detail: 'the gap has widened', score: 'quieter' },
        { text: 'We barely communicate', detail: 'long silences between exchanges', score: 'barely' }
      ]},
      { id: 'effort', q: 'When it comes to bridging the distance, who usually takes the lead?', hint: '', options: [
        { text: 'Mostly him', detail: 'he reaches back across the gap', score: 'him' },
        { text: 'About equally', detail: 'it flows both ways', score: 'equal' },
        { text: 'Mostly me', detail: 'I hold most of the reaching', score: 'me' },
        { text: 'It changes back and forth', detail: 'no steady pattern', score: 'variable' },
        { text: 'We rarely bridge the gap', detail: 'the distance just sits', score: 'rarely' },
        { text: 'It\u2019s difficult to tell', detail: 'I genuinely can\u2019t say', score: 'hard' }
      ]},
      { id: 'space', q: 'What usually happens when the distance stretches longer than usual?', hint: 'How someone handles extended absence is one of the clearer tests of whether the distance is situational or meaningful.', options: [
        { text: 'He reaches back', detail: 'the longer gap prompts contact', score: 'notices' },
        { text: 'He stays connected through the gap', detail: 'present, patient', score: 'stays' },
        { text: 'Nothing really changes', detail: 'silence stays silence', score: 'nothing' },
        { text: 'He drifts further', detail: 'the gap widens', score: 'worse' },
        { text: 'He comes back only when I close the gap', detail: 'he returns, but on my call', score: 'returns' },
        { text: 'We haven\u2019t had enough distance to tell', detail: 'too early, or never tested', score: 'notell' }
      ]},
      { id: 'alignment', q: 'How closely does what he does across the distance match what he says about missing you?', hint: '', options: [
        { text: 'Very closely', detail: 'he backs it up with action', score: 'very' },
        { text: 'Usually, but not always', detail: 'solid, with lapses', score: 'usually' },
        { text: 'Sometimes', detail: 'it depends on the week', score: 'sometimes' },
        { text: 'Not very closely', detail: 'more talk than follow-through', score: 'notvery' },
        { text: 'They often contradict each other', detail: 'warm words, distant actions', score: 'contradict' },
        { text: 'I honestly don\u2019t know', detail: 'I can\u2019t track it', score: 'dontknow' }
      ]},
      { id: 'want', q: 'What do you most want to know?', hint: 'Be honest with this one \u2014 it decides what actually helps you next.', options: [
        { text: 'Does he miss me?', detail: 'the question on the surface', score: 'feelings' },
        { text: 'Why has he gone quiet?', detail: 'something shifted; I want to understand what', score: 'why' },
        { text: 'Is this distance temporary?', detail: 'direction, not just absence', score: 'going' },
        { text: 'Is he invested enough to reach back?', detail: 'I want to know where the floor is', score: 'commit' },
        { text: 'Does he still miss me?', detail: 'after all this time', score: 'still' },
        { text: 'Should I reach out, or wait?', detail: 'I\u2019m stuck between two moves', score: 'wait' },
        { text: 'What\u2019s really going on in the silence?', detail: 'I sense something I can\u2019t name', score: 'beneath' },
        { text: 'I just want clarity', detail: 'whatever clarity looks like', score: 'justclarity' }
      ]},
      { id: 'help', q: 'What would help you most right now?', hint: '', options: [
        { text: 'A clearer interpretation of his behavior', detail: 'reading the absence better', score: 'interpret' },
        { text: 'Insight into what he may be feeling', detail: 'his side of the distance', score: 'insight' },
        { text: 'Understanding where this is heading', detail: 'the trajectory', score: 'heading' },
        { text: 'Guidance on what I should do next', detail: 'a next step', score: 'guidance' },
        { text: 'A deeper reading of the connection', detail: 'the whole picture', score: 'deeper' },
        { text: 'I\u2019m not sure \u2014 I just want to understand', detail: 'help me find the question', score: 'unsure' }
      ]}
    ],
    resolve: window.loveResolve({ high: 'actively-reaching-back', midHigh: 'connection-continuity', mid: 'gap-dependent', low: 'suppressed-avoidant', uncertain: 'not-enough-evidence' }),
    results: {
      'actively-reaching-back': {
        path: 'Actively reaching back',
        summary: 'He bridges the distance unprompted, stays connected through the gap, and backs his words with action.',
        suggest: function (a) {
          var s = 'Across what you\u2019ve described, he reaches back toward you across the distance without needing a prompt.';
          if (a.communication === 'consistent') s += ' Contact stays steady across the gap rather than dropping off.';
          if (a.effort === 'him' || a.effort === 'equal') s += ' The reaching flows from both sides.';
          if (a.alignment === 'very' || a.alignment === 'usually') s += ' And what he does matches what he says about missing you.';
          s += ' That\u2019s the clearest behavioral signal that the distance hasn\u2019t diminished the connection \u2014 though it still can\u2019t prove what he privately feels, only that his behavior reaches back.';
          return s;
        },
        dontTell: 'Active reaching across distance shows the connection survives absence; it can\u2019t prove the subjective experience of missing. He can reach back from habit, attachment, or genuine longing \u2014 behavior can\u2019t distinguish between them. What it can show is that the distance hasn\u2019t broken the pattern.',
        watchIntro: 'Worth watching over the coming weeks:',
        watch: function () {
          return [
            'Whether the reaching holds across different kinds of distance \u2014 physical, emotional, situational \u2014 not just one type of gap.',
            'Whether the quality of the reaching carries warmth, or is purely maintenance. Missing someone and staying in touch are different things.'
          ];
        }
      },
      'connection-continuity': {
        path: 'Connection in continuity',
        summary: 'The connection survives the distance, even if the reaching is quieter.',
        suggest: function (a) {
          var s = 'Your answers describe a connection that holds across distance \u2014 not through dramatic reaching, but through steady continuity.';
          if (a.communication === 'frequent' || a.communication === 'reactive') s += ' Contact happens, though its rhythm may be uneven.';
          if (a.space === 'stays' || a.space === 'notices') s += ' And the gap doesn\u2019t break the thread.';
          s += ' That\u2019s a real signal: the distance hasn\u2019t dissolved the connection. It just hasn\u2019t produced the kind of active reaching that would confirm longing specifically \u2014 continuity and missing are related but different.';
          return s;
        },
        dontTell: 'Connection continuity shows the bond survives absence; it can\u2019t prove the felt experience of missing. Some people maintain connection out of habit or attachment without the emotional pull of longing. Continuity is reassuring, but it\u2019s not the same signal as actively reaching back.',
        watchIntro: 'Worth watching over the coming weeks:',
        watch: function () {
          return [
            'Whether the continuity comes with warmth and specific recall, or is purely procedural \u2014 routine check-ins versus genuine engagement.',
            'Whether the connection deepens across the distance or simply persists. Persistence and longing are different signals.'
          ];
        }
      },
      'gap-dependent': {
        path: 'Gap-dependent',
        summary: 'The connection lives mainly in prompted or scheduled contact across the distance.',
        suggest: function (a) {
          var s = 'Your answers describe a connection that depends on someone carrying it across the distance \u2014 and that someone appears to be mostly you.';
          if (a.communication === 'reactive') s += ' He responds more than he initiates.';
          if (a.space === 'nothing' || a.space === 'returns') s += ' And the gaps fill only when you fill them.';
          s += ' That doesn\u2019t mean he doesn\u2019t miss you. It means the behavioral evidence of his missing \u2014 unprompted reaching, bridging the gap, active engagement across distance \u2014 is thinner than the question needs.';
          return s;
        },
        dontTell: 'A gap-dependent pattern has many explanations: busyness, a different communication style, an avoidant attachment pattern, or simply a connection that hasn\u2019t deepened enough to produce reaching across distance. The pattern can\u2019t tell you which \u2014 and it can\u2019t access what he privately feels.',
        watchIntro: 'Try a simple observation window:',
        watch: function () {
          return [
            'For two or three weeks, note who bridges the gap unprompted \u2014 the distance is where the real signal lives, not the scheduled contact.',
            'A pattern that\u2019s still gap-dependent after a month of ordinary distance is the relationship\u2019s current shape, not a phase. Whether that shape works for you is a separate question.'
          ];
        }
      },
      'suppressed-avoidant': {
        path: 'Suppressed or avoidant',
        summary: 'The distance has widened, and the reaching has thinned or stopped.',
        suggest: function (a) {
          var s = 'Your answers show a pattern where the distance has grown and the behavioral evidence of reaching back has thinned.';
          if (a.communication === 'quieter' || a.communication === 'barely') s += ' Contact has dropped off.';
          if (a.space === 'worse' || a.space === 'nothing') s += ' And the gap is widening rather than closing.';
          if (a.effort === 'me') s += ' You\u2019re carrying the reaching, and it isn\u2019t being reciprocated.';
          s += ' That doesn\u2019t prove he doesn\u2019t miss you \u2014 avoidant attachment can suppress connection-seeking behavior even when the feeling is present. But the behavioral evidence is running thin, and that\u2019s worth being honest about.';
          return s;
        },
        dontTell: 'Suppressed behavior across distance has two very different possible causes: he doesn\u2019t miss you, or he does but suppresses the reaching (avoidant attachment, stress, self-protection). The pattern can\u2019t distinguish between them \u2014 only a direct conversation or more time can. What it can tell you is that the observable evidence is thin.',
        watchIntro: 'Over the next few weeks:',
        watch: function () {
          return [
            'Let one gap go that you\u2019d normally fill, and watch what happens to the distance. Not as a test; as information about whether the reaching returns on its own.',
            'If the suppression persists across different conditions and weeks, it\u2019s the relationship\u2019s current shape \u2014 not a weather pattern. A direct, kind conversation is more useful than another round of distance-reading.'
          ];
        }
      },
      'not-enough-evidence': {
        path: 'Not enough evidence yet',
        summary: 'Too early, or too close, to read \u2014 which is information too.',
        suggest: function () {
          return 'Several of your answers say \u201CI don\u2019t know\u201D \u2014 and for the \u201Cdoes he miss me\u201D question, that\u2019s often the honest answer. The distance hasn\u2019t been long enough, or the pattern hasn\u2019t been clear enough, to read what behavior across absence actually shows. Right now, the question is asking more of the evidence than the evidence can give.';
        },
        dontTell: 'An unclear pattern isn\u2019t a negative one. It means the distance hasn\u2019t yet produced the kind of behavioral record that would let you read it honestly. At this stage, hunting for one more \u201Csign\u201D tends to produce noise \u2014 every small gesture gets recruited as evidence.',
        watchIntro: 'Give it a defined window:',
        watch: function () {
          return [
            'Two or three weeks of ordinary distance, watching two things: who bridges the gap unprompted, and whether the connection holds or thins.',
            'Then come back and retake this check. With more pattern to read, the result will be sharper.'
          ];
        }
      }
    },
    underneath: function (answers, pattern) {
      var a = answers;
      if ((a.status === 'exes' || a.status === 'separated') && (a.want === 'still' || a.trigger === 'distant' || a.trigger === 'changed')) {
        return { key: 'closure', label: 'What may be underneath: the closure question', text: 'When something has ended, \u201Cdoes he miss me\u201D can quietly become a way of keeping the connection alive rather than a genuine question about his inner life. If that lands, the more useful frame is closure \u2014 what this was and what it means now \u2014 not whether the feeling has returned.' };
      }
      if (a.want === 'wait') {
        return { key: 'reach-out', label: 'What may be underneath: the reach-out question', text: '\u201CShould I reach out or wait\u201D isn\u2019t really about whether he misses you \u2014 it\u2019s a decision you\u2019re carrying. His pattern of response over time is more useful information than a reading about what he feels in the silence. The decision stays yours.' };
      }
      if (a.trigger === 'unknown' && (pattern === 'actively-reaching-back' || pattern === 'connection-continuity')) {
        return { key: 'anxiety', label: 'What may be underneath: the anxiety question', text: 'Worth noticing: your answers describe a connection that survives the distance, and the doubt didn\u2019t come from his behavior \u2014 it came from not being able to see inside the silence. When the question keeps returning even while the reaching is present, it\u2019s sometimes about anxiety rather than evidence.' };
      }
      if (a.want === 'beneath' || (a.want === 'justclarity' && a.help === 'deeper')) {
        return { key: 'preoccupation', label: 'What may be underneath: the preoccupation question', text: 'Sometimes the question inverts: you\u2019re asking about his missing because your own missing won\u2019t quiet down. That\u2019s a different question entirely \u2014 one about your own attachment and need. If the preoccupation is significant, a licensed therapist is the more honest match than a reading about him.' };
      }
      if (pattern === 'suppressed-avoidant' || pattern === 'gap-dependent') {
        return { key: 'distance', label: 'What may be underneath: the distance question', text: 'When the reaching has thinned this much, the real question may not be \u201Cdoes he miss me\u201D but \u201Cis this distance situational, or is it the relationship\u2019s new shape?\u201D That\u2019s a distance question, and it has a clearer honest answer than the mind-reading one.' };
      }
      return null;
    },
    practice: window.lovePracticeSet('does-he-miss-me'),
    matchPractice: window.loveMatchPractice,
    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'does-he-miss-me', {
        emailTitle: 'Get absence-pattern guidance by email',
        emailText: 'One weekly note for people navigating exactly this \u2014 a decision guide, a free tool, one honest recommendation. No spam, unsubscribe anytime.',
        negativePatternTip: {
          pattern: 'suppressed-avoidant',
          text: 'when the reaching has thinned this much, a reading about whether he misses you can quietly become a more expensive way of staying attached to someone who isn\u2019t reaching back. If you book one, frame it on your own situation \u2014 not on his feelings.'
        }
      });
    }
  },

  /* ============================================================
     6. IS HE SERIOUS ABOUT ME
     Intention vs. comfort: four signals (consistency, initiative,
     investment, alignment of words and actions). Five patterns:
     clear-intention / building-undefined / comfortable-holding /
     avoidant-uncertainty / not-enough-time.
     ============================================================ */
  'is-he-serious-about-me': {
    id: 'is-he-serious-about-me',
    title: 'Read His Intention Pattern',
    subtitle: 'Eight questions, about two minutes. A read of what the relationship\u2019s directional behavior may honestly suggest about intention \u2014 and where it can\u2019t answer. No score, no verdict, no signup.',
    questions: [
      { id: 'status', q: 'What\u2019s your relationship with him right now?', hint: 'This matters more than it sounds \u2014 \u201Cserious\u201D means different things at different stages.', options: [
        { text: 'We\u2019re in a relationship', detail: 'together, official', score: 'together' },
        { text: 'We\u2019re dating, but it\u2019s not official', detail: 'seeing each other regularly', score: 'dating' },
        { text: 'We\u2019re talking or getting to know each other', detail: 'early days', score: 'talking' },
        { text: 'We\u2019re friends, but there might be more', detail: 'a line that keeps almost being crossed', score: 'friends' },
        { text: 'We\u2019re separated or taking space', detail: 'a pause of some kind', score: 'separated' },
        { text: 'We\u2019re exes', detail: 'it ended at some point', score: 'exes' },
        { text: 'It\u2019s complicated', detail: 'even this question is hard to answer', score: 'complicated' }
      ]},
      { id: 'trigger', q: 'What made you start wondering whether he\u2019s serious about you?', hint: '', options: [
        { text: 'He\u2019s become more distant', detail: 'less invested than he was', score: 'distant' },
        { text: 'His commitment feels inconsistent', detail: 'warm, then not', score: 'inconsistent' },
        { text: 'He says he\u2019s serious, but I\u2019m not sure', detail: 'words without weight', score: 'words' },
        { text: 'We had a conflict that shifted something', detail: 'and now I\u2019m questioning', score: 'conflict' },
        { text: 'Things feel stuck', detail: 'comfortable, but not moving forward', score: 'stalled' },
        { text: 'I don\u2019t know if he\u2019s serious', detail: 'I can\u2019t get a clear read', score: 'unknown' },
        { text: 'Something about us feels different', detail: 'I can\u2019t name it', score: 'changed' },
        { text: 'No specific reason \u2014 I just want clarity', detail: 'the question itself', score: 'clarity' }
      ]},
      { id: 'communication', q: 'How would you describe the consistency of his engagement?', hint: '', options: [
        { text: 'Consistent and invested', detail: 'steady across weeks and moods', score: 'consistent' },
        { text: 'Strong, but with some waves', detail: 'mostly steady, occasionally uneven', score: 'frequent' },
        { text: 'Mostly when I push for depth', detail: 'he engages when I pull', score: 'reactive' },
        { text: 'Hot and cold', detail: 'very close, then distant', score: 'hotcold' },
        { text: 'Mostly when it\u2019s convenient', detail: 'engagement follows his mood', score: 'convenient' },
        { text: 'He\u2019s become noticeably thinner', detail: 'recently, without explanation', score: 'quieter' },
        { text: 'We barely connect deeply', detail: 'the surface is fine, the depth is missing', score: 'barely' }
      ]},
      { id: 'effort', q: 'When it comes to building something forward, who usually takes the lead?', hint: '', options: [
        { text: 'Mostly him', detail: 'he plans, initiates, pushes forward', score: 'him' },
        { text: 'About equally', detail: 'it flows both ways', score: 'equal' },
        { text: 'Mostly me', detail: 'I hold the direction', score: 'me' },
        { text: 'It changes back and forth', detail: 'no steady pattern', score: 'variable' },
        { text: 'We rarely talk about the future', detail: 'the relationship lives in the present', score: 'rarely' },
        { text: 'It\u2019s difficult to tell', detail: 'I genuinely can\u2019t say', score: 'hard' }
      ]},
      { id: 'space', q: 'What usually happens when you stop pushing things forward?', hint: 'Who carries the relationship\u2019s direction is one of the clearer tests of intention.', options: [
        { text: 'He steps up', detail: 'the forward motion doesn\u2019t break', score: 'notices' },
        { text: 'He holds the thread', detail: 'present, patient, engaged', score: 'stays' },
        { text: 'Nothing really changes', detail: 'the pause stays a pause', score: 'nothing' },
        { text: 'He drifts further', detail: 'space becomes distance', score: 'worse' },
        { text: 'He re-engages only when I do', detail: 'he follows, but on my lead', score: 'returns' },
        { text: 'We haven\u2019t tested it', detail: 'too early, or never tried', score: 'notell' }
      ]},
      { id: 'alignment', q: 'How closely do his actions match what he says about being serious?', hint: '', options: [
        { text: 'Very closely', detail: 'he does what he says', score: 'very' },
        { text: 'Usually, but not always', detail: 'solid, with lapses', score: 'usually' },
        { text: 'Sometimes', detail: 'it depends on the week', score: 'sometimes' },
        { text: 'Not very closely', detail: 'more talk than follow-through', score: 'notvery' },
        { text: 'They often contradict each other', detail: 'warm words, distant actions', score: 'contradict' },
        { text: 'I honestly don\u2019t know', detail: 'I can\u2019t track it', score: 'dontknow' }
      ]},
      { id: 'want', q: 'What do you most want to know?', hint: 'Be honest with this one \u2014 it decides what actually helps you next.', options: [
        { text: 'Is he serious about me?', detail: 'the question on the surface', score: 'feelings' },
        { text: 'Why isn\u2019t he taking things forward?', detail: 'something is holding him back', score: 'why' },
        { text: 'Is this going anywhere real?', detail: 'direction, not just comfort', score: 'going' },
        { text: 'Is he going to commit?', detail: 'I want to know where the floor is', score: 'commit' },
        { text: 'After all this time, is he still serious?', detail: 'after a shift', score: 'still' },
        { text: 'Should I wait, or move on?', detail: 'I\u2019m stuck between two futures', score: 'wait' },
        { text: 'What\u2019s really holding him back?', detail: 'I sense something I can\u2019t name', score: 'beneath' },
        { text: 'I just want clarity', detail: 'whatever clarity looks like', score: 'justclarity' }
      ]},
      { id: 'help', q: 'What would help you most right now?', hint: '', options: [
        { text: 'A clearer interpretation of his behavior', detail: 'reading the intention better', score: 'interpret' },
        { text: 'Insight into what he may be planning', detail: 'his side of it', score: 'insight' },
        { text: 'Understanding where this is heading', detail: 'the trajectory', score: 'heading' },
        { text: 'Guidance on what I should do next', detail: 'a next step', score: 'guidance' },
        { text: 'A deeper reading of the relationship', detail: 'the whole picture', score: 'deeper' },
        { text: 'I\u2019m not sure \u2014 I just want to understand', detail: 'help me find the question', score: 'unsure' }
      ]}
    ],
    resolve: window.loveResolve({ high: 'clear-intention', midHigh: 'building-undefined', mid: 'comfortable-holding', low: 'avoidant-uncertainty', uncertain: 'not-enough-time' }),
    results: {
      'clear-intention': {
        path: 'Clear intention',
        summary: 'Consistent engagement, mutual forward effort, and actions that match his words.',
        suggest: function (a) {
          var s = 'Across what you\u2019ve described, the behavioral evidence points toward genuine intention.';
          if (a.communication === 'consistent') s += ' His engagement is steady across weeks and moods, not just in good stretches.';
          if (a.effort === 'him' || a.effort === 'equal') s += ' He takes initiative in building things forward.';
          if (a.alignment === 'very' || a.alignment === 'usually') s += ' And his actions match what he says about being serious.';
          s += ' That\u2019s the strongest pattern observable behavior can show for the \u201Cis he serious\u201D question \u2014 though intention is ultimately a private matter, and only a direct conversation can fully confirm it.';
          return s;
        },
        dontTell: 'Clear behavioral intention shows the relationship is being built, not just maintained. It can\u2019t guarantee the outcome \u2014 someone can build with genuine intention and still hit a wall, or be serious and bad at showing it. The pattern narrows the uncertainty; it doesn\u2019t close it.',
        watchIntro: 'Worth watching over the coming months:',
        watch: function () {
          return [
            'Whether the intention holds during his own hard weeks \u2014 investment that survives inconvenience is the strongest signal there is.',
            'Whether the two of you can talk about the future directly \u2014 intention shows in behavior, but it confirms itself in conversation.'
          ];
        }
      },
      'building-undefined': {
        path: 'Building but undefined',
        summary: 'The relationship is growing, but the direction hasn\u2019t been named yet.',
        suggest: function (a) {
          var s = 'Your answers describe a relationship with real engagement \u2014 but the direction hasn\u2019t been clearly defined yet.';
          if (a.communication === 'frequent' || a.communication === 'reactive') s += ' There\u2019s contact and warmth, but it doesn\u2019t consistently build toward anything specific.';
          if (a.effort === 'variable' || a.effort === 'equal') s += ' And while effort exists, the forward motion isn\u2019t clearly being driven by both of you.';
          s += ' That\u2019s the normal state of a relationship that hasn\u2019t yet had the conversation about what it is and where it\u2019s going \u2014 which is often the actual source of the \u201Cis he serious\u201D question.';
          return s;
        },
        dontTell: 'Building but undefined is the most common state for a developing relationship. The \u201Cis he serious\u201D question asks the relationship to have a definition it hasn\u2019t yet been given \u2014 and that\u2019s a conversation question, not a signs-reading question.',
        watchIntro: 'The most useful next step:',
        watch: function () {
          return [
            'A direct, kind conversation about where the relationship is heading \u2014 not a quiz of his feelings, but an honest exchange about direction. That produces more information than another month of pattern-reading.',
            'Whether the building continues with or without the definition. A relationship that grows but won\u2019t define itself is sometimes comfortable without being serious \u2014 and that distinction matters.'
          ];
        }
      },
      'comfortable-holding': {
        path: 'Comfortable holding pattern',
        summary: 'The connection is comfortable, but it isn\u2019t moving forward.',
        suggest: function (a) {
          var s = 'Your answers describe a relationship that has settled into a comfortable holding pattern \u2014 warmth and contact without forward motion.';
          if (a.communication === 'frequent' || a.communication === 'reactive') s += ' There\u2019s engagement, but it doesn\u2019t build.';
          if (a.effort === 'rarely' || a.space === 'nothing') s += ' And the future isn\u2019t being addressed.';
          s += ' That\u2019s the gap the \u201Cis he serious\u201D question lives in: the relationship is comfortable enough to continue, but not directional enough to answer. Comfort and intention are different things.';
          return s;
        },
        dontTell: 'A comfortable holding pattern can last for years. It doesn\u2019t prove he\u2019s not serious \u2014 some people are content and serious simultaneously. But it does mean the behavioral evidence of intention \u2014 forward motion, definition, investment in building \u2014 is absent, and that\u2019s worth being honest about.',
        watchIntro: 'The honest test:',
        watch: function () {
          return [
            'Raise the future directly \u2014 not as an ultimatum, but as a question. \u201CWhere do you see this going?\u201D gives you more information than another month of reading his comfort level.',
            'If the answer is vague, deflective, or commits to nothing specific, that\u2019s information too. Comfort without direction is a real relationship shape, and it\u2019s one worth naming before it costs you more time.'
          ];
        }
      },
      'avoidant-uncertainty': {
        path: 'Avoidant uncertainty',
        summary: 'The engagement thins when things deepen, and the direction stays unclear.',
        suggest: function (a) {
          var s = 'Your answers show a pattern where engagement thins when the relationship asks for more \u2014 consistency drops, effort becomes one-sided, or his words and actions pull apart.';
          if (a.communication === 'hotcold' || a.communication === 'quieter') s += ' The engagement runs in waves or has thinned.';
          if (a.effort === 'me') s += ' You\u2019re carrying the direction.';
          if (a.alignment === 'contradict' || a.alignment === 'notvery') s += ' And what he says about being serious doesn\u2019t match what he does.';
          s += ' That pattern is real information. It doesn\u2019t prove he\u2019s not serious \u2014 avoidant patterns can suppress forward motion even when the feeling is genuine. But the behavioral evidence of intention is running thin, and the question deserves an honest answer.';
          return s;
        },
        dontTell: 'Avoidant uncertainty has two different possible causes: he\u2019s not as serious as you need, or he is but suppresses the forward motion (avoidant attachment, fear, timing). The pattern can\u2019t distinguish between them \u2014 only a direct conversation or more time can. What it can tell you is that the observable evidence isn\u2019t matching the question.',
        watchIntro: 'Over the next few weeks:',
        watch: function () {
          return [
            'Name the pattern directly \u2014 kindly, but clearly. \u201CI notice that when things get closer, the engagement thins. Can we talk about that?\u201D His response to a direct, non-accusatory observation is more informative than another month of watching.',
            'If the avoidant pattern persists across different conditions and conversations, it may be the relationship\u2019s shape rather than a phase. Whether that shape works for you is the real question.'
          ];
        }
      },
      'not-enough-time': {
        path: 'Not enough time yet to know',
        summary: 'Too early to read intention \u2014 which is information too.',
        suggest: function () {
          return 'Several of your answers say \u201CI don\u2019t know\u201D \u2014 and for the \u201Cis he serious\u201D question, that\u2019s often the honest answer. Intention reveals itself across time and across different conditions, and the relationship hasn\u2019t yet produced enough behavioral history to read. The question is asking more of the evidence than the evidence can give.';
        },
        dontTell: 'An unclear pattern isn\u2019t a negative one. It means the relationship hasn\u2019t yet been tested at the depth the \u201Cis he serious\u201D question requires \u2014 across stress, across time, across the conversations that reveal direction. That\u2019s a timing issue, not a verdict.',
        watchIntro: 'Give it a defined window:',
        watch: function () {
          return [
            'Two or three months of ordinary relationship life, watching whether consistency, initiative, and alignment hold across different conditions.',
            'Then come back and retake this check. With more behavioral history, the result will be sharper \u2014 or the conversation about direction will have happened naturally.'
          ];
        }
      }
    },
    underneath: function (answers, pattern) {
      var a = answers;
      if ((a.status === 'exes' || a.status === 'separated') && (a.want === 'still' || a.trigger === 'distant')) {
        return { key: 'closure', label: 'What may be underneath: the closure question', text: 'When something has ended, \u201Cis he serious about me\u201D can quietly become a way of reopening what ended. If that lands, the more useful frame is what this was and what it means now \u2014 not whether the seriousness has returned.' };
      }
      if (a.want === 'wait') {
        return { key: 'commit', label: 'What may be underneath: the commitment question', text: '\u201CShould I wait or move on\u201D is really a commitment question \u2014 not about reading his intention, but about deciding your own. A reading can give you a richer view of each path, but the decision stays yours. Any reader who offers to make it for you is selling certainty nobody has.' };
      }
      if (a.trigger === 'unknown' && (pattern === 'clear-intention' || pattern === 'building-undefined')) {
        return { key: 'self-worth', label: 'What may be underneath: the self-worth question', text: 'Worth noticing: your answers describe a relationship with real engagement, and the doubt didn\u2019t come from his behavior \u2014 it came from not being sure you deserve it. When \u201Cis he serious\u201D keeps returning even while things are building, it\u2019s sometimes about your own sense of worth rather than his intention.' };
      }
      if (a.want === 'beneath' || (a.want === 'justclarity' && a.help === 'deeper')) {
        return { key: 'comfort-vs-intention', label: 'What may be underneath: the comfort vs. intention question', text: 'You said you want to understand what\u2019s really holding him back \u2014 which suggests the question is about the gap between comfort and intention. He may be comfortable without being serious, or serious without being able to show it. That distinction matters, and it\u2019s one behavior alone can\u2019t always settle.' };
      }
      if (a.want === 'why' && (pattern === 'comfortable-holding' || pattern === 'avoidant-uncertainty')) {
        return { key: 'timeline', label: 'What may be underneath: the timeline question', text: 'You\u2019re asking why he isn\u2019t taking things forward \u2014 and sometimes the honest answer is that his timeline is different from yours, or that he\u2019s content with the current shape and doesn\u2019t feel urgency to change it. That\u2019s a timeline question, and it has a clearer honest answer than the mind-reading one: ask him directly.' };
      }
      return null;
    },
    practice: window.lovePracticeSet('is-he-serious-about-me'),
    matchPractice: window.loveMatchPractice,
    customResult: function (ctx) {
      window.mysticdoPatternResult(ctx, 'is-he-serious-about-me', {
        emailTitle: 'Get intention-pattern guidance by email',
        emailText: 'One weekly note for people navigating exactly this \u2014 a decision guide, a free tool, one honest recommendation. No spam, unsubscribe anytime.',
        negativePatternTip: {
          pattern: 'avoidant-uncertainty',
          text: 'when the engagement thins this much under depth, a reading about whether he\u2019s \u201Cserious\u201D can quietly become a more expensive way of staying in a relationship that isn\u2019t building. If you book one, frame it on your own direction \u2014 not on his intention.'
        }
      });
    }
  }
};
