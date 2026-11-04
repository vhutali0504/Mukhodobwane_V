import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter, Link } from 'react-router'
import { Suspense, lazy } from 'react'
import { App } from '../../client/src/App.jsx'
import { RoomLoadBoundary } from '../../client/src/components/layout/RoomLoadBoundary.jsx'

const Broken = lazy(() => Promise.reject(new Error('chunk failed')))

describe('RoomLoadBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    sessionStorage.clear()
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  const mount = (reload) =>
    render(
      <RoomLoadBoundary reload={reload}>
        <Suspense fallback={<p>loading</p>}>
          <Broken />
        </Suspense>
      </RoomLoadBoundary>,
    )

  it('a rejected lazy import shows Reload and a link back to the formal site', async () => {
    sessionStorage.setItem('room-chunk-reloaded', '1')
    const reload = vi.fn()
    mount(reload)
    expect(await screen.findByText(/Couldn.t load the room/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to the formal site' })).toHaveAttribute('href', '/')
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }))
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('reloads on its own once, then stops', async () => {
    const reload = vi.fn()
    mount(reload)
    await screen.findByText(/Couldn.t load the room/)
    expect(reload).toHaveBeenCalledTimes(1)
    cleanup()
    mount(reload)
    await screen.findByText(/Couldn.t load the room/)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('still works when sessionStorage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    mount(vi.fn())
    expect(await screen.findByText(/Couldn.t load the room/)).toBeInTheDocument()
  })
})

describe('scroll reset on navigation', () => {
  let scrollTo
  beforeEach(() => {
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  const mount = () =>
    render(
      <MemoryRouter initialEntries={['/']}>
        <Link to="/privacy">go-privacy</Link>
        <Link to="/privacy#deletion">go-hash</Link>
        <App />
      </MemoryRouter>,
    )

  it('scrolls to the top on a push navigation', () => {
    mount()
    scrollTo.mockClear()
    fireEvent.click(screen.getByText('go-privacy'))
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('leaves hash navigations alone', () => {
    mount()
    scrollTo.mockClear()
    fireEvent.click(screen.getByText('go-hash'))
    expect(scrollTo).not.toHaveBeenCalled()
  })
})
