import { Link } from 'react-router-dom'
import { useItemContext } from '../api/hooks'
import type { ItemKind } from '../api/types'

const PATHS: Record<ItemKind, string> = {
  lesson: '/lessons',
  problem: '/problems',
  quiz: '/quizzes',
}

/**
 * CodeSignal-style course-player bar: track breadcrumb, "Step i of N",
 * a progress bar, and prev/next arrows. Sits at the top of every item page.
 */
export function TrackContextBar({ kind, slug }: { kind: ItemKind; slug: string }) {
  const { data: ctx } = useItemContext(kind, slug)
  if (!ctx) {
    return <div className="h-11 border-b border-line bg-surface-1" />
  }
  const pct = ctx.total > 0 ? Math.round((ctx.doneCount / ctx.total) * 100) : 0
  return (
    <div className="border-b border-line bg-surface-1">
      <div className="flex items-center gap-3 px-5 py-2">
        <Link
          to={`/tracks/${ctx.trackSlug}`}
          className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: ctx.accent }}
          />
          <span className="truncate">{ctx.trackTitle}</span>
        </Link>
        <span className="text-xs text-ink-faint">·</span>
        <span className="shrink-0 text-xs font-semibold text-ink-muted">
          Step {ctx.index} of {ctx.total}
        </span>
        <div className="h-1.5 min-w-16 flex-1 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${pct}%`, backgroundColor: ctx.accent }}
          />
        </div>
        <span className="shrink-0 text-xs text-ink-faint">{pct}%</span>
        <div className="flex shrink-0 items-center gap-1">
          {ctx.prev ? (
            <Link
              to={`${PATHS[ctx.prev.kind]}/${ctx.prev.slug}`}
              title={`Previous: ${ctx.prev.title}`}
              className="rounded-lg px-2 py-1 text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              ←
            </Link>
          ) : (
            <span className="px-2 py-1 text-sm text-ink-faint/40">←</span>
          )}
          {ctx.next ? (
            <Link
              to={`${PATHS[ctx.next.kind]}/${ctx.next.slug}`}
              title={`Next: ${ctx.next.title}`}
              className="rounded-lg px-2 py-1 text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              →
            </Link>
          ) : (
            <span className="px-2 py-1 text-sm text-ink-faint/40">→</span>
          )}
        </div>
      </div>
    </div>
  )
}
