import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen, cleanup, within, renderHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { createTerminal, step } from '../../client/src/room/terminal/engine.js'
import { MENU } from '../../client/src/room/terminal/constants.js'
import { profile } from '../../client/src/content/profile.js'
import { FACTS } from '../../client/src/content/facts.js'
import { TRIVIA } from '../../client/src/content/trivia.js'
import { VAULT_WORDS } from '../../client/src/content/vaultWords.js'

vi.mock('../../client/src/lib/webgl.js', () => ({ hasWebGL: vi.fn(() => false) }))

import { RoomShell } from '../../client/src/room/scene/RoomShell.jsx'
import { TouchControls } from '../../client/src/room/ui/TouchControls.jsx'
import { RoomHud } from '../../client/src/room/ui/RoomHud.jsx'
import { useRoomKeyboard } from '../../client/src/room/ui/useRoomKeyboard.js'
import { initRoom, roomReducer } from '../../client/src/room/scene/roomReducer.js'

const ctx = { profile, FACTS, TRIVIA, VAULT_WORDS, rng: () => 0.42 }

function inMode(mode) {
  let t = { ...createTerminal({ rng: () => 0.42 }), mode: 'menu', booted: true }
  if (mode === 'scan') return { ...t, mode: 'scan' }
  if (mode === 'quiz') return step(t, { type: 'tapCommand', text: 'quiz' }, ctx).t
  if (mode === 'game') return step(t, { type: 'tapCommand', text: 'hack' }, ctx).t
  if (mode === 'section') {
    const sec = step(t, { type: 'clickLine', index: 1 }, ctx).t
    return step(sec, { type: 'setScrollMax', max: 10 }, ctx).t
  }
  return t
}

function matchCoarse(coarse) {
  window.matchMedia = vi.fn((query) => ({
    matches: coarse && query === '(pointer: coarse)',
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

const withRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)
const button = (name) => screen.getByRole('button', { name })

afterEach(() => {
  cleanup()
  delete window.matchMedia
})

describe('room UI', () => {
  it('falls back to 2D when WebGL is unavailable', () => {
    withRouter(<RoomShell />)
    expect(screen.getByText("Your device can't run the 3D room")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to the formal site' })).toHaveAttribute('href', '/')
    MENU.forEach((id, i) => {
      expect(button(`${String(i + 1).padStart(2, '0')} ${id}`)).toBeInTheDocument()
    })
    expect(document.querySelector('canvas')).toBeNull()
  })

  describe('touch controls cover every action', () => {
    beforeEach(() => matchCoarse(true))

    const renderIn = (mode) => {
      const dispatch = vi.fn()
      withRouter(<TouchControls t={inMode(mode)} dispatch={dispatch} />)
      return dispatch
    }
    const always = () => {
      expect(button('Stand up')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Exit to formal' })).toHaveAttribute('href', '/')
    }

    it('menu: all 9 items', () => {
      const dispatch = renderIn('menu')
      MENU.forEach((id, i) => {
        expect(button(`${String(i + 1).padStart(2, '0')} ${id}`)).toBeInTheDocument()
      })
      button('04 projects').click()
      expect(dispatch).toHaveBeenCalledWith({ type: 'clickLine', index: 3 })
      always()
    })

    it('quiz: A, B, C and Next', () => {
      const dispatch = renderIn('quiz')
      ;['A', 'B', 'C', 'Next'].forEach((n) => expect(button(new RegExp(`^${n}\\b`))).toBeInTheDocument())
      button(/^B\b/).click()
      expect(dispatch).toHaveBeenCalledWith({ type: 'clickLine', index: 1 })
      always()
    })

    it('game: the 8 words and Play again', () => {
      const t = inMode('game')
      const dispatch = renderIn('game')
      expect(t.game.words).toHaveLength(8)
      t.game.words.forEach((w) => expect(button(w)).toBeInTheDocument())
      expect(button('Play again')).toBeInTheDocument()
      button(t.game.words[2]).click()
      expect(dispatch).toHaveBeenCalledWith({ type: 'clickLine', index: 2 })
      always()
    })

    it('scan: Scan fingerprint', () => {
      const dispatch = renderIn('scan')
      button('Scan fingerprint').click()
      expect(dispatch).toHaveBeenCalledWith({ type: 'pad' })
      always()
    })

    it('section: scroll buttons and Stand up sends Escape', () => {
      const dispatch = renderIn('section')
      button('Scroll down').click()
      expect(dispatch).toHaveBeenCalledWith({ type: 'scroll', delta: 3 })
      button('Stand up').click()
      expect(dispatch).toHaveBeenCalledWith({ type: 'key', key: 'Escape' })
      always()
    })

    it('renders nothing on a fine pointer', () => {
      matchCoarse(false)
      withRouter(<TouchControls t={inMode('menu')} dispatch={vi.fn()} />)
      expect(screen.queryByRole('button', { name: 'Stand up' })).toBeNull()
    })
  })

  it('TerminalFallback: typing help and Enter shows the help lines', async () => {
    const user = userEvent.setup()
    withRouter(<RoomShell />)
    const input = screen.getByRole('textbox', { name: 'Command' })
    await user.type(input, 'help{Enter}')
    expect(screen.getByText('ls / menu ....... list sections')).toBeInTheDocument()
    expect(input).toHaveValue('')
    await user.type(input, 'skills{Enter}')
    const out = screen.getByRole('region', { name: 'Terminal output' })
    expect(within(out).getByText(/SKILLS/)).toBeInTheDocument()
  })

  describe('RoomHud', () => {
    it('standing shows the look-around hint', () => {
      withRouter(<RoomHud pose="standing" />)
      expect(screen.getByText('drag to look around · click the desk to sit down')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Exit to formal' })).toHaveAttribute('href', '/')
    })

    it('seated shows the terminal hint and a stand-up button', () => {
      const onStand = vi.fn()
      withRouter(<RoomHud pose="seated" onStand={onStand} />)
      expect(screen.getByText('↑↓ / click to choose · type "help" · Esc to stand up')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Exit to formal' })).toHaveAttribute('href', '/')
      button('Stand up').click()
      expect(onStand).toHaveBeenCalled()
    })
  })

  describe('useRoomKeyboard', () => {
    const press = (init) => {
      const e = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
      window.dispatchEvent(e)
      return e
    }

    it('Enter while standing asks to sit', () => {
      const dispatch = vi.fn()
      renderHook(() => useRoomKeyboard(dispatch, 'standing'))
      press({ key: 'Enter' })
      expect(dispatch).toHaveBeenCalledWith({ type: 'sit' })
      press({ key: 'a' })
      expect(dispatch).toHaveBeenCalledTimes(1)
    })

    it('seated keys go to the engine; shortcuts and Tab pass through', () => {
      const dispatch = vi.fn()
      renderHook(() => useRoomKeyboard(dispatch, 'seated'))
      const space = press({ key: ' ' })
      expect(space.defaultPrevented).toBe(true)
      expect(dispatch).toHaveBeenLastCalledWith({ type: 'key', key: ' ' })
      expect(press({ key: 'ArrowDown' }).defaultPrevented).toBe(true)
      const n = dispatch.mock.calls.length
      expect(press({ key: 'c', ctrlKey: true }).defaultPrevented).toBe(false)
      expect(press({ key: 'r', metaKey: true }).defaultPrevented).toBe(false)
      expect(press({ key: 'Tab' }).defaultPrevented).toBe(false)
      expect(dispatch).toHaveBeenCalledTimes(n)
    })

    it('does nothing while moving', () => {
      const dispatch = vi.fn()
      renderHook(() => useRoomKeyboard(dispatch, 'moving'))
      press({ key: 'Enter' })
      expect(dispatch).not.toHaveBeenCalled()
    })
  })

  describe('roomReducer (pose + engine)', () => {
    it('sit is a camera move; the engine boots only on arrival', () => {
      let s = initRoom({ now: 0 })
      s = roomReducer(s, { type: 'sit', now: 1 })
      expect(s.pose).toBe('moving')
      expect(s.movingTo).toBe('seated')
      expect(s.t.mode).toBe('idle')
      s = roomReducer(s, { type: 'arrive', at: 'seated', now: 2 })
      expect(s.pose).toBe('seated')
      expect(s.t.mode).toBe('boot')
      expect(s.glitchSeq).toBe(s.seq)
    })

    it('Escape while seated stands up and keeps the terminal state', () => {
      let s = { ...initRoom({ now: 0, twoD: true }), pose: 'seated' }
      expect(s.t.mode).toBe('menu')
      s = roomReducer(s, { type: 'key', key: 'Escape', now: 5 })
      expect(s.pose).toBe('moving')
      expect(s.movingTo).toBe('standing')
      s = roomReducer(s, { type: 'arrive', at: 'standing', now: 6 })
      expect(s.pose).toBe('standing')
      expect(s.t.mode).toBe('menu')
    })

    it('the pad while standing asks to sit instead of scanning', () => {
      const s = roomReducer(initRoom({ now: 0 }), { type: 'pad', now: 1 })
      expect(s.pose).toBe('moving')
      expect(s.t.scanAt).toBe(-1)
    })
  })
})
