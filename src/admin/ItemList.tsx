import type { ReactNode } from 'react'
import type { TechItem } from '../types/item'
import { Icon } from '../components/Icon'

interface ItemListProps {
  items: TechItem[]
  editingItemId: string | null
  editForm: ReactNode
  onEdit: (item: TechItem) => void
  onDelete: (item: TechItem) => void
}

export function ItemList({ items, editingItemId, editForm, onEdit, onDelete }: ItemListProps) {
  if (items.length === 0) return <p className="text-sm text-muted">No items yet.</p>

  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((item) =>
        item.id === editingItemId ? (
          <li key={item.id} className="py-2">
            {editForm}
          </li>
        ) : (
          <li key={item.id} className="flex items-center gap-3 py-2">
            <Icon icon={item.icon} className="size-6" />
            <span className="flex-1 text-sm font-medium text-fg">{item.name}</span>
            <span className="text-xs text-muted">{item.tags.join(', ')}</span>
            <button type="button" onClick={() => onEdit(item)} className="text-sm text-accent hover:underline">
              Edit
            </button>
            <button type="button" onClick={() => onDelete(item)} className="text-sm text-red-400 hover:underline">
              Delete
            </button>
          </li>
        ),
      )}
    </ul>
  )
}
