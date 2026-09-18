import { motion } from 'motion/react'
import { useTimelineEntries } from '../hooks/useTimelineEntries'
import { formatDateRange } from '../lib/formatDateRange'
import { sectionVariants } from '../lib/motionVariants'

// Local to this one staggered list — same numbers as sectionVariants, kept
// separate from motionVariants.ts since nothing else needs a per-node stagger.
const pathContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

const dotVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.3, ease: 'backOut' as const } },
}

const lineVariants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

function SectionHeading({ label }: { label: string }) {
  return (
    <h2 className="font-mono text-xs font-semibold tracking-wide text-muted uppercase">
      <span className="text-accent">❯</span> {label}
    </h2>
  )
}

function EntryDescription({ text }: { text: string }) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return null

  if (lines.length === 1) {
    return <p className="mt-1.5 font-sans text-sm leading-relaxed text-muted">{lines[0]}</p>
  }

  return (
    <ul className="mt-1.5 list-disc pl-4 font-sans text-sm leading-relaxed text-muted">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  )
}

export function TimelinePath() {
  const { entries, loading, error } = useTimelineEntries()

  return (
    <motion.div variants={sectionVariants} className="flex flex-col gap-3">
      <SectionHeading label="Timeline" />
      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted">❯ No timeline entries yet.</p>
      ) : (
        <motion.ol variants={pathContainerVariants} initial="hidden" animate="visible" className="flex flex-col">
          {entries.map((entry, index) => {
            const isCurrent = !entry.endDate
            const isLast = index === entries.length - 1

            return (
              <motion.li
                key={entry.id}
                variants={rowVariants}
                className="grid grid-cols-[5rem_1.25rem_1fr] gap-x-3 sm:grid-cols-[9.5rem_1.5rem_1fr] sm:gap-x-4"
              >
                <p className="pt-0.5 text-right font-mono text-xs text-muted tabular-nums sm:whitespace-nowrap">
                  {formatDateRange(entry.startDate, entry.endDate)}
                </p>

                <div className="flex flex-col items-center">
                  <motion.span
                    variants={dotVariants}
                    className={
                      isCurrent
                        ? 'mt-1 size-3 shrink-0 rounded-full bg-accent shadow-[0_0_0_3px_rgba(126,231,135,0.16),0_0_10px_1px_rgba(126,231,135,0.45)]'
                        : 'mt-1 size-2.5 shrink-0 rounded-full bg-surface shadow-[0_0_0_1.5px_var(--color-muted),inset_0_0_0_1px_rgba(0,0,0,0.3)]'
                    }
                  />
                  {!isLast && (
                    <motion.span
                      variants={lineVariants}
                      style={{ transformOrigin: 'top' }}
                      className="mt-1.5 w-px flex-1 bg-muted/35"
                    />
                  )}
                </div>

                <div className={isLast ? 'pb-1' : 'pb-8'}>
                  <p className="font-mono text-sm font-semibold text-fg">
                    {entry.role} <span className="font-normal text-muted">@ {entry.org}</span>
                  </p>
                  {entry.description && <EntryDescription text={entry.description} />}
                </div>
              </motion.li>
            )
          })}
        </motion.ol>
      )}
    </motion.div>
  )
}
