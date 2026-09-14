import { supabase } from './supabaseClient'

interface PinnedRepoRow {
  id: string
}

export async function fetchPinnedRepos(): Promise<string[]> {
  const { data, error } = await supabase.from('pinned_repos').select('*').order('created_at')
  if (error) throw new Error(error.message)
  return (data as PinnedRepoRow[]).map((row) => row.id)
}

export async function createPinnedRepo(id: string): Promise<void> {
  const { error } = await supabase.from('pinned_repos').insert({ id })
  if (error) throw new Error(error.message)
}

export async function deletePinnedRepo(id: string): Promise<void> {
  const { data, error } = await supabase.from('pinned_repos').delete().eq('id', id).select()
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error(
      'Delete had no effect — the "Admin can delete pinned repos" policy may be missing or your admin user id may not match it.',
    )
  }
}
