---
title: "Case Study: Design a Backtesting Platform"
minutes: 13
---

**Builds on:** Tick Data Storage; How to Answer a System Design Question

The prompt: *"Researchers replay strategies over years of tick history, fast and honestly."* The word to seize on is **honestly**. A backtester that flatters strategies is worse than none — it converts research budget into confident losses. Run the script.

## Step 1: Requirements

First we ask what "correct" means here, because it outranks everything:

- **No lookahead.** A strategy must never see data from after its simulated "now" — not in prices, not in features, not in corporate actions. One leaked tick can turn a losing strategy into a paper goldmine.
- **Throughput.** "How much history, how fast?" Say: 2 years of full US equity tick data, across thousands of symbols, and researchers want runs back **overnight**.
- **Reproducibility.** Same code + same data + same config = bit-identical results. If Tuesday's rerun gives a different Sharpe, nobody can trust anything.

A good follow-up here is: "Do fills need to be realistic, or is close-price-to-close-price acceptable?" — because execution modeling is where honest backtests go to die, and the answer sets the depth of the simulator.

## Step 2: Capacity estimation

$$2 \ \text{years} \times 250 \ \text{days/yr} \times 1{,}000{,}000{,}000 \ \text{events/day} = 5 \times 10^{11} \ \text{events}$$

Half a trillion events. At ~50 bytes/event columnar-compressed, roughly 25 TB. Now the scan math: one core streaming a columnar store at ~1 GB/s processes 25 TB in ~25,000 seconds ≈ **7 hours — single-threaded, we barely make overnight with zero headroom**. Conclusion, stated aloud: "One event stream can't be parallelized without breaking causality, but *runs are embarrassingly parallel across partitions* — date and symbol partitioning isn't a storage nicety, it's the throughput strategy." The capacity math just dictated the architecture. Say that; interviewers love watching numbers drive design.

## Step 3: High-level design

Data in → processing → data out → storage:

1. **Tick store.** Columnar, partitioned by date × symbol (the tick-storage lesson's layout), and **point-in-time correct**: what the strategy reads is what was knowable *at that moment* — original prints, revisions applied only at their revision timestamps.
2. **Event-driven simulation core.** Per run, one **strictly ordered event stream**: market data, timer events, and the strategy's own order acks, merged by timestamp. The strategy is a callback — it receives event N, may emit orders, then receives event N+1. There is no other way to get data.
3. **Execution simulator.** Orders don't fill by fiat; they're simulated **against the historical book**: latency injection (your order arrives *x* µs after you sent it — the market moved), queue position (you're behind existing size at your price), fees and rebates.
4. **Results store + metrics.** Fills, positions, and P&L land in a results database; the metrics layer computes Sharpe, max drawdown (the sliding-window drawdown problem from the coding track — same algorithm, production seat), turnover, capacity.

Offer the menu: lookahead prevention, execution realism, or deterministic parallelism.

## Deep dive 1: Lookahead prevention as an architectural property

The weak answer is "we're careful about timestamps." The strong answer: **the simulator is physically incapable of handing you future data.** The event loop is **pull-based** — the strategy has no API to query the tick store, no file handles, no "give me today's close." It receives events; that's the entire surface. Features (moving averages, volatility estimates, book imbalance) are computed *incrementally from delivered events*, never from precomputed arrays indexed by date — a precomputed array is a lookahead bug waiting for an off-by-one. This is the same discipline as purged cross-validation in the ML lesson: don't audit for leakage, make leakage unrepresentable.

## Deep dive 2: Execution realism

Naive backtests fill at mid-price, instantly, in unlimited size — and systematically overstate P&L, because you "capture" spreads no one would have paid you and never suffer **adverse selection** (your passive order fills exactly when the market is about to move against you). The realism ladder, cheap to expensive:

| Grade | Fill model | Cost | Honest for |
|---|---|---|---|
| 1 | Mid-price, instant | Trivial | Daily-horizon signals |
| 2 | Cross the spread + fees | Cheap | Moderate-frequency |
| 3 | Latency + top-of-book size | Moderate | Intraday |
| 4 | Full queue position vs historical book | Expensive | HFT/market making |

Trade-off in canonical form: "Grade 4 buys us honest microstructure P&L at the cost of ~10× simulation compute — so we let researchers choose the grade, and require the high grades before anything ships to production."

## Deep dive 3: Parallelism without breaking determinism

We parallelize **across** runs, symbols, and date ranges — never **within** one event stream, because splitting a stream reorders causally linked events. Each run gets an explicit **per-run seed** for anything stochastic (latency jitter, partial-fill randomness), recorded with the results; reruns replay identical randomness. Floating-point discipline too: fixed reduction orders, no reduction-order-varying parallel sums inside a run. Reproducibility isn't a QA feature — it's what lets two researchers argue about the strategy instead of the simulator.

## Step 5: The integrity walk

For a backtester, the failure walk is an *integrity* walk — kill the honesty of each input:

- **Data revisions.** Vendors correct bad prints days later. If backtests read corrected data the strategy couldn't have seen live, results are fiction. Point-in-time snapshots: replay what was knowable then; apply revisions only at their revision time.
- **Survivorship bias.** If the symbol universe is "stocks that exist today," every backtest quietly excludes everything that went to zero. Delisted symbols **must exist** in the store, with their delisting events — dying is a return, usually −100%.
- **Clock alignment across venues.** An NYSE print and a NASDAQ quote with equal timestamps from different clocks can create phantom cross-venue arbitrage. Normalize to a common clock, and carry uncertainty bounds where sync is imperfect.

## Why this is a top-3 quant-dev interview question

Backtesting infrastructure is the rare prompt that tests all three things a quant dev must hold at once: **systems** (half a trillion events, partition-parallel, deterministic), **finance** (queue position, adverse selection, survivorship), and **statistical honesty** (lookahead, revisions, reproducibility). A candidate can fake one of the three. Almost nobody fakes all of them — which is exactly why interviewers keep asking it.

## Interview checkpoints

- Reproduce the capacity math: 500B events → why partition-parallelism is forced, not optional.
- Explain "the simulator physically cannot hand you future data" — what makes pull-based event delivery stronger than timestamp discipline?
- Why do mid-price fills overstate P&L, and what does each rung of the realism ladder buy and cost?
- Where is parallelism allowed, where is it forbidden, and what role do per-run seeds play?
- Name the three integrity failures — revisions, survivorship, clock skew — and the design answer to each.
