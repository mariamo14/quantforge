import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import confetti from 'canvas-confetti'
import { useProblem, useRunCode, useSubmitCode } from '../api/hooks'
import type { ProblemDto, RunResponse } from '../api/types'
import { Markdown } from '../components/Markdown'
import { NextUp } from '../components/NextUp'
import { TrackContextBar } from '../components/TrackContextBar'
import { DifficultyBadge, Spinner, VerdictBadge, XpPill, VERDICT_LABELS } from '../components/ui'
import { useTheme } from '../state/theme'

export function ProblemPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: problem, isLoading } = useProblem(slug!)

  if (isLoading || !problem) {
    return <Spinner label="Loading problem…" />
  }
  return <Workspace key={problem.slug} problem={problem} />
}

function Workspace({ problem }: { problem: ProblemDto }) {
  const { theme } = useTheme()
  const [code, setCode] = useState(problem.lastSubmittedCode ?? problem.starterCode)
  const [result, setResult] = useState<RunResponse | null>(null)
  const [resultKind, setResultKind] = useState<'run' | 'submit'>('run')
  const [tab, setTab] = useState<'statement' | 'editorial'>('statement')
  const run = useRunCode(problem.slug)
  const submit = useSubmitCode(problem.slug)
  const busy = run.isPending || submit.isPending

  async function handleRun() {
    setResultKind('run')
    setResult(await run.mutateAsync(code))
  }

  async function handleSubmit() {
    setResultKind('submit')
    const response = await submit.mutateAsync(code)
    setResult(response)
    if (response.firstAccept) {
      confetti({ particleCount: 160, spread: 75, origin: { y: 0.7 } })
    }
  }

  // ⌘↵ runs, ⌘⇧↵ submits — the shortcuts you'd expect from a judge UI.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        if (busy) return
        if (event.shiftKey) {
          void handleSubmit()
        } else {
          void handleRun()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, busy])

  const statusLine = useMemo(() => {
    if (busy) return resultKind === 'submit' || submit.isPending ? 'Judging…' : 'Compiling & running…'
    if (!result) return null
    const scope = resultKind === 'run' ? 'sample tests' : 'tests'
    return `${result.passed}/${result.total} ${scope} passed`
  }, [busy, result, resultKind, submit.isPending])

  return (
    <div className="flex h-full flex-col">
      <TrackContextBar kind="problem" slug={problem.slug} />
      <header className="flex flex-wrap items-center gap-3 border-b border-line bg-surface-1 px-5 py-3">
        <h1 className="font-semibold">{problem.title}</h1>
        <DifficultyBadge difficulty={problem.difficulty} />
        {problem.solved ? (
          <span className="rounded-full bg-good-soft px-2.5 py-0.5 text-xs font-semibold text-good">
            Solved ✓
          </span>
        ) : (
          <XpPill xp={problem.xp} />
        )}
        <span className="text-xs text-ink-faint">time limit {problem.timeLimitMs} ms</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={busy}
            title="⌘↵"
            className="rounded-xl border border-line-strong px-4 py-1.5 text-sm font-semibold transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            {run.isPending ? 'Running…' : 'Run'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy}
            title="⌘⇧↵"
            className="rounded-xl bg-gradient-to-r from-brand to-accent px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submit.isPending ? 'Judging…' : 'Submit'}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Statement pane */}
        <div className="w-[42%] min-w-[320px] overflow-y-auto border-r border-line">
          {problem.solved && problem.editorialMd && (
            <div className="flex gap-1 border-b border-line bg-surface-1 px-4 pt-3">
              {(['statement', 'editorial'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-t-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    tab === t
                      ? 'border border-b-0 border-line bg-surface-0 text-ink'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {t === 'statement' ? 'Statement' : '✨ Editorial'}
                </button>
              ))}
            </div>
          )}
          <div className="p-5">
            <Markdown>
              {tab === 'editorial' && problem.editorialMd ? problem.editorialMd : problem.statementMd}
            </Markdown>

            {tab === 'statement' && problem.sampleTests.length > 0 && (
              <div className="mt-6 flex flex-col gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
                  Sample tests
                </h3>
                {problem.sampleTests.map((test, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <IoBlock label={`Input ${i + 1}`} text={test.input} />
                    <IoBlock label={`Output ${i + 1}`} text={test.expectedOutput} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor + results pane */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <Editor
              language="cpp"
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={code}
              onChange={(value) => setCode(value ?? '')}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>

          <div className="h-[36%] min-h-[160px] overflow-y-auto border-t border-line bg-surface-1">
            <div className="sticky top-0 flex items-center gap-3 border-b border-line bg-surface-1 px-4 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Results
              </p>
              {result && !busy && <VerdictBadge verdict={result.verdict} />}
              {statusLine && <span className="text-xs text-ink-muted">{statusLine}</span>}
              {result?.firstAccept && (
                <span className="text-xs font-semibold text-good">
                  +{result.xpAwarded} XP — first accept! 🎉
                </span>
              )}
              <span className="ml-auto flex items-center gap-3">
                <NextUp
                  kind="problem"
                  slug={problem.slug}
                  active={resultKind === 'submit' && result?.verdict === 'ACCEPTED'}
                />
                <span className="text-[11px] text-ink-faint">⌘↵ run · ⌘⇧↵ submit</span>
              </span>
            </div>

            <div className="p-4">
              {busy && <Spinner label="clang++ is thinking…" />}
              {!busy && !result && (
                <p className="py-6 text-center text-sm text-ink-muted">
                  Run your code against the sample tests, then submit to face the hidden ones.
                </p>
              )}
              {!busy && result && <ResultDetails result={result} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultDetails({ result }: { result: RunResponse }) {
  if (result.verdict === 'COMPILE_ERROR') {
    return (
      <div>
        <p className="mb-2 text-sm font-medium text-bad">Compilation failed</p>
        <pre className="overflow-x-auto rounded-xl bg-surface-0 p-3 font-mono text-xs leading-5 text-bad">
          {result.compilerOutput}
        </pre>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {result.tests.map((test) => (
        <div key={test.index} className="rounded-xl border border-line bg-surface-0 p-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm ${test.verdict === 'ACCEPTED' ? 'text-good' : 'text-bad'}`}
            >
              {test.verdict === 'ACCEPTED' ? '●' : '○'}
            </span>
            <p className="text-sm font-medium">
              Test {test.index + 1}
              {!test.sample && <span className="ml-1 text-xs text-ink-faint">(hidden)</span>}
            </p>
            <span className="text-xs text-ink-muted">{VERDICT_LABELS[test.verdict]}</span>
            <span className="ml-auto text-xs text-ink-faint">{test.timeMs} ms</span>
          </div>
          {test.verdict !== 'ACCEPTED' && test.sample && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {test.expected != null && <IoBlock label="Expected" text={test.expected} />}
              {test.actual != null && <IoBlock label="Your output" text={test.actual} />}
            </div>
          )}
          {test.stderr && test.verdict === 'RUNTIME_ERROR' && (
            <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-2 p-2 font-mono text-xs text-bad">
              {test.stderr}
            </pre>
          )}
        </div>
      ))}
    </div>
  )
}

function IoBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
        {label}
      </p>
      <pre className="overflow-x-auto rounded-lg border border-line bg-surface-2 p-2 font-mono text-xs leading-5">
        {text.replace(/\n$/, '') || ' '}
      </pre>
    </div>
  )
}
