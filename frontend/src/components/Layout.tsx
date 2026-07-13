import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../state/auth'
import { useTheme } from '../state/theme'
import { useMe } from '../api/hooks'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/tracks', label: 'Learning Tracks', icon: '🗺️' },
  { to: '/submissions', label: 'Submissions', icon: '🧾' },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { data: me } = useMe()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src="/forge.svg" alt="" className="size-8 rounded-lg" />
        <div>
          <p className="text-[15px] font-bold leading-tight">QuantForge</p>
          <p className="text-[11px] text-ink-faint">quant dev training</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-soft text-brand'
                  : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
              }`
            }
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {me && (
        <div className="mx-3 mt-6 rounded-xl border border-line bg-surface-2 p-3">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Level {me.level}</span>
            <span>
              {me.xpIntoLevel}/{me.xpForNextLevel} XP
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-[width] duration-700"
              style={{ width: `${Math.min(100, (me.xpIntoLevel / me.xpForNextLevel) * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-ink-muted">
            <span aria-hidden>🔥</span>
            <span>{me.streakDays > 0 ? `${me.streakDays}-day streak` : 'Start a streak today'}</span>
          </div>

          {(() => {
            const done = me.tracks.reduce((s, t) => s + t.done, 0)
            const total = me.tracks.reduce((s, t) => s + t.total, 0)
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <div className="mt-3 border-t border-line pt-2">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Overall</span>
                  <span>
                    {done}/{total} · {pct}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full bg-good transition-[width] duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })()}
        </div>
      )}

      <div className="mt-auto border-t border-line p-3">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
            {user?.displayName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.displayName}</p>
            <p className="truncate text-[11px] text-ink-faint">{user?.email}</p>
          </div>
        </div>
        <div className="mt-1 flex gap-1">
          <button
            onClick={toggle}
            className="flex-1 rounded-lg px-2 py-1.5 text-xs text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={logout}
            className="flex-1 rounded-lg px-2 py-1.5 text-xs text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  // close the mobile drawer on navigation
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* mobile top bar */}
      <div className="flex items-center gap-3 border-b border-line bg-surface-1 px-4 py-3 lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="rounded-lg px-2 py-1 text-lg text-ink-muted hover:bg-surface-2"
        >
          ☰
        </button>
        <img src="/forge.svg" alt="" className="size-7 rounded-lg" />
        <span className="font-bold">QuantForge</span>
      </div>

      {/* mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-line bg-surface-1 shadow-2xl">
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-line bg-surface-1 lg:block">
        <SidebarContent />
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
