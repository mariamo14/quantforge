---
title: How Quant Dev Interviews Work
minutes: 10
---

# How Quant Dev Interviews Work

Quant developer loops are more standardized than most candidates expect: nearly every firm — HFT prop shops (Jane Street, HRT, Jump, Optiver, IMC), quant hedge funds (Citadel, Two Sigma, Millennium pods), and market makers — runs some permutation of the same five rounds. Knowing what each round is *actually* testing lets you prepare deliberately instead of grinding randomly.

## Anatomy of the loop

1. **Screen** (recruiter + online assessment or 45-min phone). HackerRank/CodeSignal or a live problem. Testing: can you write correct code quickly under light pressure. Speed matters here more than elegance.
2. **Coding rounds** (1–2). LeetCode-medium/hard with a systems twist — parse a stream of trades and maintain rolling statistics, merge time-ordered feeds, implement an order book. Testing: correctness, complexity analysis, and whether your code handles edge cases (empty book, duplicate order IDs) without prompting.
3. **Low-level / language round** (the differentiator for dev roles — see below).
4. **Math / brainteasers** (heavier at prop shops, lighter at some funds). Mental arithmetic, probability, expected value, market-making games.
5. **Systems design + fit**. Design a trading-adjacent system; then motivation, collaboration, how you handle being wrong. Prop shops genuinely filter on the last one — trading desks are small and error-admission culture is load-bearing.

## The C++ round: internals, not LeetCode

This is where strong generalist SWEs get filtered out. The round probes whether you know what the machine does, because in trading the abstraction leaks *are* the job:

- **vtables**: what a virtual call compiles to (load vptr, index the table, indirect call), why it defeats inlining and branch prediction, and hence why hot paths avoid virtual dispatch (CRTP, `std::variant`, templates).
- **Move semantics**: what `std::move` actually is (an rvalue cast — it moves nothing), when moves are elided (RVO/NRVO), why a moved-from object must stay valid-but-unspecified, when a member `std::string` move is just a pointer swap.
- **Memory model**: `std::atomic`, acquire/release vs `seq_cst`, what a data race is (UB, not "stale reads"), how you'd build or reason about an SPSC ring buffer — the canonical trading-interview lock-free question.
- **Memory & layout**: stack vs heap costs, why allocation on the hot path is forbidden, cache lines (64 bytes), false sharing, struct padding and why field order matters.
- Classic openers: "What happens when you call a virtual function in a constructor?" "Tell me everything that happens in `std::vector::push_back`." "Why is `std::map` slow?" (pointer-chasing, cache misses — they want *cache misses*, not "log n").

The **DS&A track** and **C++ track** on this site cover both halves; drill them in parallel, not sequentially.

## Live-coding tactics

- **Restate the problem and confirm constraints** before typing — input sizes, value ranges, what "fast" means. Half the failure modes are solving the wrong problem.
- **Narrate as you go.** Silent typing reads as uncollaborative; interviewers pass people they'd want on their desk at 9:29 am.
- **State brute force, then improve** — it banks partial credit and often reveals the optimization.
- **Test before declaring done**: walk one normal case and two edges (empty input, single element, duplicates) out loud.
- When stuck, say what you know, what you're unsure of, and the two paths you're weighing. Structured stuck-ness is itself a positive signal.

## Math rounds and how to drill them

Two flavors, both drillable:

- **Mental arithmetic**: fast, accurate computation under a clock (Optiver's 80-in-8-minutes test is the famous one). Drill daily: two-digit multiplication, fraction↔decimal conversions, quick percentage math. Ten minutes a day for four weeks transforms this.
- **Probability puzzles**: expected value (expected rolls to see all six faces of a die — coupon collector, 14.7), conditional probability and Bayes, symmetry arguments, betting/market-making games ("make me a market on the number of windows in this building" — they're testing bid-ask logic and how you update on new info, not the trivia).

The **Brainteasers track** and the probability sections of the **CQF track** are your drill set. The meta-skill: *talk through your reasoning* — a wrong answer with clean probabilistic reasoning beats a memorized right one.

## Systems rounds: feed handler / order gateway

The two canonical prompts, both covered by this site's **Systems track** plus the networking, kernel-bypass, and LOB lessons:

- **Design a feed handler**: UDP multicast in, A/B arbitration, gap detection with snapshot recovery, decode (ITCH-style), book build, fan-out to strategies. They'll push on: what happens on packet loss? On a slow consumer (backpressure vs. drop vs. conflate)? Threading model — one thread per symbol group? How do you test it (deterministic replay)?
- **Design an order gateway**: strategy orders in, risk checks (fat-finger limits, position limits, self-trade prevention) in nanoseconds, venue session management, sequence-number recovery after disconnect, exactly-once semantics on the order path, drop-copy reconciliation.

Structure beats detail: requirements → data flow → the hot path → failure modes → measurement. Saying "I'd benchmark before optimizing; here's where I *expect* the time to go" lands well.

## Questions to ask, and red flags

Good questions signal you understand the business: "How is dev latency-budget ownership split with researchers?" "What does the path from backtest to production look like?" "How did the team handle the last big incident?" Red flags to watch for: they can't articulate how devs share in the upside (comp structure vagueness), "we'll train you on everything" with no specifics, pure-maintenance roles sold as greenfield, and interviewers who are hostile rather than probing — desks interview how they work.

## A 4-week prep plan

- **Week 1 — foundations**: C++ track (memory, moves, virtual dispatch) + DS&A track refresher. Start daily 10-minute mental-arithmetic drills (continue all four weeks).
- **Week 2 — domain**: Systems track + the microstructure, LOB, networking, and FIX lessons. Build a toy order book in C++ — it's the single highest-leverage project, feeding coding, C++, and systems rounds simultaneously.
- **Week 3 — pressure**: Brainteasers track daily; CQF track probability sections; timed LeetCode-style sets; mock the two systems prompts out loud.
- **Week 4 — integration**: full mock loops (timed, spoken), review every miss, re-drill weak spots. Rest the day before each onsite — these loops are cognitively brutal and sleep is alpha.

## Interview checkpoints

- Know the five-round shape — screen, coding, low-level, math, systems/fit — and what each is scored on.
- C++ rounds test internals: vtable mechanics, what `std::move` really does, acquire/release atomics, cache lines and false sharing — "why is `std::map` slow" wants *cache misses*.
- Live coding: restate constraints, narrate, brute-force first, test edges aloud.
- Math rounds are drillable: daily mental arithmetic + a repertoire of EV/Bayes/market-making puzzles, reasoning spoken aloud.
- Have the feed handler and order gateway designs pre-thought: hot path, loss recovery, backpressure, risk checks, testing via replay.
- Prep is a system: 4 weeks, one toy order book project, mock loops in week 4.
