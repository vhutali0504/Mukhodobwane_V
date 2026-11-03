import { describe, it, expect } from 'vitest';
import {
  createQuiz,
  answerQuiz,
  nextQuestion,
  isQuizOver,
  quizRank,
} from '../../../client/src/room/terminal/quiz.js';
import { TRIVIA } from '../../../client/src/content/trivia.js';
import { mulberry32 } from './helpers.js';

const fresh = () => createQuiz(TRIVIA, mulberry32(42));

describe('quiz', () => {
  it('picks 5 unique questions', () => {
    const q = fresh();
    expect(q.qs).toHaveLength(5);
    expect(new Set(q.qs.map((x) => x.q)).size).toBe(5);
  });
  it('scores a correct answer once', () => {
    const q = fresh();
    const a = answerQuiz(q, q.qs[0].a);
    expect(a.score).toBe(1);
    expect(answerQuiz(a, q.qs[0].a)).toBe(a);
    expect(q.score).toBe(0);
  });
  it('does not score a wrong answer', () => {
    const q = fresh();
    expect(answerQuiz(q, (q.qs[0].a + 1) % 3).score).toBe(0);
  });
  it('ignores next before answering', () => {
    const q = fresh();
    expect(nextQuestion(q)).toBe(q);
  });
  it('is over after 5 rounds', () => {
    let q = fresh();
    for (let r = 0; r < 5; r++) {
      expect(isQuizOver(q)).toBe(false);
      q = nextQuestion(answerQuiz(q, q.qs[q.i].a));
    }
    expect(isQuizOver(q)).toBe(true);
    expect(q.score).toBe(5);
  });
  it('ranks scores', () => {
    expect(quizRank(0)).toBe('you might be a bot.');
    expect(quizRank(5)).toBe('root access granted. flawless.');
  });
});
