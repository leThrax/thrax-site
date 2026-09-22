import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { TOOLS } from '../data/tools'
import { ToolsHeader } from '../components/ToolsHeader'
import { sectionVariants } from '../lib/motionVariants'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function ToolsIndexPage() {
  useDocumentTitle('thrax-site — Tools')

  return (
    <>
      <motion.div variants={sectionVariants}>
        <ToolsHeader toolCount={TOOLS.length} />
      </motion.div>

      <motion.div variants={sectionVariants} className="flex flex-col gap-4">
        <h1 className="font-mono text-xs font-semibold tracking-wide text-muted uppercase">
          <span className="text-accent">❯</span> Tools
        </h1>
        <div className="flex flex-col gap-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              to={`/tools/${tool.slug}`}
              className="group flex flex-col gap-1 rounded-md border border-border bg-surface p-4 transition-colors hover:border-accent hover:shadow-[0_0_16px_rgba(126,231,135,0.2)] focus-visible:border-accent focus-visible:outline-none"
            >
              <span className="font-mono text-sm font-medium text-fg">
                {tool.name}
                <span className="cursor-blink text-accent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                  _
                </span>
              </span>
              <span className="text-sm text-muted">{tool.description}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </>
  )
}
