import iconsData from 'simple-icons/icons.json'

export interface SimpleIconMeta {
  title: string
  slug: string
  hex: string
}

const allIcons = iconsData as SimpleIconMeta[]
const metaBySlug = new Map(allIcons.map((icon) => [icon.slug, icon]))

export function getSimpleIconMeta(slug: string): SimpleIconMeta | undefined {
  return metaBySlug.get(slug)
}

export function searchSimpleIcons(query: string, limit = 20): SimpleIconMeta[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return allIcons
    .filter((icon) => icon.title.toLowerCase().includes(q) || icon.slug.includes(q))
    .slice(0, limit)
}

// Each icon's SVG markup is loaded lazily, per-slug, as its own chunk — avoids
// bundling all ~3,500 icons' path data up front just to support picking any of
// them by slug (only data/simple-icons.json's small metadata is bundled eagerly).
const svgLoaders = import.meta.glob('../../node_modules/simple-icons/icons/*.svg', {
  query: '?raw',
  import: 'default',
})

export async function loadSimpleIconSvg(slug: string): Promise<string | undefined> {
  const loader = svgLoaders[`../../node_modules/simple-icons/icons/${slug}.svg`]
  if (!loader) return undefined
  const markup = (await loader()) as string
  return markup.replace('<svg ', '<svg fill="currentColor" ')
}
