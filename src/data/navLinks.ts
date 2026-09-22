export interface NavLink {
  path: string
  label: string
  flag: string
  description: string
}

// Shared between SiteNav (the persistent shell-flag-style nav bar) and
// HomePage (the quick-link cards) so both stay in sync automatically.
export const NAV_LINKS: NavLink[] = [
  {
    path: '/software',
    label: 'Software Stack',
    flag: 'software',
    description: 'Tools, apps, and CLI utilities I actually use — filterable by OS and topic.',
  },
  {
    path: '/hardware',
    label: 'Hardware',
    flag: 'hardware',
    description: 'My rig, homeserver, and laptops — specs plus an interactive 3D model.',
  },
  {
    path: '/projects',
    label: 'Projects',
    flag: 'projects',
    description: 'Public repos, pulled live from GitHub.',
  },
  {
    path: '/cv',
    label: 'CV',
    flag: 'cv',
    description: 'Experience, education, and skills.',
  },
  {
    path: '/blog',
    label: 'Blog',
    flag: 'blog',
    description: 'Tutorials and software reviews.',
  },
  {
    path: '/tools',
    label: 'Tools',
    flag: 'tools',
    description: "Small browser-based utilities — starting with a Liar's Dice odds calculator.",
  },
]
