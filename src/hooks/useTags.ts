import { useCallback, useEffect, useState } from 'react'
import { fetchTags } from '../lib/tags'
import type { FilterTag } from '../types/filter'

interface UseTagsResult {
  tags: FilterTag[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTags(): UseTagsResult {
  const [tags, setTags] = useState<FilterTag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchTags()
      .then((data) => {
        if (cancelled) return
        setTags(data)
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

  return { tags, loading, error, refetch }
}
