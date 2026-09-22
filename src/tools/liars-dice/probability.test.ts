import { describe, expect, it } from 'vitest'
import {
  assertValidSetup,
  binomialPmf,
  binomialPmfDistribution,
  evaluateClaim,
  faceProbability,
  mostLikelyOutcome,
  oddsLevel,
  probabilityAtLeast,
  totalDice,
  type DiceSetup,
} from './probability.ts'

describe('assertValidSetup', () => {
  it('accepts a valid setup', () => {
    expect(() => assertValidSetup({ players: 4, diceCount: 5, faces: 6 })).not.toThrow()
  })

  it.each([
    { players: 0, diceCount: 5, faces: 6 },
    { players: 1.5, diceCount: 5, faces: 6 },
    { players: 4, diceCount: 0, faces: 6 },
    { players: 4, diceCount: 5, faces: 1 },
  ])('rejects %o', (setup) => {
    expect(() => assertValidSetup(setup as DiceSetup)).toThrow(RangeError)
  })
})

describe('totalDice / faceProbability', () => {
  it('multiplies players by diceCount', () => {
    expect(totalDice({ players: 4, diceCount: 5, faces: 6 })).toBe(20)
  })

  it('is 1/faces', () => {
    expect(faceProbability(6)).toBeCloseTo(1 / 6)
  })
})

describe('binomialPmfDistribution', () => {
  it('sums to 1 across k=0..n for a range of setups', () => {
    for (const [n, p] of [
      [20, 1 / 6],
      [8, 1 / 4],
      [1, 1 / 6],
      [40, 1 / 20],
    ] as const) {
      const pmf = binomialPmfDistribution(n, p)
      const sum = pmf.reduce((a, b) => a + b, 0)
      expect(sum).toBeCloseTo(1, 9)
    }
  })

  it('matches a factorial-based reference implementation', () => {
    const n = 8
    const p = 0.25
    const factorial = (x: number): number => (x <= 1 ? 1 : x * factorial(x - 1))
    for (let k = 0; k <= n; k++) {
      const reference = (factorial(n) / (factorial(k) * factorial(n - k))) * p ** k * (1 - p) ** (n - k)
      expect(binomialPmf(n, p, k)).toBeCloseTo(reference, 9)
    }
  })

  it('returns 0 outside [0, n]', () => {
    expect(binomialPmf(10, 1 / 6, -1)).toBe(0)
    expect(binomialPmf(10, 1 / 6, 11)).toBe(0)
  })
})

describe('probabilityAtLeast', () => {
  it('is 1 for k <= 0', () => {
    expect(probabilityAtLeast(20, 1 / 6, 0)).toBe(1)
    expect(probabilityAtLeast(20, 1 / 6, -3)).toBe(1)
  })

  it('is 0 for k > n', () => {
    expect(probabilityAtLeast(20, 1 / 6, 21)).toBe(0)
  })

  it('equals p^n for k = n', () => {
    expect(probabilityAtLeast(5, 1 / 6, 5)).toBeCloseTo((1 / 6) ** 5, 9)
  })

  it('matches a single-die sanity check', () => {
    expect(probabilityAtLeast(1, 1 / 6, 1)).toBeCloseTo(1 / 6, 9)
  })
})

describe('evaluateClaim', () => {
  const setup: DiceSetup = { players: 4, diceCount: 5, faces: 6 }

  it('returns matching exact/at-least probabilities for a known case', () => {
    const result = evaluateClaim(setup, 3, 1)
    expect(result.probabilityExact).toBeCloseTo(0.23788656613785025, 9)
    expect(result.probabilityAtLeast).toBeCloseTo(0.6713409283621811, 9)
  })

  it('rejects an out-of-range quantity', () => {
    expect(() => evaluateClaim(setup, -1, 1)).toThrow(RangeError)
    expect(() => evaluateClaim(setup, 21, 1)).toThrow(RangeError)
  })

  it('rejects an out-of-range face', () => {
    expect(() => evaluateClaim(setup, 1, 0)).toThrow(RangeError)
    expect(() => evaluateClaim(setup, 1, 7)).toThrow(RangeError)
  })
})

describe('mostLikelyOutcome', () => {
  it('finds the mode for a 20-dice d6 pool', () => {
    const outcome = mostLikelyOutcome({ players: 4, diceCount: 5, faces: 6 })
    expect(outcome.quantity).toBe(3)
  })

  it('finds the mode for a single die (favors zero)', () => {
    const outcome = mostLikelyOutcome({ players: 1, diceCount: 1, faces: 6 })
    expect(outcome.quantity).toBe(0)
    expect(outcome.probabilityExact).toBeCloseTo(5 / 6, 9)
  })

  it('is symmetric: probabilities do not depend on which face is asked for', () => {
    const setup: DiceSetup = { players: 3, diceCount: 4, faces: 8 }
    const outcome = mostLikelyOutcome(setup)
    const claimOnMode = evaluateClaim(setup, outcome.quantity, 1)
    expect(claimOnMode.probabilityExact).toBeCloseTo(outcome.probabilityExact, 9)
  })
})

describe('oddsLevel', () => {
  it('is "likely" at and above 50%', () => {
    expect(oddsLevel(0.5)).toBe('likely')
    expect(oddsLevel(0.99)).toBe('likely')
    expect(oddsLevel(1)).toBe('likely')
  })

  it('is "possible" from 20% up to (but not including) 50%', () => {
    expect(oddsLevel(0.2)).toBe('possible')
    expect(oddsLevel(0.35)).toBe('possible')
    expect(oddsLevel(0.4999)).toBe('possible')
  })

  it('is "unlikely" below 20%', () => {
    expect(oddsLevel(0.1999)).toBe('unlikely')
    expect(oddsLevel(0)).toBe('unlikely')
  })
})
