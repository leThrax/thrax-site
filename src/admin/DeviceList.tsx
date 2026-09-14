import type { ReactNode } from 'react'
import type { Device } from '../types/device'

interface DeviceListProps {
  devices: Device[]
  editingDeviceId: string | null
  editForm: ReactNode
  onEdit: (device: Device) => void
  onDelete: (device: Device) => void
}

export function DeviceList({ devices, editingDeviceId, editForm, onEdit, onDelete }: DeviceListProps) {
  if (devices.length === 0) return <p className="text-sm text-muted">No devices yet.</p>

  return (
    <ul className="flex flex-col divide-y divide-border">
      {devices.map((device) =>
        device.id === editingDeviceId ? (
          <li key={device.id} className="py-2">
            {editForm}
          </li>
        ) : (
          <li key={device.id} className="flex items-center gap-3 py-2">
            <span className="flex-1 text-sm font-medium text-fg">{device.name}</span>
            <span className="text-xs text-muted">{device.modelUrl ? '3d model' : 'no model'}</span>
            <button type="button" onClick={() => onEdit(device)} className="text-sm text-accent hover:underline">
              Edit
            </button>
            <button type="button" onClick={() => onDelete(device)} className="text-sm text-red-400 hover:underline">
              Delete
            </button>
          </li>
        ),
      )}
    </ul>
  )
}
