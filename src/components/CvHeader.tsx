import { cv } from '../data/cv'
import { useTypewriter } from '../hooks/useTypewriter'
import { TerminalWindow } from './TerminalWindow'

export function CvHeader() {
  const displayedShell = useTypewriter('--cv')

  return (
    <TerminalWindow>
      <p>
        <span className="text-muted">OS:</span> Curriculum Vitae
      </p>
      <p>
        <span className="text-muted">Skills:</span> {cv.skills.length} listed
      </p>
      <p>
        <span className="text-muted">Shell:</span> {displayedShell}
        <span className="terminal-cursor text-accent">|</span>
      </p>
    </TerminalWindow>
  )
}
