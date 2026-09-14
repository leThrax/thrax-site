import { supabase } from './supabaseClient'
import type { Device, DeviceSpec, ModelCredit } from '../types/device'

export interface DeviceRow {
  id: string
  name: string
  specs: DeviceSpec[]
  model_url: string | null
  model_credit: ModelCredit | null
}

function toDevice(row: DeviceRow): Device {
  return {
    id: row.id,
    name: row.name,
    specs: row.specs,
    modelUrl: row.model_url ?? undefined,
    modelCredit: row.model_credit ?? undefined,
  }
}

function toDeviceRow(device: Device): DeviceRow {
  return {
    id: device.id,
    name: device.name,
    specs: device.specs,
    model_url: device.modelUrl ?? null,
    model_credit: device.modelCredit ?? null,
  }
}

export async function fetchDevices(): Promise<Device[]> {
  const { data, error } = await supabase.from('devices').select('*').order('created_at')
  if (error) throw new Error(error.message)
  return (data as DeviceRow[]).map(toDevice)
}

export async function createDevice(device: Device): Promise<void> {
  const { error } = await supabase.from('devices').insert(toDeviceRow(device))
  if (error) throw new Error(error.message)
}

export async function updateDevice(device: Device): Promise<void> {
  const { data, error } = await supabase.from('devices').update(toDeviceRow(device)).eq('id', device.id).select()
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('Update had no effect — check the "Admin can update devices" policy and your admin user id.')
  }
}

export async function deleteDevice(id: string): Promise<void> {
  const { data, error } = await supabase.from('devices').delete().eq('id', id).select()
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('Delete had no effect — check the "Admin can delete devices" policy and your admin user id.')
  }
}
