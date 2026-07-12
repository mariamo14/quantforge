import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../state/auth'
import { usePageTitle } from '../lib/usePageTitle'

export function AuthPage() {
  const { user, login, register } = useAuth()
  const location = useLocation()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  usePageTitle('Sign in')

  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? '/'
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, displayName, password)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-ink-faint focus:border-brand'

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img src="/forge.svg" alt="" className="size-14 rounded-2xl" />
          <div>
            <h1 className="text-2xl font-bold">QuantForge</h1>
            <p className="mt-1 text-sm text-ink-muted">
              C++, systems, and CQF-grade quant finance — one forge.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface-1 p-6">
          <div className="mb-5 grid grid-cols-2 rounded-xl bg-surface-2 p-1 text-sm font-medium">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m)
                  setError(null)
                }}
                className={`rounded-lg py-1.5 transition-colors ${
                  mode === m ? 'bg-brand text-white shadow' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === 'register' && (
              <input
                className={inputClass}
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={60}
              />
            )}
            <input
              className={inputClass}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className={inputClass}
              type="password"
              placeholder={mode === 'register' ? 'Password (8+ characters)' : 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === 'register' ? 8 : undefined}
            />

            {error && (
              <p className="rounded-xl bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-xl bg-gradient-to-r from-brand to-accent py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? 'One moment…' : mode === 'login' ? 'Sign in' : 'Start forging'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          Local-first: your account and progress live in a database on this machine.
        </p>
      </div>
    </div>
  )
}
