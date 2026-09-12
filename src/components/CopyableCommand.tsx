import { useState } from 'react'

interface CopyableCommandProps {
  command: string
}

export function CopyableCommand({ command }: CopyableCommandProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can fail (e.g. no permission) — nothing sensible to
      // do beyond not showing a false "Copied!" confirmation.
    }
  }

  return (
    <div className="flex items-center gap-2 rounded border border-border bg-bg px-2 py-1 font-mono text-xs">
      <span className="flex-1 overflow-x-auto whitespace-pre text-fg">
        <span className="text-accent">$</span> {command}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 text-muted hover:text-accent"
        aria-label="Copy command"
      >
        {copied ? 'Copied!' : 'copy'}
      </button>
    </div>
  )
}
