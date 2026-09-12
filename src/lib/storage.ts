import { supabase } from './supabaseClient'

export async function uploadIcon(itemId: string, file: File): Promise<string> {
  const path = `${itemId}/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('icons').upload(path, file)
  if (error) throw new Error(error.message)
  return supabase.storage.from('icons').getPublicUrl(path).data.publicUrl
}
