import type { Post } from '../types/post'
import { useTypewriter } from '../hooks/useTypewriter'
import { TerminalWindow } from './TerminalWindow'

interface BlogPostHeaderProps {
  post: Post
}

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  const displayedShell = useTypewriter(`--post=${post.id}`)

  return (
    <TerminalWindow>
      <p>
        <span className="text-muted">OS:</span> Reading Post
      </p>
      <p>
        <span className="text-muted">Published:</span>{' '}
        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'draft'}
      </p>
      <p>
        <span className="text-muted">Shell:</span> {displayedShell}
        <span className="terminal-cursor text-accent">|</span>
      </p>
    </TerminalWindow>
  )
}
