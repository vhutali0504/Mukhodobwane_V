import { MENU } from './constants.js';

const MENU_ALIASES = new Set(['ls', 'menu', 'clear', 'cd ..', 'ls ./about_me']);

// Turns a line of typed text into a Command. Pure; no state needed.
export function parseCommand(text) {
  const c = String(text ?? '').trim().toLowerCase();
  if (!c) return { kind: 'unknown', text: '' };

  if (c === 'help') return { kind: 'help' };
  if (MENU_ALIASES.has(c)) return { kind: 'menu' };
  if (c === 'whoami') return { kind: 'whoami' };
  if (c === 'exit' || c === 'logout') return { kind: 'exit' };
  if (/^sudo(\s|$)/.test(c)) return { kind: 'sudo' };
  if (c === 'quiz' || c === 'trivia') return { kind: 'quiz' };
  if (c === 'hack' || c === 'game' || c === 'play') return { kind: 'hack' };
  if (c === 'funfact' || c === 'fortune' || c === 'fact') return { kind: 'funfact' };
  if (/^[1-9]$/.test(c)) return { kind: 'open', index: Number(c) - 1 };

  const arg = c
    .replace(/^(cat|open|cd|less|more)\s+/, '')
    .replace(/\.txt$/, '')
    .replace(/^\.\//, '');
  const index = MENU.findIndex(
    (id) => id === arg || id.startsWith(arg) || id.split('_').includes(arg),
  );
  if (arg && index >= 0) return { kind: 'open', index };

  if (/^[a-z]{5}$/.test(c)) return { kind: 'word', word: c.toUpperCase() };
  return { kind: 'unknown', text: c };
}
