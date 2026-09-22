import { describe, expect, it } from 'vitest'
import { formatPercent } from './format.ts'

describe('formatPercent', () => {
  it('formats a fraction as a one-decimal percentage', () => {
    expect(formatPercent(0.6713409283621811)).toBe('67.1%')
    expect(formatPercent(0)).toBe('0.0%')
    expect(formatPercent(1)).toBe('100.0%')
  })
})
