import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LiarsDiceCalculator } from './LiarsDiceCalculator'

describe('LiarsDiceCalculator', () => {
  it('clamps the displayed claim quantity on read when the dice pool shrinks below it', async () => {
    const user = userEvent.setup()
    render(<LiarsDiceCalculator />)

    const quantityGroup = screen.getByRole('group', { name: 'Quantity' })
    const quantityIncrease = within(quantityGroup).getByRole('button', { name: 'Increase quantity' })
    const quantityValue = within(quantityGroup).getByRole('status')

    // Default setup is 4 players * 5 dice = 20 total dice, claim starts at 1.
    for (let i = 0; i < 15; i++) {
      await user.click(quantityIncrease)
    }
    expect(quantityValue).toHaveTextContent('16')

    const playersGroup = screen.getByRole('group', { name: 'Players' })
    const playersDecrease = within(playersGroup).getByRole('button', { name: 'Decrease players' })

    // Shrink the pool to 1 player * 5 dice = 5 total dice, well below the
    // claim quantity of 16 chosen above.
    for (let i = 0; i < 3; i++) {
      await user.click(playersDecrease)
    }

    // The claim is clamped on read (not written back into state via an
    // effect), so the displayed quantity should cap at the new pool size
    // without error or a stale/invalid value left on screen.
    expect(quantityValue).toHaveTextContent('5')

    // Raising the pool back up should reveal the *original* claim quantity
    // was preserved underneath the clamp, not lost or overwritten.
    const playersIncrease = within(playersGroup).getByRole('button', { name: 'Increase players' })
    for (let i = 0; i < 3; i++) {
      await user.click(playersIncrease)
    }
    expect(quantityValue).toHaveTextContent('16')
  })
})
