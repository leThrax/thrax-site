import type { TechItem } from '../types/item'
import type { Category } from '../types/category'
import { RECOMMENDED_TAG_ID } from '../data/filterTags'

export type SelectedTagsByGroup = Record<string, Set<string>>

export function matches(item: TechItem, selectedTagsByGroup: SelectedTagsByGroup): boolean {
  return Object.values(selectedTagsByGroup).every((selected) => {
    if (selected.size === 0) return true
    return item.tags.some((tag) => selected.has(tag))
  })
}

export function filterItems(items: TechItem[], selectedTagsByGroup: SelectedTagsByGroup): TechItem[] {
  return items.filter((item) => matches(item, selectedTagsByGroup))
}

export function matchesSearch(item: TechItem, query: string): boolean {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return true
  return item.name.toLowerCase().includes(trimmed)
}

export function searchItems(items: TechItem[], query: string): TechItem[] {
  return items.filter((item) => matchesSearch(item, query))
}

export function sortRecommendedFirst(items: TechItem[]): TechItem[] {
  return [...items].sort((a, b) => {
    const aRec = a.tags.includes(RECOMMENDED_TAG_ID) ? 0 : 1
    const bRec = b.tags.includes(RECOMMENDED_TAG_ID) ? 0 : 1
    return aRec - bRec
  })
}

export const OTHER_CATEGORY_LABEL = 'Other'

export interface CategoryGroup {
  label: string
  items: TechItem[]
}

export function groupByCategory(items: TechItem[], categories: Category[]): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>()

  for (const item of items) {
    const key = item.category ?? ''
    const label = key ? categories.find((c) => c.id === key)?.label ?? OTHER_CATEGORY_LABEL : OTHER_CATEGORY_LABEL
    const groupKey = label === OTHER_CATEGORY_LABEL ? '' : key
    if (!groups.has(groupKey)) groups.set(groupKey, { label, items: [] })
    groups.get(groupKey)!.items.push(item)
  }

  return [...groups.values()].sort((a, b) => {
    if (a.label === OTHER_CATEGORY_LABEL) return 1
    if (b.label === OTHER_CATEGORY_LABEL) return -1
    return a.label.localeCompare(b.label)
  })
}
