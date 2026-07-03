import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { checkQuizAnswer, useQuiz, useSubmitQuiz } from '../api/hooks'
import type { QuizCheckResponse, QuizResultResponse } from '../api/types'
import { Markdown } from '../components/Markdown'
import { NextUp } from '../components/NextUp'
import { TrackContextBar } from '../components/TrackContextBar'
import { Card, Spinner } from '../components/ui'

export function QuizPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: quiz, isLoading } = useQuiz(slug!)
  const submitQuiz = useSubmitQuiz(slug!)

  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [feedback, setFeedback] = useState<Record<number, QuizCheckResponse>>({})
  const [current, setCurrent] = useState(0)
  const [checking, setChecking] = useState(false)
  const [outcome, setOutcome] = useState<QuizResultResponse | null>(null)

  if (isLoading || !quiz) {
    return <Spinner label="Loading quiz…" />
  }

  const total = quiz.questions.length
  const question = quiz.questions[current]
  const selected = answers[question.id]
  const checked = feedback[question.id]
  const allChecked = quiz.questions.every((q) => feedback[q.id] !== undefined)

  async function handleCheck() {
    if (selected === undefined || !quiz) return
    setChecking(true)
    try {
      const result = await checkQuizAnswer(quiz.slug, question.id, selected)
      setFeedback((f) => ({ ...f, [question.id]: result }))
      if (result.correct) {
        confetti({ particleCount: 25, spread: 40, origin: { y: 0.75 }, scalar: 0.7 })
      }
    } finally {
      setChecking(false)
    }
  }

  async function handleFinish() {
    if (!quiz) return
    const questionIds = quiz.questions.map((q) => q.id)
    const result = await submitQuiz.mutateAsync({
      questionIds,
      answers: questionIds.map((id) => answers[id] ?? -1),
    })
    setOutcome(result)
    if (result.passed) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } })
    }
  }

  function reset() {
    setOutcome(null)
    setAnswers({})
    setFeedback({})
    setCurrent(0)
  }

  if (outcome) {
    return (
      <div>
        <TrackContextBar kind="quiz" slug={quiz.slug} />
        <QuizResults quizSlug={quiz.slug} quizTitle={quiz.title} outcome={outcome} onRetry={reset} />
      </div>
    )
  }

  return (
    <div>
      <TrackContextBar kind="quiz" slug={quiz.slug} />
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

        {/* Per-question progress segments: green = correct, red = missed, brand = current */}
        <div className="mt-6 mb-4 flex items-center gap-2">
          {quiz.questions.map((q, i) => {
            const f = feedback[q.id]
            const color =
              f === undefined
                ? i === current
                  ? 'bg-brand'
                  : 'bg-surface-3'
                : f.correct
                  ? 'bg-good'
                  : 'bg-bad'
            return (
              <button
                key={q.id}
                onClick={() => setCurrent(i)}
                className={`h-1.5 flex-1 rounded-full transition-colors ${color} ${
                  i === current ? 'ring-2 ring-brand/40' : ''
                }`}
                aria-label={`Question ${i + 1}`}
              />
            )
          })}
        </div>

        <Card className="p-6">
          <p className="mb-4 text-xs font-semibold text-ink-faint">
            Question {current + 1} of {total}
          </p>
          <Markdown>{question.promptMd}</Markdown>
          <div className="mt-5 flex flex-col gap-2">
            {question.choices.map((choice, i) => {
              const isSelected = selected === i
              let style = isSelected
                ? 'border-brand bg-brand-soft font-medium text-ink'
                : 'border-line bg-surface-2 text-ink-muted hover:border-line-strong hover:text-ink'
              if (checked) {
                if (i === checked.correctIndex) {
                  style = 'border-good bg-good-soft font-medium text-ink'
                } else if (isSelected) {
                  style = 'border-bad bg-bad-soft text-ink'
                } else {
                  style = 'border-line bg-surface-2 text-ink-faint'
                }
              }
              return (
                <button
                  key={i}
                  disabled={checked !== undefined}
                  onClick={() => setAnswers((a) => ({ ...a, [question.id]: i }))}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${style}`}
                >
                  <span className="mr-2 font-mono text-xs text-ink-faint">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {choice}
                  {checked && i === checked.correctIndex && <span className="ml-2">✓</span>}
                  {checked && isSelected && i !== checked.correctIndex && (
                    <span className="ml-2">✗</span>
                  )}
                </button>
              )
            })}
          </div>

          {checked && (
            <div
              className={`mt-4 rounded-xl border-l-4 p-4 text-sm ${
                checked.correct ? 'border-good bg-good-soft' : 'border-bad bg-bad-soft'
              }`}
            >
              <p className="mb-1 font-semibold">
                {checked.correct ? 'Correct! 🎉' : 'Not quite.'}
              </p>
              <Markdown>{checked.explanationMd}</Markdown>
            </div>
          )}
        </Card>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="rounded-xl border border-line-strong px-4 py-2 text-sm font-medium transition-colors hover:border-brand hover:text-brand disabled:opacity-40"
          >
            ← Previous
          </button>

          {!checked ? (
            <button
              onClick={handleCheck}
              disabled={selected === undefined || checking}
              className="rounded-xl bg-gradient-to-r from-brand to-accent px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {checking ? 'Checking…' : 'Check answer'}
            </button>
          ) : current < total - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="rounded-xl bg-gradient-to-r from-brand to-accent px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Next question →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={submitQuiz.isPending || !allChecked}
              title={!allChecked ? 'Some questions are unanswered — use the progress dots above' : undefined}
              className="rounded-xl bg-gradient-to-r from-brand to-accent px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitQuiz.isPending ? 'Recording…' : 'Finish & see results'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function QuizResults({
  quizSlug,
  quizTitle,
  outcome,
  onRetry,
}: {
  quizSlug: string
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
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            onClick={onRetry}
            className="rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:border-brand hover:text-brand"
          >
            Try again
          </button>
          {outcome.passed ? (
            <NextUp kind="quiz" slug={quizSlug} active={true} />
          ) : (
            <Link
              to="/tracks"
              className="rounded-xl bg-gradient-to-r from-brand to-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Back to tracks
            </Link>
          )}
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
