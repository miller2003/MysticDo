/**
 * MysticDo — content search and reading-type recommendation.
 *
 * Backs the MCP tools (`search_mysticdo`, `list_mysticdo_topics`,
 * `recommend_reading_type`) and the browser-side WebMCP tools, so both surfaces
 * return the same answers.
 *
 * The corpus is the prebuilt index at /assets/data/content-index.json
 * (scripts/build-content-index.py). It is fetched through the asset binding and
 * memoised per isolate — the corpus changes on the order of days, so one fetch
 * per Worker instance is the right trade-off.
 */

import { CONTENT_INDEX_PATH } from './agent-discovery.js';

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'can', 'do', 'does',
  'for', 'from', 'get', 'had', 'has', 'have', 'how', 'i', 'if', 'in', 'is', 'it',
  'its', 'me', 'my', 'of', 'on', 'or', 'should', 'so', 'that', 'the', 'their',
  'them', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'we', 'what',
  'when', 'where', 'which', 'who', 'why', 'will', 'with', 'you', 'your',
]);

const KIND_LABELS = {
  guide: 'Decision guide',
  comparison: 'Comparison',
  practice: 'Practice hub',
  question: 'Intent hub',
  quiz: 'Quiz',
  tool: 'Free tool',
  page: 'Page',
};

function tokenize(value) {
  const matches = String(value || '').toLowerCase().match(/[a-z0-9']+/g);
  return matches || [];
}

function contentTokens(value) {
  return tokenize(value).filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function countOccurrences(haystack, needle) {
  if (!haystack || !needle) return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1 && count < 6) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

/* ═══════════════════════════════ index loading ═══════════════════════════════ */

let indexPromise = null;

export function loadIndex(env, requestUrl) {
  if (!indexPromise) {
    const target = new URL(CONTENT_INDEX_PATH, requestUrl).toString();
    indexPromise = env.ASSETS.fetch(target)
      .then((res) => (res.ok ? res.json() : null))
      .then((doc) => (doc && Array.isArray(doc.pages) ? doc : null))
      .catch(() => null);
  }
  return indexPromise;
}

/** Test seam: lets the local harness inject a corpus instead of using ASSETS. */
export function __setIndex(doc) {
  indexPromise = Promise.resolve(doc);
}

/* ═══════════════════════════════ search ═══════════════════════════════ */

export function searchPages(doc, query, options = {}) {
  if (!doc) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 8, 1), 25);
  const kind = options.kind || null;

  const terms = contentTokens(query);
  const phrase = String(query || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!terms.length && !phrase) return [];

  const scored = [];

  for (const page of doc.pages) {
    if (kind && page.kind !== kind) continue;

    const title = (page.title || '').toLowerCase();
    const h1 = (page.h1 || '').toLowerCase();
    const description = (page.description || '').toLowerCase();
    const headings = (page.headings || []).join(' ').toLowerCase();
    const faqs = (page.faqQuestions || []).join(' ').toLowerCase();
    const text = (page.text || '').toLowerCase();

    let score = 0;
    let matched = 0;

    for (const term of new Set(terms)) {
      let hit = 0;
      hit += countOccurrences(title, term) * 6;
      hit += countOccurrences(h1, term) * 5;
      hit += countOccurrences(description, term) * 4;
      hit += countOccurrences(headings, term) * 3;
      hit += countOccurrences(faqs, term) * 3;
      hit += countOccurrences(text, term) * 1;
      if (hit > 0) matched += 1;
      score += hit;
    }

    if (score === 0) continue;

    // Reward covering more of the query, so "tarot cost" beats "tarot".
    const uniqueTerms = new Set(terms).size || 1;
    score *= 0.4 + 0.6 * (matched / uniqueTerms);

    if (phrase.length > 6) {
      if (title.includes(phrase) || h1.includes(phrase)) score += 25;
      else if (description.includes(phrase)) score += 12;
      else if (text.includes(phrase)) score += 6;
    }

    scored.push({ page, score: Math.round(score * 10) / 10, matched });
  }

  scored.sort((a, b) => b.score - a.score || a.page.url.localeCompare(b.page.url));

  return scored.slice(0, limit).map(({ page, score }) => ({
    url: page.url,
    title: page.title,
    kind: page.kind,
    kindLabel: KIND_LABELS[page.kind] || page.kind,
    description: page.description,
    excerpt: buildExcerpt(page, terms, phrase),
    score,
  }));
}

function buildExcerpt(page, terms, phrase) {
  const text = page.text || '';
  if (!text) return '';

  const lower = text.toLowerCase();
  let at = phrase.length > 6 ? lower.indexOf(phrase) : -1;
  if (at === -1) {
    for (const term of terms) {
      at = lower.indexOf(term);
      if (at !== -1) break;
    }
  }
  // The index already front-loads the page's own direct answer; when no term
  // matches inside the excerpt window, starting at 0 surfaces that answer.
  const start = at > 120 ? at - 120 : 0;
  const slice = text.slice(start, start + 420).trim();
  return (start > 0 ? '…' : '') + slice + (text.length > start + 420 ? '…' : '');
}

/* ═══════════════════════════════ topics ═══════════════════════════════ */

export function listTopics(doc, options = {}) {
  if (!doc) return { sections: [] };
  const kind = options.kind || null;

  const buckets = new Map();
  for (const page of doc.pages) {
    if (kind && page.kind !== kind) continue;
    const group = page.kind === 'page'
      ? 'Site pages'
      : (KIND_LABELS[page.kind] || page.kind) + 's';
    if (!buckets.has(group)) buckets.set(group, []);
    buckets.get(group).push({ url: page.url, title: page.title, description: page.description });
  }

  const sections = [...buckets.entries()].map(([name, items]) => ({
    section: name,
    count: items.length,
    items,
  }));
  sections.sort((a, b) => b.count - a.count || a.section.localeCompare(b.section));

  return { site: doc.site, pageCount: doc.pageCount, sections };
}

/* ═══════════════════════ reading-type recommendation ═══════════════════════ */

/**
 * Rules are ordered: the first rule whose pattern matches wins. Order encodes
 * priority — grief outranks everything (it is the highest-vulnerability
 * category), and the "no tool answers timing" caution outranks a naive
 * astrology suggestion.
 */
const RULES = [
  {
    id: 'grief',
    practice: 'Medium',
    pattern: /\b(died|die|death|passed away|passed on|deceased|grief|grieving|funeral|bereave|widow|widower|afterlife|medium|mediumship|sign from|spirit of|my (mom|dad|mother|father|grandma|grandpa|brother|sister|husband|wife|son|daughter|friend) (passed|died))\b/i,
    discriminator: 'The question is about someone who has died, which is the one thing only mediumship addresses.',
    runnerUp: {
      practice: 'Psychic',
      when: 'if the question turns out to be about your own situation or the living rather than about contact with the person who died.',
    },
    cost: '$75–$300 per session (30–60 minutes).',
    caution:
      'Grief is where this industry\'s worst actors operate. Vet harder: any claim that your loved one needs you to keep paying is exploitation, and it is the clearest walk-away signal there is.',
    next: '/guides/medium-reading-guide',
  },
  {
    id: 'timing',
    practice: 'Astrology',
    pattern: /\b(when will|when am i|how long until|how many months|how many years|what year|timing|right time|retrograde|transit|cycle|saturn return|life path|long term|long arc)\b/i,
    discriminator: 'The question is about timing or a life arc, and astrology is the only one of the four practices even attempting a timing answer.',
    runnerUp: {
      practice: 'Tarot',
      when: 'if you decide the real question is what is happening in the situation now, rather than when it changes.',
    },
    cost: 'Automated report $20–$50; recorded reading $50–$150; live session $100–$300.',
    caution:
      'No tool reliably answers timing questions, astrology included. Treat a timing answer as a frame for reflection, not a schedule.',
    next: '/astrology/',
  },
  {
    id: 'career-money',
    practice: 'Tarot',
    pattern: /\b(job|career|promotion|offer|interview|boss|work|business|salary|money|financ|wealth|invest|raise|quit my)\b/i,
    discriminator: 'Career and money questions are usually decisions between options, which is what tarot\'s structured spread is built for.',
    runnerUp: {
      practice: 'Psychic',
      when: 'if you specifically want an outside read on another person involved — a manager, a business partner, a hiring committee.',
    },
    cost: 'Platform $1–$8/min ($15–$45 for a focused session); independent $30–$150 per session.',
    caution:
      'For a real financial or legal decision, no reading substitutes for a qualified professional.',
    next: '/questions/career-work/',
  },
  {
    id: 'compatibility',
    practice: 'Astrology',
    pattern: /\b(compatib|synastry|are we (a )?(good )?match|his chart|her chart|our charts|two charts|birth chart|natal)\b/i,
    discriminator: 'Compatibility across two people is a chart-to-chart comparison, which is astrology\'s native output.',
    runnerUp: {
      practice: 'Tarot',
      when: 'if you care less about the long-term wiring and more about the current dynamic between you.',
    },
    cost: 'Live session $100–$300; synastry is usually priced in the same band.',
    caution:
      'A full chart needs your exact birth time. Without it there are no houses and no Ascendant, and much of the specific value is lost — confirm the time before you pay.',
    next: '/guides/birth-chart-reading-cost',
  },
  {
    id: 'person-read',
    practice: 'Psychic',
    // Tolerant of interleaved adverbs ("what does he *actually* think") — the
    // literal phrasing people use is never the canonical one.
    pattern: /\b(?:what (?:does|is|did) (?:he|she|they)[^.?!]{0,40}(?:think|feel|want|thinking|feeling)|is (?:he|she|they)[^.?!]{0,30}(?:cheating|lying|interested|serious|faithful)|will (?:he|she|they)[^.?!]{0,30}(?:contact|reach out|come back|call|text|reply|return)|does (?:he|she|they)[^.?!]{0,30}(?:love|miss|care)|my ex\b|the other person|going on with (?:him|her|them))/i,
    discriminator: 'The question is a direct read on another person or a live situation, which is what psychic work addresses.',
    runnerUp: {
      practice: 'Tarot',
      when: 'if you would rather understand the dynamic between you than get a read on the other person.',
    },
    cost: 'Platform $1–$15/min ($20–$60 for 15–20 focused minutes); independent $60–$300 per session.',
    caution:
      'Someone else\'s feelings are not a fixed, readable quantity. Treat the answer as a perspective, not a fact — and set a time limit before you connect, because drift is what actually inflates the bill.',
    next: '/psychic/',
  },
  {
    id: 'pattern',
    practice: 'Tarot',
    pattern: /\b(pattern|why do i keep|keep (doing|ending up|attracting)|dynamic|repeating|myself|blind spot|not seeing|mirror|reflect)\b/i,
    discriminator: 'The question is about a pattern or blind spot rather than a person or a date, which is what a structured spread surfaces.',
    runnerUp: {
      practice: 'Psychic',
      when: 'if the pattern only makes sense when read through a specific other person\'s behaviour.',
    },
    cost: 'Platform $1–$8/min ($15–$45); independent $30–$150 per session.',
    caution: 'A bigger spread is not a better reading. One sharp question on three cards beats a large spread on a vague one.',
    next: '/tarot/',
  },
  {
    id: 'decision',
    practice: 'Tarot',
    pattern: /\b(should i|decision|two options|which path|choose between|stuck|fork in the road|take the|leaving|stay or go)\b/i,
    discriminator: 'A choice between options maps onto a spread\'s positions — past, present, obstacle, option — more directly than onto a single intuitive read.',
    runnerUp: {
      practice: 'Astrology',
      when: 'if the decision is really about timing — whether to act now or wait for a different cycle.',
    },
    cost: 'Platform $1–$8/min ($15–$45); independent $30–$150 per session.',
    caution: 'Decide the question and the time budget before you connect.',
    next: '/tarot/',
  },
  {
    id: 'grief-adjacent-loss',
    practice: 'Medium',
    pattern: /\b(loss|lost (him|her|them)|closure|let go|goodbye|ended|breakup|passed)\b/i,
    discriminator: 'Loss and closure questions sit closest to mediumship — but only where the person has died. A breakup is not a medium question.',
    runnerUp: {
      practice: 'Tarot',
      when: 'the loss is a relationship ending rather than a death — tarot is the better tool for processing an ending.',
    },
    cost: 'Medium sessions $75–$300. For a breakup, tarot or psychic pricing applies instead.',
    caution: 'For a bereavement, vet the reader harder than you would in any other category.',
    next: '/questions/loss-closure/',
  },
];

export function recommendReadingType(doc, situation, options = {}) {
  const text = String(situation || '').trim();
  const rule = RULES.find((r) => r.pattern.test(text)) || null;

  const results = text
    ? searchPages(doc, text, { limit: Math.min(Number(options.limit) || 4, 6) })
    : [];

  if (!rule) {
    return {
      situation: text,
      confidence: 'low',
      practice: null,
      discriminator:
        'The situation does not map cleanly to one practice. The right first step is the guided matcher, which asks seven questions and returns a practice without requiring a signup.',
      runnerUp: null,
      cost: null,
      caution:
        'Recommend a free step first. Reading costs are only worth spending once the practice is settled.',
      next: '/do-what-fits',
      supportingPages: results,
    };
  }

  return {
    situation: text,
    confidence: results.length ? 'high' : 'medium',
    practice: rule.practice,
    discriminator: rule.discriminator,
    runnerUp: rule.runnerUp,
    cost: rule.cost,
    caution: rule.caution,
    next: rule.next,
    nextUrl: rule.next,
    supportingPages: results,
  };
}

/* ═══════════════════════════════ formatting ═══════════════════════════════ */

export function formatSearchResults(query, results) {
  if (!results.length) {
    return 'No MysticDo page matched "' + query + '". Try a broader term, or call ' +
      'list_mysticdo_topics to browse the catalogue.';
  }
  const lines = ['MysticDo results for "' + query + '":', ''];
  results.forEach((r, i) => {
    lines.push((i + 1) + '. ' + r.title);
    lines.push('   ' + r.kindLabel + ' — https://mysticdo.com' + r.url);
    if (r.description) lines.push('   ' + r.description);
    if (r.excerpt) lines.push('   … ' + r.excerpt);
    lines.push('');
  });
  return lines.join('\n').trim();
}

export function formatRecommendation(rec) {
  const lines = [];
  lines.push(rec.practice ? 'Recommended practice: ' + rec.practice : 'No single practice fits cleanly.');
  lines.push('Confidence: ' + rec.confidence);
  lines.push('');
  lines.push('Why: ' + rec.discriminator);
  if (rec.runnerUp) {
    lines.push('');
    lines.push(rec.runnerUp.practice + ' would win ' + rec.runnerUp.when);
  }
  if (rec.cost) {
    lines.push('');
    lines.push('Expected cost: ' + rec.cost);
  }
  if (rec.caution) {
    lines.push('');
    lines.push('Caution: ' + rec.caution);
  }
  lines.push('');
  lines.push('Next step: https://mysticdo.com' + rec.next);
  if (rec.supportingPages && rec.supportingPages.length) {
    lines.push('');
    lines.push('Supporting pages:');
    for (const p of rec.supportingPages) {
      lines.push('- ' + p.title + ' — https://mysticdo.com' + p.url);
    }
  }
  return lines.join('\n');
}

export { KIND_LABELS };
