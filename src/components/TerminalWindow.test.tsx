import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TerminalWindow } from './TerminalWindow'

describe('TerminalWindow', () => {
  it('renders the shared chrome plus the caller-supplied info rows', () => {
    render(
      <TerminalWindow>
        <p>Shell: --os=macos</p>
      </TerminalWindow>,
    )

    expect(screen.getByText('visitor@thrax-site')).toBeInTheDocument()
    expect(screen.getByText('Shell: --os=macos')).toBeInTheDocument()
  })
})
