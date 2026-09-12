import type { FilterGroup } from '../types/filter'

// Groups are a small, rarely-changing taxonomy decision and stay static.
// Individual tags within these groups are managed dynamically — see
// src/lib/tags.ts / src/hooks/useTags.ts (backed by the Supabase `tags` table).
export const filterGroups: FilterGroup[] = [
  { id: 'os', label: 'Operating System', order: 0 },
  { id: 'topic', label: 'Topic', order: 1 },
  { id: 'featured', label: 'Featured', order: 2 },
]

// A specific, code-recognized tag within the "featured" group — sorts an
// item to the front of the grid and marks it with a star (see
// sortRecommendedFirst in lib/filtering.ts and ItemCard.tsx).
export const RECOMMENDED_TAG_ID = 'recommended'
