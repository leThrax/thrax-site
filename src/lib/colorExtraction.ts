const FILL_ATTR_REGEX = /fill=["']\s*(#[0-9a-fA-F]{3,8})\s*["']/g
const FILL_STYLE_REGEX = /fill:\s*(#[0-9a-fA-F]{3,8})/g

function normalizeHex(hex: string): string {
  const value = hex.replace('#', '')
  if (value.length === 3) {
    return value
      .split('')
      .map((c) => c + c)
      .join('')
      .toLowerCase()
  }
  return value.slice(0, 6).toLowerCase()
}

export function extractColorFromSvgText(text: string): string | null {
  const found = new Set<string>()
  for (const regex of [FILL_ATTR_REGEX, FILL_STYLE_REGEX]) {
    for (const match of text.matchAll(regex)) {
      found.add(normalizeHex(match[1]))
    }
  }
  return found.size === 1 ? [...found][0] : null
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = src
  })
}

function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  if (max === min) return 0
  const lightness = (max + min) / 2
  const d = max - min
  return lightness > 0.5 ? d / (2 - max - min) : d / (max + min)
}

/** Weights each pixel by how saturated (vivid) it is, squared, so a colorful
 * foreground glyph dominates over a large, merely dark/muted background fill
 * — many icons (e.g. macOS-style app icons) are a small vivid mark centered
 * on a big flat dark tile, and a plain average would mostly just describe
 * the tile. Returns null if there's essentially no color signal at all
 * (a genuinely grayscale/monochrome image), so the caller can fall back. */
function saturationWeightedAverage(data: Uint8ClampedArray): string | null {
  let r = 0
  let g = 0
  let b = 0
  let weightSum = 0
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha < 128) continue
    const red = data[i]
    const green = data[i + 1]
    const blue = data[i + 2]
    const weight = saturation(red, green, blue) ** 2
    r += red * weight
    g += green * weight
    b += blue * weight
    weightSum += weight
  }
  if (weightSum < 1) return null
  const toHex = (n: number) => Math.round(n / weightSum).toString(16).padStart(2, '0')
  return `${toHex(r)}${toHex(g)}${toHex(b)}`
}

function plainAverage(data: Uint8ClampedArray): string | null {
  let r = 0
  let g = 0
  let b = 0
  let count = 0
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha < 128) continue
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
    count++
  }
  if (count === 0) return null
  const toHex = (n: number) => Math.round(n / count).toString(16).padStart(2, '0')
  return `${toHex(r)}${toHex(g)}${toHex(b)}`
}

export async function extractColorFromImage(file: File): Promise<string | null> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImage(objectUrl)
    const size = 32
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, size, size)

    let data: Uint8ClampedArray
    try {
      data = ctx.getImageData(0, 0, size, size).data
    } catch {
      return null
    }

    // Saturation-weighted first — picks out a vivid foreground mark over a
    // dark/muted background tile. Falls back to a plain average only for a
    // genuinely grayscale/monochrome icon (no color signal to weight by).
    return saturationWeightedAverage(data) ?? plainAverage(data)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export async function extractIconTint(file: File): Promise<string | null> {
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
  if (isSvg) {
    const text = await file.text()
    const fromSvg = extractColorFromSvgText(text)
    if (fromSvg) return fromSvg
  }
  return extractColorFromImage(file)
}
