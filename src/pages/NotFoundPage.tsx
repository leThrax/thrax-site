import { Link, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { sectionVariants } from '../lib/motionVariants'

export function NotFoundPage() {
  const { pathname } = useLocation()
  useDocumentTitle('thrax-site — 404')

  return (
    <motion.div variants={sectionVariants} className="flex flex-col gap-2">
      <p className="font-mono text-sm text-red-400">command not found: {pathname}</p>
      <p className="font-mono text-sm text-muted">$ zsh: exit 127</p>
      <Link to="/" className="font-mono text-sm text-accent hover:underline">
        ← back home
      </Link>
    </motion.div>
  )
}
