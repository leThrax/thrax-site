import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { InstallCommand, TechItem } from '../types/item'
import type { FilterGroup, FilterTag } from '../types/filter'
import type { Category } from '../types/category'
import { searchSimpleIcons } from '../lib/simpleIcons'
import { slugify } from '../lib/slugify'
import { uploadIcon } from '../lib/storage'
import { extractIconTint } from '../lib/colorExtraction'
import { fetchWikipediaInfo } from '../lib/wikipedia'
import { getPackageManagerSearchUrl } from '../lib/packageManagerSearch'
import { Icon } from '../components/Icon'
import { TagPicker } from './TagPicker'
import { CategoryPicker } from './CategoryPicker'

interface ItemFormProps {
  initialItem?: TechItem
  groups: FilterGroup[]
  allTags: FilterTag[]
  categories: Category[]
  onCreateTag: (label: string, group: string) => Promise<void>
  onDeleteTag: (tag: FilterTag) => Promise<boolean>
  onCreateCategory: (label: string) => Promise<void>
  onDeleteCategory: (category: Category) => Promise<boolean>
  onSubmit: (item: TechItem) => Promise<void>
  onCancel: () => void
}

const inputClass = 'rounded border border-border bg-surface px-2 py-1 text-fg disabled:opacity-50'

export function ItemForm({
  initialItem,
  groups,
  allTags,
  categories,
  onCreateTag,
  onDeleteTag,
  onCreateCategory,
  onDeleteCategory,
  onSubmit,
  onCancel,
}: ItemFormProps) {
  const isEditing = Boolean(initialItem)
  const [name, setName] = useState(initialItem?.name ?? '')
  const [manualId, setManualId] = useState(initialItem?.id ?? '')
  const [idTouched, setIdTouched] = useState(isEditing)
  const id = idTouched ? manualId : slugify(name)
  const [tagIds, setTagIds] = useState(initialItem?.tags ?? [])
  const [description, setDescription] = useState(initialItem?.description ?? '')
  const [url, setUrl] = useState(initialItem?.url ?? '')
  const [category, setCategory] = useState(initialItem?.category ?? '')
  const [installCommands, setInstallCommands] = useState<InstallCommand[]>(
    initialItem?.installCommands ?? [],
  )
  const [iconSlug, setIconSlug] = useState(
    initialItem?.icon.kind === 'simple-icons' ? initialItem.icon.slug : '',
  )
  const [iconQuery, setIconQuery] = useState('')
  const [iconMode, setIconMode] = useState<'simple-icons' | 'custom'>(
    initialItem?.icon.kind === 'custom' ? 'custom' : 'simple-icons',
  )
  const existingCustomUrl = initialItem?.icon.kind === 'custom' ? initialItem.icon.url : undefined
  const existingCustomTint = initialItem?.icon.kind === 'custom' ? initialItem.icon.tint : undefined
  const [customFile, setCustomFile] = useState<File | null>(null)
  const [customPreviewUrl, setCustomPreviewUrl] = useState<string | undefined>(existingCustomUrl)
  const [customTint, setCustomTint] = useState<string | undefined>(existingCustomTint)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fetchingWikiInfo, setFetchingWikiInfo] = useState(false)
  const [wikiFetchError, setWikiFetchError] = useState<string | null>(null)

  const suggestions = useMemo(() => searchSimpleIcons(iconQuery), [iconQuery])

  function addInstallCommand() {
    setInstallCommands((prev) => [...prev, { manager: '', command: '' }])
  }

  function updateInstallCommand(index: number, field: keyof InstallCommand, value: string) {
    setInstallCommands((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)),
    )
  }

  function removeInstallCommand(index: number) {
    setInstallCommands((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleAutoFillFromWikipedia() {
    setWikiFetchError(null)
    setFetchingWikiInfo(true)
    try {
      const result = await fetchWikipediaInfo(name)
      if (result.description) setDescription(result.description)
      if (result.url) setUrl(result.url)
      if (!result.description && !result.url) {
        setWikiFetchError('No Wikipedia info found — try adjusting the name, or fill these in yourself.')
      }
    } catch {
      setWikiFetchError('Could not reach Wikipedia. Try again, or fill these in yourself.')
    } finally {
      setFetchingWikiInfo(false)
    }
  }

  useEffect(() => {
    if (!customFile) return
    const objectUrl = URL.createObjectURL(customFile)
    setCustomPreviewUrl(objectUrl)

    let cancelled = false
    setCustomTint(undefined)
    extractIconTint(customFile).then((tint) => {
      if (!cancelled && tint) setCustomTint(tint)
    })

    return () => {
      cancelled = true
      URL.revokeObjectURL(objectUrl)
    }
  }, [customFile])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!name.trim() || !id.trim()) {
      setFormError('Name and id are required.')
      return
    }

    setSubmitting(true)
    try {
      let icon: TechItem['icon']
      if (iconMode === 'simple-icons') {
        if (!iconSlug.trim()) {
          setFormError('Pick an icon.')
          return
        }
        icon = { kind: 'simple-icons', slug: iconSlug.trim() }
      } else {
        if (customFile) {
          const uploadedUrl = await uploadIcon(id.trim(), customFile)
          icon = { kind: 'custom', url: uploadedUrl, tint: customTint }
        } else if (existingCustomUrl) {
          icon = { kind: 'custom', url: existingCustomUrl, tint: customTint }
        } else {
          setFormError('Choose an image to upload.')
          return
        }
      }

      const item: TechItem = {
        id: id.trim(),
        name: name.trim(),
        tags: tagIds,
        icon,
        description: description.trim() || undefined,
        url: url.trim() || undefined,
        category: category.trim() || undefined,
        installCommands: installCommands
          .map((entry) => ({ manager: entry.manager.trim(), command: entry.command.trim() }))
          .filter((entry) => entry.manager || entry.command),
      }
      await onSubmit(item)
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
      <h2 className="text-lg font-medium text-fg">{isEditing ? `Edit ${initialItem?.name}` : 'Add item'}</h2>

      <label className="flex flex-col gap-1 text-sm">
        Name
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
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

      <TagPicker
        groups={groups}
        allTags={allTags}
        selectedTagIds={tagIds}
        onChange={setTagIds}
        onCreateTag={onCreateTag}
        onDeleteTag={onDeleteTag}
      />

      <div className="flex flex-col gap-2 text-sm">
        <span>Icon</span>
        <div className="flex gap-3 text-xs">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              checked={iconMode === 'simple-icons'}
              onChange={() => setIconMode('simple-icons')}
            />
            simple-icons
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" checked={iconMode === 'custom'} onChange={() => setIconMode('custom')} />
            Custom upload
          </label>
        </div>

        {iconMode === 'simple-icons' ? (
          <>
            <div className="flex items-center gap-2">
              {iconSlug && <Icon icon={{ kind: 'simple-icons', slug: iconSlug }} className="size-6" />}
              <input
                className={`${inputClass} flex-1`}
                value={iconSlug}
                onChange={(e) => {
                  setIconSlug(e.target.value)
                  setIconQuery(e.target.value)
                }}
                placeholder="search by name, e.g. proton"
              />
            </div>
            {suggestions.length > 0 && (
              <ul className="flex flex-col gap-1 rounded border border-border p-1">
                {suggestions.map((s) => (
                  <li key={s.slug}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-fg hover:bg-surface-hover"
                      onClick={() => {
                        setIconSlug(s.slug)
                        setIconQuery('')
                      }}
                    >
                      <Icon icon={{ kind: 'simple-icons', slug: s.slug }} className="size-4" />
                      {s.title} <span className="text-muted">({s.slug})</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            {customPreviewUrl && (
              <img src={customPreviewUrl} alt="" className="size-6 rounded object-contain" />
            )}
            <input
              type="file"
              accept="image/*,.svg"
              onChange={(e) => setCustomFile(e.target.files?.[0] ?? null)}
              className="flex-1 text-xs text-muted file:mr-2 file:cursor-pointer file:rounded file:border file:border-accent file:bg-accent/10 file:px-2 file:py-1 file:font-mono file:text-xs file:text-accent hover:file:bg-accent/20"
            />
            {customTint && (
              <span
                title={`Detected tint: #${customTint}`}
                className="size-4 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: `#${customTint}` }}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-muted">Description &amp; URL</span>
        <button
          type="button"
          onClick={handleAutoFillFromWikipedia}
          disabled={!name.trim() || fetchingWikiInfo}
          className="text-xs text-accent hover:underline disabled:opacity-50"
        >
          {fetchingWikiInfo ? 'Fetching…' : 'Auto-fill from Wikipedia'}
        </button>
      </div>
      {wikiFetchError && <span className="text-xs text-red-400">{wikiFetchError}</span>}

      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea
          className={inputClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        URL
        <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
      </label>

      <CategoryPicker
        categories={categories}
        selectedId={category || undefined}
        onChange={(id) => setCategory(id ?? '')}
        onCreateCategory={onCreateCategory}
        onDeleteCategory={onDeleteCategory}
      />

      <div className="flex flex-col gap-2 text-sm">
        <span>Install commands</span>
        {installCommands.map((entry, index) => {
          const searchUrl = getPackageManagerSearchUrl(entry.manager, name)
          return (
            <div key={index} className="flex items-center gap-2">
              <input
                className={`${inputClass} w-24`}
                value={entry.manager}
                onChange={(e) => updateInstallCommand(index, 'manager', e.target.value)}
                placeholder="brew"
              />
              {searchUrl && (
                <a
                  href={searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs text-accent hover:underline"
                >
                  search ↗
                </a>
              )}
              <input
                className={`${inputClass} flex-1`}
                value={entry.command}
                onChange={(e) => updateInstallCommand(index, 'command', e.target.value)}
                placeholder="brew install --cask protonvpn"
              />
              <button
                type="button"
                onClick={() => removeInstallCommand(index)}
                aria-label="Remove install command"
                className="text-muted hover:text-red-400"
              >
                ×
              </button>
            </div>
          )
        })}
        <button
          type="button"
          onClick={addInstallCommand}
          className="self-start rounded border border-dashed border-border px-2 py-0.5 text-xs text-muted"
        >
          + Add install command
        </button>
      </div>

      {formError && <p className="text-sm text-red-400">{formError}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded border border-accent bg-accent/10 px-3 py-1 text-sm font-medium text-accent disabled:opacity-50"
        >
          {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add item'}
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-border px-3 py-1 text-sm text-muted">
          Cancel
        </button>
      </div>
    </form>
  )
}
