import type { Tool } from '../data/tools'
import { useTypewriter } from '../hooks/useTypewriter'
import { TerminalWindow } from './TerminalWindow'

interface ToolPageHeaderProps {
  tool: Tool
}

export function ToolPageHeader({ tool }: ToolPageHeaderProps) {
  const displayedShell = useTypewriter(`--tool=${tool.slug}`)

  return (
    <TerminalWindow>
      <p>
        <span className="text-muted">OS:</span> {tool.name}
      </p>
      <p>
        <span className="text-muted">About:</span> {tool.description}
      </p>
      <p>
        <span className="text-muted">Shell:</span> {displayedShell}
        <span className="terminal-cursor text-accent">|</span>
      </p>
    </TerminalWindow>
  )
}
