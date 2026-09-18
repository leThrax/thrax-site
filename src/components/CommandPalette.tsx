import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { NAV_LINKS } from '../data/navLinks'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

const DESTINATIONS = [{ path: '/', label: 'Home' }, ...NAV_LINKS]

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()

  const q = query.trim().toLowerCase()
  const filtered = q ? DESTINATIONS.filter((d) => d.label.toLowerCase().includes(q)) : DESTINATIONS

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => (filtered.length === 0 ? 0 : (i + 1) % filtered.length))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => (filtered.length === 0 ? 0 : (i - 1 + filtered.length) % filtered.length))
      } else if (e.key === 'Enter') {
        const target = filtered[activeIndex]
        if (target) {
          navigate(target.path)
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, activeIndex, filtered, navigate, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-32"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-md flex-col gap-3 rounded-md border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-accent">❯</span>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActiveIndex(0)
                }}
                placeholder="jump to..."
                className="flex-1 border-b border-border bg-transparent px-1 py-1 text-fg placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              {filtered.length === 0 ? (
                <p className="font-mono text-sm text-muted">no matches</p>
              ) : (
                filtered.map((destination, index) => (
                  <button
                    key={destination.path}
                    type="button"
                    onClick={() => {
                      navigate(destination.path)
                      onClose()
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={
                      index === activeIndex
                        ? 'rounded border border-accent bg-accent/10 px-3 py-1.5 text-left font-mono text-sm text-accent'
                        : 'rounded border border-border px-3 py-1.5 text-left font-mono text-sm text-fg transition-colors hover:border-accent-2'
                    }
                  >
                    {destination.label}
                  </button>
                ))
              )}
            </div>

            <p className="font-mono text-xs text-muted">[↑↓] navigate  [enter] open  [esc] close</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
