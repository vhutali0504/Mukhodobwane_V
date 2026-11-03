import { describe, it, expect } from 'vitest';
import { parseCommand } from '../../../client/src/room/terminal/commands.js';

describe('parseCommand', () => {
  it('opens a section by file name', () => {
    expect(parseCommand('cat skills.txt')).toEqual({ kind: 'open', index: 1 });
  });
  it('opens by digit (1-based)', () => {
    expect(parseCommand('3')).toEqual({ kind: 'open', index: 2 });
  });
  it('opens by id word', () => {
    expect(parseCommand('summary')).toEqual({ kind: 'open', index: 0 });
  });
  it('recognises sudo, logout and menu aliases', () => {
    expect(parseCommand('sudo rm -rf /')).toEqual({ kind: 'sudo' });
    expect(parseCommand('LOGOUT')).toEqual({ kind: 'exit' });
    expect(parseCommand('clear')).toEqual({ kind: 'menu' });
    expect(parseCommand('cd ..')).toEqual({ kind: 'menu' });
  });
  it('maps game and quiz aliases', () => {
    expect(parseCommand('play')).toEqual({ kind: 'hack' });
    expect(parseCommand('trivia')).toEqual({ kind: 'quiz' });
    expect(parseCommand('fortune')).toEqual({ kind: 'funfact' });
  });
  it('treats a 5-letter word as a vault guess', () => {
    expect(parseCommand('token')).toEqual({ kind: 'word', word: 'TOKEN' });
  });
  it('returns unknown for blank, 0 and 10', () => {
    expect(parseCommand('   ')).toEqual({ kind: 'unknown', text: '' });
    expect(parseCommand('0').kind).toBe('unknown');
    expect(parseCommand('10').kind).toBe('unknown');
  });
});
