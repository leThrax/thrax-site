import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Stepper } from './Stepper'

describe('Stepper', () => {
  it('displays the current value', () => {
    render(<Stepper label="Players" value={4} onChange={() => {}} min={1} max={12} />)

    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('calls onChange with value + 1 when the increase button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Stepper label="Players" value={4} onChange={onChange} min={1} max={12} />)

    await user.click(screen.getByRole('button', { name: 'Increase players' }))

    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('calls onChange with value - 1 when the decrease button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Stepper label="Players" value={4} onChange={onChange} min={1} max={12} />)

    await user.click(screen.getByRole('button', { name: 'Decrease players' }))

    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('disables the decrease button at min and does not call onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Stepper label="Players" value={1} onChange={onChange} min={1} max={12} />)

    const decreaseBtn = screen.getByRole('button', { name: 'Decrease players' })
    expect(decreaseBtn).toBeDisabled()

    await user.click(decreaseBtn)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disables the increase button at max and does not call onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Stepper label="Players" value={12} onChange={onChange} min={1} max={12} />)

    const increaseBtn = screen.getByRole('button', { name: 'Increase players' })
    expect(increaseBtn).toBeDisabled()

    await user.click(increaseBtn)
    expect(onChange).not.toHaveBeenCalled()
  })
})
