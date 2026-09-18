import { useTypewriter } from '../hooks/useTypewriter'
import { TerminalWindow } from './TerminalWindow'

// Same terminal-window content as every other page's header (see
// TerminalWindow.tsx for the shared chrome), but showing static site/owner
// info instead of filter state or fetched data — kept as its own component
// since it has no props/dynamic data, unlike FetchHeader.
export function WhoamiHeader() {
  const displayedShell = useTypewriter('whoami')

  return (
    <TerminalWindow>
      <p>
        <span className="text-muted">User:</span> tim w. aka thrax
      </p>
      <p>
        <span className="text-muted">Role:</span> bachelor informatics student
      </p>
      <p>
        <span className="text-muted">Site:</span> software stack, CV, projects, blog
      </p>
      <p>
        <span className="text-muted">Shell:</span> {displayedShell}
        <span className="terminal-cursor text-accent">|</span>
      </p>
    </TerminalWindow>
  )
}
