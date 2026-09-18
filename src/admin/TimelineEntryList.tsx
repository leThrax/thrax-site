import { useEffect, useState, type ReactNode } from 'react'
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { TimelineEntry } from '../types/timeline'
import { formatDateRange } from '../lib/formatDateRange'

interface TimelineEntryListProps {
  entries: TimelineEntry[]
  editingEntryId: string | null
  editForm: ReactNode
  onEdit: (entry: TimelineEntry) => void
  onDelete: (entry: TimelineEntry) => void
  onReorder: (orderedIds: string[]) => void
}

interface SortableRowProps {
  entry: TimelineEntry
  isEditing: boolean
  editForm: ReactNode
  onEdit: (entry: TimelineEntry) => void
  onDelete: (entry: TimelineEntry) => void
}

function SortableRow({ entry, isEditing, editForm, onEdit, onDelete }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: entry.id,
    disabled: isEditing,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  if (isEditing) {
    return (
      <li ref={setNodeRef} style={style} className="py-2">
        {editForm}
      </li>
    )
  }

  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-3 py-2">
      <span
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-grab text-muted hover:text-accent-2 active:cursor-grabbing"
      >
        ⠿
      </span>
      <span className="flex-1 text-sm font-medium text-fg">
        {entry.role} <span className="text-muted">@ {entry.org}</span>
      </span>
      <span className="text-xs text-muted">{formatDateRange(entry.startDate, entry.endDate)}</span>
      <button type="button" onClick={() => onEdit(entry)} className="text-sm text-accent hover:underline">
        Edit
      </button>
      <button type="button" onClick={() => onDelete(entry)} className="text-sm text-red-400 hover:underline">
        Delete
      </button>
    </li>
  )
}

export function TimelineEntryList({
  entries,
  editingEntryId,
  editForm,
  onEdit,
  onDelete,
  onReorder,
}: TimelineEntryListProps) {
  // Local display order, seeded from the `entries` prop and reconciled
  // whenever it changes. Drag-and-drop needs instant visual feedback that
  // can't wait for the persist-then-refetch round trip, so this is the one
  // list in the app that optimistically reorders ahead of server
  // confirmation — everywhere else waits for refetch() after a mutation.
  const [displayOrder, setDisplayOrder] = useState(entries)
  useEffect(() => setDisplayOrder(entries), [entries])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = displayOrder.findIndex((entry) => entry.id === active.id)
    const newIndex = displayOrder.findIndex((entry) => entry.id === over.id)
    const reordered = arrayMove(displayOrder, oldIndex, newIndex)
    setDisplayOrder(reordered)
    onReorder(reordered.map((entry) => entry.id))
  }

  if (entries.length === 0) return <p className="text-sm text-muted">No timeline entries yet.</p>

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
      <SortableContext items={displayOrder.map((entry) => entry.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col divide-y divide-border">
          {displayOrder.map((entry) => (
            <SortableRow
              key={entry.id}
              entry={entry}
              isEditing={entry.id === editingEntryId}
              editForm={editForm}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
