import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import { validateContact } from '../../client/src/lib/validateContact.js'
import { submitContact } from '../../client/src/api/contact.js'
import ContactForm from '../../client/src/components/formal/ContactForm.jsx'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const good = {
  name: 'Ada',
  email: 'ada@example.com',
  message: 'Hello there, nice site.',
  consent: true,
}

describe('validateContact', () => {
  it('returns {} when valid', () => {
    expect(validateContact(good)).toEqual({})
  })
  it('flags empty name', () => {
    expect(validateContact({ ...good, name: '  ' }).name).toBe('Please enter your name.')
  })
  it('flags bad email', () => {
    expect(validateContact({ ...good, email: 'nope' }).email).toBe(
      'Please enter a valid email address.',
    )
  })
  it('flags short message', () => {
    expect(validateContact({ ...good, message: 'short' }).message).toBe(
      'Please write at least 10 characters.',
    )
  })
  it('flags over-long fields', () => {
    expect(validateContact({ ...good, name: 'a'.repeat(101) }).name).toMatch(/100/)
    expect(validateContact({ ...good, email: 'a'.repeat(250) + '@b.co' }).email).toMatch(/254/)
    expect(validateContact({ ...good, message: 'a'.repeat(5001) }).message).toMatch(/5000/)
  })
  it('flags missing consent', () => {
    expect(validateContact({ ...good, consent: false }).consent).toBe(
      'Please agree to the privacy policy so I can reply.',
    )
  })
})

describe('submitContact', () => {
  it('posts urlencoded body with form-name', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    await submitContact(
      { name: 'Ada', email: 'a@b.co', message: 'hi there you', consent: true },
      { fetchImpl },
    )
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('/')
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded')
    expect(init.body).toContain('form-name=contact')
    expect(init.body).toContain('name=Ada')
    expect(init.body).toContain('email=a%40b.co')
  })
  it('rejects http_500', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    await expect(submitContact(good, { fetchImpl })).rejects.toThrow('http_500')
  })
  it('rejects timeout after 10000ms', async () => {
    vi.useFakeTimers()
    const fetchImpl = vi.fn(
      (_u, { signal }) =>
        new Promise((_res, rej) =>
          signal.addEventListener('abort', () => rej(new DOMException('x', 'AbortError'))),
        ),
    )
    const p = submitContact(good, { fetchImpl })
    const assertion = expect(p).rejects.toThrow('timeout')
    await vi.advanceTimersByTimeAsync(10000)
    await assertion
  })
})

function setup() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<ContactForm />} />
        <Route path="/thanks" element={<p>THANKS PAGE</p>} />
      </Routes>
    </MemoryRouter>,
  )
}
async function fill(user) {
  await user.type(screen.getByLabelText('Name'), 'Ada')
  await user.type(screen.getByLabelText('Email'), 'ada@example.com')
  await user.type(screen.getByLabelText('Message'), 'Hello there, nice site.')
  await user.click(screen.getByRole('checkbox'))
}

describe('ContactForm', () => {
  it('has a Contact heading, unchecked consent and a privacy link', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
    expect(screen.getByRole('link', { name: /privacy/i })).toHaveAttribute('href', '/privacy')
  })
  it('opens the privacy link in a new tab so the typed message survives', () => {
    setup()
    const link = screen.getByRole('link', { name: /privacy policy/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveTextContent('(opens in a new tab)')
  })
  it('shows inline errors via aria-describedby and focuses the first invalid field', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    const name = screen.getByLabelText('Name')
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(document.getElementById(name.getAttribute('aria-describedby'))).toHaveTextContent(
      'Please enter your name.',
    )
    expect(name).toHaveFocus()
    expect(screen.getByText('Please agree to the privacy policy so I can reply.')).toBeInTheDocument()
  })
  it('navigates to /thanks on success', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }))
    setup()
    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(await screen.findByText('THANKS PAGE')).toBeInTheDocument()
  })
  it('shows the error with a mailto link and keeps values on failure', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    setup()
    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(
      'Something went wrong sending your message. Please try again or email me directly.',
    )
    expect(alert.querySelector('a[href^="mailto:"]')).not.toBeNull()
    expect(alert).toHaveFocus()
    expect(screen.getByLabelText('Name')).toHaveValue('Ada')
    expect(screen.getByLabelText('Message')).toHaveValue('Hello there, nice site.')
  })
  it('double submit sends once', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn(() => new Promise(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    setup()
    await fill(user)
    const btn = screen.getByRole('button', { name: 'Send message' })
    await user.click(btn)
    await user.click(btn)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled()
  })
  it('honeypot filled: no fetch, still shows success', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { container } = setup()
    await fill(user)
    const bot = container.querySelector('input[name="bot-field"]')
    expect(bot).toHaveAttribute('tabindex', '-1')
    expect(bot.closest('[aria-hidden="true"]')).not.toBeNull()
    fireEvent.change(bot, { target: { value: 'spam' } })
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(await screen.findByText('THANKS PAGE')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
