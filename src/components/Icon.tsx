import { useEffect, useState } from 'react'
import type { IconRef } from '../types/item'
import { getSimpleIconMeta, loadSimpleIconSvg } from '../lib/simpleIcons'

interface IconProps {
  icon: IconRef
  className?: string
}

export function Icon({ icon, className }: IconProps) {
  const [svg, setSvg] = useState<string | null>(null)

  useEffect(() => {
    setSvg(null)
    if (icon.kind !== 'simple-icons') return
    let cancelled = false
    loadSimpleIconSvg(icon.slug).then((markup) => {
      if (!cancelled && markup) setSvg(markup)
    })
    return () => {
      cancelled = true
    }
  }, [icon])

  if (icon.kind === 'custom') {
    return <img src={icon.url} className={className} alt="" />
  }

  const meta = getSimpleIconMeta(icon.slug)
  if (!svg || !meta) return null

  return (
    <span
      className={`inline-block [&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className ?? ''}`}
      style={{ color: `#${meta.hex}` }}
      role="img"
      aria-label={meta.title}
      // simple-icons SVG markup is trusted, locally bundled vendor content —
      // never derived from user/admin input beyond selecting a known slug.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
