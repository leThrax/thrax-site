import type { FilterGroup } from '../types/filter'
import type { SelectedTagsByGroup } from '../lib/filtering'
import { useTypewriter } from '../hooks/useTypewriter'

interface FetchHeaderProps {
  itemCount: number
  groups: FilterGroup[]
  selected: SelectedTagsByGroup
}

export function FetchHeader({ itemCount, groups, selected }: FetchHeaderProps) {
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order)

  const shellFlags = sortedGroups
    .map((group) => {
      const tagIds = selected[group.id]
      if (!tagIds || tagIds.size === 0) return null
      return `--${group.id}=${[...tagIds].join(',')}`
    })
    .filter(Boolean)
    .join(' ')

  const displayedShell = useTypewriter(shellFlags || '--all')

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
          <span className="text-muted">OS:</span> Personal Tech Stack
        </p>
        <p>
          <span className="text-muted">Tools:</span> {itemCount} tracked
        </p>
        <p>
          <span className="text-muted">Shell:</span> {displayedShell}
          <span className="terminal-cursor text-accent">|</span>
        </p>
      </div>
    </div>
  )
}
