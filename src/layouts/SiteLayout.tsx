import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { Outlet } from 'react-router-dom'
import { BootSequence } from '../components/BootSequence'
import { SiteNav } from '../components/SiteNav'
import { CommandPalette } from '../components/CommandPalette'
import { containerVariants, sectionVariants } from '../lib/motionVariants'

const BOOT_SESSION_KEY = 'thrax-site:booted'

// Owns the boot-sequence gate and the shared nav so every public page gets
// both regardless of which one is entered first — this used to live in the
// software-stack page back when it was the site's only public route.
export function SiteLayout() {
  const [showBoot, setShowBoot] = useState(() => !window.sessionStorage.getItem(BOOT_SESSION_KEY))
  const [paletteOpen, setPaletteOpen] = useState(false)

  function handleBootComplete() {
    window.sessionStorage.setItem(BOOT_SESSION_KEY, '1')
    setShowBoot(false)
  }

  // Global Cmd+K / Ctrl+K listener for the command palette — mounted once,
  // live from first paint (not gated behind the boot sequence completing),
  // same window-keydown-effect shape as ItemDetail's Escape handler.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {showBoot ? (
          <BootSequence key="boot" onComplete={handleBootComplete} />
        ) : (
          <motion.main
            key="main"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto flex min-h-svh max-w-5xl flex-col gap-8 p-6"
          >
            <motion.div variants={sectionVariants}>
              <SiteNav onOpenPalette={() => setPaletteOpen(true)} />
            </motion.div>
            <Outlet />
          </motion.main>
        )}
      </AnimatePresence>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </MotionConfig>
  )
}
