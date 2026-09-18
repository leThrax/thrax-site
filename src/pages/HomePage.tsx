import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { WhoamiHeader } from '../components/WhoamiHeader'
import { NAV_LINKS } from '../data/navLinks'
import { sectionVariants } from '../lib/motionVariants'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function HomePage() {
  useDocumentTitle('thrax-site')

  return (
    <>
      <motion.div variants={sectionVariants}>
        <WhoamiHeader />
      </motion.div>

      <motion.div variants={sectionVariants} className="font-mono text-sm text-muted">
        <span className="text-accent">❯</span> Personal site — software stack, CV, projects, and a blog, all in
        one place.
      </motion.div>

      <motion.div
        variants={sectionVariants}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="group flex flex-col gap-2 rounded-md border border-border bg-surface p-4 transition-colors hover:border-accent hover:shadow-[0_0_16px_rgba(126,231,135,0.2)] focus-visible:border-accent focus-visible:outline-none"
          >
            <span className="font-mono text-sm font-medium text-fg">
              {link.label}
              <span className="cursor-blink text-accent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                _
              </span>
            </span>
            <span className="text-sm text-muted">{link.description}</span>
          </Link>
        ))}
      </motion.div>
    </>
  )
}
