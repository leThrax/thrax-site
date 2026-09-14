import { useCallback, useEffect, useState } from 'react'
import { fetchPosts } from '../lib/posts'
import type { Post } from '../types/post'

interface UsePostsResult {
  posts: Post[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePosts(): UsePostsResult {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchPosts()
      .then((data) => {
        if (cancelled) return
        setPosts(data)
        setError(null)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const refetch = useCallback(() => setReloadToken((t) => t + 1), [])

  return { posts, loading, error, refetch }
}
