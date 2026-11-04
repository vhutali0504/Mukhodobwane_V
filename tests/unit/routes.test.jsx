import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from '../../client/src/App.jsx'
import { profile } from '../../client/src/content/profile.js'

const at = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

describe('routes and per-page meta', () => {
  afterEach(cleanup)

  it.each([
    ['/', 'Mukhodobwane Vhutalihandivho · Software Developer'],
    ['/privacy', 'Privacy · Mukhodobwane Vhutalihandivho'],
    ['/thanks', 'Thanks · Mukhodobwane Vhutalihandivho'],
    ['/nope', '404 · Mukhodobwane Vhutalihandivho'],
  ])('%s sets the document title', (path, title) => {
    at(path)
    expect(document.title).toBe(title)
    expect(document.querySelector('meta[name="description"]').content).not.toBe('')
    expect(document.querySelector('meta[property="og:title"]').content).toBe(title)
    expect(document.querySelector('meta[property="og:description"]').content).not.toBe('')
  })

  it('NotFound shows the terminal message and a link home', () => {
    at('/nope')
    expect(screen.getByText('404: file not found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
  })

  it('Privacy covers forms, analytics, cookies and deletion', () => {
    at('/privacy')
    const text = document.body.textContent
    expect(text).toContain('Netlify Forms')
    expect(text).toContain('GoatCounter')
    expect(text).toContain('Sentry')
    expect(text).toContain('filters form spam')
    expect(text).toContain('no cookies')
    expect(document.querySelector(`a[href^="mailto:${profile.email}"]`)).not.toBeNull()
  })

  it('Thanks confirms receipt and links home', () => {
    at('/thanks')
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
  })
})
