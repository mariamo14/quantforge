---
title: Storing Market Data: Tick Databases
minutes: 11
---

**Builds on:** *Databases & Durability Basics*, *Anatomy of a Trading System*.

Every quote, trade, and order-book update flowing through the pipeline from the last lesson is worth keeping — it's the raw material for research, backtesting, and compliance. The catch is volume. Let's do the arithmetic before choosing any technology.

## The scale problem, in real numbers

A single liquid symbol — say SPY — generates on the order of **millions of book events per trading day**. Across all US equities venues, the consolidated feeds run to **tens of billions of messages per day** on busy days.

Now multiply. Suppose each event stores timestamp, symbol, price, size, side, and flags — call it $\sim 40$ bytes raw. Then:

$$10^{10} \text{ messages} \times 40 \text{ bytes} \approx 400 \text{ GB per day, raw}$$

Good compression brings that to **hundreds of GB compressed per day** — every day, forever, because researchers want years of history. That's petabyte-scale within a few years. Whatever we build must eat a firehose all day (append-heavy), keep everything in time order, and serve researchers who read *billions* of rows in one query.

## Why a general SQL database chokes

Your databases lesson covered row stores: each row's fields sit together on disk, great for "fetch order #123 and update it." Tick data is the opposite workload in every way:

- **Append-heavy, never updated.** Ticks are history; nothing edits them. Row-store machinery for updates and transactions is pure overhead here.
- **Time-ordered.** Data arrives and is read in timestamp order; general indexes add cost without helping.
- **Batch reads of few fields.** A researcher asks for "every trade price for AAPL in 2025" — two columns, billions of rows. A row store must read *entire rows* off disk (timestamps, sizes, flags, everything) just to extract the one field you wanted. At a billion rows, that's the difference between minutes and hours.

Insert-at-a-time, read-a-whole-row engines simply face the wrong direction.

## The columnar idea, from zero

Flip the layout. Instead of storing each *row* together, store each *field* together: all the timestamps in one block, all the prices in another, all the sizes in a third. This is a **columnar** store, and it wins twice:

1. **Compression.** Similar values sit next to each other. Consecutive timestamps differ by microseconds, so store the *deltas* — tiny numbers that compress brilliantly. Prices of one symbol barely move tick to tick; sides are just B/S. Compression ratios of 5–20× are routine, which is how 400 GB raw becomes a manageable file.
2. **Fast scans of few columns.** Want prices only? Read the price block only, skipping everything else. Your billion-row query touches a fraction of the bytes.

Add the natural writing pattern — **append-only**, **partitioned by date and symbol** (one chunk per symbol per day) — and queries like "AAPL on 2025-03-14" become "open exactly one chunk." Layout *is* the index.

## Hot, warm, cold

Not all history is equally urgent, so tier it by the latency numbers you already know:

| Tier | Where | Holds | Access time |
|---|---|---|---|
| Hot | RAM | Today's ticks | ~100 ns |
| Warm | Local SSD | Recent weeks/months | ~100 µs |
| Cold | Object storage (e.g. S3) | Years of history | ~10–100 ms |

Live strategies and today's monitoring hit RAM; recent research hits SSD; a five-year backtest streams from cheap object storage overnight. Same data model, three price points.

## What queries look like

Two shapes dominate (described, not coded):

- **As-of join:** "for each of my trades, what was the prevailing quote *at or just before* that moment?" — aligning two time series by nearest-preceding timestamp. It's *the* signature tick-database operation, and painful in standard SQL.
- **Bar aggregation:** collapse raw ticks into intervals — one open/high/low/close/volume summary per minute, say — turning billions of events into a dataset a model can chew.

## The ecosystem, one line each

- **kdb+/q:** the industry incumbent — columnar, in-memory-first, blisteringly fast, famously terse language, famously expensive.
- **Parquet + Arrow:** the open stack — Parquet is the compressed columnar file format on disk; Arrow is the matching in-memory format tools share.
- **ClickHouse / QuestDB:** open-source columnar databases increasingly common for tick workloads.

## Point-in-time correctness

One research-integrity rule to end on: store **what you knew then, not what got corrected later**. Exchanges cancel erroneous trades; vendors restate bad prints; symbols change. If your database silently applies corrections in place, your backtest trades on information that did not exist at that moment — the same lookahead bias the ML track warns about, smuggled in through storage. Serious tick stores are **bitemporal**: they keep both the original record and the correction, each with its own timestamp, so a backtest can replay the world exactly as it appeared. When an interviewer asks "how would you store tick data?", mentioning point-in-time correctness unprompted is a genuine differentiator.

## Interview checkpoints

- Reproduce the scale math: $10^{10}$ messages × ~40 bytes ≈ 400 GB/day raw, hundreds of GB compressed.
- Explain why row-oriented SQL stores fit tick workloads badly (append-heavy, time-ordered, few-column batch reads).
- Describe columnar storage and why it compresses so well (delta-encoded timestamps, similar neighboring values).
- Sketch hot/warm/cold tiers with rough access latencies.
- Define an as-of join and explain point-in-time correctness in one sentence each.
