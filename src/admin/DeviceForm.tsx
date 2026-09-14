import { useState, type FormEvent } from 'react'
import type { Device, DeviceSpec } from '../types/device'
import { slugify } from '../lib/slugify'
import { uploadDeviceModel } from '../lib/storage'

interface DeviceFormProps {
  initialDevice?: Device
  onSubmit: (device: Device) => Promise<void>
  onCancel: () => void
}

const inputClass = 'rounded border border-border bg-surface px-2 py-1 text-fg disabled:opacity-50'

export function DeviceForm({ initialDevice, onSubmit, onCancel }: DeviceFormProps) {
  const isEditing = Boolean(initialDevice)
  const [name, setName] = useState(initialDevice?.name ?? '')
  const [manualId, setManualId] = useState(initialDevice?.id ?? '')
  const [idTouched, setIdTouched] = useState(isEditing)
  const id = idTouched ? manualId : slugify(name)
  const [specs, setSpecs] = useState<DeviceSpec[]>(initialDevice?.specs ?? [])
  const [modelFile, setModelFile] = useState<File | null>(null)
  const existingModelUrl = initialDevice?.modelUrl
  const [creator, setCreator] = useState(initialDevice?.modelCredit?.creator ?? '')
  const [sourceUrl, setSourceUrl] = useState(initialDevice?.modelCredit?.sourceUrl ?? '')
  const [license, setLicense] = useState(initialDevice?.modelCredit?.license ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function addSpec() {
    setSpecs((prev) => [...prev, { label: '', value: '' }])
  }

  function updateSpec(index: number, field: keyof DeviceSpec, value: string) {
    setSpecs((prev) => prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)))
  }

  function removeSpec(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!name.trim() || !id.trim()) {
      setFormError('Name and id are required.')
      return
    }

    setSubmitting(true)
    try {
      const modelUrl = modelFile ? await uploadDeviceModel(id.trim(), modelFile) : existingModelUrl
      const trimmedCreator = creator.trim()
      const trimmedSourceUrl = sourceUrl.trim()
      const trimmedLicense = license.trim()

      const device: Device = {
        id: id.trim(),
        name: name.trim(),
        specs: specs
          .map((entry) => ({ label: entry.label.trim(), value: entry.value.trim() }))
          .filter((entry) => entry.label || entry.value),
        modelUrl,
        modelCredit:
          trimmedCreator || trimmedSourceUrl
            ? { creator: trimmedCreator, sourceUrl: trimmedSourceUrl, license: trimmedLicense || undefined }
            : undefined,
      }
      await onSubmit(device)
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
      <h2 className="text-lg font-medium text-fg">{isEditing ? `Edit ${initialDevice?.name}` : 'Add device'}</h2>

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

      <div className="flex flex-col gap-2 text-sm">
        <span>Specs</span>
        {specs.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              className={`${inputClass} w-28`}
              value={entry.label}
              onChange={(e) => updateSpec(index, 'label', e.target.value)}
              placeholder="CPU"
            />
            <input
              className={`${inputClass} flex-1`}
              value={entry.value}
              onChange={(e) => updateSpec(index, 'value', e.target.value)}
              placeholder="Ryzen 9 7950X"
            />
            <button
              type="button"
              onClick={() => removeSpec(index)}
              aria-label="Remove spec"
              className="text-muted hover:text-red-400"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSpec}
          className="self-start rounded border border-dashed border-border px-2 py-0.5 text-xs text-muted"
        >
          + Add spec
        </button>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <span>3D model (.glb)</span>
        {existingModelUrl && !modelFile && (
          <a
            href={existingModelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline"
          >
            current model ↗
          </a>
        )}
        <input
          type="file"
          accept=".glb"
          onChange={(e) => setModelFile(e.target.files?.[0] ?? null)}
          className="text-xs text-muted file:mr-2 file:cursor-pointer file:rounded file:border file:border-accent file:bg-accent/10 file:px-2 file:py-1 file:font-mono file:text-xs file:text-accent hover:file:bg-accent/20"
        />

        <span className="mt-1 text-muted">Model credit (Sketchfab)</span>
        <input
          className={inputClass}
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          placeholder="Creator name"
        />
        <input
          className={inputClass}
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://sketchfab.com/3d-models/…"
        />
        <input
          className={inputClass}
          value={license}
          onChange={(e) => setLicense(e.target.value)}
          placeholder="License (optional), e.g. CC Attribution 4.0"
        />
      </div>

      {formError && <p className="text-sm text-red-400">{formError}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded border border-accent bg-accent/10 px-3 py-1 text-sm font-medium text-accent disabled:opacity-50"
        >
          {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add device'}
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-border px-3 py-1 text-sm text-muted">
          Cancel
        </button>
      </div>
    </form>
  )
}
