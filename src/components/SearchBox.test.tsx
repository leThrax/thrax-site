import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBox } from './SearchBox'

describe('SearchBox', () => {
  it('renders the current value in the input', () => {
    render(<SearchBox value="proton" onChange={() => {}} />)

    expect(screen.getByPlaceholderText('search tools...')).toHaveValue('proton')
  })

  it('calls onChange with the new value as the user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SearchBox value="" onChange={onChange} />)

    await user.type(screen.getByPlaceholderText('search tools...'), 'vpn')

    expect(onChange).toHaveBeenCalledTimes(3)
    expect(onChange).toHaveBeenLastCalledWith('n')
  })
})
