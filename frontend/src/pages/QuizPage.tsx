import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { useQuiz, useSubmitQuiz } from '../api/hooks'
import type { QuizResultResponse } from '../api/types'
import { Markdown } from '../components/Markdown'
import { Card, Spinner } from '../components/ui'

export function QuizPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: quiz, isLoading } = useQuiz(slug!)
  const submitQuiz = useSubmitQuiz(slug!)

  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [current, setCurrent] = useState(0)
  const [outcome, setOutcome] = useState<QuizResultResponse | null>(null)

  if (isLoading || !quiz) {
    return <Spinner label="Loading quiz…" />
  }

  const total = quiz.questions.length
  const question = quiz.questions[current]
  const answered = Object.keys(answers).length

  async function handleSubmit() {
    if (!quiz) return
    const questionIds = quiz.questions.map((q) => q.id)
    const payload = {
      questionIds,
      answers: questionIds.map((id) => answers[id] ?? -1),
    }
    const result = await submitQuiz.mutateAsync(payload)
    setOutcome(result)
    if (result.passed) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } })
    }
  }

  if (outcome) {
    return (
      <QuizResults
        quizTitle={quiz.title}
        outcome={outcome}
        onRetry={() => {
          setOutcome(null)
          setAnswers({})
          setCurrent(0)
        }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Quiz</p>
          <h1 className="mt-1 text-2xl font-bold">{quiz.title}</h1>
        </div>
        {quiz.bestScore != null && (
          <span className="rounded-full bg-surface-2 px-3 py-1 text-sm text-ink-muted">
            Best: {quiz.bestScore}/{total}
          </span>
        )}
      </div>
      {quiz.description && <p className="text-sm text-ink-muted">{quiz.description}</p>}

      <div className="mt-6 mb-4 flex items-center gap-2">
        {quiz.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrent(i)}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i === current
                ? 'bg-brand'
                : answers[q.id] !== undefined
                  ? 'bg-brand/40'
                  : 'bg-surface-3'
            }`}
            aria-label={`Question ${i + 1}`}
          />
        ))}
      </div>

      <Card className="p-6">
        <p className="mb-4 text-xs font-semibold text-ink-faint">
          Question {current + 1} of {total}
        </p>
        <Markdown>{question.promptMd}</Markdown>
        <div className="mt-5 flex flex-col gap-2">
          {question.choices.map((choice, i) => {
            const selected = answers[question.id] === i
            return (
              <button
                key={i}
                onClick={() => setAnswers((a) => ({ ...a, [question.id]: i }))}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  selected
                    ? 'border-brand bg-brand-soft font-medium text-ink'
                    : 'border-line bg-surface-2 text-ink-muted hover:border-line-strong hover:text-ink'
                }`}
              >
                <span className="mr-2 font-mono text-xs text-ink-faint">
                  {String.fromCharCode(65 + i)}
                </span>
                {choice}
              </button>
            )
          })}
        </div>
      </Card>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="rounded-xl border border-line-strong px-4 py-2 text-sm font-medium transition-colors hover:border-brand hover:text-brand disabled:opacity-40"
        >
          ← Previous
        </button>
        {current < total - 1 ? (
          <button
            onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
            className="rounded-xl border border-line-strong px-4 py-2 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitQuiz.isPending || answered < total}
            title={answered < total ? 'Answer all questions first' : undefined}
            className="rounded-xl bg-gradient-to-r from-brand to-accent px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitQuiz.isPending
              ? 'Grading…'
              : answered < total
                ? `Answer ${total - answered} more`
                : 'Submit answers'}
          </button>
        )}
      </div>
    </div>
  )
}

function QuizResults({
  quizTitle,
  outcome,
  onRetry,
}: {
  quizTitle: string
  outcome: QuizResultResponse
  onRetry: () => void
}) {
  const pct = outcome.total > 0 ? Math.round((outcome.score / outcome.total) * 100) : 0
  return (
    <div className="mx-auto max-w-2xl p-8">
      <Card className="p-8 text-center">
        <span className="text-5xl">{outcome.passed ? '🏆' : '📖'}</span>
        <h1 className="mt-3 text-2xl font-bold">
          {outcome.score}/{outcome.total} ({pct}%)
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {quizTitle} — {outcome.passed ? 'passed!' : 'not passed yet (70% to pass)'}
          {outcome.xpAwarded > 0 && ` · +${outcome.xpAwarded} XP`}
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={onRetry}
            className="rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:border-brand hover:text-brand"
          >
            Try again
          </button>
          <Link
            to="/tracks"
            className="rounded-xl bg-gradient-to-r from-brand to-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Back to tracks
          </Link>
        </div>
      </Card>

      <h2 className="mt-8 mb-3 text-lg font-semibold">Review</h2>
      <div className="flex flex-col gap-3">
        {outcome.results.map((result, i) => (
          <Card key={result.questionId} className="p-4">
            <div className="flex items-center gap-2">
              <span className={result.correct ? 'text-good' : 'text-bad'}>
                {result.correct ? '✓' : '✗'}
              </span>
              <p className="text-sm font-medium">Question {i + 1}</p>
              <span className="text-xs text-ink-faint">
                correct answer: {String.fromCharCode(65 + result.correctIndex)}
              </span>
            </div>
            {result.explanationMd && (
              <div className="mt-2 border-l-2 border-line pl-3 text-sm">
                <Markdown>{result.explanationMd}</Markdown>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
