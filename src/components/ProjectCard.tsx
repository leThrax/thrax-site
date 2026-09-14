import { motion } from 'motion/react'
import type { GithubRepo } from '../types/github'

interface ProjectCardProps {
  repo: GithubRepo
}

export function ProjectCard({ repo }: ProjectCardProps) {
  return (
    <motion.a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col gap-2 rounded-md border border-border bg-surface p-4 transition-colors hover:border-accent hover:shadow-[0_0_16px_rgba(126,231,135,0.2)] focus-visible:border-accent focus-visible:outline-none"
    >
      <span className="font-mono text-sm font-medium text-fg">
        {repo.name}
        <span className="cursor-blink text-accent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
          _
        </span>
      </span>
      {repo.description && <span className="text-sm text-muted">{repo.description}</span>}
      <span className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
        {repo.language && <span>{repo.language}</span>}
        <span>★ {repo.stars}</span>
        {repo.contributor && <span className="text-accent-2">contributor</span>}
      </span>
    </motion.a>
  )
}
