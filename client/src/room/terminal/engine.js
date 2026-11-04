import { profile as defaultProfile } from '../../content/profile.js';
import { FACTS as defaultFacts } from '../../content/facts.js';
import { TRIVIA as defaultTrivia } from '../../content/trivia.js';
import { VAULT_WORDS as defaultWords } from '../../content/vaultWords.js';
import {
  BOOT_LINES,
  BOOT_LINE_MS,
  SCAN_MS,
  GRANT_HOLD_MS,
  MAX_INPUT,
  MENU,
  SCROLL_PAGE,
} from './constants.js';
import { parseCommand } from './commands.js';
import { createQuiz, answerQuiz, nextQuestion, isQuizOver } from './quiz.js';
import { createVault, guessVault } from './vault.js';

// Pure state machine. Time only arrives through `now` in actions; randomness
// only through ctx.rng. step() never mutates its input: every path returns
// new objects.

export function createTerminal({ rng = Math.random, now = 0 } = {}) {
  return {
    mode: 'idle',
    bootAt: now,
    scanAt: -1,
    grantAt: -1,
    sel: 0,
    sec: 0,
    msg: null,
    quiz: null,
    game: null,
    input: '',
    factIdx: Math.floor(rng() * 1000),
    booted: false,
    scroll: 0,
    scrollMax: 0,
  };
}

export function visibleBootLines(t, now) {
  if (t.mode === 'idle') return 0;
  const n = Math.floor((now - t.bootAt) / BOOT_LINE_MS) + 1;
  return Math.max(0, Math.min(BOOT_LINES.length, n));
}

const defaultCtx = () => ({
  profile: defaultProfile,
  FACTS: defaultFacts,
  TRIVIA: defaultTrivia,
  VAULT_WORDS: defaultWords,
  rng: Math.random,
});

const SEATED_MODES = ['menu', 'section', 'msg', 'quiz', 'game'];
const wrapIndex = (i, n) => (i + n) % n;

// Every handler returns { t, effects }.
const out = (t, ...effects) => ({ t, effects });

function toMenu(t) {
  return out({ ...t, mode: 'menu', msg: null, input: '' }, 'glitch');
}

function showMsg(t, cmd, lines, fact = false) {
  const msg = fact ? { cmd, lines, fact: true } : { cmd, lines };
  return out({ ...t, mode: 'msg', msg, input: '' }, 'glitch');
}

function showFact(t, c) {
  const fact = c.FACTS[t.factIdx % c.FACTS.length];
  return showMsg(
    { ...t, factIdx: t.factIdx + 1 },
    'fun_fact --random',
    [fact, '', '[enter] another fact'],
    true,
  );
}

function startQuiz(t, c) {
  const quiz = createQuiz(c.TRIVIA, c.rng);
  return out({ ...t, mode: 'quiz', quiz, input: '', msg: null }, 'glitch');
}

function startGame(t, c) {
  const game = createVault(c.VAULT_WORDS, c.rng);
  return out({ ...t, mode: 'game', game, input: '', msg: null }, 'glitch');
}

function guess(t, c, word) {
  if (!t.game || t.game.done) return out(t);
  const pickFact = () => c.FACTS[Math.floor(c.rng() * c.FACTS.length)];
  return out({ ...t, game: guessVault(t.game, word, pickFact) });
}

function openSection(t, c, index) {
  if (!Number.isInteger(index) || index < 0 || index >= MENU.length) return out(t);
  const next = { ...t, sel: index, input: '' };
  if (index === 6) return showFact(next, c);
  if (index === 7) return startQuiz(next, c);
  if (index === 8) return startGame(next, c);
  return out({ ...next, mode: 'section', sec: index, msg: null }, 'glitch');
}

const notFound = (t, text) =>
  showMsg(t, text, [`command not found: ${text}`, '', 'type "help" to see what works.']);

function runCommand(t, c, raw) {
  const text = String(raw).trim();
  const cleared = { ...t, input: '' };
  if (!text) return out(cleared);

  // In the vault game a typed candidate wins over any command alias.
  if (t.mode === 'game' && t.game && /^[a-z]{5}$/i.test(text)) {
    const w = text.toUpperCase();
    if (t.game.words.includes(w)) return guess(cleared, c, w);
  }

  const cmd = parseCommand(text);
  switch (cmd.kind) {
    case 'help':
      return showMsg(cleared, 'help', [
        'ls / menu ....... list sections',
        'cat <section> ... open a section, e.g. cat skills',
        '1-9 ............. open by number',
        'hack ............ play crack_the_vault',
        'quiz ............ 5 random trivia questions',
        'funfact ......... random fun fact',
        'whoami .......... who are you?',
        'clear ........... back to the menu',
        'exit ............ stand up from the desk',
      ]);
    case 'menu':
      return toMenu(cleared);
    case 'whoami': {
      const handle = c.profile.links.tryhackme.split('/').filter(Boolean).pop();
      return showMsg(cleared, 'whoami', [
        'visitor',
        '',
        "you are sitting at Vhutali's desk. be nice to the keyboard.",
        '',
        `tryhackme handle: ${handle}`,
      ]);
    }
    case 'exit':
      return out(cleared, 'standUp');
    case 'sudo':
      return showMsg(cleared, text.toLowerCase(), [
        '[sudo] password for visitor: ********',
        'visitor is not in the sudoers file.',
        'This incident will be reported.',
      ]);
    case 'quiz':
      return startQuiz(cleared, c);
    case 'hack':
      return startGame(cleared, c);
    case 'funfact':
      return showFact(cleared, c);
    case 'open':
      return openSection(cleared, c, cmd.index);
    case 'word':
      return t.mode === 'game' ? guess(cleared, c, cmd.word) : notFound(cleared, text.toLowerCase());
    default:
      return notFound(cleared, cmd.text);
  }
}

// Enter (or a click) with nothing typed.
function activate(t, c) {
  switch (t.mode) {
    case 'menu':
      return openSection(t, c, t.sel);
    case 'msg':
      return t.msg && t.msg.fact ? showFact(t, c) : toMenu(t);
    case 'game':
      return t.game.done ? startGame(t, c) : guess(t, c, t.game.words[t.game.sel]);
    case 'quiz':
      return isQuizOver(t.quiz) ? startQuiz(t, c) : out({ ...t, quiz: nextQuestion(t.quiz) });
    default:
      return toMenu(t);
  }
}

function startScan(t, now) {
  if (t.mode !== 'scan' || t.scanAt >= 0 || t.grantAt >= 0) return out(t);
  return out({ ...t, scanAt: now }, 'scanStarted');
}

function sit(t, now) {
  // Already booted: resume exactly where the visitor left off.
  if (t.mode !== 'idle') return out(t);
  return out({ ...t, mode: 'boot', bootAt: now, booted: true }, 'glitch');
}

function tick(t, now) {
  if (t.mode === 'boot' && now - t.bootAt >= BOOT_LINES.length * BOOT_LINE_MS) {
    return out({ ...t, mode: 'scan' });
  }
  if (t.mode === 'scan' && t.scanAt >= 0 && t.grantAt < 0 && now - t.scanAt >= SCAN_MS) {
    return out({ ...t, mode: 'granted', grantAt: now });
  }
  if (t.mode === 'granted' && now - t.grantAt >= GRANT_HOLD_MS) {
    return out({ ...t, mode: 'menu' }, 'glitch');
  }
  return out(t);
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const READING = ['section', 'msg'];

function scrollBy(t, delta) {
  if (!READING.includes(t.mode)) return out(t);
  const scroll = clamp(t.scroll + delta, 0, t.scrollMax);
  return out(scroll === t.scroll ? t : { ...t, scroll });
}

function setScrollMax(t, max) {
  const scrollMax = Math.max(0, Math.floor(Number(max)) || 0);
  const scroll = clamp(t.scroll, 0, scrollMax);
  if (scrollMax === t.scrollMax && scroll === t.scroll) return out(t);
  return out({ ...t, scrollMax, scroll });
}

const SCROLL_KEYS = { ArrowDown: 1, ArrowUp: -1, PageDown: SCROLL_PAGE, PageUp: -SCROLL_PAGE, ' ': SCROLL_PAGE };

function onKey(t, c, a) {
  const k = String(a.key);
  if (k === 'Escape') return out(t, 'standUp');
  if (t.mode === 'scan') return k === 'Enter' ? startScan(t, a.now) : out(t);
  if (!SEATED_MODES.includes(t.mode)) return out(t);

  if (t.mode === 'quiz' && !t.input && k.length === 1) {
    const i = 'abc123'.indexOf(k.toLowerCase());
    if (i >= 0) return out({ ...t, quiz: answerQuiz(t.quiz, i % 3) });
  }
  if (READING.includes(t.mode) && !t.input && k in SCROLL_KEYS) return scrollBy(t, SCROLL_KEYS[k]);
  if (k === 'Enter') return t.input ? runCommand(t, c, t.input) : activate(t, c);
  if (k === 'Backspace') {
    if (t.input) return out({ ...t, input: t.input.slice(0, -1) });
    return t.mode === 'menu' ? out(t) : toMenu(t);
  }
  // Left arrow is the dedicated "back to menu" key.
  if (k === 'ArrowLeft') return t.mode === 'menu' || t.input ? out(t) : toMenu(t);
  if (k === 'ArrowDown' || k === 'ArrowUp') {
    const d = k === 'ArrowDown' ? 1 : -1;
    if (t.mode === 'menu') return out({ ...t, sel: wrapIndex(t.sel + d, MENU.length) });
    if (t.mode === 'game') {
      const n = t.game.words.length;
      return out({ ...t, game: { ...t.game, sel: wrapIndex(t.game.sel + d, n) } });
    }
    return out(t);
  }
  if (k.length === 1 && t.input.length < MAX_INPUT) return out({ ...t, input: t.input + k });
  return out(t);
}

function clickLine(t, c, i) {
  if (!Number.isInteger(i) || i < 0) return out(t);
  switch (t.mode) {
    case 'menu':
      return openSection(t, c, i);
    case 'quiz':
      if (isQuizOver(t.quiz)) return startQuiz(t, c);
      if (t.quiz.picked !== null) return out({ ...t, quiz: nextQuestion(t.quiz) });
      return i < 3 ? out({ ...t, quiz: answerQuiz(t.quiz, i) }) : out(t);
    case 'game': {
      if (t.game.done) return startGame(t, c);
      const w = t.game.words[i];
      if (!w) return out(t);
      return guess({ ...t, game: { ...t.game, sel: i } }, c, w);
    }
    case 'section':
    case 'msg':
      return activate(t, c);
    default:
      return out(t);
  }
}

function stepInner(t, action, ctx) {
  const c = { ...defaultCtx(), ...ctx };
  switch (action.type) {
    case 'sit':
      return sit(t, action.now);
    case 'tick':
      return tick(t, action.now);
    case 'key':
      return onKey(t, c, action);
    case 'pad':
      return t.mode === 'idle' ? sit(t, action.now) : startScan(t, action.now);
    case 'clickLine':
      return clickLine(t, c, action.index);
    case 'scroll':
      return scrollBy(t, Number(action.delta) || 0);
    case 'setScrollMax':
      return setScrollMax(t, action.max);
    case 'tapCommand':
      return SEATED_MODES.includes(t.mode) ? runCommand(t, c, action.text) : out(t);
    default:
      return out(t);
  }
}

// Scroll position belongs to what is on screen: reset when it changes.
export function step(t, action, ctx) {
  const r = stepInner(t, action, ctx);
  const n = r.t;
  if (n !== t && n.scroll !== 0 && (n.mode !== t.mode || n.sec !== t.sec || n.msg !== t.msg)) {
    return { ...r, t: { ...n, scroll: 0 } };
  }
  return r;
}
