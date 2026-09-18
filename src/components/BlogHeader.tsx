import { useTypewriter } from '../hooks/useTypewriter'
import { TerminalWindow } from './TerminalWindow'

interface BlogHeaderProps {
  postCount: number
}

export function BlogHeader({ postCount }: BlogHeaderProps) {
  const displayedShell = useTypewriter('--blog')

  return (
    <TerminalWindow>
      <p>
        <span className="text-muted">OS:</span> Tutorials & Reviews
      </p>
      <p>
        <span className="text-muted">Posts:</span> {postCount} tracked
      </p>
      <p>
        <span className="text-muted">Shell:</span> {displayedShell}
        <span className="terminal-cursor text-accent">|</span>
      </p>
    </TerminalWindow>
  )
}
