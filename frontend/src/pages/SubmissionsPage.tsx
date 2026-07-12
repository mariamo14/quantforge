import { Link } from 'react-router-dom'
import { useSubmissions } from '../api/hooks'
import { Card, EmptyState, Spinner, VerdictBadge } from '../components/ui'
import { usePageTitle } from '../lib/usePageTitle'

export function SubmissionsPage() {
  const { data: submissions, isLoading } = useSubmissions()
  usePageTitle('Submissions')

  if (isLoading || !submissions) {
    return <Spinner label="Loading submissions…" />
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-bold">Submissions</h1>
      <p className="mt-1 text-sm text-ink-muted">Your 50 most recent judge runs.</p>

      {submissions.length === 0 ? (
        <Card className="mt-6">
          <EmptyState
            icon="🧾"
            title="No submissions yet"
            hint="Open any problem, write some C++, and hit Submit — your history shows up here."
          />
        </Card>
      ) : (
        <Card className="mt-6 overflow-hidden">
          {submissions.map((submission, index) => (
            <Link
              key={submission.id}
              to={`/problems/${submission.problemSlug}`}
              className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-2 ${
                index > 0 ? 'border-t border-line' : ''
              }`}
            >
              <VerdictBadge verdict={submission.verdict} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{submission.problemTitle}</p>
                <p className="text-xs text-ink-faint">
                  {new Date(submission.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="shrink-0 text-xs text-ink-muted">
                {submission.passedCount}/{submission.totalCount} tests
                {submission.maxTimeMs > 0 && ` · ${submission.maxTimeMs} ms`}
              </p>
            </Link>
          ))}
        </Card>
      )}
    </div>
  )
}
