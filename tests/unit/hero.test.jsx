import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Hero from '../../client/src/components/formal/Hero.jsx'
import TopBar from '../../client/src/components/layout/TopBar.jsx'
import Footer from '../../client/src/components/layout/Footer.jsx'
import MobileCta from '../../client/src/components/layout/MobileCta.jsx'
import { profile } from '../../client/src/content/profile.js'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Hero', () => {
  it('shows the name, actions, availability and portrait', () => {
    render(<Hero />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Mukhodobwane')
    expect(h1).toHaveTextContent('Vhutalihandivho')
    expect(screen.getByRole('link', { name: 'View my work' })).toHaveAttribute('href', '#work')
    const cv = screen.getByRole('link', { name: 'Download CV' })
    expect(cv).toHaveAttribute('href', profile.cvUrl)
    expect(cv).toHaveAttribute('download')
    expect(screen.getByText('Open to roles, starting 2027')).toBeInTheDocument()
    expect(screen.getByAltText('Portrait of Mukhodobwane Vhutalihandivho')).toBeInTheDocument()
    // The photo has no caption card over it.
    expect(document.querySelector('.idcard')).toBeNull()
    expect(screen.queryByText('Co-Founder & Technical Lead')).not.toBeInTheDocument()
  })

  it('shows the first role statically when reduced motion is preferred', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener() {},
      removeEventListener() {},
    }))
    render(<Hero />)
    expect(document.querySelector('.role-typed')).toHaveTextContent('Full-stack developer')
  })
})

describe('TopBar', () => {
  it('has section links, a mode switch link and a working menu button', () => {
    render(<TopBar />)
    for (const s of ['Work', 'Experience', 'Skills', 'Contact']) {
      expect(screen.getByRole('link', { name: s })).toHaveAttribute('href', `#${s.toLowerCase()}`)
    }
    expect(screen.getByRole('link', { name: 'Switch to hacker mode' })).toHaveAttribute('href', '/room')
    const menu = screen.getByRole('button', { name: 'Menu' })
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(menu)
    expect(menu).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(menu)
    expect(menu).toHaveAttribute('aria-expanded', 'false')
  })

  it('calls onActivate from the mode switch', () => {
    const onActivate = vi.fn((e) => e.preventDefault())
    render(<TopBar onActivate={onActivate} />)
    fireEvent.click(screen.getByRole('link', { name: 'Switch to hacker mode' }))
    expect(onActivate).toHaveBeenCalledTimes(1)
  })
})

describe('Footer and MobileCta', () => {
  it('footer links out and into the room, with no phone number', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', profile.links.github)
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', profile.links.linkedin)
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'Enter the room' })).toHaveAttribute('href', '/room')
    expect(document.body.textContent).not.toMatch(/(\+27|\b0)\s?\d{2}\s?\d{3}\s?\d{4}/)
  })

  it('mobile CTA offers Contact and Download CV', () => {
    render(<MobileCta />)
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact')
    expect(screen.getByRole('link', { name: 'Download CV' })).toHaveAttribute('href', profile.cvUrl)
  })
})
