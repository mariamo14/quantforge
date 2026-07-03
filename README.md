# ⚡ QuantForge

An interview-prep platform for becoming a **quant developer** — CodeSignal-style C++ challenges judged by a real compiler, HelloInterview-style learning roadmaps, and a quantitative-finance core modeled on the CQF syllabus. Runs entirely on your machine.

## What's inside

**5 learning tracks** — 34 lessons, 19 judged C++ problems, 15 quizzes (~90 questions):

| Track | Focus |
|---|---|
| ⚡ C++ for Quant Developers | RAII, move semantics, templates, memory model, low-latency patterns, vtables, UB & sanitizers, floating point |
| 🧮 DS&A for Trading Systems | Streaming stats, monotonic deques, heaps with lazy deletion, matching engines, LRU caches, arbitrage graphs |
| 📈 Quant Finance — CQF Core | Stochastic calculus, Black-Scholes & Greeks, implied vol, binomial trees, Monte Carlo methods, volatility models, portfolio theory, fixed income, rates & credit, VaR/ES, ML in finance |
| 🛰️ Systems & Microstructure | Networking, FIX & binary protocols, kernel bypass, feed-handler design, exchange mechanics, LOB dynamics |
| 🧠 Brainteasers & Mental Math | Probability puzzles, market-maker games, and timed mental-math drills |

**Features:** live C++ judge (compile + run against hidden tests with per-test verdicts), Monaco editor with ⌘↵/⌘⇧↵ shortcuts, XP/levels/streaks, daily challenge, editorials unlocked on solve, KaTeX-rendered math, dark/light themes.

## Stack

- **Frontend** — React 19 + TypeScript, Vite, Tailwind CSS v4, TanStack Query, Monaco, KaTeX
- **Backend** — Spring Boot 4 (Java), Spring Security + JWT, Spring Data JPA, H2 file database
- **Judge** — `clang++ -std=c++20 -O2` subprocess with wall-clock timeouts, forced kill, and output caps
- **Content** — plain YAML + Markdown in `content/`, seeded idempotently at startup (edit content without touching code)

## Running it

Prereqs: a JDK (17+), Node 20+, and Xcode command-line tools (`clang++`) — all standard on a dev Mac.

```bash
# terminal 1 — API on :8080 (first run downloads Maven + deps)
cd backend && ./mvnw spring-boot:run

# terminal 2 — UI on :5173 (proxies /api to :8080)
cd frontend && npm install && npm run dev
```

Open http://localhost:5173, create an account (stored locally in `backend/data/`), and start forging.

## Tests

```bash
cd backend && ./mvnw test        # judge integration tests (real clang++), auth flow,
                                 # and content validation: every reference solution
                                 # must be ACCEPTED on its own hidden tests
cd frontend && npm run build     # type-check + production build
```

## Content authoring

Everything lives in `content/`:

```
content/
├── tracks/*.yaml            # track → modules → ordered lesson/problem/quiz refs
├── lessons/<slug>.md        # frontmatter (title, minutes) + markdown/KaTeX body
├── quizzes/<slug>.yaml      # MCQs with explanations
└── problems/<slug>/
    ├── problem.yaml         # title, difficulty, xp, timeLimitMs
    ├── statement.md         # rendered in the workspace
    ├── starter.cpp          # what the editor opens with
    ├── solution.cpp         # reference solution (must pass its own tests)
    ├── editorial.md         # unlocked after first accept
    └── tests.yaml           # [{input, output, sample}] — sample tests are shown, others hidden
```

Add or edit files, restart the backend, and the seeder upserts by slug — user progress is preserved. To add a problem, write the inputs in `tools/gen_tests.py` and run `python3 tools/gen_tests.py <slug>`: it compiles your `solution.cpp` and generates `tests.yaml` from it. The `ContentValidationTest` then enforces that the reference solution passes.

## Judge safety model

Submissions compile and run as **local subprocesses** — appropriate for a personal, local tool where the only code run is your own:

- per-submission temp directory, deleted afterwards
- 10s compile / per-problem run timeouts enforced with `destroyForcibly`
- output capped (8MB) and drained on background threads so spam can't wedge the server
- concurrency limited by a semaphore

There is deliberately **no filesystem/network sandbox**. If this were ever exposed to other people's code, the judge would need to run inside a locked-down container (gVisor/Firecracker-class isolation) — that is the known hardening step, not an oversight.

## Architecture notes

- **XP is always derived** from completions/accepts/best-scores — never stored — so it can't drift.
- Hidden tests never leave the backend: the problem API returns sample tests only, and per-test diffs are included only for samples.
- `Run` judges sample tests and records nothing; `Submit` judges the full set, records the submission, and awards XP once per problem.
- Streak = consecutive active days (any submission, lesson completion, or quiz attempt) ending today or yesterday.
