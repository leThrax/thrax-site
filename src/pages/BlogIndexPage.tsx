import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { usePosts } from '../hooks/usePosts'
import { sectionVariants } from '../lib/motionVariants'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function BlogIndexPage() {
  useDocumentTitle('thrax-site — Blog')
  const { posts, loading, error } = usePosts()
  const publishedPosts = posts.filter((post) => post.publishedAt)

  return (
    <motion.div variants={sectionVariants} className="flex flex-col gap-4">
      <h1 className="font-mono text-xs font-semibold tracking-wide text-muted uppercase">
        <span className="text-accent">❯</span> Blog
      </h1>
      {error ? (
        <p className="font-mono text-sm text-red-400">Couldn't load posts: {error}</p>
      ) : loading ? (
        <p className="font-mono text-sm text-muted">
          $ loading posts<span className="terminal-cursor text-accent">_</span>
        </p>
      ) : publishedPosts.length === 0 ? (
        <p className="font-mono text-sm text-muted">
          <span className="text-accent">❯</span> no posts yet
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {publishedPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group flex flex-col gap-1 rounded-md border border-border bg-surface p-4 transition-colors hover:border-accent hover:shadow-[0_0_16px_rgba(126,231,135,0.2)] focus-visible:border-accent focus-visible:outline-none"
            >
              <span className="font-mono text-sm font-medium text-fg">
                {post.title}
                <span className="cursor-blink text-accent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                  _
                </span>
              </span>
              {post.excerpt && <span className="text-sm text-muted">{post.excerpt}</span>}
              <span className="font-mono text-xs text-muted">
                {new Date(post.publishedAt!).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  )
}
