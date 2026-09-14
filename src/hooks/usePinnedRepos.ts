import { useCallback, useEffect, useState } from 'react'
import { fetchPinnedRepos } from '../lib/pinnedRepos'

interface UsePinnedReposResult {
  pinnedRepoIds: string[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePinnedRepos(): UsePinnedReposResult {
  const [pinnedRepoIds, setPinnedRepoIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchPinnedRepos()
      .then((data) => {
        if (cancelled) return
        setPinnedRepoIds(data)
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

  return { pinnedRepoIds, loading, error, refetch }
}
