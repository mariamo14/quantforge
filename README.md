# ⚡ QuantForge

An interview-prep platform for becoming a **quant developer** — CodeSignal-style C++ challenges judged by a real compiler, HelloInterview-style learning roadmaps, and a quantitative-finance core modeled on the CQF syllabus. Runs entirely on your machine.

## What's inside

**6 learning tracks** — 69 lessons, 36 judged C++ problems, 34 quizzes (~160 questions):

| Track | Focus |
|---|---|
| ⚡ C++ for Quant Developers | From the compilation model and value semantics up through RAII, moves, templates, the memory model, low-latency patterns, UB & floating point |
| 🧮 DS&A for Trading Systems | Streaming stats, monotonic deques, heaps with lazy deletion, matching engines, LRU caches, arbitrage graphs |
| 📈 Quant Finance — CQF Core | From "what is a market?" to Black-Scholes and beyond: returns, TVM, probability, stochastic calculus, derivatives, trees, MC, volatility, portfolio/risk, rates & credit, ML |
| 🛰️ Systems & Microstructure | Networking, FIX & binary protocols, kernel bypass, feed-handler design, exchange mechanics, LOB dynamics |
| 🏗️ System Design for Quant Devs | From "what is a server?" through scaling, queues, and reliability to worked interview case studies: market-data pipeline, order gateway, backtester |
| 🧠 Brainteasers & Mental Math | Probability puzzles, market-maker games, and timed mental-math drills |

**Features:** live C++ judge (compile + run against hidden tests with per-test verdicts), Monaco editor with ⌘↵/⌘⇧↵ shortcuts, XP/levels/streaks, daily challenge, editorials unlocked on solve, KaTeX-rendered math, dark/light themes.

**Step-by-step progression (CodeSignal-style):** tracks assume zero prior knowledge — the quant track literally starts at "what is a market?" and climbs to Black-Scholes one concept at a time, with a short checkpoint quiz after each idea and an easy coding exercise before each hard one. Items unlock sequentially (finish a step to open the next; a "Next up" button carries you forward), and a per-track **Free roam** toggle opens everything for experienced users. Every lesson/problem/quiz page carries a course-player bar (track, "Step i of N", progress, prev/next); quizzes give **instant per-question feedback** — answer, check, read the explanation, advance. Lessons that depend on earlier material declare it with a *Builds on:* line.

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

## Hosting it for other people

The defaults are tuned for personal, local use. Before exposing QuantForge to anyone else:

1. **Set a real JWT secret**: `export QUANTFORGE_JWT_SECRET=$(openssl rand -hex 48)`. The `prod` profile (`--spring.profiles.active=prod`) **refuses to boot** on the default secret.
2. **The judge sandbox is on by default** (macOS `sandbox-exec`): submissions cannot open network connections or write outside their temp directory — verified by an integration test. On hosts without `sandbox-exec`, the judge logs a warning and runs unsandboxed; for untrusted users on Linux, run the judge inside a container (gVisor/Firecracker-class) instead.
3. **Auth endpoints are rate-limited** (15/min per IP, in-memory). Behind a reverse proxy, make sure `X-Forwarded-For` is set by the proxy (and stripped from client requests).
4. **Serve the frontend as static files**: `cd frontend && npm run build`, then put `dist/` behind nginx/Caddy with `/api` proxied to :8080, and terminate TLS there.
5. **Back up `backend/data/`** — it's the whole database. H2 is fine for a classroom-sized deployment; migrate the JDBC URL to Postgres before serious concurrency.
6. Judge throughput is `quantforge.judge.max-concurrent` (default 2) — size it to cores minus what the JVM and OS need.

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
