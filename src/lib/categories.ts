import { supabase } from './supabaseClient'
import type { Category } from '../types/category'

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('label')
  if (error) throw new Error(error.message)
  return data as Category[]
}

export async function createCategory(category: Category): Promise<void> {
  const { error } = await supabase.from('categories').insert(category)
  if (error) throw new Error(error.message)
}

export async function deleteCategory(id: string): Promise<void> {
  const { data, error } = await supabase.from('categories').delete().eq('id', id).select()
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error(
      'Delete had no effect — the "Admin can delete categories" policy may be missing or your admin user id may not match it. Re-run supabase/schema.sql with the correct admin UID.',
    )
  }
}
