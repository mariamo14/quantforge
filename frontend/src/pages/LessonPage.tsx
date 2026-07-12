import { useParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { useCompleteLesson, useLesson } from '../api/hooks'
import { Markdown } from '../components/Markdown'
import { NextUp } from '../components/NextUp'
import { TrackContextBar } from '../components/TrackContextBar'
import { Spinner } from '../components/ui'
import { usePageTitle } from '../lib/usePageTitle'

export function LessonPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: lesson, isLoading } = useLesson(slug!)
  const complete = useCompleteLesson(slug!)
  usePageTitle(lesson?.title)

  if (isLoading || !lesson) {
    return <Spinner label="Loading lesson…" />
  }

  async function markComplete() {
    const result = await complete.mutateAsync()
    if (result.xpAwarded > 0) {
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.8 } })
    }
  }

  return (
    <div>
      <TrackContextBar kind="lesson" slug={slug!} />
      <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Lesson · {lesson.minutes} min read
          </p>
          <h1 className="mt-1 text-2xl font-bold">{lesson.title}</h1>
        </div>
        {lesson.done && (
          <span className="shrink-0 rounded-full bg-good-soft px-3 py-1 text-sm font-semibold text-good">
            Completed ✓
          </span>
        )}
      </div>

      <Markdown>{lesson.markdown}</Markdown>

      <div className="mt-10 flex items-center justify-between rounded-2xl border border-line bg-surface-1 p-4">
        <p className="text-sm text-ink-muted">
          {lesson.done ? 'Nice — this one is in the bank.' : 'Finished reading?'}
        </p>
        {lesson.done ? (
          <NextUp kind="lesson" slug={lesson.slug} active={true} />
        ) : (
          <button
            onClick={markComplete}
            disabled={complete.isPending}
            className="rounded-xl bg-gradient-to-r from-brand to-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {complete.isPending ? 'Saving…' : 'Mark complete (+25 XP)'}
          </button>
        )}
      </div>
      </div>
    </div>
  )
}
