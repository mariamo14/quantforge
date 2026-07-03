import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchNext } from '../api/hooks'
import type { ItemKind, NextItemDto } from '../api/types'

const PATHS: Record<ItemKind, string> = {
  lesson: '/lessons',
  problem: '/problems',
  quiz: '/quizzes',
}

/**
 * "Next: … →" button shown once the current item is complete — the
 * finish-and-advance loop. `active` controls when the lookup fires.
 */
export function NextUp({ kind, slug, active }: { kind: ItemKind; slug: string; active: boolean }) {
  const [next, setNext] = useState<NextItemDto | null>(null)

  useEffect(() => {
    let cancelled = false
    if (active) {
      fetchNext(kind, slug)
        .then((result) => {
          if (!cancelled) setNext(result)
        })
        .catch(() => {})
    }
    return () => {
      cancelled = true
    }
  }, [kind, slug, active])

  if (!active || !next) return null

  if (next.endOfTrack || !next.kind || !next.slug) {
    return (
      <Link
        to={`/tracks/${next.trackSlug}`}
        className="inline-flex items-center gap-2 rounded-xl bg-good-soft px-4 py-2 text-sm font-semibold text-good transition-opacity hover:opacity-80"
      >
        🏆 {next.trackTitle} complete — back to the track
      </Link>
    )
  }
  return (
    <Link
      to={`${PATHS[next.kind]}/${next.slug}`}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
    >
      Next: {next.title} →
    </Link>
  )
}
