interface FilterChipProps {
  id: string
  label: string
  selected: boolean
  onToggle: () => void
}

export function FilterChip({ id, label, selected, onToggle }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={onToggle}
      className={
        selected
          ? 'rounded border border-accent bg-accent/10 px-2 py-1 font-mono text-xs text-accent transition-colors'
          : 'rounded border border-border px-2 py-1 font-mono text-xs text-muted transition-colors hover:border-accent-2 hover:text-fg'
      }
    >
      --{id}
    </button>
  )
}
