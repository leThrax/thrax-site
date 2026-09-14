import type { ReactNode } from 'react'
import type { Post } from '../types/post'

interface PostListProps {
  posts: Post[]
  editingPostId: string | null
  editForm: ReactNode
  onEdit: (post: Post) => void
  onDelete: (post: Post) => void
}

export function PostList({ posts, editingPostId, editForm, onEdit, onDelete }: PostListProps) {
  if (posts.length === 0) return <p className="text-sm text-muted">No posts yet.</p>

  return (
    <ul className="flex flex-col divide-y divide-border">
      {posts.map((post) =>
        post.id === editingPostId ? (
          <li key={post.id} className="py-2">
            {editForm}
          </li>
        ) : (
          <li key={post.id} className="flex items-center gap-3 py-2">
            <span className="flex-1 text-sm font-medium text-fg">{post.title}</span>
            <span className="text-xs text-muted">{post.publishedAt ? 'published' : 'draft'}</span>
            <button type="button" onClick={() => onEdit(post)} className="text-sm text-accent hover:underline">
              Edit
            </button>
            <button type="button" onClick={() => onDelete(post)} className="text-sm text-red-400 hover:underline">
              Delete
            </button>
          </li>
        ),
      )}
    </ul>
  )
}
