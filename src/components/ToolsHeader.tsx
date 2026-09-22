import { useTypewriter } from '../hooks/useTypewriter'
import { TerminalWindow } from './TerminalWindow'

interface ToolsHeaderProps {
  toolCount: number
}

export function ToolsHeader({ toolCount }: ToolsHeaderProps) {
  const displayedShell = useTypewriter('--tools')

  return (
    <TerminalWindow>
      <p>
        <span className="text-muted">OS:</span> Browser Tools
      </p>
      <p>
        <span className="text-muted">Tools:</span> {toolCount} available
      </p>
      <p>
        <span className="text-muted">Shell:</span> {displayedShell}
        <span className="terminal-cursor text-accent">|</span>
      </p>
    </TerminalWindow>
  )
}
