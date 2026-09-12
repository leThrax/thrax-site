import { useCallback, useEffect, useState } from 'react'
import { fetchCategories } from '../lib/categories'
import type { Category } from '../types/category'

interface UseCategoriesResult {
  categories: Category[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchCategories()
      .then((data) => {
        if (cancelled) return
        setCategories(data)
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

  return { categories, loading, error, refetch }
}
