import { supabase } from './supabaseClient'
import type { IconRef, InstallCommand, TechItem } from '../types/item'

export interface ItemRow {
  id: string
  name: string
  tags: string[]
  description: string | null
  url: string | null
  category: string | null
  icon_kind: 'simple-icons' | 'custom'
  icon_value: string
  icon_tint: string | null
  install_commands: InstallCommand[]
}

function toIconRef(icon_kind: ItemRow['icon_kind'], icon_value: string, icon_tint: string | null): IconRef {
  if (icon_kind === 'custom') return { kind: 'custom', url: icon_value, tint: icon_tint ?? undefined }
  return { kind: 'simple-icons', slug: icon_value }
}

function toTechItem(row: ItemRow): TechItem {
  return {
    id: row.id,
    name: row.name,
    tags: row.tags,
    icon: toIconRef(row.icon_kind, row.icon_value, row.icon_tint),
    description: row.description ?? undefined,
    url: row.url ?? undefined,
    category: row.category ?? undefined,
    installCommands: row.install_commands,
  }
}

function toItemRow(item: TechItem): ItemRow {
  return {
    id: item.id,
    name: item.name,
    tags: item.tags,
    description: item.description ?? null,
    url: item.url ?? null,
    category: item.category ?? null,
    icon_kind: item.icon.kind,
    icon_value: item.icon.kind === 'custom' ? item.icon.url : item.icon.slug,
    icon_tint: item.icon.kind === 'custom' ? (item.icon.tint ?? null) : null,
    install_commands: item.installCommands,
  }
}

export async function fetchItems(): Promise<TechItem[]> {
  const { data, error } = await supabase.from('items').select('*').order('name')
  if (error) throw new Error(error.message)
  return (data as ItemRow[]).map(toTechItem)
}

export async function createItem(item: TechItem): Promise<void> {
  const { error } = await supabase.from('items').insert(toItemRow(item))
  if (error) throw new Error(error.message)
}

export async function updateItem(item: TechItem): Promise<void> {
  const { data, error } = await supabase.from('items').update(toItemRow(item)).eq('id', item.id).select()
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('Update had no effect — check the "Admin can update items" policy and your admin user id.')
  }
}

export async function deleteItem(id: string): Promise<void> {
  const { data, error } = await supabase.from('items').delete().eq('id', id).select()
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('Delete had no effect — check the "Admin can delete items" policy and your admin user id.')
  }
}
