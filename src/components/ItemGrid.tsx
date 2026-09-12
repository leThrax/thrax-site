import { AnimatePresence } from 'motion/react'
import type { TechItem } from '../types/item'
import { ItemCard } from './ItemCard'

interface ItemGridProps {
  items: TechItem[]
  onSelect: (item: TechItem) => void
}

export function ItemGrid({ items, onSelect }: ItemGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onSelect={onSelect} />
        ))}
      </AnimatePresence>
    </div>
  )
}
