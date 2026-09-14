import { NavLink } from 'react-router-dom'
import { NAV_LINKS } from '../data/navLinks'

const inactiveClasses = 'border border-transparent text-muted hover:border-accent-2 hover:text-accent-2'
const activeClasses = 'border border-accent bg-accent/10 text-accent'

export function SiteNav() {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto rounded-md border border-border bg-surface px-2 py-2 font-mono text-sm">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `shrink-0 rounded px-2 py-1 font-semibold transition-colors ${isActive ? activeClasses : inactiveClasses}`
        }
      >
        ~
      </NavLink>
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `shrink-0 rounded px-2 py-1 transition-colors ${isActive ? activeClasses : inactiveClasses}`
          }
        >
          --{link.flag}
        </NavLink>
      ))}
    </nav>
  )
}
