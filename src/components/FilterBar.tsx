import type { FilterGroup, FilterTag } from '../types/filter'
import { FilterChip } from './FilterChip'

interface FilterBarProps {
  groups: FilterGroup[]
  tags: FilterTag[]
  selected: Record<string, Set<string>>
  onToggle: (groupId: string, tagId: string) => void
}

export function FilterBar({ groups, tags, selected, onToggle }: FilterBarProps) {
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order)

  return (
    <div className="flex flex-col gap-3 font-mono">
      {sortedGroups.map((group) => (
        <div key={group.id} className="flex flex-wrap items-center gap-2">
          <span className="text-accent">❯</span>
          <span className="text-xs font-semibold tracking-wide text-muted uppercase">{group.label}</span>
          {tags
            .filter((tag) => tag.group === group.id)
            .map((tag) => (
              <FilterChip
                key={tag.id}
                id={tag.id}
                label={tag.label}
                selected={selected[group.id]?.has(tag.id) ?? false}
                onToggle={() => onToggle(group.id, tag.id)}
              />
            ))}
        </div>
      ))}
    </div>
  )
}
