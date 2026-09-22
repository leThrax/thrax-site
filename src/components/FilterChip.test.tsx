import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterChip } from './FilterChip'

describe('FilterChip', () => {
  it('renders the flag-style id as its visible label', () => {
    render(<FilterChip id="macos" label="MacOS" selected={false} onToggle={() => {}} />)

    expect(screen.getByRole('button', { name: 'MacOS' })).toHaveTextContent('--macos')
  })

  it('exposes the human-readable label via aria-label, not the raw flag text', () => {
    render(<FilterChip id="macos" label="MacOS" selected={false} onToggle={() => {}} />)

    expect(screen.getByRole('button', { name: 'MacOS' })).toBeInTheDocument()
  })

  it('reflects selection state via aria-pressed', () => {
    const { rerender } = render(
      <FilterChip id="macos" label="MacOS" selected={false} onToggle={() => {}} />,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')

    rerender(<FilterChip id="macos" label="MacOS" selected={true} onToggle={() => {}} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<FilterChip id="macos" label="MacOS" selected={false} onToggle={onToggle} />)

    await user.click(screen.getByRole('button'))

    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
