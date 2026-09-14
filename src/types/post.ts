export interface Post {
  id: string // slug, e.g. "setting-up-cachyos"
  title: string
  excerpt?: string
  body: string // markdown
  publishedAt?: string // undefined/null means draft
}
