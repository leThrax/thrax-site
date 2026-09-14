export interface GithubRepo {
  id: number
  name: string
  description?: string
  url: string
  language?: string
  stars: number
  updatedAt: string
  contributor?: boolean // true for manually-pinned repos the owner contributed to but doesn't own
}
