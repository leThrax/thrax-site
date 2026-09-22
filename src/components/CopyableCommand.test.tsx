import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyableCommand } from './CopyableCommand'

describe('CopyableCommand', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the command as a shell line', () => {
    render(<CopyableCommand command="brew install --cask protonvpn" />)

    expect(screen.getByText('brew install --cask protonvpn')).toBeInTheDocument()
  })

  it('copies the command to the clipboard and shows a brief confirmation', async () => {
    // userEvent.setup() installs its own clipboard stub on `navigator`, so
    // our override must be defined after it, or the click ends up writing
    // through user-event's stub instead of this test's mock.
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    render(<CopyableCommand command="brew install --cask protonvpn" />)
    await user.click(screen.getByRole('button', { name: 'Copy command' }))

    expect(writeText).toHaveBeenCalledWith('brew install --cask protonvpn')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Copy command' })).toHaveTextContent('Copied!'))
  })

  it('silently no-ops if the clipboard API rejects', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    render(<CopyableCommand command="brew install --cask protonvpn" />)
    await user.click(screen.getByRole('button', { name: 'Copy command' }))

    expect(screen.getByRole('button', { name: 'Copy command' })).toHaveTextContent('copy')
  })
})
