import { useState } from 'react'
import type { FilterGroup, FilterTag } from '../types/filter'
import { slugify } from '../lib/slugify'

interface TagPickerProps {
  groups: FilterGroup[]
  allTags: FilterTag[]
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
  onCreateTag: (label: string, group: string) => Promise<void>
  onDeleteTag: (tag: FilterTag) => Promise<boolean>
}

export function TagPicker({ groups, allTags, selectedTagIds, onChange, onCreateTag, onDeleteTag }: TagPickerProps) {
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newGroup, setNewGroup] = useState(sortedGroups[0]?.id ?? '')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function toggleTag(tagId: string) {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }

  function labelFor(tagId: string): string {
    return allTags.find((t) => t.id === tagId)?.label ?? tagId
  }

  async function handleDeleteTag(tag: FilterTag) {
    setDeleteError(null)
    try {
      const deleted = await onDeleteTag(tag)
      if (deleted) onChange(selectedTagIds.filter((id) => id !== tag.id))
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete tag.')
    }
  }

  async function handleCreateTag() {
    setCreateError(null)
    const label = newLabel.trim()
    if (!label) {
      setCreateError('Enter a tag name.')
      return
    }
    const id = slugify(label)
    setCreating(true)
    try {
      await onCreateTag(label, newGroup)
      onChange([...selectedTagIds, id])
      setNewLabel('')
      setShowAddForm(false)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Could not create tag.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="text-fg">Tags</span>

      <div className="flex flex-wrap gap-1">
        {selectedTagIds.length === 0 && <span className="text-xs text-muted">No tags yet.</span>}
        {selectedTagIds.map((tagId) => (
          <span
            key={tagId}
            className="flex items-center gap-1 rounded border border-accent bg-accent/10 px-2 py-0.5 text-xs text-accent"
          >
            {labelFor(tagId)}
            <button
              type="button"
              onClick={() => toggleTag(tagId)}
              aria-label={`Remove ${labelFor(tagId)}`}
              className="leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded border border-border p-2">
        {sortedGroups.map((group) => (
          <div key={group.id} className="flex flex-wrap items-center gap-1">
            <span className="text-xs font-semibold tracking-wide text-muted uppercase">{group.label}</span>
            {allTags
              .filter((tag) => tag.group === group.id)
              .map((tag) => {
                const selected = selectedTagIds.includes(tag.id)
                return (
                  <span
                    key={tag.id}
                    className={
                      selected
                        ? 'group inline-flex shrink-0 items-center rounded border border-accent bg-accent/10 text-accent transition-colors'
                        : 'group inline-flex shrink-0 items-center rounded border border-border text-muted transition-colors hover:border-accent-2'
                    }
                  >
                    <button
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="px-2 py-0.5 text-xs font-medium"
                    >
                      {tag.label}
                    </button>
                    <span className="flex items-center pointer-events-none opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
                      <span className={selected ? 'h-3 w-px bg-accent/40' : 'h-3 w-px bg-border'} />
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag)}
                        aria-label={`Delete tag ${tag.label}`}
                        title="Delete tag"
                        className="px-1.5 text-xs text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  </span>
                )
              })}
          </div>
        ))}

        {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}

        {showAddForm ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCreateTag()
                }
              }}
              placeholder="New tag name"
              className="rounded border border-border bg-surface px-2 py-1 text-xs text-fg"
            />
            <select
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              className="rounded border border-border bg-surface px-2 py-1 text-xs text-fg"
            >
              {sortedGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCreateTag}
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
            + New tag
          </button>
        )}
      </div>
    </div>
  )
}
