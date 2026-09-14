import { useCallback, useEffect, useState } from 'react'
import { fetchGithubRepos } from '../lib/github'
import type { GithubRepo } from '../types/github'

interface UseGithubReposResult {
  repos: GithubRepo[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useGithubRepos(username: string): UseGithubReposResult {
  const [repos, setRepos] = useState<GithubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!username) {
      setLoading(false)
      setError('No GitHub username configured (set VITE_GITHUB_USERNAME in .env.local).')
      return
    }

    let cancelled = false
    setLoading(true)

    fetchGithubRepos(username)
      .then((data) => {
        if (cancelled) return
        setRepos(data)
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
  }, [username, reloadToken])

  const refetch = useCallback(() => setReloadToken((t) => t + 1), [])

  return { repos, loading, error, refetch }
}
