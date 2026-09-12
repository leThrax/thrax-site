import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (error) setError(error.message)
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-xs flex-col gap-3 font-mono">
      <h1 className="text-xl font-medium text-fg">Admin login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="rounded border border-border bg-surface px-2 py-1 text-fg"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="rounded border border-border bg-surface px-2 py-1 text-fg"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded border border-accent bg-accent/10 px-3 py-1 text-sm font-medium text-accent disabled:opacity-50"
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
