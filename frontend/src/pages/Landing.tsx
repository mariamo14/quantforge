import { Link } from 'react-router-dom'
import { usePageTitle } from '../lib/usePageTitle'

const TRACKS = [
  {
    icon: '⚡',
    accent: '#f59e0b',
    title: 'C++ for Quant Developers',
    blurb: 'From the compilation model to lock-free thinking — the C++ trading firms actually probe.',
  },
  {
    icon: '🧮',
    accent: '#22d3ee',
    title: 'DS&A for Trading Systems',
    blurb: 'Order books, streaming stats, and matching engines instead of abstract puzzles.',
  },
  {
    icon: '📈',
    accent: '#a78bfa',
    title: 'Quant Finance — CQF Core',
    blurb: 'From "what is a market?" to Black-Scholes, volatility models, rates, and risk.',
  },
  {
    icon: '🛰️',
    accent: '#34d399',
    title: 'Systems & Microstructure',
    blurb: 'Feeds, FIX, kernel bypass, and how exchanges really move prices.',
  },
  {
    icon: '🏗️',
    accent: '#f472b6',
    title: 'System Design',
    blurb: 'From "what is a server?" to whiteboarding a market-data pipeline.',
  },
  {
    icon: '🧠',
    accent: '#fb7185',
    title: 'Brainteasers & Mental Math',
    blurb: 'The probability puzzles and timed arithmetic the trading floor loves.',
  },
]

const FEATURES = [
  {
    icon: '⚙️',
    title: 'A real compiler judges you',
    blurb:
      'Every problem compiles your C++ with clang and runs it against hidden tests — verdicts, diffs, and compiler errors, just like the real screens.',
  },
  {
    icon: '🪜',
    title: 'Zero to quant, step by step',
    blurb:
      'No prior finance or systems knowledge assumed. Concepts unlock one at a time, each sealed with a checkpoint before the next.',
  },
  {
    icon: '✅',
    title: 'Instant feedback everywhere',
    blurb:
      'Check each quiz answer as you go, read the explanation, and let the Next button carry you forward.',
  },
  {
    icon: '📐',
    title: 'Interview-shaped content',
    blurb:
      'Every lesson ends with the checkpoints interviewers actually probe; every editorial tells you what to say out loud.',
  },
]

export function Landing() {
  usePageTitle('Become a Quant Developer')
  return (
    <div className="min-h-full overflow-y-auto">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <img src="/forge.svg" alt="" className="size-9 rounded-xl" />
          <span className="text-lg font-bold">QuantForge</span>
        </div>
        <Link
          to="/auth"
          className="rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:border-brand hover:text-brand"
        >
          Sign in
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-6 pt-14 pb-10 text-center">
        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
          Become a{' '}
          <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
            quant developer
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-muted">
          C++ judged by a real compiler. Quant finance from absolute zero. System design for
          trading systems. One guided path through all of it.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/auth"
            className="rounded-xl bg-gradient-to-r from-brand to-accent px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Start forging — it's your machine
          </Link>
        </div>
        <p className="mt-4 text-xs text-ink-faint">
          6 tracks · 130+ steps · 30+ compiler-judged C++ problems · CQF-grade math
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-line bg-surface-1 p-5">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-2 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{f.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-center text-2xl font-bold">Six tracks, one destination</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((t) => (
            <div key={t.title} className="rounded-2xl border border-line bg-surface-1 p-5">
              <span
                className="flex size-10 items-center justify-center rounded-xl text-xl"
                style={{ backgroundColor: `${t.accent}22` }}
              >
                {t.icon}
              </span>
              <h3 className="mt-3 font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{t.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14 text-center">
        <h2 className="text-2xl font-bold">The interview loop won't wait</h2>
        <p className="mx-auto mt-3 max-w-lg text-ink-muted">
          Create an account and solve your first order-book problem in the next ten minutes.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-brand to-accent px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
        >
          Create your account
        </Link>
      </section>

      <footer className="border-t border-line py-6 text-center text-xs text-ink-faint">
        QuantForge — built for the next generation of quant developers.
      </footer>
    </div>
  )
}
