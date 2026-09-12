import { useState } from 'react'
import type { Category } from '../types/category'
import { slugify } from '../lib/slugify'

interface CategoryPickerProps {
  categories: Category[]
  selectedId?: string
  onChange: (id: string | undefined) => void
  onCreateCategory: (label: string) => Promise<void>
  onDeleteCategory: (category: Category) => Promise<boolean>
}

export function CategoryPicker({
  categories,
  selectedId,
  onChange,
  onCreateCategory,
  onDeleteCategory,
}: CategoryPickerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function toggleCategory(id: string) {
    onChange(selectedId === id ? undefined : id)
  }

  async function handleDeleteCategory(category: Category) {
    setDeleteError(null)
    try {
      const deleted = await onDeleteCategory(category)
      if (deleted && selectedId === category.id) onChange(undefined)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete category.')
    }
  }

  async function handleCreateCategory() {
    setCreateError(null)
    const label = newLabel.trim()
    if (!label) {
      setCreateError('Enter a category name.')
      return
    }
    const id = slugify(label)
    setCreating(true)
    try {
      await onCreateCategory(label)
      onChange(id)
      setNewLabel('')
      setShowAddForm(false)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Could not create category.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="text-fg">Category</span>

      <div className="flex flex-col gap-2 rounded border border-border p-2">
        <div className="flex flex-wrap items-center gap-1">
          {categories.length === 0 && <span className="text-xs text-muted">No categories yet.</span>}
          {categories.map((category) => {
            const selected = selectedId === category.id
            return (
              <span
                key={category.id}
                className={
                  selected
                    ? 'group inline-flex shrink-0 items-center rounded border border-accent bg-accent/10 text-accent transition-colors'
                    : 'group inline-flex shrink-0 items-center rounded border border-border text-muted transition-colors hover:border-accent-2'
                }
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="px-2 py-0.5 text-xs font-medium"
                >
                  {category.label}
                </button>
                <span className="flex items-center pointer-events-none opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
                  <span className={selected ? 'h-3 w-px bg-accent/40' : 'h-3 w-px bg-border'} />
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(category)}
                    aria-label={`Delete category ${category.label}`}
                    title="Delete category"
                    className="px-1.5 text-xs text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              </span>
            )
          })}
        </div>

        {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}

        {showAddForm ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCreateCategory()
                }
              }}
              placeholder="New category name"
              className="rounded border border-border bg-surface px-2 py-1 text-xs text-fg"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={creating}
              className="rounded border border-accent bg-accent/10 px-2 py-1 text-xs font-medium text-accent disabled:opacity-50"
            >
              {creating ? 'Adding…' : 'Add'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-muted">
              Cancel
            </button>
            {createError && <span className="text-xs text-red-400">{createError}</span>}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="self-start rounded border border-dashed border-border px-2 py-0.5 text-xs text-muted"
          >
            + New category
          </button>
        )}
      </div>
    </div>
  )
}
