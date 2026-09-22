import styles from './Stepper.module.css'

interface StepperProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
}

export function Stepper({ label, value, onChange, min, max }: StepperProps) {
  const decrement = () => onChange(Math.max(min, value - 1))
  const increment = () => onChange(Math.min(max, value + 1))

  return (
    <div className={styles.stepper} role="group" aria-label={label}>
      <button
        type="button"
        className={styles.stepperBtn}
        onClick={decrement}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        &minus;
      </button>
      <output className={styles.stepperValue} aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={styles.stepperBtn}
        onClick={increment}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        +
      </button>
    </div>
  )
}
