import { useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { Outlet } from 'react-router-dom'
import { BootSequence } from '../components/BootSequence'
import { SiteNav } from '../components/SiteNav'
import { containerVariants, sectionVariants } from '../lib/motionVariants'

const BOOT_SESSION_KEY = 'thrax-site:booted'

// Owns the boot-sequence gate and the shared nav so every public page gets
// both regardless of which one is entered first — this used to live in the
// tech-stack page back when it was the site's only public route.
export function SiteLayout() {
  const [showBoot, setShowBoot] = useState(() => !window.sessionStorage.getItem(BOOT_SESSION_KEY))

  function handleBootComplete() {
    window.sessionStorage.setItem(BOOT_SESSION_KEY, '1')
    setShowBoot(false)
  }

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
              <SiteNav />
            </motion.div>
            <Outlet />
          </motion.main>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
