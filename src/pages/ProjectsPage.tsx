import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useGithubRepos } from '../hooks/useGithubRepos'
import { usePinnedRepos } from '../hooks/usePinnedRepos'
import { fetchGithubRepo } from '../lib/github'
import { ProjectCard } from '../components/ProjectCard'
import { sectionVariants } from '../lib/motionVariants'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { GithubRepo } from '../types/github'

const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME ?? ''

export function ProjectsPage() {
  useDocumentTitle('thrax-site — Projects')
  const { repos: ownedRepos, loading: ownedLoading, error: ownedError } = useGithubRepos(GITHUB_USERNAME)
  const { pinnedRepoIds, loading: pinnedIdsLoading } = usePinnedRepos()
  const [pinnedRepos, setPinnedRepos] = useState<GithubRepo[]>([])
  const [pinnedLoading, setPinnedLoading] = useState(true)

  useEffect(() => {
    if (pinnedIdsLoading) return
    if (pinnedRepoIds.length === 0) {
      setPinnedRepos([])
      setPinnedLoading(false)
      return
    }

    let cancelled = false
    setPinnedLoading(true)

    Promise.all(
      pinnedRepoIds.map(async (id) => {
        const [owner, repo] = id.split('/')
        try {
          return await fetchGithubRepo(owner, repo)
        } catch {
          return null
        }
      }),
    ).then((results) => {
      if (cancelled) return
      setPinnedRepos(results.filter((r): r is GithubRepo => r !== null).map((r) => ({ ...r, contributor: true })))
      setPinnedLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [pinnedRepoIds, pinnedIdsLoading])

  const loading = ownedLoading || pinnedLoading
  const seen = new Set<number>()
  const repos = [...ownedRepos, ...pinnedRepos]
    .filter((repo) => {
      if (seen.has(repo.id)) return false
      seen.add(repo.id)
      return true
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return (
    <motion.div variants={sectionVariants} className="flex flex-col gap-4">
      <h1 className="font-mono text-xs font-semibold tracking-wide text-muted uppercase">
        <span className="text-accent">❯</span> Projects
      </h1>
      {loading ? (
        <p className="font-mono text-sm text-muted">
          $ loading repos<span className="terminal-cursor text-accent">_</span>
        </p>
      ) : (
        <>
          {ownedError && (
            <p className="font-mono text-sm text-red-400">Couldn't load your GitHub repos: {ownedError}</p>
          )}
          {repos.length === 0 ? (
            <p className="font-mono text-sm text-muted">
              <span className="text-accent">❯</span> no public repos found
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {repos.map((repo) => (
                <ProjectCard key={repo.id} repo={repo} />
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
