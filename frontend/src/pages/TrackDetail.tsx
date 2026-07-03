import { Link, useParams } from 'react-router-dom'
import { useTrack } from '../api/hooks'
import type { ItemDto } from '../api/types'
import { Card, DifficultyBadge, Spinner, XpPill } from '../components/ui'

const KIND_META: Record<ItemDto['kind'], { icon: string; path: string; label: string }> = {
  lesson: { icon: '📖', path: '/lessons', label: 'Lesson' },
  problem: { icon: '⌨️', path: '/problems', label: 'Problem' },
  quiz: { icon: '❓', path: '/quizzes', label: 'Quiz' },
}

export function TrackDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: track, isLoading } = useTrack(slug!)

  if (isLoading || !track) {
    return <Spinner label="Loading track…" />
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link to="/tracks" className="text-sm text-ink-muted hover:text-ink">
        ← All tracks
      </Link>
      <div className="mt-3 flex items-center gap-4">
        <span
          className="flex size-14 items-center justify-center rounded-2xl text-3xl"
          style={{ backgroundColor: `${track.accent}22` }}
        >
          {track.icon}
        </span>
        <div>
          <h1 className="text-2xl font-bold">{track.title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{track.description}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-8">
        {track.modules.map((module, moduleIndex) => (
          <section key={module.slug}>
            <div className="mb-3 flex items-baseline gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-surface-2 text-xs font-bold text-ink-muted">
                {moduleIndex + 1}
              </span>
              <div>
                <h2 className="font-semibold">{module.title}</h2>
                {module.description && (
                  <p className="text-sm text-ink-muted">{module.description}</p>
                )}
              </div>
            </div>

            <Card className="overflow-hidden">
              {module.items.map((item, itemIndex) => {
                const meta = KIND_META[item.kind]
                return (
                  <Link
                    key={`${item.kind}-${item.slug}`}
                    to={`${meta.path}/${item.slug}`}
                    className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2 ${
                      itemIndex > 0 ? 'border-t border-line' : ''
                    }`}
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm ${
                        item.done ? 'bg-good-soft' : 'bg-surface-2'
                      }`}
                    >
                      {item.done ? '✓' : meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-medium group-hover:text-brand ${
                          item.done ? 'text-ink-muted' : ''
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs text-ink-faint">
                        {meta.label}
                        {item.minutes != null && ` · ${item.minutes} min`}
                        {item.questionCount != null && ` · ${item.questionCount} questions`}
                      </p>
                    </div>
                    {item.difficulty && <DifficultyBadge difficulty={item.difficulty} />}
                    {item.xp != null && !item.done && <XpPill xp={item.xp} />}
                  </Link>
                )
              })}
            </Card>
          </section>
        ))}
      </div>
    </div>
  )
}
