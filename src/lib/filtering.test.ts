import { describe, expect, it } from 'vitest'
import type { TechItem } from '../types/item'
import type { Category } from '../types/category'
import {
  filterItems,
  groupByCategory,
  searchItems,
  sortRecommendedFirst,
  type SelectedTagsByGroup,
} from './filtering'

const items: TechItem[] = [
  {
    id: 'a',
    name: 'A',
    tags: ['macos', 'privacy'],
    icon: { kind: 'simple-icons', slug: 'a' },
    installCommands: [],
  },
  {
    id: 'b',
    name: 'B',
    tags: ['linux', 'privacy'],
    icon: { kind: 'simple-icons', slug: 'b' },
    installCommands: [],
  },
  {
    id: 'c',
    name: 'C',
    tags: ['windows'],
    icon: { kind: 'simple-icons', slug: 'c' },
    installCommands: [],
  },
]

describe('filterItems', () => {
  it('returns every item when nothing is selected', () => {
    const selected: SelectedTagsByGroup = {}
    expect(filterItems(items, selected).map((i) => i.id)).toEqual(['a', 'b', 'c'])
  })

  it('ORs multiple tags within the same group', () => {
    const selected: SelectedTagsByGroup = { os: new Set(['macos', 'linux']) }
    expect(filterItems(items, selected).map((i) => i.id)).toEqual(['a', 'b'])
  })

  it('ANDs across groups, narrowing further', () => {
    const selected: SelectedTagsByGroup = {
      os: new Set(['macos', 'linux']),
      topic: new Set(['privacy']),
    }
    expect(filterItems(items, selected).map((i) => i.id)).toEqual(['a', 'b'])

    const narrower: SelectedTagsByGroup = {
      os: new Set(['windows']),
      topic: new Set(['privacy']),
    }
    expect(filterItems(items, narrower)).toEqual([])
  })

  it('treats selecting every chip in a group the same as selecting none', () => {
    const allOs: SelectedTagsByGroup = { os: new Set(['macos', 'linux', 'windows']) }
    const none: SelectedTagsByGroup = {}
    expect(filterItems(items, allOs)).toEqual(filterItems(items, none))
  })
})

const namedItems: TechItem[] = [
  {
    id: 'proton-vpn',
    name: 'Proton VPN',
    tags: [],
    icon: { kind: 'simple-icons', slug: 'protonvpn' },
    installCommands: [],
  },
  {
    id: 'signal',
    name: 'Signal',
    tags: [],
    icon: { kind: 'simple-icons', slug: 'signal' },
    installCommands: [],
  },
  {
    id: 'bitwarden',
    name: 'Bitwarden',
    tags: [],
    icon: { kind: 'simple-icons', slug: 'bitwarden' },
    installCommands: [],
  },
]

describe('searchItems', () => {
  it('returns every item when the query is empty', () => {
    expect(searchItems(namedItems, '').map((i) => i.id)).toEqual([
      'proton-vpn',
      'signal',
      'bitwarden',
    ])
  })

  it('narrows to items whose name contains the query', () => {
    expect(searchItems(namedItems, 'proton').map((i) => i.id)).toEqual(['proton-vpn'])
  })

  it('matches case-insensitively', () => {
    expect(searchItems(namedItems, 'SIGNAL').map((i) => i.id)).toEqual(['signal'])
  })

  it('returns nothing when no name matches', () => {
    expect(searchItems(namedItems, 'nonexistent')).toEqual([])
  })
})

const recommendableItems: TechItem[] = [
  { id: 'a', name: 'A', tags: [], icon: { kind: 'simple-icons', slug: 'a' }, installCommands: [] },
  {
    id: 'b',
    name: 'B',
    tags: ['recommended'],
    icon: { kind: 'simple-icons', slug: 'b' },
    installCommands: [],
  },
  { id: 'c', name: 'C', tags: [], icon: { kind: 'simple-icons', slug: 'c' }, installCommands: [] },
  {
    id: 'd',
    name: 'D',
    tags: ['recommended'],
    icon: { kind: 'simple-icons', slug: 'd' },
    installCommands: [],
  },
]

describe('sortRecommendedFirst', () => {
  it('moves recommended items to the front, preserving relative order otherwise', () => {
    expect(sortRecommendedFirst(recommendableItems).map((i) => i.id)).toEqual([
      'b',
      'd',
      'a',
      'c',
    ])
  })

  it('is a no-op when nothing is recommended', () => {
    const none = recommendableItems.map((i) => ({ ...i, tags: [] }))
    expect(sortRecommendedFirst(none).map((i) => i.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('is a no-op when everything is recommended', () => {
    const all = recommendableItems.map((i) => ({ ...i, tags: ['recommended'] }))
    expect(sortRecommendedFirst(all).map((i) => i.id)).toEqual(['a', 'b', 'c', 'd'])
  })
})

function withCategory(id: string, category: string | undefined): TechItem {
  return {
    id,
    name: id,
    tags: [],
    category,
    icon: { kind: 'simple-icons', slug: id },
    installCommands: [],
  }
}

const categoryCatalog: Category[] = [
  { id: 'gaming', label: 'Gaming' },
  { id: 'browser', label: 'Browser' },
]

describe('groupByCategory', () => {
  it('groups items by category id, sorted alphabetically by label', () => {
    const categorized = [
      withCategory('a', 'gaming'),
      withCategory('b', 'browser'),
      withCategory('c', 'gaming'),
    ]
    const groups = groupByCategory(categorized, categoryCatalog)
    expect(groups.map((g) => g.label)).toEqual(['Browser', 'Gaming'])
    expect(groups.map((g) => g.items.map((i) => i.id))).toEqual([['b'], ['a', 'c']])
  })

  it('buckets uncategorized items as "Other", sorted after named categories', () => {
    const categorized = [
      withCategory('a', 'gaming'),
      withCategory('b', undefined),
      withCategory('c', ''),
    ]
    const groups = groupByCategory(categorized, categoryCatalog)
    expect(groups.map((g) => g.label)).toEqual(['Gaming', 'Other'])
    expect(groups[1].items.map((i) => i.id)).toEqual(['b', 'c'])
  })

  it('buckets an item referencing a deleted/unknown category id as "Other"', () => {
    const categorized = [withCategory('a', 'gaming'), withCategory('b', 'stale-id')]
    const groups = groupByCategory(categorized, categoryCatalog)
    expect(groups.map((g) => g.label)).toEqual(['Gaming', 'Other'])
    expect(groups[1].items.map((i) => i.id)).toEqual(['b'])
  })
})
