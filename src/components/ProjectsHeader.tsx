import { useTypewriter } from '../hooks/useTypewriter'
import { TerminalWindow } from './TerminalWindow'

interface ProjectsHeaderProps {
  repoCount: number
}

export function ProjectsHeader({ repoCount }: ProjectsHeaderProps) {
  const displayedShell = useTypewriter('--projects')

  return (
    <TerminalWindow>
      <p>
        <span className="text-muted">OS:</span> Public Repositories
      </p>
      <p>
        <span className="text-muted">Repos:</span> {repoCount} tracked
      </p>
      <p>
        <span className="text-muted">Shell:</span> {displayedShell}
        <span className="terminal-cursor text-accent">|</span>
      </p>
    </TerminalWindow>
  )
}
