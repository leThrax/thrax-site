import { useState } from 'react'
import { useSession } from '../hooks/useSession'
import { useItems } from '../hooks/useItems'
import { useTags } from '../hooks/useTags'
import { useCategories } from '../hooks/useCategories'
import { createItem, deleteItem, updateItem } from '../lib/items'
import { createTag, deleteTag } from '../lib/tags'
import { createCategory, deleteCategory } from '../lib/categories'
import { supabase } from '../lib/supabaseClient'
import { filterGroups } from '../data/filterTags'
import { slugify } from '../lib/slugify'
import type { TechItem } from '../types/item'
import type { FilterTag } from '../types/filter'
import type { Category } from '../types/category'
import { LoginForm } from './LoginForm'
import { ItemList } from './ItemList'
import { ItemForm } from './ItemForm'

export function AdminPage() {
  const { session, loading: sessionLoading } = useSession()
  const { items, loading: itemsLoading, error, refetch } = useItems()
  const { tags, refetch: refetchTags } = useTags()
  const { categories, refetch: refetchCategories } = useCategories()
  const [editingItem, setEditingItem] = useState<TechItem | null>(null)
  const [showForm, setShowForm] = useState(false)

  if (sessionLoading) return <p className="p-6 font-mono text-sm text-muted">Loading…</p>
  if (!session) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-bg p-6">
        <LoginForm />
      </main>
    )
  }

  async function handleSubmit(item: TechItem) {
    if (editingItem) await updateItem(item)
    else await createItem(item)
    setShowForm(false)
    setEditingItem(null)
    refetch()
  }

  async function handleDelete(item: TechItem) {
    if (!window.confirm(`Delete "${item.name}"?`)) return
    await deleteItem(item.id)
    refetch()
  }

  async function handleCreateTag(label: string, group: string) {
    await createTag({ id: slugify(label), label, group })
    refetchTags()
  }

  async function handleDeleteTag(tag: FilterTag): Promise<boolean> {
    const affected = items.filter((item) => item.tags.includes(tag.id))
    const message =
      affected.length > 0
        ? `Delete tag "${tag.label}"? It will be removed from ${affected.length} item${affected.length === 1 ? '' : 's'}.`
        : `Delete tag "${tag.label}"?`
    if (!window.confirm(message)) return false

    for (const item of affected) {
      await updateItem({ ...item, tags: item.tags.filter((t) => t !== tag.id) })
    }
    await deleteTag(tag.id)
    refetch()
    refetchTags()
    return true
  }

  async function handleCreateCategory(label: string) {
    await createCategory({ id: slugify(label), label })
    refetchCategories()
  }

  async function handleDeleteCategory(category: Category): Promise<boolean> {
    const affected = items.filter((item) => item.category === category.id)
    const message =
      affected.length > 0
        ? `Delete category "${category.label}"? It will be removed from ${affected.length} item${affected.length === 1 ? '' : 's'}.`
        : `Delete category "${category.label}"?`
    if (!window.confirm(message)) return false

    for (const item of affected) {
      await updateItem({ ...item, category: undefined })
    }
    await deleteCategory(category.id)
    refetch()
    refetchCategories()
    return true
  }

  const formProps = {
    groups: filterGroups,
    allTags: tags,
    categories,
    onCreateTag: handleCreateTag,
    onDeleteTag: handleDeleteTag,
    onCreateCategory: handleCreateCategory,
    onDeleteCategory: handleDeleteCategory,
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-6 bg-bg p-6 font-mono">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-fg">Admin</h1>
        <button type="button" onClick={() => supabase.auth.signOut()} className="text-sm text-muted hover:underline">
          Sign out
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {showForm && !editingItem ? (
        <ItemForm
          {...formProps}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingItem(null)
          }}
        />
      ) : showForm ? null : (
        <button
          type="button"
          onClick={() => {
            setEditingItem(null)
            setShowForm(true)
          }}
          className="self-start rounded border border-accent bg-accent/10 px-3 py-1 text-sm font-medium text-accent"
        >
          Add item
        </button>
      )}

      {itemsLoading ? (
        <p className="text-sm text-muted">Loading items…</p>
      ) : (
        <ItemList
          items={items}
          editingItemId={showForm && editingItem ? editingItem.id : null}
          editForm={
            <ItemForm
              {...formProps}
              initialItem={editingItem ?? undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false)
                setEditingItem(null)
              }}
            />
          }
          onEdit={(item) => {
            setEditingItem(item)
            setShowForm(true)
          }}
          onDelete={handleDelete}
        />
      )}
    </main>
  )
}
