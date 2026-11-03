import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Work from '../../client/src/components/formal/Work.jsx'
import Experience from '../../client/src/components/formal/Experience.jsx'
import Skills from '../../client/src/components/formal/Skills.jsx'
import Education from '../../client/src/components/formal/Education.jsx'
import { profile } from '../../client/src/content/profile.js'

function stubMotion(reduced) {
  vi.stubGlobal('matchMedia', () => ({
    matches: reduced,
    addEventListener() {},
    removeEventListener() {},
  }))
}

beforeEach(() => stubMotion(false))
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const ksms = () =>
  screen.getByRole('button', { name: /MutualTrust.*Student Management System \(KSMS\)/ })

describe('Work', () => {
  it('renders 5 rows in order, numbered 01-05', () => {
    render(<Work />)
    const rows = screen.getAllByRole('button')
    expect(rows).toHaveLength(5)
    rows.forEach((b, i) => {
      expect(b).toHaveTextContent(String(i + 1).padStart(2, '0'))
      expect(b).toHaveTextContent(profile.projects[i].title)
      expect(b).toHaveAttribute('aria-controls', `project-${profile.projects[i].id}`)
    })
    expect(screen.getByRole('heading', { level: 2, name: 'Selected work' })).toHaveAttribute(
      'id',
      'work',
    )
  })

  it('toggles on click', async () => {
    const user = userEvent.setup()
    render(<Work />)
    expect(ksms()).toHaveAttribute('aria-expanded', 'false')
    await user.click(ksms())
    expect(ksms()).toHaveAttribute('aria-expanded', 'true')
    const panel = document.getElementById('project-ksms')
    expect(within(panel).getByText(/centre manager/)).toBeInTheDocument()
    expect(panel).not.toHaveAttribute('inert')
    await user.click(ksms())
    expect(ksms()).toHaveAttribute('aria-expanded', 'false')
    expect(panel).toHaveAttribute('inert')
  })

  it('toggles with Enter and Space', async () => {
    const user = userEvent.setup()
    render(<Work />)
    ksms().focus()
    await user.keyboard('{Enter}')
    expect(ksms()).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard(' ')
    expect(ksms()).toHaveAttribute('aria-expanded', 'false')
    await user.keyboard(' ')
    expect(ksms()).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows links only where the content has them', () => {
    render(<Work />)
    for (const id of ['ksms', 'tle']) {
      expect(document.getElementById(`project-${id}`).querySelectorAll('a')).toHaveLength(0)
    }
    const jt = within(document.getElementById('project-job-tracker'))
    for (const name of ['Live app', 'Source']) {
      const a = jt.getByRole('link', { name, hidden: true })
      expect(a).toHaveAttribute('target', '_blank')
      expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('marks rows instant under reduced motion', () => {
    stubMotion(true)
    render(<Work />)
    expect(document.querySelectorAll('.row.is-instant')).toHaveLength(5)
  })
})

describe('Experience, Skills, Education', () => {
  it('lists EDS before StudyTrust', () => {
    render(<Experience />)
    const heads = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(heads[0]).toMatch(/Elevate Digital Solutions/)
    expect(heads[1]).toMatch(/StudyTrust/)
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'experience')
  })

  it('renders 5 skill groups', () => {
    render(<Skills />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5)
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'skills')
  })

  it('renders education', () => {
    render(<Education />)
    expect(screen.getByText('University of Johannesburg')).toBeInTheDocument()
    expect(screen.getByText(/2023 – 2026/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'education')
  })
})
