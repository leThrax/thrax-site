import { supabase } from './supabaseClient'
import type { Post } from '../types/post'

interface PostRow {
  id: string
  title: string
  excerpt: string | null
  body: string
  published_at: string | null
}

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt ?? undefined,
    body: row.body,
    publishedAt: row.published_at ?? undefined,
  }
}

function toPostRow(post: Post): PostRow {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt ?? null,
    body: post.body,
    published_at: post.publishedAt ?? null,
  }
}

export async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as PostRow[]).map(toPost)
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase.from('posts').select('*').eq('id', slug).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? toPost(data as PostRow) : null
}

export async function createPost(post: Post): Promise<void> {
  const { error } = await supabase.from('posts').insert(toPostRow(post))
  if (error) throw new Error(error.message)
}

export async function updatePost(post: Post): Promise<void> {
  const { data, error } = await supabase.from('posts').update(toPostRow(post)).eq('id', post.id).select()
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('Update had no effect — check the "Admin can update posts" policy and your admin user id.')
  }
}

export async function deletePost(id: string): Promise<void> {
  const { data, error } = await supabase.from('posts').delete().eq('id', id).select()
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('Delete had no effect — check the "Admin can delete posts" policy and your admin user id.')
  }
}
