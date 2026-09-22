import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { TOOLS } from '../data/tools'
import { sectionVariants } from '../lib/motionVariants'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ToolPageHeader } from '../components/ToolPageHeader'

export function ToolPage() {
  const { slug } = useParams<{ slug: string }>()
  const tool = TOOLS.find((t) => t.slug === slug)
  useDocumentTitle(tool ? `thrax-site — ${tool.name}` : 'thrax-site — Tools')

  if (!tool) {
    return (
      <motion.div variants={sectionVariants} className="flex flex-col gap-2">
        <p className="font-mono text-sm text-red-400">Tool not found: {slug}</p>
        <Link to="/tools" className="font-mono text-sm text-accent hover:underline">
          ← back to tools
        </Link>
      </motion.div>
    )
  }

  const ToolComponent = tool.component

  return (
    <motion.article variants={sectionVariants} className="flex flex-col gap-4">
      <ToolPageHeader tool={tool} />
      <Link to="/tools" className="font-mono text-sm text-accent hover:underline">
        ← back to tools
      </Link>
      <ToolComponent />
    </motion.article>
  )
}
