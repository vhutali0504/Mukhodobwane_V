import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from '../../client/src/App.jsx'

afterEach(cleanup)

describe('App', () => {
  it('renders a main landmark', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
