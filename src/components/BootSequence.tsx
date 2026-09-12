import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

const BOOT_LINES: string[] = [
  '[    0.000000] Linux version 6.12.0-cachyos (thrax@thrax-site) #1 SMP PREEMPT_DYNAMIC',
  '[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz root=/dev/sda1 quiet',
  '[    0.002841] BIOS-provided physical RAM map: usable',
  '[    0.014220] CPU: AMD Ryzen 9 detected, 16 cores online',
  '[    0.081332] ACPI: Core revision 20240827',
  '[    0.142981] Initializing cgroup subsys cpuset',
  '[    0.203114] Freeing unused kernel image memory',
  '[    0.311420] Run /sbin/init as init process',
  '[  OK  ] Started Load Kernel Modules',
  '[  OK  ] Mounted /boot',
  '[  OK  ] Reached target Local File Systems',
  '[  OK  ] Started Network Manager',
  '[  OK  ] Reached target Network',
  '[  OK  ] Started thrax-site.service',
  '[  OK  ] Reached target Graphical Interface',
]

const LINE_DELAY_MS = 90
const HOLD_AFTER_MS = 400
const OK_PREFIX = '[  OK  ]'

interface BootSequenceProps {
  onComplete: () => void
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete()
      return
    }

    let cancelled = false
    let timeoutId: number

    function step(index: number) {
      if (cancelled) return
      if (index >= BOOT_LINES.length) {
        timeoutId = window.setTimeout(onComplete, HOLD_AFTER_MS)
        return
      }
      setVisibleCount(index + 1)
      timeoutId = window.setTimeout(() => step(index + 1), LINE_DELAY_MS)
    }

    step(0)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onComplete}
      className="fixed inset-0 z-50 flex cursor-pointer flex-col gap-0.5 overflow-hidden bg-bg p-6 font-mono text-xs"
    >
      {BOOT_LINES.slice(0, visibleCount).map((line, i) =>
        line.startsWith(OK_PREFIX) ? (
          <p key={i} className="text-fg">
            <span className="text-accent">{OK_PREFIX}</span>
            {line.slice(OK_PREFIX.length)}
          </p>
        ) : (
          <p key={i} className="text-muted">
            {line}
          </p>
        ),
      )}
      <span className="absolute right-4 bottom-4 text-muted">[click to skip]</span>
    </motion.div>
  )
}
