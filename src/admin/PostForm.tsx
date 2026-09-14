import { useRef, useState, type FormEvent } from 'react'
import type { Post } from '../types/post'
import { slugify } from '../lib/slugify'
import { uploadPostMedia } from '../lib/storage'

interface PostFormProps {
  initialPost?: Post
  onSubmit: (post: Post) => Promise<void>
  onCancel: () => void
}

const inputClass = 'rounded border border-border bg-surface px-2 py-1 text-fg disabled:opacity-50'

export function PostForm({ initialPost, onSubmit, onCancel }: PostFormProps) {
  const isEditing = Boolean(initialPost)
  const [title, setTitle] = useState(initialPost?.title ?? '')
  const [manualId, setManualId] = useState(initialPost?.id ?? '')
  const [idTouched, setIdTouched] = useState(isEditing)
  const id = idTouched ? manualId : slugify(title)
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? '')
  const [body, setBody] = useState(initialPost?.body ?? '')
  const [published, setPublished] = useState(Boolean(initialPost?.publishedAt))
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)

  async function handleInsertMedia(file: File, kind: 'image' | 'video') {
    setMediaError(null)
    const setUploading = kind === 'image' ? setUploadingImage : setUploadingVideo
    setUploading(true)
    try {
      const url = await uploadPostMedia(id.trim() || 'draft', file)
      const snippet = kind === 'image' ? `![${file.name}](${url})\n` : `<video controls src="${url}"></video>\n`
      const textarea = bodyRef.current
      if (textarea) {
        const start = textarea.selectionStart ?? body.length
        const end = textarea.selectionEnd ?? body.length
        const next = body.slice(0, start) + snippet + body.slice(end)
        setBody(next)
        const cursor = start + snippet.length
        requestAnimationFrame(() => {
          textarea.focus()
          textarea.setSelectionRange(cursor, cursor)
        })
      } else {
        setBody((prev) => prev + (prev ? '\n' : '') + snippet)
      }
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!title.trim() || !id.trim()) {
      setFormError('Title and id are required.')
      return
    }
    if (!body.trim()) {
      setFormError('Body is required.')
      return
    }

    setSubmitting(true)
    try {
      const post: Post = {
        id: id.trim(),
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        body,
        publishedAt: published ? (initialPost?.publishedAt ?? new Date().toISOString()) : undefined,
      }
      await onSubmit(post)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4 font-mono"
    >
      <h2 className="text-lg font-medium text-fg">{isEditing ? `Edit ${initialPost?.title}` : 'Add post'}</h2>

      <label className="flex flex-col gap-1 text-sm">
        Title
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Id (slug)
        <input
          className={inputClass}
          value={id}
          disabled={isEditing}
          onChange={(e) => {
            setIdTouched(true)
            setManualId(e.target.value)
          }}
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Excerpt
        <textarea className={inputClass} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} />
      </label>

      <div className="flex flex-col gap-2 text-sm">
        <span>Insert into body</span>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <label className="flex items-center gap-2 text-muted">
            Image
            <input
              type="file"
              accept="image/*"
              disabled={uploadingImage}
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) handleInsertMedia(file, 'image')
              }}
              className="file:mr-2 file:cursor-pointer file:rounded file:border file:border-accent file:bg-accent/10 file:px-2 file:py-1 file:font-mono file:text-xs file:text-accent hover:file:bg-accent/20"
            />
          </label>
          <label className="flex items-center gap-2 text-muted">
            Video
            <input
              type="file"
              accept="video/*"
              disabled={uploadingVideo}
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) handleInsertMedia(file, 'video')
              }}
              className="file:mr-2 file:cursor-pointer file:rounded file:border file:border-accent file:bg-accent/10 file:px-2 file:py-1 file:font-mono file:text-xs file:text-accent hover:file:bg-accent/20"
            />
          </label>
          {(uploadingImage || uploadingVideo) && <span className="text-muted">Uploading…</span>}
        </div>
        {mediaError && <span className="text-xs text-red-400">{mediaError}</span>}
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Body (markdown)
        <textarea
          ref={bodyRef}
          className={`${inputClass} font-mono`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          required
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published
      </label>

      {formError && <p className="text-sm text-red-400">{formError}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded border border-accent bg-accent/10 px-3 py-1 text-sm font-medium text-accent disabled:opacity-50"
        >
          {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add post'}
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-border px-3 py-1 text-sm text-muted">
          Cancel
        </button>
      </div>
    </form>
  )
}
