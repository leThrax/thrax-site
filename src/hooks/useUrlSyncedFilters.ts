import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import type { SelectedTagsByGroup } from '../lib/filtering'

function parseFromSearch(search: string): SelectedTagsByGroup {
  const params = new URLSearchParams(search)
  const result: SelectedTagsByGroup = {}
  for (const [group, value] of params.entries()) {
    result[group] = new Set(value.split(',').filter(Boolean))
  }
  return result
}

function serializeToSearch(selected: SelectedTagsByGroup): string {
  const params = new URLSearchParams()
  for (const [group, tags] of Object.entries(selected)) {
    if (tags.size > 0) params.set(group, [...tags].join(','))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

/** Drop-in replacement for `useState<SelectedTagsByGroup>({})` that mirrors
 * the selection into the URL's query string via `history.replaceState`, so
 * filtered views are shareable/bookmarkable. Read once on mount; no popstate
 * listener, since back/forward filter-history navigation isn't a goal here. */
export function useUrlSyncedFilters(): [SelectedTagsByGroup, Dispatch<SetStateAction<SelectedTagsByGroup>>] {
  const [selected, setSelected] = useState<SelectedTagsByGroup>(() =>
    parseFromSearch(window.location.search),
  )

  useEffect(() => {
    const newSearch = serializeToSearch(selected)
    const newUrl = `${window.location.pathname}${newSearch}${window.location.hash}`
    window.history.replaceState(null, '', newUrl)
  }, [selected])

  return [selected, setSelected]
}
