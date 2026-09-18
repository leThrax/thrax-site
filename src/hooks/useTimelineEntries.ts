import { useCallback, useEffect, useState } from 'react'
import { fetchTimelineEntries } from '../lib/timeline'
import type { TimelineEntry } from '../types/timeline'

interface UseTimelineEntriesResult {
  entries: TimelineEntry[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTimelineEntries(): UseTimelineEntriesResult {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchTimelineEntries()
      .then((data) => {
        if (cancelled) return
        setEntries(data)
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

  return { entries, loading, error, refetch }
}
