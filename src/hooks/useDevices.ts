import { useCallback, useEffect, useState } from 'react'
import { fetchDevices } from '../lib/devices'
import type { Device } from '../types/device'

interface UseDevicesResult {
  devices: Device[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDevices(): UseDevicesResult {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchDevices()
      .then((data) => {
        if (cancelled) return
        setDevices(data)
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

  return { devices, loading, error, refetch }
}
