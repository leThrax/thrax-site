import { lazy } from 'react'

// Lazy-loaded, unlike every other route: HardwarePage pulls in three.js/
// react-three-fiber/drei for the 3D model, an unusually heavy dependency
// that would otherwise land in the main bundle every page pays for.
export const HardwarePageLazy = lazy(() =>
  import('../../pages/HardwarePage.tsx').then((m) => ({ default: m.HardwarePage })),
)
