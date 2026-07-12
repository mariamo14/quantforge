import { Link } from 'react-router-dom'
import { useTracks } from '../api/hooks'
import { Card, ProgressRing, Spinner } from '../components/ui'
import { usePageTitle } from '../lib/usePageTitle'

export function Tracks() {
  const { data: tracks, isLoading } = useTracks()
  usePageTitle('Learning Tracks')

  if (isLoading || !tracks) {
    return <Spinner label="Loading tracks…" />
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-bold">Learning tracks</h1>
      <p className="mt-1 text-sm text-ink-muted">
        From modern C++ to stochastic calculus — everything a quant developer interviews on.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {tracks.map((track) => (
          <Link key={track.slug} to={`/tracks/${track.slug}`}>
            <Card className="group h-full p-5 transition-colors hover:border-line-strong">
              <div className="flex items-start justify-between gap-3">
                <span
                  className="flex size-11 items-center justify-center rounded-xl text-xl"
                  style={{ backgroundColor: `${track.accent}22` }}
                >
                  {track.icon}
                </span>
                <div className="relative">
                  <ProgressRing done={track.done} total={track.total} accent={track.accent} size={40} />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                    {track.total > 0 ? Math.round((track.done / track.total) * 100) : 0}%
                  </span>
                </div>
              </div>
              <h2 className="mt-3 font-semibold group-hover:text-brand">{track.title}</h2>
              <p className="mt-1 line-clamp-3 text-sm text-ink-muted">{track.description}</p>
              <p className="mt-3 text-xs font-medium text-ink-faint">
                {track.done}/{track.total} items complete
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
