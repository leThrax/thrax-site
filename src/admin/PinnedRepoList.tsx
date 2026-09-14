import { useState } from 'react'
import { fetchGithubRepo, parseRepoRef } from '../lib/github'

interface PinnedRepoListProps {
  pinnedRepoIds: string[]
  onCreate: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function PinnedRepoList({ pinnedRepoIds, onCreate, onDelete }: PinnedRepoListProps) {
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleAdd() {
    setAddError(null)
    const ref = parseRepoRef(input)
    if (!ref) {
      setAddError('Enter a GitHub URL or "owner/repo".')
      return
    }
    const id = `${ref.owner}/${ref.repo}`
    if (pinnedRepoIds.includes(id)) {
      setAddError('Already pinned.')
      return
    }
    setAdding(true)
    try {
      await fetchGithubRepo(ref.owner, ref.repo)
      await onCreate(id)
      setInput('')
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Could not verify repo.')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleteError(null)
    try {
      await onDelete(id)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete.')
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4 font-mono">
      <h2 className="text-lg font-medium text-fg">Pinned repos</h2>
      <p className="text-xs text-muted">
        Repos you contributed to but don't own — shown on the Projects page alongside your own repos.
      </p>

      {pinnedRepoIds.length === 0 ? (
        <p className="text-sm text-muted">No pinned repos yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {pinnedRepoIds.map((id) => (
            <li key={id} className="flex items-center gap-3 py-2">
              <span className="flex-1 text-sm text-fg">{id}</span>
              <button
                type="button"
                onClick={() => handleDelete(id)}
                className="text-sm text-red-400 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder="owner/repo or https://github.com/owner/repo"
          className="min-w-64 rounded border border-border bg-surface px-2 py-1 text-xs text-fg"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className="rounded border border-accent bg-accent/10 px-2 py-1 text-xs font-medium text-accent disabled:opacity-50"
        >
          {adding ? 'Checking…' : 'Add'}
        </button>
        {addError && <span className="text-xs text-red-400">{addError}</span>}
      </div>
    </div>
  )
}
