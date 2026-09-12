interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="flex items-center gap-2 font-mono text-sm">
      <span className="text-accent">❯</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="search tools..."
        className="flex-1 border-b border-border bg-transparent px-1 py-1 text-fg placeholder:text-muted focus:border-accent focus:outline-none"
      />
    </div>
  )
}
