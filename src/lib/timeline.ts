import { supabase } from './supabaseClient'
import type { TimelineEntry } from '../types/timeline'

interface TimelineEntryRow {
  id: string
  role: string
  org: string
  start_date: string
  end_date: string | null
  description: string | null
  position: number
}

function toTimelineEntry(row: TimelineEntryRow): TimelineEntry {
  return {
    id: row.id,
    role: row.role,
    org: row.org,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    description: row.description ?? undefined,
    position: row.position,
  }
}

function toTimelineEntryRow(entry: TimelineEntry): TimelineEntryRow {
  return {
    id: entry.id,
    role: entry.role,
    org: entry.org,
    start_date: entry.startDate,
    end_date: entry.endDate ?? null,
    description: entry.description ?? null,
    position: entry.position,
  }
}

export async function fetchTimelineEntries(): Promise<TimelineEntry[]> {
  const { data, error } = await supabase.from('timeline_entries').select('*').order('position')
  if (error) throw new Error(error.message)
  return (data as TimelineEntryRow[]).map(toTimelineEntry)
}

export async function createTimelineEntry(entry: TimelineEntry): Promise<void> {
  const { error } = await supabase.from('timeline_entries').insert(toTimelineEntryRow(entry))
  if (error) throw new Error(error.message)
}

export async function updateTimelineEntry(entry: TimelineEntry): Promise<void> {
  const { data, error } = await supabase
    .from('timeline_entries')
    .update(toTimelineEntryRow(entry))
    .eq('id', entry.id)
    .select()
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('Update had no effect — check the "Admin can update timeline entries" policy and your admin user id.')
  }
}

export async function deleteTimelineEntry(id: string): Promise<void> {
  const { data, error } = await supabase.from('timeline_entries').delete().eq('id', id).select()
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('Delete had no effect — check the "Admin can delete timeline entries" policy and your admin user id.')
  }
}

// Bulk-persists a drag-and-drop reorder as a batch of per-row position
// updates rather than one upsert — an upsert would need every column sent
// per row to avoid nulling the rest, whereas this stays consistent with the
// one-mapper-per-row style used everywhere else in this file.
export async function reorderTimelineEntries(orderedIds: string[]): Promise<void> {
  const results = await Promise.all(
    orderedIds.map((id, index) => supabase.from('timeline_entries').update({ position: index }).eq('id', id)),
  )
  const failed = results.find((result) => result.error)
  if (failed?.error) throw new Error(failed.error.message)
}
