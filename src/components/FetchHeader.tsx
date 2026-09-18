import type { FilterGroup } from '../types/filter'
import type { SelectedTagsByGroup } from '../lib/filtering'
import { useTypewriter } from '../hooks/useTypewriter'
import { TerminalWindow } from './TerminalWindow'

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
    <TerminalWindow>
      <p>
        <span className="text-muted">OS:</span> Personal Software Stack
      </p>
      <p>
        <span className="text-muted">Tools:</span> {itemCount} tracked
      </p>
      <p>
        <span className="text-muted">Shell:</span> {displayedShell}
        <span className="terminal-cursor text-accent">|</span>
      </p>
    </TerminalWindow>
  )
}
