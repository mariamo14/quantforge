import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { get } from '../api/client'
import { useDaily, useMe } from '../api/hooks'
import type { TrackDetail } from '../api/types'
import { Card, DifficultyBadge, ProgressRing, Spinner, XpPill } from '../components/ui'

const ITEM_PATHS = { lesson: '/lessons', problem: '/problems', quiz: '/quizzes' } as const

export function Dashboard() {
  const { data: me, isLoading } = useMe()
  const { data: daily } = useDaily()

  const continueTrack = me?.tracks.find((t) => t.done > 0 && t.done < t.total) ?? me?.tracks[0]

  // Deep-link Continue straight to the frontier item, not just the track page.
  const { data: continueDetail } = useQuery({
    queryKey: ['track', continueTrack?.slug],
    queryFn: () => get<TrackDetail>(`/api/tracks/${continueTrack!.slug}`),
    enabled: !!continueTrack,
  })

  if (isLoading || !me) {
    return <Spinner label="Loading your forge…" />
  }

  const frontier = continueDetail?.modules
    .flatMap((m) => m.items)
    .find((item) => !item.done && !item.locked)
  const continueHref = frontier
    ? `${ITEM_PATHS[frontier.kind]}/${frontier.slug}`
    : continueTrack
      ? `/tracks/${continueTrack.slug}`
      : '/tracks'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {me.user.displayName.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {me.streakDays > 0
              ? `You're on a ${me.streakDays}-day streak — keep it burning.`
              : 'Solve anything today to light your streak.'}
          </p>
        </div>
        {continueTrack && continueTrack.total > 0 && (
          <Link
            to={continueHref}
            className="rounded-xl bg-gradient-to-r from-brand to-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {frontier ? `Continue: ${frontier.title} →` : `Continue ${continueTrack.title} →`}
          </Link>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="🔥" label="Streak" value={`${me.streakDays} day${me.streakDays === 1 ? '' : 's'}`} />
        <StatCard icon="⚡" label={`Level ${me.level}`} value={`${me.xp} XP`} />
        <StatCard icon="✅" label="Problems solved" value={String(me.solvedProblems)} />
        <StatCard icon="📚" label="Lessons done" value={String(me.completedLessons)} />
      </div>

      {daily && (
        <Card className="mt-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-warn-soft text-xl">
                🎯
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  Daily challenge
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="font-semibold">{daily.title}</p>
                  <DifficultyBadge difficulty={daily.difficulty} />
                  <XpPill xp={daily.xp} />
                </div>
              </div>
            </div>
            {daily.solved ? (
              <span className="rounded-full bg-good-soft px-3 py-1 text-sm font-semibold text-good">
                Solved ✓
              </span>
            ) : (
              <Link
                to={`/problems/${daily.slug}`}
                className="rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:border-brand hover:text-brand"
              >
                Solve it
              </Link>
            )}
          </div>
        </Card>
      )}

      <h2 className="mt-10 mb-4 text-lg font-semibold">Your tracks</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {me.tracks.map((track) => (
          <Link key={track.slug} to={`/tracks/${track.slug}`}>
            <Card className="group flex items-center gap-4 p-4 transition-colors hover:border-line-strong">
              <div className="relative">
                <ProgressRing done={track.done} total={track.total} accent={track.accent} size={52} />
                <span className="absolute inset-0 flex items-center justify-center text-lg">
                  {track.icon}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold group-hover:text-brand">{track.title}</p>
                <p className="text-sm text-ink-muted">
                  {track.done}/{track.total} complete
                  {track.total > 0 && track.done === track.total && ' 🏆'}
                </p>
              </div>
              <span className="text-ink-faint transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-lg font-bold leading-tight">{value}</p>
          <p className="text-xs text-ink-muted">{label}</p>
        </div>
      </div>
    </Card>
  )
}
