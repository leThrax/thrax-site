import { useEffect } from 'react'
import { motion } from 'motion/react'
import type { TechItem } from '../types/item'
import type { FilterGroup, FilterTag } from '../types/filter'
import { Icon } from './Icon'
import { CopyableCommand } from './CopyableCommand'
import { getSimpleIconMeta } from '../lib/simpleIcons'

interface ItemDetailProps {
  item: TechItem
  allTags: FilterTag[]
  groups: FilterGroup[]
  onClose: () => void
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export function ItemDetail({ item, allTags, groups, onClose }: ItemDetailProps) {
  const tintHex =
    item.icon.kind === 'simple-icons' ? getSimpleIconMeta(item.icon.slug)?.hex : item.icon.tint
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <motion.div
        layoutId={`item-${item.id}`}
        onClick={(e) => e.stopPropagation()}
        style={
          tintHex
            ? {
                backgroundColor: 'var(--color-surface)',
                backgroundImage: `linear-gradient(to bottom, #${tintHex}1a 0%, var(--color-surface) 60%)`,
              }
            : undefined
        }
        className="flex w-full max-w-sm flex-col gap-3 rounded-md border border-border bg-surface p-6"
      >
        <div className="flex items-start justify-between gap-4 font-mono text-xs text-muted">
          <span>
            $ info {item.id}
          </span>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-accent">
            [x]
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Icon icon={item.icon} className="size-10" />
          <h2 className="font-mono text-lg font-medium text-fg">
            {item.name}
            <span className="terminal-cursor text-accent">_</span>
          </h2>
        </div>

        {sortedGroups.map((group) => {
          const tagsInGroup = item.tags
            .map((tagId) => allTags.find((t) => t.id === tagId))
            .filter((t): t is FilterTag => t?.group === group.id)
          if (tagsInGroup.length === 0) return null
          return (
            <div key={group.id} className="flex flex-wrap items-center gap-1 font-mono text-xs">
              <span className="text-muted uppercase tracking-wide">{group.label}</span>
              {tagsInGroup.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded border border-accent bg-accent/10 px-1.5 py-0.5 text-accent"
                >
                  --{tag.id}
                </span>
              ))}
            </div>
          )
        })}

        {item.description && <p className="font-sans text-base leading-relaxed text-fg">{item.description}</p>}

        {item.installCommands.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-muted uppercase tracking-wide">Install</span>
            {item.installCommands.map((entry, index) => (
              <CopyableCommand key={index} command={entry.command} />
            ))}
          </div>
        )}

        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start font-mono text-sm text-accent underline-offset-4 hover:underline"
          >
            → visit {hostnameOf(item.url)}
          </a>
        )}

        <p className="mt-2 font-mono text-xs text-muted">[esc] close</p>
      </motion.div>
    </motion.div>
  )
}
