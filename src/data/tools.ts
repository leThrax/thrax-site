import type { ComponentType } from 'react'
import { LiarsDiceCalculator } from '../tools/liars-dice/LiarsDiceCalculator'

export interface Tool {
  slug: string
  name: string
  description: string
  component: ComponentType
}

// Adding a future tool is one entry here plus one new src/tools/<slug>/
// folder — no main.tsx edit needed, same growth model as NAV_LINKS driving
// SiteNav/HomePage/CommandPalette without per-route wiring.
export const TOOLS: Tool[] = [
  {
    slug: 'liars-dice',
    name: "Liar's Dice Odds",
    description: "Binomial odds calculator for calling — or making — a Liar's Dice bid.",
    component: LiarsDiceCalculator,
  },
]
