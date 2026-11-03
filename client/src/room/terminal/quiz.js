// Pure trivia quiz helpers. Every function returns a new Quiz.

export const RANKS = [
  'you might be a bot.',
  'script kiddie.',
  'junior analyst.',
  'solid. you could work here.',
  'senior engineer energy.',
  'root access granted. flawless.',
];

export function shuffled(list, rng) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createQuiz(pool, rng, n = 5) {
  return { qs: shuffled(pool, rng).slice(0, n), i: 0, score: 0, picked: null };
}

export function isQuizOver(q) {
  return q.i >= q.qs.length;
}

export function answerQuiz(q, k) {
  if (q.picked !== null || isQuizOver(q)) return q;
  return { ...q, picked: k, score: q.score + (k === q.qs[q.i].a ? 1 : 0) };
}

export function nextQuestion(q) {
  if (q.picked === null || isQuizOver(q)) return q;
  return { ...q, i: q.i + 1, picked: null };
}

export function quizRank(score) {
  return RANKS[Math.max(0, Math.min(RANKS.length - 1, score))];
}
