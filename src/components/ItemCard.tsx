import { motion } from 'motion/react'
import type { TechItem } from '../types/item'
import { Icon } from './Icon'
import { getSimpleIconMeta } from '../lib/simpleIcons'
import { RECOMMENDED_TAG_ID } from '../data/filterTags'

interface ItemCardProps {
  item: TechItem
  onSelect: (item: TechItem) => void
}

export function ItemCard({ item, onSelect }: ItemCardProps) {
  const tintHex =
    item.icon.kind === 'simple-icons' ? getSimpleIconMeta(item.icon.slug)?.hex : item.icon.tint
  const isRecommended = item.tags.includes(RECOMMENDED_TAG_ID)

  return (
    <motion.button
      type="button"
      layoutId={`item-${item.id}`}
      onClick={() => onSelect(item)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      style={
        tintHex
          ? {
              backgroundColor: 'var(--color-surface)',
              backgroundImage: `linear-gradient(to bottom, #${tintHex}1a 0%, var(--color-surface) 60%)`,
            }
          : undefined
      }
      className="group relative flex flex-col items-center gap-2 rounded-md border border-border bg-surface p-4 text-center transition-colors hover:border-accent hover:shadow-[0_0_16px_rgba(126,231,135,0.2)] focus-visible:border-accent focus-visible:outline-none"
    >
      {isRecommended && (
        <span role="img" aria-label="Recommended" className="absolute top-1.5 right-1.5 text-accent-2">
          ★
        </span>
      )}
      <Icon icon={item.icon} className="size-8" />
      <span className="font-mono text-sm font-medium text-fg">
        {item.name}
        <span className="cursor-blink text-accent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
          _
        </span>
      </span>
    </motion.button>
  )
}
