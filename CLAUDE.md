# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This started as the default `npm create vite` react-ts scaffold and is now a single-page, filterable showcase of the site owner's tech stack — see "Tech-stack showcase" below for the full architecture and current build status.

## Tech-stack showcase

A single page lists "items" (apps, CLI tools, etc.), each with an icon and free-form tags (e.g. "Proton VPN" → `windows, mac-os, linux, privacy, vpn, proton`). A set of filter chips, grouped into categories (e.g. "Operating System": Macos/Windows/Linux/CachyOS/Ubuntu; "Topic": Privacy/...), narrows the visible items with smooth remove/reflow animation. Items are added over time through an admin login + panel rather than by editing code.

### Implementation status

- **Built**: Tailwind v4 styling, the grouped/animated filter grid (`FilterBar`/`FilterChip`, `ItemGrid`/`ItemCard`, `motion` exit/reflow animation) with selection synced to the URL query string (`useUrlSyncedFilters`), the pure `filtering.ts` matching logic with Vitest coverage, a `simple-icons`-based `Icon` component (brand-colored, dynamic lookup), the Supabase data-fetch wiring (`supabaseClient.ts`, `useItems`/`useTags`/`useCategories` hooks), a full admin panel at `/admin` (Supabase Auth login, add/edit/delete for items, `simple-icons` search-and-pick **or** custom image upload to Supabase Storage, edit forms opening inline at the item's position in the list rather than at the top of the page), a fully dynamic tag catalog (`TagPicker` in the admin form — click any existing tag to add it, or create a brand-new one on the fly; it's usable everywhere immediately, no code change/redeploy), and an equivalent single-select category catalog (`CategoryPicker`, backed by its own `categories` table — see "Category grouping" below).
- **Not yet built**: nothing outstanding from the original plan or subsequent requests so far.
- **Blocked on the user**: the Supabase project itself doesn't exist until you create one. Until it's created and configured (see "Supabase setup" below), `useItems` will log a console warning and the grid will show a "Couldn't load items" error — this is expected, not a bug.
- **Deployment note**: `/admin` is a client-side-only route (checked via `window.location.pathname` in `main.tsx`, no server routing). A static host must be configured to serve `index.html` for unknown paths (SPA fallback/rewrite — e.g. Vercel/Netlify's default rewrite-all-to-index behavior) or a direct visit to `/admin` will 404.

### Supabase setup (one-time, done by the project owner)

1. Create a project at supabase.com (free tier is sufficient).
2. In the SQL Editor, run `supabase/schema.sql` from this repo — creates the `items` and `tags` tables, enables RLS, adds public-read/admin-write policies, and (optionally) seeds 6 demo items + the 6 starter tags. Leave the `'<ADMIN_USER_ID>'` placeholders as-is for now.
3. In Authentication settings, disable public sign-ups, then manually create the one admin user (Authentication -> Users -> Add user).
4. Copy that user's UID and re-run the whole file with the real UID substituted in place of every `'<ADMIN_USER_ID>'` (the policies are `drop if exists`-then-`create`, so this is safe to re-run any time, e.g. after rotating the admin user).
5. Create a public Storage bucket named `icons` (used for custom icon uploads from the admin form).
6. Copy `.env.local.example` to `.env.local` and fill in the project's URL and anon key (Project Settings -> API).
7. Visit `/admin` locally and sign in with the admin user's email/password from step 3.

### Confirmed tech-stack decisions

| Area | Decision | Why |
|---|---|---|
| Data storage | **Supabase** (hosted Postgres + Auth + Storage) | Items are added later via an admin panel, which rules out a static code-only data file |
| Icon sourcing | **`simple-icons`** npm package, looked up dynamically by slug at runtime (not a hand-maintained per-icon import map); local custom-SVG/upload fallback for anything missing | Thousands of brand SVGs (OS logos, dev tools, CLI tools), MIT licensed, no runtime network dependency. Dynamic lookup means an item added via the admin panel with a new `simple-icons` slug renders immediately, no developer/redeploy step needed |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` | Fast to build chips/cards/responsive grid + the admin form UI consistently |
| Animation | **`motion`** (Framer Motion) | `AnimatePresence` for exit animations + `layout` prop for FLIP-based reflow when filtered items are removed |
| Filter grouping | Grouped into categories, **OR within a group, AND across groups** | Standard faceted-search semantics — selecting two OS filters shows either OS, adding a Topic filter narrows further. A flat AND-everything model would zero out results whenever two same-group chips are selected |
| Routing | None (no `react-router`) | Single public route; the admin route can be gated with a plain `pathname` check |
| Testing | **Vitest**, scoped to the filtering logic | No test runner exists yet; the filter-matching function is pure and worth locking down with unit tests |

### Visual design: terminal/neofetch theme

The site commits to a single fixed dark theme (no light-mode variant, no `dark:` variants anywhere) — a deliberate identity choice grounded in the content itself (Proton VPN, CachyOS, iTerm2 are exactly "ricing/dotfiles" territory), not a generic dark-mode reskin. Design tokens live in `src/index.css`'s Tailwind v4 `@theme` block:

| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#0d0f12` | page background |
| `--color-surface` | `#15181d` | cards, panels |
| `--color-surface-hover` | `#1b1f26` | card hover bg |
| `--color-border` | `#2a2f3a` | hairline borders |
| `--color-fg` | `#d8dee9` | primary text |
| `--color-muted` | `#6b7280` | dim/secondary text |
| `--color-accent` | `#7ee787` | primary accent (prompt, active/selected, links) |
| `--color-accent-2` | `#d992ff` | secondary accent (hover highlights) |

These `--color-*` names are what Tailwind v4 auto-generates `bg-*`/`text-*`/`border-*` utilities from (e.g. `bg-surface`, `text-accent`, `border-border`) — no `tailwind.config.js` needed, still CSS-first.

Type: `JetBrains Mono` as the **display/UI face** (headings, buttons, tags, card names — used almost everywhere, loaded via `<link>` in `index.html`, not a package), `Inter` as the **body face**, used only for the item description prose in `ItemDetail` where a humanist sans reads better than mono for a full sentence.

Signature element: `FetchHeader.tsx` — a bordered "terminal window" panel at the top of the public page showing live data (item count, current filter selection rendered as shell flags, e.g. `Shell: --os=macos,linux --topic=privacy`) rather than being purely decorative. Filter chips (`FilterChip.tsx`) are styled the same way — visually `--{tag.id}` (e.g. `--privacy`), with `aria-label` carrying the human-readable `tag.label` so screen readers still announce "Privacy," not the raw flag string.

Per-item tint: `ItemCard`/`ItemDetail` both resolve a `tintHex` — `getSimpleIconMeta(slug)?.hex` for `simple-icons` items, or `item.icon.tint` for `custom` items (see below) — and, when present, set inline `style={{ backgroundColor: 'var(--color-surface)', backgroundImage: 'linear-gradient(to bottom, ...)' }}` — a ~10%-opacity top-down wash of that color fading into `var(--color-surface)` by 60% down the card. **Important:** `backgroundColor` and `backgroundImage` are set as two separate style properties deliberately, not combined into the `background` shorthand — the shorthand resets `background-color` to `transparent` when not included in its value, and since the gradient's own colors are alpha-blended (semi-transparent at the top stop), that let the page's `body` scanline/vignette background (see below) bleed straight through the top of every tinted card. A straight top-down fade was chosen over an earlier radial/circular version specifically because it reads better against the card's sharp corners and borders. Both components apply the *same* gradient so the shared-`layoutId` morph animation between them doesn't show a jarring background snap. Inline `style` always wins over Tailwind classes regardless of specificity, which is why `ItemCard` doesn't also try to layer a `hover:bg-surface-hover` class — that would silently never apply once tinted; the `hover:border-accent` + shadow-glow hover feedback carries hover state instead, uniformly for tinted and untinted cards.

**Custom-icon tint extraction** (`src/lib/colorExtraction.ts`): custom uploads have no bundled color metadata, so a tint is extracted from the file itself, once, at upload time in `ItemForm` (same "expensive one-off work belongs in the admin flow" principle as the Wikipedia auto-fill) and stored in `items.icon_tint` — the public page never re-analyzes images. Two-tier extraction: (1) for SVGs, read the file as text and regex for `fill="#…"`/`fill:#…` values; if exactly one distinct color turns up (true for most simple single-color brand marks), use it directly; (2) otherwise (raster image — PNG etc. — or an SVG with zero/multiple distinct fills), draw the image onto a small offscreen canvas and run `saturationWeightedAverage()` — each opaque pixel's contribution is weighted by its HSL saturation squared, so a small vivid foreground glyph dominates the result over a large flat dark/muted background tile (common for app-icon-style PNGs: a colorful mark centered on a big dark rounded-square backdrop). A plain unweighted average would instead mostly just describe the backdrop, producing a muddy, barely-noticeable color close to the theme's own `--color-surface`. If the weighted pass finds no meaningful color signal at all (weight sum near zero — a genuinely grayscale/monochrome icon, e.g. solid black or white), it falls back to `plainAverage()` so those icons still get *some* representative shade instead of no tint at all. Existing custom-icon items uploaded before this feature (or before this saturation-weighting revision) won't have a tint, or may have the old muddier one, until their icon is re-uploaded — an accepted gap, not specially handled.

**Page background**: `body` in `src/index.css` layers two static `background-image` gradients over `--color-bg` — a `radial-gradient` vignette (darkens toward the edges/corners, transparent in the readable center) and a `repeating-linear-gradient` scanline texture (faint 1px-on/2px-off horizontal lines) — plus `background-attachment: fixed`. Both are static (no `@keyframes`), so there's nothing to gate behind `prefers-reduced-motion`. Since every card/panel (`FetchHeader`, `ItemCard`, `ItemDetail`, admin panels) paints its own opaque-ish background on top, this texture is only visible in the page's negative space around them, not layered over content.

**File input styling**: native `<input type="file">` buttons are unstyled/tiny by default and easy to miss. `ItemForm`'s custom-icon upload input uses Tailwind's `file:` variant (targets `::file-selector-button` directly, no hidden-input/label trick needed) to give the browse button the same bordered/accent-colored look as the rest of the form's buttons.

**Page-load fade-in** (`App.tsx`): the outer `<motion.main>` and its top-level sections (`FetchHeader`, `SearchBox`, `FilterBar`, the error/loading/`ItemGrid` block) share a parent/child `variants` pair (`containerVariants`/`sectionVariants`) — Framer Motion automatically propagates the parent's `staggerChildren`/`delayChildren` timing to children using the same variant names, so each section fades and slides in ~120ms after the previous one with no manual per-section delay math. The whole tree is wrapped in `<MotionConfig reducedMotion="user">` (from `motion/react`), which automatically drops the `y` slide for users with `prefers-reduced-motion` set while still letting the opacity fade play — the same respect-the-preference approach already used for the `cursor-blink`/`terminal-cursor` animations, just via Motion's built-in mechanism instead of a manual CSS media query.

**Boot sequence** (`src/components/BootSequence.tsx`): a purely decorative simulated Linux kernel/systemd boot log that plays before `<motion.main>` on first load — a fixed list of `dmesg`/`[  OK  ]`-style lines revealed one at a time via a `setTimeout` chain (same tick-based pattern as `useTypewriter`, but whole-line reveal rather than character-by-character, matching how real boot logs actually print). `App.tsx` toggles between `<BootSequence>` and `<motion.main>` inside an outer `<AnimatePresence mode="wait">` (nested around the existing `ItemDetail` `AnimatePresence`, which is unrelated and unaffected) so the boot overlay fully fades out before the main content's own entrance begins, rather than the two overlapping. Plays once per browser **session** (`sessionStorage`, key `thrax-site:booted` — checked directly in `useState`'s initializer, no `useEffect`/no SSR guard, consistent with how `useUrlSyncedFilters` already reads `window.location` directly), is click-to-skip, and — checked manually via `window.matchMedia('(prefers-reduced-motion: reduce)')` inside the component rather than relying on `MotionConfig` alone, since skipping the sequence *entirely* (not just softening it) is the correct behavior here — is bypassed altogether under that preference.

Motion: a blinking text-cursor (`_`) appears after an item name on card hover/focus. Implemented as a plain CSS rule scoped to `.group:hover .cursor-blink` / `.group:focus-visible .cursor-blink` (**not** an unconditional `.cursor-blink { animation: ... }`) — the animation itself must be conditional on the hover/focus selector, or its keyframe-driven opacity would override the `opacity-0`/`group-hover:opacity-100` show/hide utilities and blink constantly regardless of hover state. Disabled under `@media (prefers-reduced-motion: reduce)` using the same selector (so specificity matches and the override actually wins). A second, unconditional variant, `.terminal-cursor` (same `@keyframes cursor-blink`, always animating), is used for the standalone `|` cursor at the end of `FetchHeader`'s Shell: line, and for the name cursor in `ItemDetail` (continuous there instead of hover-gated, since the detail view is already the active/open state).

**Scrollbar**: a global rule in `index.css` sets `scrollbar-color`/`scrollbar-width` (Firefox) plus `::-webkit-scrollbar*` pseudo-elements (Chromium/Safari) so the scrollbar thumb uses `--color-accent` (brightening to `--color-accent-2` on hover) against a `--color-bg` track, instead of the browser default.

**No-results state** (`App.tsx`): when `visibleItems` is empty post-filter/search, shows a `❯`-prefixed message instead of an empty grid — distinguishing "no tools added yet" (`items.length === 0`, nothing to clear) from "no matches" (search/filters excluded everything), and in the latter case offering an inline "clear filters" action that resets both `searchQuery` and `selected` at once.

`FetchHeader`'s Shell: line runs through `src/hooks/useTypewriter.ts` — a small state machine (tracked via refs, not just React state, to survive being re-triggered mid-animation) that deletes whatever's currently displayed down to empty, then types the new target out character by character, re-running every time the target string (the filter flags) changes. On first mount, since nothing's displayed yet, it skips straight to typing `--all`. This is a deliberate full clear-and-retype on every change (not a common-prefix diff), matching the terminal-redraw feel intentionally over a smarter/smoother diff.

### Data model

```ts
// src/types/item.ts
interface TechItem {
  id: string;                 // slug, e.g. "proton-vpn"
  name: string;
  tags: string[];              // free-form tag ids, stored in Postgres as text[]
  icon: IconRef;
  description?: string;
  url?: string;
  category?: string;           // id of a Category (Supabase `categories` table), not free text — see "Category grouping" below
  installCommands: InstallCommand[]; // package-manager commands, stored as jsonb; [] not undefined, same convention as tags
}

interface InstallCommand { manager: string; command: string } // e.g. { manager: "brew", command: "brew install --cask protonvpn" }

type IconRef =
  | { kind: "simple-icons"; slug: string }   // resolved from the offline-bundled set
  | { kind: "custom"; url: string; tint?: string }; // uploaded to Supabase Storage; tint extracted at upload time, see below

// src/types/filter.ts
interface FilterTag { id: string; label: string; group: string }   // Supabase `tags` table
interface FilterGroup { id: string; label: string; order: number } // src/data/filterTags.ts, static

// src/types/category.ts
interface Category { id: string; label: string } // Supabase `categories` table
```

Tag *values* on each item, and the tag *catalog* itself (id/label/group), both live in Supabase — the admin panel can add a new tag on the fly (via `TagPicker`, see below) and it's immediately usable everywhere, no code change needed. Only the *groups* ("Operating System", "Topic", "Featured") stay a small hand-maintained static array in `src/data/filterTags.ts` — adding a new group is a deliberate taxonomy decision, not routine content entry, so it's left as a manual code change (schema migration included, since the `tags.group_id` column has a `check` constraint enumerating valid groups).

**"Recommended" tag** (`RECOMMENDED_TAG_ID` in `filterTags.ts`): a specific, code-recognized tag within the "Featured" group. Unlike ordinary tags, its presence on an item has two extra effects, both driven purely by checking `item.tags.includes(RECOMMENDED_TAG_ID)` — no separate boolean field: `sortRecommendedFirst()` (`lib/filtering.ts`) sorts recommended items to the front of the grid (stable sort, so relative order is otherwise preserved), and `ItemCard` renders a small ★ badge (secondary accent color, top-right corner) on them. Being an ordinary tag under the hood means it also shows up as a normal filterable flag in `FilterBar` (`--recommended`) and in `ItemDetail`'s grouped tag list, for free — no special-casing needed there. The "Featured" group exists specifically so a curation/meta tag like this doesn't get mixed into "Topic," which describes properties of the tool itself, not the site owner's opinion of it.

**Category grouping** (`groupByCategory()` in `lib/filtering.ts`, `CategorySection.tsx`): once the item list gets large, a flat grid gets cluttered, so `App.tsx` groups `visibleItems` by `item.category` into labeled sections (`❯ BROWSER`, `❯ GAMING`, ...) — each just a heading followed by the *same* `ItemGrid` component, so nothing about card rendering, the shared-`layoutId` detail-view morph, or `sortRecommendedFirst` changes; recommended items still sort first, just *within* their own category section rather than being pulled into a separate cross-cutting one (deliberately — pulling them out would make a category look like it's missing something). `item.category` holds a **category id**, resolved to a display label via the `categories` catalog (`useCategories()`, passed into `groupByCategory(items, categories)`) — categories are created once via the admin panel's `CategoryPicker` (single-select sibling of `TagPicker`, see "Admin panel" below) and picked from existing ones thereafter, the same click-to-reuse workflow as tags, which is why case-drift ("Browser" vs "browser") is no longer a concern the grouping logic has to paper over. Categories deliberately live in their own `categories` table rather than being folded into `tags`/`FilterGroup` — a tag group is multi-select and automatically becomes a public filter facet (every group is iterated generically in `FilterBar`), whereas a category is single-select-per-item and intentionally stays out of the public filter UI (grouping/display only); a separate table avoids needing to special-case or exclude a "Category" group from that generic iteration. Categories sort alphabetically by label; uncategorized items — or an item whose `category` id no longer resolves in the catalog (e.g. a stale reference) — land in an "Other" bucket always shown last. If literally nothing has a category set yet, `App.tsx` falls back to today's flat, headerless grid instead of showing a single pointless "❯ OTHER" heading — grouping only kicks in once it's actually being used.

### Supabase layer

- **`items` table**: `id`, `name`, `tags text[]`, `description`, `url`, `category` (a `categories.id`, not free text), `icon_kind`, `icon_value` (slug or Storage URL), `icon_tint` (nullable — extracted color for custom icons only, see "Per-item tint" below), `created_at`.
- **`tags` table**: `id`, `label`, `group_id` (`'os' | 'topic'`, checked against the static groups), `created_at`. No update/rename policy (tags are only ever added or deleted, never renamed) — see "Deleting tags" below.
- **`categories` table**: `id`, `label`, `created_at`. Same never-renamed, only-added-or-deleted convention as `tags`, and same admin-only write RLS pattern; unlike `tags` it has no `group_id` (categories aren't grouped) and its rows are never iterated by `FilterBar`. `supabase/schema.sql` includes a one-time backfill that converts any pre-existing free-text `items.category` values into real catalog rows (slugified id, original text as label) and repoints `items.category` at the new ids — safe to re-run.
- **Storage bucket** (`icons`): custom-uploaded icon images for items not covered by `simple-icons`.
- **Auth**: a single admin account. Public sign-up disabled at the project level; the admin user is created once via the Supabase dashboard.
- **RLS**: public `select` on `items`/`tags`/`categories` (anon key, read-only); `insert`/`update`/`delete` on `items`, and `insert`/`delete` on `tags` and `categories`, restricted to `auth.uid() = '<admin-user-id>'`. Same read-public/write-admin-only pattern on the `icons` bucket.
- **Client**: `src/lib/supabaseClient.ts`, initialized from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (Vite env vars, kept in `.env.local`, not committed). The anon key is safe to expose client-side by design — RLS protects writes, not key secrecy.
- The public page fetches items and tags once on load into React state (`useItems`/`useTags`); all filtering happens client-side against that in-memory data (no per-filter-click network calls).

### Filtering algorithm

Pure, framework-independent function in `src/lib/filtering.ts`:

```
matches(item, selectedTagsByGroup) =
  every group g:
    selectedTagsByGroup[g] is empty
    OR item.tags intersects selectedTagsByGroup[g]
```

Filter state is `Record<groupId, Set<tagId>>` synced to `URLSearchParams` via `src/hooks/useUrlSyncedFilters.ts` — a drop-in `useState` replacement (same tuple shape) that reads the initial selection from `window.location.search` on mount and mirrors changes back via `history.replaceState` (no `popstate` listener; back/forward filter-history navigation isn't a goal, only shareable/bookmarkable links).

**Free-text search** (`SearchBox.tsx`, `matchesSearch`/`searchItems` in `filtering.ts`): a separate, simpler mechanism from tag faceting — plain case-insensitive substring match on `item.name` only (not description/tags), deliberately not URL-synced (`App.tsx` holds `searchQuery` in plain `useState`) since shareable search links weren't asked for, unlike the tag filters. Composed in `App.tsx` as `filterItems(searchItems(items, searchQuery), selected)` — search narrows first, tag-faceting applies on top, so the two combine with AND semantics. Styled as an inline `❯ ` prompt-prefixed underline input rather than a boxed search field, matching `FilterBar`'s prompt-symbol convention instead of introducing a different visual language for search vs. filter.

### Animation notes

`AnimatePresence` wraps the mapped grid so filtered-out items animate out; the `layoutId={`item-${item.id}`}` on each card (in place of a plain boolean `layout`) drives FLIP-based reflow of the remaining items *and* doubles as the shared-element id for the click-to-expand detail card (see below) — `layoutId` already implies the same local layout-animation behavior `layout` would, so there's no need for both. Every card needs a stable `key={item.id}`. No virtualization needed at the expected scale (dozens to low hundreds of items).

### Item detail card (`src/components/ItemDetail.tsx`)

Clicking an `ItemCard` (now a `motion.button`, so it's natively keyboard-accessible) calls `onSelect(item)`, set from `App.tsx`'s `selectedItem` state. `ItemDetail` renders a fixed, centered overlay whose inner card shares the *same* `layoutId={`item-${item.id}`}` as the clicked `ItemCard` — Framer Motion automatically animates the "morph" between the two across the tree, no manual position math and no `LayoutGroup` needed (there's only one grid and one detail overlay, and ids are unique per item). Shows, in order: the item's tags (grouped by category, styled as the same `--{id}` chips used in `FilterBar` — static, non-interactive spans copying that visual treatment rather than reusing `FilterChip` itself, since one is clickable and this isn't), its `description` (only if set), its install commands (only if any — see below), and a "Visit website" link to `item.url` (only if set) opening in a new tab — descriptive info first, then "how to get it," then "learn more." Needs `allTags`/`groups` passed down from `App.tsx` (same `tags`/`filterGroups` the public `FilterBar` already uses) purely to resolve each tag id to its label/group for display. Closes via backdrop click, an explicit `×`, or `Escape` (a `keydown` listener in a `useEffect` — a legitimate external-system-sync effect, same reasoning as `Icon.tsx`'s lazy-load effect).

**Install commands** (`src/components/CopyableCommand.tsx`): each entry in `item.installCommands` (free-form `{ manager, command }` pairs — the admin types the *entire* command, not just a package name, since managers need different flags/casks/taps that can't be auto-templated) renders as a `$ {command}` shell line with a copy button (`navigator.clipboard.writeText`, brief local "Copied!" confirmation via a timeout, silently no-ops if the clipboard API throws). Stored as `items.install_commands jsonb` — a flexible per-item list rather than fixed `brew`/`winget`/... columns, since any given item only supports a handful of the many possible managers. The admin-form editor (`ItemForm.tsx`) is a repeatable two-input-per-row list (manager, command) with add/remove, same spirit as `TagPicker`'s pattern; blank rows are dropped and values trimmed on submit.

**"Search on this manager" links** (`src/lib/packageManagerSearch.ts`): next to each install-command row's manager input, a live "search ↗" link opens that manager's own package-search page in a new tab, pre-filled with the item's name — a small static alias→URL-template table (`brew`/`homebrew`, `choco`/`chocolatey`, `winget`, `pacman`/`arch`, `aur`, `apt`/`ubuntu`, `debian`, `snap`, `flatpak`, `npm`, `cargo`, `pip`/`pypi`, `gem`, `scoop`), matched case-insensitively; unrecognized manager names just show no link. Every URL was verified directly (curl with a real browser UA) rather than assumed — notably **Homebrew has no linkable search page at all** (its site's search is a client-side-only Algolia widget with no server route), so its entry points at GitHub code search across the `Homebrew/homebrew-cask` tap instead. This is deliberately *not* live in-app search-and-autofill: public search-API coverage across these registries is too inconsistent (winget has no reliable public API at all) and CORS support unverifiable from outside a real browser, so the admin still copies the exact command back from the opened search page themselves — this only automates the navigation + query-typing step.

### Icon lookup (`src/lib/simpleIcons.ts`)

- Icon **metadata** (title/slug/hex for all ~3,500 `simple-icons` icons) is bundled eagerly via the package's `./icons.json` export (`simple-icons/icons.json`, ~450KB raw) — used for `getSimpleIconMeta(slug)` (color + display name) and `searchSimpleIcons(query)` (the admin form's icon picker).
- Each icon's **SVG markup** is loaded lazily, one file per icon, via `import.meta.glob('../../node_modules/simple-icons/icons/*.svg', { query: '?raw', import: 'default' })` in the same file — this code-splits ~3,459 tiny per-icon chunks so the main bundle doesn't eagerly ship all path data (that would be ~15MB uncompressed). The glob's module-reference table still adds real weight to the main bundle (~180KB gzip) as the cost of supporting "any slug, no redeploy."
- `Icon.tsx` combines both: renders nothing until the lazy SVG chunk resolves (async, via `useEffect` + local state — a legitimate use of an effect since it's synchronizing with an external system, a dynamically imported module), then injects the markup via `dangerouslySetInnerHTML` (safe here: the content is trusted, locally bundled vendor SVG, never derived from arbitrary user input beyond selecting a known slug) recolored via a wrapping `<span style={{ color: '#'+hex }}>` plus `fill="currentColor"` patched into the SVG string.
- `tsconfig.app.json` needs `resolveJsonModule: true` for the `icons.json` import to type-check.

### Admin panel (`src/admin/`)

- Routing: `src/main.tsx` renders `<AdminPage/>` instead of `<App/>` when `window.location.pathname === '/admin'` — no router library, per the "no `react-router`" decision above.
- `AdminPage.tsx` gates on `useSession()` (`src/hooks/useSession.ts`, wraps `supabase.auth.getSession()` + `onAuthStateChange`): shows `LoginForm` (email/password via `supabase.auth.signInWithPassword`) when signed out, otherwise the item list + form.
- **Add vs. edit form placement**: adding a new item shows `ItemForm` above `ItemList`, in the same spot as the "Add item" button it replaces (there's no existing row to anchor a brand-new item to). Editing an item instead renders the form *inline*, inside `ItemList` in place of that item's row (`ItemList`'s `editingItemId`/`editForm` props — `editForm` is the already-constructed `<ItemForm/>` element built once in `AdminPage`, so `ItemList` doesn't need every individual form prop threaded through it) — this avoids forcing a scroll back to the top of a long list just to see the form you opened. `AdminPage`'s `showForm`/`editingItem` state is unchanged by this (still two independently-set variables, kept in sync at each call site); only where the resulting form renders differs based on whether `editingItem` is set.
- `ItemForm.tsx` handles both add and edit (the `id`/slug field is auto-derived from `name` via `slugify()` until manually edited, and is disabled entirely when editing an existing item since it's the Postgres primary key). Icon selection is a radio toggle between **simple-icons** (text input backed by `searchSimpleIcons` suggestions) and **custom upload** (`<input type="file">`, uploaded via `src/lib/storage.ts`'s `uploadIcon(itemId, file)` to the `icons` Storage bucket at `${itemId}/${timestamp}-${filename}`, then stored as `{ kind: "custom", url: <public URL>, tint }`). A newly-selected custom file also runs through `extractIconTint()` (see "Per-item tint" above) with a small color-swatch preview next to the file input; editing an existing custom-icon item without picking a new file reuses both the existing URL and tint as-is.
- **Description + URL auto-fill**: an "Auto-fill from Wikipedia" button (above the Description/URL fields) calls `fetchWikipediaInfo(name)` (`src/lib/wikipedia.ts`) and fills *both* fields independently from one lookup. It tries an exact Wikipedia REST summary lookup by title first, falls back to the MediaWiki search API to resolve a near-miss title, and prefers the short Wikidata-style `description` field over the longer `extract` paragraph. The summary response also carries a `wikibase_item` (Wikidata QID) for free — when present, a follow-up call to Wikidata's `wbgetclaims` for property **P856** ("official website") supplies the URL, picking the claim with no language qualifier or one tagged English (`Q1860`) since some items (e.g. Proton products) have one P856 value per locale. Coverage isn't universal and the two fields resolve independently (a "not found" message only shows if *both* come back empty); the admin can always edit or ignore the result. This is a one-time, explicit, admin-side convenience call — it does not touch the public page or add any runtime dependency there, consistent with the site staying static/offline-first for visitors.
- `TagPicker.tsx` (used inside `ItemForm`) replaces free-text tag entry: shows the item's currently-selected tags as removable pills, all catalog tags grouped and clickable below (reusing the same grouped-chip visual pattern as the public `FilterBar`) to toggle them on/off, and a "+ New tag" control (label + a 2-way Operating System/Topic choice) that calls `createTag()` (`src/lib/tags.ts`), refetches the shared tag list via `useTags()`, and auto-selects the new tag onto the item being edited.
- **Deleting tags**: each catalog tag in `TagPicker`'s grid has its own small delete control (deliberately distinct from the "×" on the selected-tags pills, which only removes the tag from the current item). `AdminPage.handleDeleteTag` — not `TagPicker` itself — owns the confirm dialog (naming how many items are affected, via a scan of the already-loaded `items`) and the actual cascade: it strips the tag from every affected item (`updateItem`) *before* deleting the tag row (`deleteTag`, `src/lib/tags.ts`) so a tag is never removed from the catalog while items still reference it. It returns a `boolean` (deleted vs. cancelled) specifically so `TagPicker` can tell those apart — only a confirmed deletion also strips the tag from the currently-open item's local selection (covers a not-yet-saved new item, which wouldn't appear in the "affected items" scan).
- `CategoryPicker.tsx` (used inside `ItemForm`) is the single-select sibling of `TagPicker` for `item.category`: shows every catalog category as a clickable chip (clicking the already-selected one clears the selection back to "no category," unlike `TagPicker`'s independent toggles), and a "+ New category" control (label only — no group choice, since categories aren't grouped) that calls `createCategory()` (`src/lib/categories.ts`), refetches via `useCategories()`, and auto-selects the new category onto the item being edited. Its per-chip delete control and `AdminPage.handleDeleteCategory` cascade (confirm → strip `item.category` from affected items via `updateItem` → delete the catalog row → refetch both → return a `boolean`) are a line-for-line mirror of tag deletion above.
- `ItemList.tsx` renders existing items with Edit/Delete actions; delete asks for confirmation via `window.confirm`.
- Mutations go through `src/lib/items.ts` (`createItem`/`updateItem`/`deleteItem`, plus the row↔`TechItem` mapping shared with `useItems`'s `fetchItems`) — RLS on the `items` table is what actually enforces admin-only writes; the client just surfaces whatever error Postgres/RLS returns.
- After any mutation, `AdminPage` calls `useItems()`'s `refetch()` to reload the list rather than optimistically patching local state.

### Project structure

```
src/
  types/item.ts, filter.ts, category.ts
  data/filterTags.ts          # static filterGroups only (os/topic) — tags themselves are dynamic
  lib/
    supabaseClient.ts
    items.ts                    # Supabase row <-> TechItem mapping + fetch/create/update/delete
    tags.ts                      # Supabase row <-> FilterTag mapping + fetchTags/createTag
    categories.ts                 # Supabase row <-> Category mapping + fetchCategories/createCategory/deleteCategory
    storage.ts                   # uploadIcon(itemId, file) -> public Storage URL
    colorExtraction.ts            # extractIconTint(file) -> hex, for custom-uploaded icons
    simpleIcons.ts                # metadata + search + lazy per-slug SVG loading (see above)
    wikipedia.ts                  # fetchWikipediaInfo(name) -> { description, url } for the admin form's auto-fill button
    packageManagerSearch.ts        # getPackageManagerSearchUrl(manager, query), see "Install commands" above
    slugify.ts
    filtering.ts                # pure matches()/filterItems()/groupByCategory(), unit-tested (filtering.test.ts)
  hooks/
    useItems.ts                  # fetch + refetch, used by both the public page and the admin list
    useTags.ts                    # same shape as useItems, for the tag catalog
    useCategories.ts               # same shape as useTags, for the category catalog
    useSession.ts                 # Supabase Auth session state
    useUrlSyncedFilters.ts         # useState-shaped filter selection, mirrored to the URL
    useTypewriter.ts                # delete-then-type animation, used by FetchHeader's Shell: line
  components/
    ItemGrid.tsx, ItemCard.tsx, ItemDetail.tsx
    CategorySection.tsx             # groups ItemGrid under a heading, see "Category grouping" above
    FetchHeader.tsx               # signature "neofetch" panel, see "Visual design" above
    SearchBox.tsx                  # free-text name search, see "Filtering algorithm" above
    CopyableCommand.tsx             # $ command + copy button, see "Install commands" above
    BootSequence.tsx                 # simulated kernel boot log, see "Boot sequence" above
    FilterBar.tsx, FilterChip.tsx
    Icon.tsx
  admin/
    AdminPage.tsx, LoginForm.tsx, ItemForm.tsx, ItemList.tsx, TagPicker.tsx, CategoryPicker.tsx
  App.tsx                       # public page: BootSequence + FetchHeader + SearchBox + FilterBar + ItemGrid + ItemDetail
  main.tsx                      # picks App vs AdminPage based on pathname

supabase/schema.sql            # run this in the Supabase SQL editor — see "Supabase setup"
.env.local.example              # copy to .env.local and fill in real Supabase project values
```

### Deployment implication

The site remains a static SPA build (`vite build`), deployable to any static host; Supabase is the only external runtime dependency (item fetch, admin auth/writes, icon storage). This is a deliberate tradeoff versus a fully static/offline site, made specifically to support the admin-panel requirement.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check via project references (`tsc -b`) then production-build with Vite
- `npm run lint` — run Oxlint
- `npm run preview` — serve the production build locally
- `npm run test` — run Vitest in watch mode; use `npx vitest run` for a single non-watch pass (currently only `src/lib/filtering.test.ts` exists)

## Toolchain notes

- **Linter is Oxlint, not ESLint.** Config lives in `.oxlintrc.json` (plugins: `react`, `typescript`, `oxc`). Type-aware lint rules are not enabled by default; enabling them requires installing `oxlint-tsgolint` and setting `"options": { "typeAware": true }` in `.oxlintrc.json` (see README for the exact snippet).
- **TypeScript uses project references**, split across three configs:
  - `tsconfig.json` — root, references the other two, has no compiler options itself
  - `tsconfig.app.json` — the app source (`src/`), target `es2023`, bundler module resolution, `noEmit`, strict-ish unused-locals/params checks
  - `tsconfig.node.json` — Vite config file itself (`vite.config.ts`), Node types
  - Run `tsc -b` (as `npm run build` does) rather than a plain `tsc`, so both projects get checked correctly.
  - `tsconfig.app.json` has `verbatimModuleSyntax: true` — type-only imports (`TechItem`, `IconRef`, `FilterTag`, `FilterGroup`, `SelectedTagsByGroup`, `Session`, etc.) must use `import type`, or the build fails.
  - `tsconfig.app.json` also has `resolveJsonModule: true`, added specifically for the `simple-icons/icons.json` metadata import in `src/lib/simpleIcons.ts`.
- React Compiler is intentionally **not** enabled (per README, to avoid dev/build perf impact).
- Imported assets (images used via JS import) live in `src/assets/`; only `public/favicon.svg` remains as a URL-referenced static asset (the template's `icons.svg` sprite was removed along with the placeholder markup that used it). `favicon.svg` is now a small hand-drawn `>_` terminal-prompt glyph (plain SVG shapes, not `<text>`, so it doesn't depend on a webfont being available wherever the browser renders favicons) matching the theme tokens directly (`--color-bg`/`--color-accent` hex values inlined, since `var()` custom properties aren't available in a standalone favicon file outside the page's own stylesheet cascade).
- **Tailwind CSS v4** is wired via the `@tailwindcss/vite` plugin in `vite.config.ts` — CSS-first, no `tailwind.config.js`. `src/index.css` holds the `@theme` design-token block, the base `body` colors, and the `cursor-blink` keyframes/reduced-motion override — see "Visual design" above.
- **Vitest** config lives inline in `vite.config.ts` (a merged `test: {}` block, typed via `/// <reference types="vitest/config" />`), not a separate `vitest.config.ts`. Default environment is `node` (no `jsdom`) since only pure-function logic is tested so far.
- **Env vars**: custom `VITE_*` vars are typed by augmenting `ImportMetaEnv` in `src/vite-env.d.ts`. Real values go in `.env.local` (already covered by `.gitignore`'s `*.local` pattern) — never commit them; `.env.local.example` documents the required keys.
