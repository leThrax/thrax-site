import { useEffect, useRef, useState } from 'react'

/** Animates `display` toward `target`: deletes whatever is currently shown
 * down to empty, then types the new target out character by character. On
 * first mount (nothing displayed yet) it skips straight to typing. */
export function useTypewriter(target: string): string {
  const [display, setDisplay] = useState('')
  const displayRef = useRef('')
  const phaseRef = useRef<'delete' | 'type'>('type')

  useEffect(() => {
    let cancelled = false
    let timeoutId: number
    phaseRef.current = displayRef.current.length > 0 ? 'delete' : 'type'

    function tick() {
      if (cancelled) return
      if (phaseRef.current === 'delete') {
        const current = displayRef.current
        if (current.length > 0) {
          const next = current.slice(0, -1)
          displayRef.current = next
          setDisplay(next)
          timeoutId = window.setTimeout(tick, 20)
          return
        }
        phaseRef.current = 'type'
      }
      const current = displayRef.current
      if (current.length < target.length) {
        const next = target.slice(0, current.length + 1)
        displayRef.current = next
        setDisplay(next)
        timeoutId = window.setTimeout(tick, 35)
      }
    }

    tick()
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [target])

  return display
}
