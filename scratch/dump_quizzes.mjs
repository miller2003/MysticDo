import fs from 'fs';

// Mock browser globals
globalThis.window = {
  gtag: () => {},
  MYSTICDO_QUIZZES: {},
  MYSTICDO_OFFERS: {},
  location: { pathname: '' }
};
globalThis.document = {
  getElementById: () => null,
  querySelector: () => null
};

// Evaluate quizzes.js
const code = fs.readFileSync('assets/js/quizzes.js', 'utf-8');
eval(code);

const quizzes = window.MYSTICDO_QUIZZES;
const output = {};

for (const [slug, qz] of Object.entries(quizzes)) {
  const questions = (qz.questions || []).map(q => ({
    id: q.id,
    q: q.q,
    hint: q.hint
  }));
  const patterns = qz.results ? Object.keys(qz.results) : [];
  const patternDetails = qz.results ? Object.entries(qz.results).map(([k, v]) => ({
    key: k,
    path: v.path,
    summary: v.summary,
    dontTell: v.dontTell
  })) : [];
  
  output[slug] = {
    id: qz.id,
    title: qz.title,
    subtitle: qz.subtitle,
    launchSub: qz.launchSub,
    questionsCount: questions.length,
    questions,
    patterns,
    patternDetails
  };
}

fs.writeFileSync('scratch/quiz_meta.json', JSON.stringify(output, null, 2));
console.log(`Successfully dumped ${Object.keys(output).length} quizzes to scratch/quiz_meta.json`);
