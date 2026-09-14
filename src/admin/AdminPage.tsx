import { useState } from 'react'
import { useSession } from '../hooks/useSession'
import { useItems } from '../hooks/useItems'
import { useTags } from '../hooks/useTags'
import { useCategories } from '../hooks/useCategories'
import { usePosts } from '../hooks/usePosts'
import { usePinnedRepos } from '../hooks/usePinnedRepos'
import { useDevices } from '../hooks/useDevices'
import { createItem, deleteItem, updateItem } from '../lib/items'
import { createTag, deleteTag } from '../lib/tags'
import { createCategory, deleteCategory } from '../lib/categories'
import { createPost, deletePost, updatePost } from '../lib/posts'
import { createPinnedRepo, deletePinnedRepo } from '../lib/pinnedRepos'
import { createDevice, deleteDevice, updateDevice } from '../lib/devices'
import { supabase } from '../lib/supabaseClient'
import { filterGroups } from '../data/filterTags'
import { slugify } from '../lib/slugify'
import type { TechItem } from '../types/item'
import type { FilterTag } from '../types/filter'
import type { Category } from '../types/category'
import type { Post } from '../types/post'
import type { Device } from '../types/device'
import { LoginForm } from './LoginForm'
import { ItemList } from './ItemList'
import { ItemForm } from './ItemForm'
import { PostList } from './PostList'
import { PostForm } from './PostForm'
import { PinnedRepoList } from './PinnedRepoList'
import { DeviceList } from './DeviceList'
import { DeviceForm } from './DeviceForm'

type Tab = 'items' | 'posts' | 'projects' | 'hardware'

export function AdminPage() {
  const { session, loading: sessionLoading } = useSession()
  const { items, loading: itemsLoading, error, refetch } = useItems()
  const { tags, refetch: refetchTags } = useTags()
  const { categories, refetch: refetchCategories } = useCategories()
  const { posts, loading: postsLoading, error: postsError, refetch: refetchPosts } = usePosts()
  const { pinnedRepoIds, error: pinnedReposError, refetch: refetchPinnedRepos } = usePinnedRepos()
  const { devices, loading: devicesLoading, error: devicesError, refetch: refetchDevices } = useDevices()
  const [activeTab, setActiveTab] = useState<Tab>('items')
  const [editingItem, setEditingItem] = useState<TechItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [showPostForm, setShowPostForm] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [showDeviceForm, setShowDeviceForm] = useState(false)

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

  async function handleSubmitPost(post: Post) {
    if (editingPost) await updatePost(post)
    else await createPost(post)
    setShowPostForm(false)
    setEditingPost(null)
    refetchPosts()
  }

  async function handleDeletePost(post: Post) {
    if (!window.confirm(`Delete "${post.title}"?`)) return
    await deletePost(post.id)
    refetchPosts()
  }

  async function handleCreatePinnedRepo(id: string) {
    await createPinnedRepo(id)
    refetchPinnedRepos()
  }

  async function handleDeletePinnedRepo(id: string) {
    if (!window.confirm(`Unpin "${id}"?`)) return
    await deletePinnedRepo(id)
    refetchPinnedRepos()
  }

  async function handleSubmitDevice(device: Device) {
    if (editingDevice) await updateDevice(device)
    else await createDevice(device)
    setShowDeviceForm(false)
    setEditingDevice(null)
    refetchDevices()
  }

  async function handleDeleteDevice(device: Device) {
    if (!window.confirm(`Delete "${device.name}"?`)) return
    await deleteDevice(device.id)
    refetchDevices()
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

      <div className="flex gap-1 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`px-3 py-1.5 text-sm ${
            activeTab === 'items' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-accent-2'
          }`}
        >
          Items
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`px-3 py-1.5 text-sm ${
            activeTab === 'posts' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-accent-2'
          }`}
        >
          Posts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`px-3 py-1.5 text-sm ${
            activeTab === 'projects' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-accent-2'
          }`}
        >
          Projects
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hardware')}
          className={`px-3 py-1.5 text-sm ${
            activeTab === 'hardware' ? 'border-b-2 border-accent text-accent' : 'text-muted hover:text-accent-2'
          }`}
        >
          Hardware
        </button>
      </div>

      {activeTab === 'items' ? (
        <>
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
        </>
      ) : activeTab === 'posts' ? (
        <>
          {postsError && <p className="text-sm text-red-400">{postsError}</p>}

          {showPostForm && !editingPost ? (
            <PostForm
              onSubmit={handleSubmitPost}
              onCancel={() => {
                setShowPostForm(false)
                setEditingPost(null)
              }}
            />
          ) : showPostForm ? null : (
            <button
              type="button"
              onClick={() => {
                setEditingPost(null)
                setShowPostForm(true)
              }}
              className="self-start rounded border border-accent bg-accent/10 px-3 py-1 text-sm font-medium text-accent"
            >
              Add post
            </button>
          )}

          {postsLoading ? (
            <p className="text-sm text-muted">Loading posts…</p>
          ) : (
            <PostList
              posts={posts}
              editingPostId={showPostForm && editingPost ? editingPost.id : null}
              editForm={
                <PostForm
                  initialPost={editingPost ?? undefined}
                  onSubmit={handleSubmitPost}
                  onCancel={() => {
                    setShowPostForm(false)
                    setEditingPost(null)
                  }}
                />
              }
              onEdit={(post) => {
                setEditingPost(post)
                setShowPostForm(true)
              }}
              onDelete={handleDeletePost}
            />
          )}
        </>
      ) : activeTab === 'projects' ? (
        <>
          {pinnedReposError && <p className="text-sm text-red-400">{pinnedReposError}</p>}
          <PinnedRepoList
            pinnedRepoIds={pinnedRepoIds}
            onCreate={handleCreatePinnedRepo}
            onDelete={handleDeletePinnedRepo}
          />
        </>
      ) : (
        <>
          {devicesError && <p className="text-sm text-red-400">{devicesError}</p>}

          {showDeviceForm && !editingDevice ? (
            <DeviceForm
              onSubmit={handleSubmitDevice}
              onCancel={() => {
                setShowDeviceForm(false)
                setEditingDevice(null)
              }}
            />
          ) : showDeviceForm ? null : (
            <button
              type="button"
              onClick={() => {
                setEditingDevice(null)
                setShowDeviceForm(true)
              }}
              className="self-start rounded border border-accent bg-accent/10 px-3 py-1 text-sm font-medium text-accent"
            >
              Add device
            </button>
          )}

          {devicesLoading ? (
            <p className="text-sm text-muted">Loading devices…</p>
          ) : (
            <DeviceList
              devices={devices}
              editingDeviceId={showDeviceForm && editingDevice ? editingDevice.id : null}
              editForm={
                <DeviceForm
                  initialDevice={editingDevice ?? undefined}
                  onSubmit={handleSubmitDevice}
                  onCancel={() => {
                    setShowDeviceForm(false)
                    setEditingDevice(null)
                  }}
                />
              }
              onEdit={(device) => {
                setEditingDevice(device)
                setShowDeviceForm(true)
              }}
              onDelete={handleDeleteDevice}
            />
          )}
        </>
      )}
    </main>
  )
}
