import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { initAnalytics } from '../../client/src/lib/analytics.js'
import { scrubBreadcrumb, scrubEvent, initErrorLogging } from '../../client/src/lib/errorLogging.js'
import { useDocumentMeta } from '../../client/src/hooks/useDocumentMeta.js'
import { ModeTransitionProvider, useSwitchClick } from '../../client/src/components/layout/ModeTransition.jsx'

function Meta({ noindex }) {
  useDocumentMeta({ title: 'T', description: 'D', noindex })
  return null
}

describe('document meta', () => {
  afterEach(cleanup)
  it('indexable pages get a canonical link and no robots tag', () => {
    render(<MemoryRouter initialEntries={['/privacy']}><Meta /></MemoryRouter>)
    expect(document.querySelector('link[rel="canonical"]').href).toBe(
      'https://mukhodobwanevhutalihandivho.netlify.app/privacy',
    )
    expect(document.querySelector('meta[name="robots"]')).toBeNull()
  })
  it('noindex pages get robots noindex and no canonical', () => {
    render(<MemoryRouter initialEntries={['/thanks']}><Meta noindex /></MemoryRouter>)
    expect(document.querySelector('meta[name="robots"]').content).toBe('noindex')
    expect(document.querySelector('link[rel="canonical"]')).toBeNull()
  })
})

describe('analytics', () => {
  afterEach(() => {
    document.head.querySelectorAll('script').forEach((s) => s.remove())
    delete window.goatcounter
  })
  it('does nothing without a code', () => {
    initAnalytics(undefined)
    expect(document.querySelector('script[src*="gc.zgo.at"]')).toBeNull()
  })
  it('injects the GoatCounter script with the endpoint, and sets no cookie', () => {
    initAnalytics('mysite')
    const s = document.querySelector('script[src="https://gc.zgo.at/count.js"]')
    expect(s.dataset.goatcounter).toBe('https://mysite.goatcounter.com/count')
    expect(window.goatcounter.no_onload).toBe(true)
    expect(document.cookie).toBe('')
  })
})

describe('error logging', () => {
  it('drops input breadcrumbs and keeps others', () => {
    expect(scrubBreadcrumb({ category: 'ui.input' })).toBeNull()
    expect(scrubBreadcrumb({ category: 'ui.click' })).toEqual({ category: 'ui.click' })
  })
  it('strips request bodies, cookies and user', () => {
    const e = scrubEvent({ request: { url: '/', data: 'name=x', cookies: { a: 1 } }, user: { email: 'a' } })
    expect(e).toEqual({ request: { url: '/' } })
  })
  it('is a no-op without a DSN', async () => {
    expect(await initErrorLogging(undefined)).toBeNull()
  })
  it('initialises Sentry without PII or tracing when a DSN is set', async () => {
    const init = vi.fn()
    vi.doMock('@sentry/react', () => ({ init }))
    await initErrorLogging('https://k@o1.ingest.sentry.io/1')
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({ sendDefaultPii: false, tracesSampleRate: 0, beforeBreadcrumb: scrubBreadcrumb, beforeSend: scrubEvent }),
    )
    vi.doUnmock('@sentry/react')
  })
})

describe('mode transition', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })
  function Where() {
    return <p data-testid="where">{useLocation().pathname}</p>
  }
  function Link() {
    const click = useSwitchClick('/room')
    return <a href="/room" onClick={click}>go</a>
  }
  it('plays the glitch overlay, then navigates', () => {
    vi.useFakeTimers()
    render(
      <MemoryRouter>
        <ModeTransitionProvider><Link /><Where /></ModeTransitionProvider>
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByText('go'))
    expect(screen.getByTestId('glitch-overlay')).toHaveClass('is-out')
    expect(screen.getByTestId('where')).toHaveTextContent('/')
    act(() => { vi.advanceTimersByTime(700) })
    expect(screen.getByTestId('where')).toHaveTextContent('/room')
    expect(screen.getByTestId('glitch-overlay')).toHaveClass('is-in')
    act(() => { vi.advanceTimersByTime(400) })
    expect(screen.queryByTestId('glitch-overlay')).toBeNull()
  })
})
