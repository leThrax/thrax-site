import { useTypewriter } from '../hooks/useTypewriter'

// Same bordered "terminal window" treatment as FetchHeader, but showing
// site/owner info instead of filter state — kept separate since FetchHeader
// stays specific to the software-stack page's filter flags.
export function WhoamiHeader() {
  const displayedShell = useTypewriter('whoami')

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
      </div>
    </div>
  )
}
