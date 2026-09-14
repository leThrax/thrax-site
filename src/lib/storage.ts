import { supabase } from './supabaseClient'

export async function uploadIcon(itemId: string, file: File): Promise<string> {
  const path = `${itemId}/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('icons').upload(path, file)
  if (error) throw new Error(error.message)
  return supabase.storage.from('icons').getPublicUrl(path).data.publicUrl
}

export async function uploadPostMedia(postId: string, file: File): Promise<string> {
  const path = `${postId}/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('post-media').upload(path, file)
  if (error) throw new Error(error.message)
  return supabase.storage.from('post-media').getPublicUrl(path).data.publicUrl
}

export async function uploadDeviceModel(deviceId: string, file: File): Promise<string> {
  const path = `${deviceId}/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('device-models').upload(path, file)
  if (error) throw new Error(error.message)
  return supabase.storage.from('device-models').getPublicUrl(path).data.publicUrl
}
