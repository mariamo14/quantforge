# ⚡ QuantForge

**A training platform for becoming a quant developer.** Write C++ that a real compiler judges against hidden tests, learn quantitative finance from "what is a market?" up to Black-Scholes, and work through system-design case studies for trading infrastructure — all in one guided path.

Think CodeSignal's judge, HelloInterview's roadmaps, and a CQF-shaped curriculum, running entirely on your own machine.

---

## What's inside

**6 tracks · 144 steps · 71 lessons · 39 compiler-judged problems · 34 quizzes (173 questions)**

| Track | What it covers |
|---|---|
| ⚡ **C++ for Quant Developers** | The compilation model and value semantics, then RAII, move semantics, templates, STL internals, the memory model and atomics, cache-friendly and low-latency patterns, undefined behavior, floating point |
| 🧮 **DS&A for Trading Systems** | Streaming statistics, monotonic deques, heaps with lazy deletion, binary search on time series, matching engines, LRU caches, arbitrage graphs |
| 📈 **Quant Finance — CQF Core** | Markets and returns → probability → stochastic calculus → derivatives → binomial trees → Black-Scholes and the Greeks → Monte Carlo → volatility models → portfolio theory and risk → rates and credit → ML in finance |
| 🛰️ **Systems & Microstructure** | Networking for trading, FIX and binary protocols, kernel bypass, feed-handler design, exchange mechanics, limit order book dynamics |
| 🏗️ **System Design for Quant Devs** | From "what is a server?" through scaling, queues, and reliability to worked interview case studies: market-data pipeline, order gateway, backtesting platform |
| 🧠 **Brainteasers & Mental Math** | Probability puzzles, Bayes and counting, market-maker games, timed arithmetic drills |

### A real judge, not a quiz about code

Every coding problem compiles your submission with `clang++ -std=c++20 -O2` and runs it against hidden test cases. You get per-test verdicts (`ACCEPTED` / `WRONG_ANSWER` / `COMPILE_ERROR` / `RUNTIME_ERROR` / `TIME_LIMIT`), expected-vs-actual diffs on sample tests, and compiler errors verbatim. The workspace is a split pane: statement, Monaco editor, results console — `⌘↵` to run, `⌘⇧↵` to submit.

Problems are drawn from what quant desks actually build: a limit order book, a price-time-priority matching engine, a lock-free-style ring buffer, a fixed memory pool, Black-Scholes and its Greeks, an implied-volatility solver, a delta-hedging P&L simulator, GARCH forecasting, historical VaR, and a token-bucket order throttle.

### Built to be learnable from zero

No prior finance or systems knowledge is assumed. Concepts unlock one at a time, each sealed by a short checkpoint quiz before the next opens, and an easy coding exercise always precedes a hard one. Specifically:

- **Sequential unlock** — finish a step to open the next; a **Next up** button carries you forward. A per-track **Free roam** toggle opens everything for experienced users.
- **Course-player bar** on every page — track, "Step 12 of 23", progress, previous/next.
- **Instant quiz feedback** — answer, check, read the explanation, advance.
- **Progress everywhere** — an overall bar segmented by track, per-module bars, XP, levels, and streaks.
- **Prerequisites are explicit** — lessons that build on earlier material say so in a *Builds on:* line, and every lesson closes with the interview checkpoints it prepares you for.

---

## Quick start

**Prerequisites:** JDK 17+, Node 20+, and a C++ compiler (`clang++` — bundled with Xcode command-line tools on macOS).

```bash
cd backend && ./mvnw spring-boot:run
```

```bash
cd frontend && npm install && npm run dev
```

Open **http://localhost:5173**, create an account, and start at step one. Everything — your account, progress, and submissions — lives in a local H2 database at `backend/data/`.

### Tests

```bash
cd backend && ./mvnw test
```

18 tests covering the auth flow, the judge (real `clang++` invocations for every verdict type, plus sandbox and anti-wedge regressions), and content validation — which compiles and judges **all 39 reference solutions against their own hidden tests** and verifies every quiz answer index, track reference, and content count.

```bash
cd frontend && npm run build
```

---

## Architecture

```
quantforge/
├── backend/          Spring Boot 4 · Spring Security + JWT · Spring Data JPA · H2
│   └── com.quantforge/{auth,content,judge,progress,config}
├── frontend/         React 19 · TypeScript · Vite · Tailwind v4 · TanStack Query · Monaco · KaTeX
├── content/          the entire curriculum, as plain YAML + Markdown
└── tools/            test generation and content linting (Python)
```

**Content is data, not code.** The whole curriculum lives in `content/` and is seeded into the database at startup, upserted by slug — so editing a lesson or adding a problem never touches application code, and user progress survives every reseed.

```
content/
├── tracks/*.yaml            track → modules → ordered lesson/problem/quiz references
├── lessons/<slug>.md        frontmatter (title, minutes) + Markdown/KaTeX body
├── quizzes/<slug>.yaml      multiple choice with per-answer explanations
└── problems/<slug>/
    ├── problem.yaml         title, difficulty, xp, time limit
    ├── statement.md         rendered beside the editor
    ├── starter.cpp          what the editor opens with
    ├── solution.cpp         reference solution — must pass its own tests
    ├── editorial.md         unlocked after the first accept
    └── tests.yaml           [{input, output, sample}] — non-sample tests stay hidden
```

**Adding a problem:** write the four content files, add an input generator to `tools/gen_tests.py`, then run `python3 tools/gen_tests.py <slug>` — it compiles your `solution.cpp` and generates `tests.yaml` from its actual output. The test suite then enforces that the reference solution passes, so a broken problem can never ship.

**Content linting:** `python3 tools/lint_content.py` catches malformed frontmatter, invalid quiz answer indices, and the subtle KaTeX failure mode where an unescaped currency `$` swallows a paragraph into a math span.

### Design decisions worth knowing

- **XP is always derived** from completions, accepted submissions, and best quiz scores — never stored — so it cannot drift out of sync.
- **Hidden tests never leave the backend.** The problem API returns sample tests only, and per-test diffs are included only for samples.
- **Run vs Submit:** `Run` judges the sample tests and records nothing; `Submit` judges the full set, records the submission, and awards XP once per problem.
- **Streaks** count consecutive active days — any submission, lesson completion, or quiz attempt — ending today or yesterday.
- **The judge feeds stdin from a worker thread.** A submission that never reads its input would otherwise fill the OS pipe and block the judge thread indefinitely, ahead of any timeout.

---

## The judge sandbox

Submissions are compiled and executed as local subprocesses with several layers of containment:

- **Sandboxed execution** — on macOS the judge wraps each run in `sandbox-exec` with network access denied and writes confined to the submission's own temporary directory. An integration test verifies the denial actually holds.
- **Wall-clock timeouts** — 10s to compile, per-problem limits to run, enforced with `destroyForcibly`.
- **Output caps** — 8MB, drained on background threads so a runaway program cannot wedge the server.
- **Bounded concurrency** — a semaphore limits simultaneous judgments (`quantforge.judge.max-concurrent`).

On hosts without `sandbox-exec` the judge logs a warning and runs unsandboxed. For untrusted code on Linux, run the judge inside a locked-down container (gVisor/Firecracker-class isolation) — that is the intended hardening path.

## Hosting it for other people

Defaults are tuned for personal, local use. Before opening it up:

1. **Set a real JWT secret** — `export QUANTFORGE_JWT_SECRET=$(openssl rand -hex 48)`. The `prod` profile (`--spring.profiles.active=prod`) refuses to start on the built-in development secret.
2. **Confirm the sandbox is active** — the judge logs its status at startup; on Linux, containerize instead.
3. **Auth endpoints are rate-limited** (15 requests/minute per IP). Behind a reverse proxy, ensure the proxy sets `X-Forwarded-For` and strips it from client requests.
4. **Serve the frontend as static files** — `npm run build`, then put `dist/` behind nginx or Caddy with `/api` proxied to port 8080 and TLS terminated there.
5. **Back up `backend/data/`** — it is the entire database. H2 suits a classroom-sized deployment; move the JDBC URL to Postgres before serious concurrency.
6. **Size the judge** — set `quantforge.judge.max-concurrent` to your core count minus headroom for the JVM and OS.

---

## License

Personal project — all curriculum content is original.
