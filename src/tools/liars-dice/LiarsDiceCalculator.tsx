import '@fontsource/fraunces/600.css'
import '@fontsource/archivo/400.css'
import '@fontsource/archivo/400-italic.css'
import '@fontsource/archivo/600.css'
import { useState } from 'react'
import styles from './LiarsDiceCalculator.module.css'
import { DieIcon } from './DieIcon'
import { Stepper } from './Stepper'
import { formatPercent } from './format'
import { evaluateClaim, mostLikelyOutcome, oddsLevel, totalDice, type DiceSetup } from './probability'

const MIN_PLAYERS = 1
const MAX_PLAYERS = 12
const MIN_DICE_COUNT = 1
const MAX_DICE_COUNT = 10
const MIN_FACES = 2
const MAX_FACES = 20
const MIN_QUANTITY = 1

interface Claim {
  quantity: number
  face: number
}

export function LiarsDiceCalculator() {
  const [setup, setSetup] = useState<DiceSetup>({ players: 4, diceCount: 5, faces: 6 })
  const [claim, setClaim] = useState<Claim>({ quantity: 1, face: 1 })

  const setPlayers = (players: number) => setSetup((s) => ({ ...s, players }))
  const setDiceCount = (diceCount: number) => setSetup((s) => ({ ...s, diceCount }))
  const setFaces = (faces: number) => setSetup((s) => ({ ...s, faces }))
  const setQuantity = (quantity: number) => setClaim((c) => ({ ...c, quantity }))
  const setFace = (face: number) => setClaim((c) => ({ ...c, face }))

  // Clamp on read rather than storing back into state: if players/dice/faces
  // shrink (e.g. fewer players lowers the pool below a previously chosen
  // quantity), the claim is still valid input, just capped for display/calc.
  const maxQuantity = totalDice(setup)
  const quantity = Math.min(claim.quantity, maxQuantity)
  const face = Math.min(claim.face, setup.faces)
  const result = evaluateClaim(setup, quantity, face)
  const likely = mostLikelyOutcome(setup)
  const claimIsMostLikely = quantity === likely.quantity
  const level = oddsLevel(result.probabilityAtLeast)

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <div className={styles.brand}>
          <DieIcon className={styles.dieIcon} />
          <h1>Liar&rsquo;s Dice odds</h1>
        </div>
        <p className={styles.tagline}>Know the odds before you call the bluff.</p>
      </header>

      <main className={styles.appMain}>
        <div className={`${styles.column} ${styles.columnSetup}`}>
          <section className={styles.panel} aria-label="Players">
            <h2>Players</h2>
            <Stepper label="Players" value={setup.players} onChange={setPlayers} min={MIN_PLAYERS} max={MAX_PLAYERS} />
            <p className={styles.hint}>{totalDice(setup)} dice in play</p>
          </section>

          <section className={styles.panel} aria-label="Dice setup">
            <h2>Dice</h2>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Dice per player</span>
              <Stepper
                label="Dice per player"
                value={setup.diceCount}
                onChange={setDiceCount}
                min={MIN_DICE_COUNT}
                max={MAX_DICE_COUNT}
              />
            </div>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Faces per die</span>
              <Stepper label="Faces per die" value={setup.faces} onChange={setFaces} min={MIN_FACES} max={MAX_FACES} />
            </div>
          </section>
        </div>

        <div className={`${styles.column} ${styles.columnAction}`}>
          <section className={styles.panel} aria-label="Claim">
            <h2>Your claim</h2>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Quantity</span>
              <Stepper label="Quantity" value={quantity} onChange={setQuantity} min={MIN_QUANTITY} max={maxQuantity} />
            </div>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Face</span>
              <Stepper label="Face" value={face} onChange={setFace} min={1} max={setup.faces} />
            </div>
          </section>

          <section className={`${styles.panel} ${styles.panelHero}`} aria-label="Result">
            <h2>Odds</h2>
            <p className={styles.oddsCaption}>
              Chance at least {quantity} {quantity === 1 ? 'die shows' : 'dice show'} {face}
            </p>
            <p className={`${styles.oddsHero} ${styles[level]}`} key={result.probabilityAtLeast}>
              {formatPercent(result.probabilityAtLeast)}
            </p>
            <p className={styles.oddsSub}>
              {formatPercent(result.probabilityExact)} chance it lands on exactly {quantity}.
            </p>

            <div className={`${styles.callout}${claimIsMostLikely ? ` ${styles.calloutMatch}` : ''}`}>
              <p className={styles.calloutHeading}>Most likely roll</p>
              <p className={styles.calloutValue}>{likely.quantity} of any face</p>
              <p className={styles.calloutSub}>
                {formatPercent(likely.probabilityExact)} exact chance, {formatPercent(likely.probabilityAtLeast)} chance
                of at least that many.
              </p>
              {claimIsMostLikely && <p className={styles.calloutMatchText}>That matches your claim.</p>}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
