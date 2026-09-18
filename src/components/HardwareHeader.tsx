import { useTypewriter } from '../hooks/useTypewriter'
import { TerminalWindow } from './TerminalWindow'

interface HardwareHeaderProps {
  deviceCount: number
  selectedDeviceId?: string
}

// Shell: line mirrors FetchHeader's filter-driven mechanism exactly, keyed
// on the selected device id instead of joined filter flags: changing
// selectedDeviceId changes useTypewriter's target, which re-runs its effect
// and replays the delete-then-retype animation automatically.
export function HardwareHeader({ deviceCount, selectedDeviceId }: HardwareHeaderProps) {
  const displayedShell = useTypewriter(selectedDeviceId ? `--${selectedDeviceId}` : '--none')

  return (
    <TerminalWindow>
      <p>
        <span className="text-muted">OS:</span> Personal Hardware
      </p>
      <p>
        <span className="text-muted">Devices:</span> {deviceCount} tracked
      </p>
      <p>
        <span className="text-muted">Shell:</span> {displayedShell}
        <span className="terminal-cursor text-accent">|</span>
      </p>
    </TerminalWindow>
  )
}
