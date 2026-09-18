import type { ReactNode } from 'react'

interface TerminalWindowProps {
  children: ReactNode
}

// Shared bordered "terminal window" chrome (window dots, visitor@thrax-site
// prompt, dashed separator) used by every page header — FetchHeader,
// WhoamiHeader, and the CV/Projects/Blog/Hardware headers below. Owns only
// the chrome; callers pass their own info-row <p> elements as children.
export function TerminalWindow({ children }: TerminalWindowProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface font-mono text-sm">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
      </div>
      <div className="flex flex-col gap-1 px-4 py-3">
        <p className="text-accent">visitor@thrax-site</p>
        <p className="text-muted">-------------------</p>
        {children}
      </div>
    </div>
  )
}
