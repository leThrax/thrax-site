import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import { fetchPostBySlug } from '../lib/posts'
import type { Post } from '../types/post'
import { sectionVariants } from '../lib/motionVariants'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useDocumentTitle(post ? `thrax-site — ${post.title}` : 'thrax-site — Blog')

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)

    fetchPostBySlug(slug)
      .then((data) => {
        if (cancelled) return
        setPost(data)
        setError(null)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <p className="font-mono text-sm text-muted">
        $ loading post<span className="terminal-cursor text-accent">_</span>
      </p>
    )
  }

  if (error || !post) {
    return (
      <motion.div variants={sectionVariants} className="flex flex-col gap-2">
        <p className="font-mono text-sm text-red-400">{error ?? 'Post not found.'}</p>
        <Link to="/blog" className="font-mono text-sm text-accent hover:underline">
          ← back to blog
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.article variants={sectionVariants} className="flex flex-col gap-4">
      <Link to="/blog" className="font-mono text-sm text-accent hover:underline">
        ← back to blog
      </Link>
      <h1 className="font-mono text-2xl font-medium text-fg">{post.title}</h1>
      {post.publishedAt && (
        <p className="font-mono text-xs text-muted">{new Date(post.publishedAt).toLocaleDateString()}</p>
      )}
      <div className="font-sans text-base leading-relaxed text-fg [&_a]:text-accent [&_code]:font-mono [&_h2]:mt-4 [&_h2]:font-mono [&_h2]:text-lg [&_h2]:text-fg [&_h3]:mt-3 [&_h3]:font-mono [&_h3]:text-base [&_h3]:text-fg [&_img]:max-w-full [&_img]:rounded-md [&_img]:border [&_img]:border-border [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-surface [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-5 [&_video]:w-full [&_video]:rounded-md [&_video]:border [&_video]:border-border">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]}>
          {post.body}
        </ReactMarkdown>
      </div>
    </motion.article>
  )
}
