import { supabase } from './supabaseClient'
import type { FilterTag } from '../types/filter'

interface TagRow {
  id: string
  label: string
  group_id: string
}

function toFilterTag(row: TagRow): FilterTag {
  return { id: row.id, label: row.label, group: row.group_id }
}

export async function fetchTags(): Promise<FilterTag[]> {
  const { data, error } = await supabase.from('tags').select('*').order('label')
  if (error) throw new Error(error.message)
  return (data as TagRow[]).map(toFilterTag)
}

export async function createTag(tag: FilterTag): Promise<void> {
  const { error } = await supabase.from('tags').insert({ id: tag.id, label: tag.label, group_id: tag.group })
  if (error) throw new Error(error.message)
}

export async function deleteTag(id: string): Promise<void> {
  const { data, error } = await supabase.from('tags').delete().eq('id', id).select()
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error(
      'Delete had no effect — the "Admin can delete tags" policy may be missing or your admin user id may not match it. Re-run supabase/schema.sql with the correct admin UID.',
    )
  }
}
