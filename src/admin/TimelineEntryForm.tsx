import { useState, type FormEvent } from 'react'
import type { TimelineEntry } from '../types/timeline'
import { slugify } from '../lib/slugify'

interface TimelineEntryFormProps {
  initialEntry?: TimelineEntry
  onSubmit: (entry: TimelineEntry) => Promise<void>
  onCancel: () => void
}

const inputClass = 'rounded border border-border bg-surface px-2 py-1 text-fg disabled:opacity-50'

export function TimelineEntryForm({ initialEntry, onSubmit, onCancel }: TimelineEntryFormProps) {
  const isEditing = Boolean(initialEntry)
  const [role, setRole] = useState(initialEntry?.role ?? '')
  const [org, setOrg] = useState(initialEntry?.org ?? '')
  const [manualId, setManualId] = useState(initialEntry?.id ?? '')
  const [idTouched, setIdTouched] = useState(isEditing)
  const id = idTouched ? manualId : slugify(`${org}-${role}`)
  const [startDate, setStartDate] = useState(initialEntry?.startDate ?? '')
  const [endDate, setEndDate] = useState(initialEntry?.endDate ?? '')
  const [ongoing, setOngoing] = useState(isEditing ? !initialEntry?.endDate : false)
  const [description, setDescription] = useState(initialEntry?.description ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!role.trim() || !org.trim() || !id.trim() || !startDate) {
      setFormError('Role, org, id, and start date are required.')
      return
    }
    if (!ongoing && !endDate) {
      setFormError('End date is required unless this entry is ongoing.')
      return
    }

    setSubmitting(true)
    try {
      const entry: TimelineEntry = {
        id: id.trim(),
        role: role.trim(),
        org: org.trim(),
        startDate,
        endDate: ongoing ? undefined : endDate,
        description: description.trim() || undefined,
        position: initialEntry?.position ?? 0,
      }
      await onSubmit(entry)
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
      <h2 className="text-lg font-medium text-fg">{isEditing ? `Edit ${initialEntry?.role}` : 'Add timeline entry'}</h2>

      <label className="flex flex-col gap-1 text-sm">
        Role
        <input
          className={inputClass}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Software Engineer"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Org / location
        <input
          className={inputClass}
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          placeholder="Acme Corp"
          required
        />
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

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Start date
          <input
            type="date"
            className={inputClass}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          End date
          <input
            type="date"
            className={inputClass}
            value={ongoing ? '' : endDate}
            disabled={ongoing}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={ongoing}
          onChange={(e) => {
            setOngoing(e.target.checked)
            if (e.target.checked) setEndDate('')
          }}
        />
        Currently here
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Description (optional)
        <textarea
          className={`${inputClass} min-h-20`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="One point per line, or leave blank"
        />
      </label>

      {formError && <p className="text-sm text-red-400">{formError}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded border border-accent bg-accent/10 px-3 py-1 text-sm font-medium text-accent disabled:opacity-50"
        >
          {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add entry'}
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-border px-3 py-1 text-sm text-muted">
          Cancel
        </button>
      </div>
    </form>
  )
}
