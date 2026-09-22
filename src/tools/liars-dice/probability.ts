export interface DiceSetup {
  /** Number of players, each rolling `diceCount` hidden dice. */
  players: number
  /** Dice rolled per player. */
  diceCount: number
  /** Faces per die (e.g. 6 for a standard d6). */
  faces: number
}

export interface ClaimProbability {
  quantity: number
  face: number
  /** P(at least `quantity` dice show `face`) — what a bid is actually judged against. */
  probabilityAtLeast: number
  /** P(exactly `quantity` dice show `face`). */
  probabilityExact: number
}

export interface MostLikelyOutcome {
  quantity: number
  probabilityAtLeast: number
  probabilityExact: number
}

export function assertValidSetup(setup: DiceSetup): void {
  if (!Number.isInteger(setup.players) || setup.players < 1) {
    throw new RangeError('players must be an integer >= 1')
  }
  if (!Number.isInteger(setup.diceCount) || setup.diceCount < 1) {
    throw new RangeError('diceCount must be an integer >= 1')
  }
  if (!Number.isInteger(setup.faces) || setup.faces < 2) {
    throw new RangeError('faces must be an integer >= 2')
  }
}

export function totalDice(setup: DiceSetup): number {
  return setup.players * setup.diceCount
}

/** Probability that a single die shows a given face, assuming a fair die. */
export function faceProbability(faces: number): number {
  return 1 / faces
}

/**
 * Probability mass function for Binomial(n, p) across k = 0..n, computed via
 * the standard recurrence pmf[k] = pmf[k-1] * (n-k+1)/k * p/(1-p) rather than
 * factorials, so it stays numerically stable for realistic dice-pool sizes.
 */
export function binomialPmfDistribution(n: number, p: number): number[] {
  const pmf = new Array<number>(n + 1)
  pmf[0] = (1 - p) ** n
  for (let k = 1; k <= n; k++) {
    pmf[k] = (pmf[k - 1] * (n - k + 1) * p) / (k * (1 - p))
  }
  return pmf
}

export function binomialPmf(n: number, p: number, k: number): number {
  if (k < 0 || k > n) return 0
  return binomialPmfDistribution(n, p)[k]
}

/** P(X >= k) for X ~ Binomial(n, p). */
export function probabilityAtLeast(n: number, p: number, k: number): number {
  if (k <= 0) return 1
  if (k > n) return 0
  const pmf = binomialPmfDistribution(n, p)
  let sum = 0
  for (let i = k; i <= n; i++) sum += pmf[i]
  return Math.min(1, sum)
}

export function evaluateClaim(setup: DiceSetup, quantity: number, face: number): ClaimProbability {
  assertValidSetup(setup)
  const n = totalDice(setup)
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > n) {
    throw new RangeError(`quantity must be an integer between 0 and ${n}`)
  }
  if (!Number.isInteger(face) || face < 1 || face > setup.faces) {
    throw new RangeError(`face must be an integer between 1 and ${setup.faces}`)
  }

  const p = faceProbability(setup.faces)
  return {
    quantity,
    face,
    probabilityAtLeast: probabilityAtLeast(n, p, quantity),
    probabilityExact: binomialPmf(n, p, quantity),
  }
}

/**
 * The single most likely dice count for any one face value, i.e. the mode of
 * Binomial(totalDice, 1/faces). By symmetry this is the same for every face,
 * so no face needs to be specified.
 */
export function mostLikelyOutcome(setup: DiceSetup): MostLikelyOutcome {
  assertValidSetup(setup)
  const n = totalDice(setup)
  const p = faceProbability(setup.faces)
  const pmf = binomialPmfDistribution(n, p)

  let modeIndex = 0
  for (let k = 1; k <= n; k++) {
    if (pmf[k] > pmf[modeIndex]) modeIndex = k
  }

  return {
    quantity: modeIndex,
    probabilityAtLeast: probabilityAtLeast(n, p, modeIndex),
    probabilityExact: pmf[modeIndex],
  }
}

export type OddsLevel = 'likely' | 'possible' | 'unlikely'

/** Buckets a probability into a coarse likelihood tier for color-coding. */
export function oddsLevel(probability: number): OddsLevel {
  if (probability >= 0.5) return 'likely'
  if (probability >= 0.2) return 'possible'
  return 'unlikely'
}
