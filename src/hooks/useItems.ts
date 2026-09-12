import { useCallback, useEffect, useState } from 'react'
import { fetchItems } from '../lib/items'
import type { TechItem } from '../types/item'

interface UseItemsResult {
  items: TechItem[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useItems(): UseItemsResult {
  const [items, setItems] = useState<TechItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchItems()
      .then((data) => {
        if (cancelled) return
        setItems(data)
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

  return { items, loading, error, refetch }
}
