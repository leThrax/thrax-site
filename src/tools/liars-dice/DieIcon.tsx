import styles from './DieIcon.module.css'

interface DieIconProps {
  className?: string
}

export function DieIcon({ className }: DieIconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" width="36" height="36" role="img" aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="9" className={styles.dieFace} />
      <circle cx="12" cy="12" r="3" className={styles.diePip} />
      <circle cx="28" cy="12" r="3" className={styles.diePip} />
      <circle cx="20" cy="20" r="3" className={styles.diePip} />
      <circle cx="12" cy="28" r="3" className={styles.diePip} />
      <circle cx="28" cy="28" r="3" className={styles.diePip} />
    </svg>
  )
}
