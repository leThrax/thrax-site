import { useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { filterGroups } from './data/filterTags'
import {
  filterItems,
  groupByCategory,
  OTHER_CATEGORY_LABEL,
  searchItems,
  sortRecommendedFirst,
} from './lib/filtering'
import { useItems } from './hooks/useItems'
import { useTags } from './hooks/useTags'
import { useCategories } from './hooks/useCategories'
import { useUrlSyncedFilters } from './hooks/useUrlSyncedFilters'
import type { TechItem } from './types/item'
import { FetchHeader } from './components/FetchHeader'
import { SearchBox } from './components/SearchBox'
import { FilterBar } from './components/FilterBar'
import { ItemGrid } from './components/ItemGrid'
import { CategorySection } from './components/CategorySection'
import { ItemDetail } from './components/ItemDetail'
import { BootSequence } from './components/BootSequence'

const BOOT_SESSION_KEY = 'thrax-site:booted'

const containerVariants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.15, staggerChildren: 0.12 } },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function App() {
  const [selected, setSelected] = useUrlSyncedFilters()
  const [searchQuery, setSearchQuery] = useState('')
  const { items, loading: itemsLoading, error: itemsError } = useItems()
  const { tags, loading: tagsLoading, error: tagsError } = useTags()
  const { categories } = useCategories()
  const [selectedItem, setSelectedItem] = useState<TechItem | null>(null)
  const [showBoot, setShowBoot] = useState(() => !window.sessionStorage.getItem(BOOT_SESSION_KEY))

  function handleBootComplete() {
    window.sessionStorage.setItem(BOOT_SESSION_KEY, '1')
    setShowBoot(false)
  }

  function toggleTag(groupId: string, tagId: string) {
    setSelected((prev) => {
      const next = new Set(prev[groupId] ?? [])
      if (next.has(tagId)) next.delete(tagId)
      else next.add(tagId)
      return { ...prev, [groupId]: next }
    })
  }

  const visibleItems = sortRecommendedFirst(filterItems(searchItems(items, searchQuery), selected))
  const categoryGroups = groupByCategory(visibleItems, categories)
  const isGrouped = !(categoryGroups.length === 1 && categoryGroups[0].label === OTHER_CATEGORY_LABEL)
  const error = itemsError ?? tagsError
  const hasActiveFilters =
    searchQuery.trim() !== '' || Object.values(selected).some((s) => s.size > 0)

  function handleClearFilters() {
    setSearchQuery('')
    setSelected({})
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {showBoot ? (
          <BootSequence key="boot" onComplete={handleBootComplete} />
        ) : (
          <motion.main
            key="main"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto flex min-h-svh max-w-5xl flex-col gap-8 p-6"
          >
            <motion.div variants={sectionVariants}>
              <FetchHeader itemCount={items.length} groups={filterGroups} selected={selected} />
            </motion.div>

            <motion.div variants={sectionVariants}>
              <SearchBox value={searchQuery} onChange={setSearchQuery} />
            </motion.div>

            <motion.div variants={sectionVariants}>
              <FilterBar groups={filterGroups} tags={tags} selected={selected} onToggle={toggleTag} />
            </motion.div>

            <motion.div variants={sectionVariants} className="flex flex-col gap-8">
              {error && (
                <p className="font-mono text-sm text-red-400">
                  Couldn't load data: {error}. Check your Supabase configuration in .env.local.
                </p>
              )}
              {itemsLoading || tagsLoading ? (
                <p className="font-mono text-sm text-muted">
                  $ loading tools<span className="terminal-cursor text-accent">_</span>
                </p>
              ) : visibleItems.length === 0 ? (
                <p className="font-mono text-sm text-muted">
                  <span className="text-accent">❯</span>{' '}
                  {items.length === 0 ? 'no tools added yet' : 'no matches'}
                  {hasActiveFilters && (
                    <>
                      {' — '}
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="text-accent hover:underline"
                      >
                        clear filters
                      </button>
                    </>
                  )}
                </p>
              ) : isGrouped ? (
                <div className="flex flex-col gap-8">
                  {categoryGroups.map((group) => (
                    <CategorySection
                      key={group.label}
                      label={group.label}
                      items={group.items}
                      onSelect={setSelectedItem}
                    />
                  ))}
                </div>
              ) : (
                <ItemGrid items={visibleItems} onSelect={setSelectedItem} />
              )}
            </motion.div>

            <AnimatePresence>
              {selectedItem && (
                <ItemDetail
                  item={selectedItem}
                  allTags={tags}
                  groups={filterGroups}
                  onClose={() => setSelectedItem(null)}
                />
              )}
            </AnimatePresence>
          </motion.main>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}

export default App
