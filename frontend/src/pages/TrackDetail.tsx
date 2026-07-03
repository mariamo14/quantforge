import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTrack } from '../api/hooks'
import type { ItemDto } from '../api/types'
import { Card, DifficultyBadge, Spinner, XpPill } from '../components/ui'

const KIND_META: Record<ItemDto['kind'], { icon: string; path: string; label: string }> = {
  lesson: { icon: '📖', path: '/lessons', label: 'Lesson' },
  problem: { icon: '⌨️', path: '/problems', label: 'Problem' },
  quiz: { icon: '❓', path: '/quizzes', label: 'Quiz' },
}

const FREE_ROAM_KEY = 'quantforge.freeroam'

export function TrackDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: track, isLoading } = useTrack(slug!)
  const [freeRoam, setFreeRoam] = useState(() => localStorage.getItem(FREE_ROAM_KEY) === '1')

  if (isLoading || !track) {
    return <Spinner label="Loading track…" />
  }

  function toggleFreeRoam() {
    setFreeRoam((prev) => {
      localStorage.setItem(FREE_ROAM_KEY, prev ? '0' : '1')
      return !prev
    })
  }

  // The frontier: first item that is unlocked but not yet done.
  const allItems = track.modules.flatMap((m) => m.items)
  const nextUp = allItems.find((item) => !item.done && !item.locked)

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="flex items-center justify-between">
        <Link to="/tracks" className="text-sm text-ink-muted hover:text-ink">
          ← All tracks
        </Link>
        <button
          onClick={toggleFreeRoam}
          title={
            freeRoam
              ? 'Free roam is on: everything is open. Click to restore the guided path.'
              : 'The path unlocks step by step. Click to open everything.'
          }
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            freeRoam
              ? 'border-warn/50 bg-warn-soft text-warn'
              : 'border-line text-ink-faint hover:border-line-strong hover:text-ink-muted'
          }`}
        >
          {freeRoam ? '🗺️ Free roam on' : '🧭 Guided path'}
        </button>
      </div>

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
        {track.modules.map((module, moduleIndex) => {
          const moduleDone = module.items.filter((i) => i.done).length
          const moduleComplete = moduleDone === module.items.length
          return (
          <section key={module.slug}>
            <div className="mb-3 flex items-center gap-3">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  moduleComplete ? 'bg-good-soft text-good' : 'bg-surface-2 text-ink-muted'
                }`}
              >
                {moduleComplete ? '✓' : moduleIndex + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{module.title}</h2>
                {module.description && (
                  <p className="text-sm text-ink-muted">{module.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${module.items.length ? (moduleDone / module.items.length) * 100 : 0}%`,
                      backgroundColor: track.accent,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-ink-faint">
                  {moduleDone}/{module.items.length}
                </span>
              </div>
            </div>

            <Card className="overflow-hidden">
              {module.items.map((item, itemIndex) => {
                const meta = KIND_META[item.kind]
                const isNextUp = nextUp?.kind === item.kind && nextUp?.slug === item.slug
                const blocked = item.locked && !freeRoam
                const row = (
                  <>
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm ${
                        item.done ? 'bg-good-soft' : 'bg-surface-2'
                      }`}
                    >
                      {item.done ? '✓' : blocked ? '🔒' : meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-medium ${
                          blocked
                            ? 'text-ink-faint'
                            : item.done
                              ? 'text-ink-muted group-hover:text-brand'
                              : 'group-hover:text-brand'
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
                    {isNextUp && (
                      <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                        Next up
                      </span>
                    )}
                    {item.difficulty && !blocked && <DifficultyBadge difficulty={item.difficulty} />}
                    {item.xp != null && !item.done && !blocked && <XpPill xp={item.xp} />}
                  </>
                )
                const rowClass = `flex items-center gap-3 px-4 py-3 ${
                  itemIndex > 0 ? 'border-t border-line' : ''
                }`
                if (blocked) {
                  return (
                    <div
                      key={`${item.kind}-${item.slug}`}
                      className={`${rowClass} cursor-not-allowed opacity-60`}
                      title="Complete the previous step to unlock"
                    >
                      {row}
                    </div>
                  )
                }
                return (
                  <Link
                    key={`${item.kind}-${item.slug}`}
                    to={`${meta.path}/${item.slug}`}
                    className={`group ${rowClass} transition-colors hover:bg-surface-2 ${
                      isNextUp ? 'bg-brand-soft/40' : ''
                    }`}
                  >
                    {row}
                  </Link>
                )
              })}
            </Card>
          </section>
          )
        })}
      </div>
    </div>
  )
}
