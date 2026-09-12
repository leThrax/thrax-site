interface ManagerSearch {
  aliases: string[]
  url: (query: string) => string
}

// Search-URL templates, verified against the actual sites (not guessed) —
// Homebrew's own site has no linkable search page at all (client-side-only
// Algolia widget), so it's substituted with GitHub code search across the
// homebrew-cask tap instead.
const MANAGER_SEARCHES: ManagerSearch[] = [
  {
    aliases: ['brew', 'homebrew'],
    url: (q) => `https://github.com/search?q=repo%3AHomebrew%2Fhomebrew-cask+${encodeURIComponent(q)}&type=code`,
  },
  {
    aliases: ['choco', 'chocolatey'],
    url: (q) => `https://community.chocolatey.org/packages?q=${encodeURIComponent(q)}`,
  },
  { aliases: ['winget'], url: (q) => `https://winget.run/search?query=${encodeURIComponent(q)}` },
  { aliases: ['pacman', 'arch'], url: (q) => `https://archlinux.org/packages/?q=${encodeURIComponent(q)}` },
  { aliases: ['aur'], url: (q) => `https://aur.archlinux.org/packages?K=${encodeURIComponent(q)}` },
  {
    aliases: ['apt', 'apt-get', 'ubuntu'],
    url: (q) => `https://packages.ubuntu.com/search?keywords=${encodeURIComponent(q)}`,
  },
  { aliases: ['debian'], url: (q) => `https://packages.debian.org/search?keywords=${encodeURIComponent(q)}` },
  { aliases: ['snap'], url: (q) => `https://snapcraft.io/search?q=${encodeURIComponent(q)}` },
  { aliases: ['flatpak'], url: (q) => `https://flathub.org/apps/search?q=${encodeURIComponent(q)}` },
  { aliases: ['npm'], url: (q) => `https://www.npmjs.com/search?q=${encodeURIComponent(q)}` },
  { aliases: ['cargo'], url: (q) => `https://crates.io/search?q=${encodeURIComponent(q)}` },
  { aliases: ['pip', 'pypi'], url: (q) => `https://pypi.org/search/?q=${encodeURIComponent(q)}` },
  { aliases: ['gem'], url: (q) => `https://rubygems.org/search?query=${encodeURIComponent(q)}` },
  { aliases: ['scoop'], url: (q) => `https://scoop.sh/#/apps?q=${encodeURIComponent(q)}` },
]

export function getPackageManagerSearchUrl(manager: string, query: string): string | null {
  const key = manager.trim().toLowerCase()
  if (!key || !query.trim()) return null
  return MANAGER_SEARCHES.find((m) => m.aliases.includes(key))?.url(query.trim()) ?? null
}
