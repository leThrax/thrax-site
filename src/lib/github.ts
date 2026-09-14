import type { GithubRepo } from '../types/github'

interface GithubRepoApiResponse {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  updated_at: string
  fork: boolean
  archived: boolean
}

function toGithubRepo(repo: GithubRepoApiResponse): GithubRepo {
  return {
    id: repo.id,
    name: repo.name,
    description: repo.description ?? undefined,
    url: repo.html_url,
    language: repo.language ?? undefined,
    stars: repo.stargazers_count,
    updatedAt: repo.updated_at,
  }
}

export async function fetchGithubRepos(username: string): Promise<GithubRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`,
  )
  if (!res.ok) throw new Error(`GitHub API error (${res.status})`)
  const data = (await res.json()) as GithubRepoApiResponse[]
  return data.filter((repo) => !repo.fork && !repo.archived).map(toGithubRepo)
}

/** Accepts "owner/repo" or a full GitHub URL (with or without a trailing ".git"). */
export function parseRepoRef(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim().replace(/\.git$/, '')
  const urlMatch = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s]+)\/?$/i)
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] }
  const shorthandMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/)
  if (shorthandMatch) return { owner: shorthandMatch[1], repo: shorthandMatch[2] }
  return null
}

export async function fetchGithubRepo(owner: string, repo: string): Promise<GithubRepo> {
  const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`)
  if (!res.ok) throw new Error(res.status === 404 ? 'Repo not found.' : `GitHub API error (${res.status})`)
  const data = (await res.json()) as GithubRepoApiResponse
  return toGithubRepo(data)
}
