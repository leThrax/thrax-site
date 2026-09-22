import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotFoundPage } from './NotFoundPage'

describe('NotFoundPage', () => {
  it('shows the attempted path in the fake shell error', () => {
    render(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('command not found: /does-not-exist')).toBeInTheDocument()
  })

  it('links back home', () => {
    render(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /back home/ })).toHaveAttribute('href', '/')
  })

  it('sets the document title', () => {
    render(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(document.title).toBe('thrax-site — 404')
  })
})
