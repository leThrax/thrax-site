import type { TechItem } from '../types/item'
import { ItemGrid } from './ItemGrid'

interface CategorySectionProps {
  label: string
  items: TechItem[]
  onSelect: (item: TechItem) => void
}

export function CategorySection({ label, items, onSelect }: CategorySectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-xs font-semibold tracking-wide text-muted uppercase">
        <span className="text-accent">❯</span> {label}
      </h2>
      <ItemGrid items={items} onSelect={onSelect} />
    </section>
  )
}
