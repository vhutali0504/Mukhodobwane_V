import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from '../../client/src/App.jsx'

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
