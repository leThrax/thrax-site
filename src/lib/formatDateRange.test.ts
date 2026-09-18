import { describe, expect, it } from 'vitest'
import { formatDateRange } from './formatDateRange'

describe('formatDateRange', () => {
  it('formats a start and end date', () => {
    expect(formatDateRange('2023-01-15', '2024-03-20')).toBe('Jan 2023 – Mar 2024')
  })

  it('renders "Present" when there is no end date', () => {
    expect(formatDateRange('2023-01-15')).toBe('Jan 2023 – Present')
  })
})
