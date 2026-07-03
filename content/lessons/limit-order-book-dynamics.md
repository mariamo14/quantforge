---
title: Limit Order Book Dynamics
minutes: 12
---

# Limit Order Book Dynamics

The limit order book (LOB) is the central data structure of modern markets — and of quant dev interviews. "Design an order book" is the single most common systems question in the space, and the follow-ups probe whether you understand the *dynamics*: what the book's shape predicts, what order flow actually looks like, and what gets built on top.

## The structure

A LOB is two ordered collections of **price levels**:

- **Bids**: buy interest, sorted descending; the best (highest) bid is the top.
- **Asks**: sell interest, sorted ascending; the best (lowest) ask is the top.

Each price level holds a FIFO queue of resting orders (under price-time priority). A snapshot:

```
        BIDS                      ASKS
  $50.08  ×  1,200    |    $50.10  ×    400
  $50.07  ×  3,500    |    $50.11  ×  2,100
  $50.06  ×  5,000    |    $50.12  ×  4,800
```

Spread = 2¢; mid = $50.09. **Depth** is the volume available at or near the touch — it measures how much you can trade before moving the price. In implementation terms, the classic engine layout is price levels in a sorted structure or a contiguous array indexed by tick (books are dense near the touch), each level holding an intrusive doubly-linked FIFO of orders, plus a hash map from order ID → node for O(1) cancels — because, as we'll see, cancels are most of the traffic.

## Imbalance: the workhorse predictor

Let $V_b$ be volume at the best bid and $V_a$ at the best ask. Order book imbalance:

$$I = \frac{V_b - V_a}{V_b + V_a} \in [-1, 1]$$

In the snapshot above, $I = (1200-400)/1600 = +0.5$: heavy bid, thin ask. Empirically, $I$ is one of the strongest short-horizon (milliseconds to seconds) predictors of mid-price direction. Why, mechanically:

- The next mid move happens when a best level is **depleted** — fully consumed or cancelled. The thin side (here, 400 shares offered) needs far less aggressive volume to be eaten through than the thick side.
- Under roughly symmetric arrival of market orders, the thin queue's expected time-to-depletion is shorter, so the mid is more likely to tick *up* (ask depletes) than down.
- Informed buyers also *cause* imbalance: they consume ask liquidity and join the bid, so imbalance partially reflects the order flow of people who know something.

Every market-making and short-horizon alpha stack has imbalance (and its variants over multiple levels, with exponential decay by distance from mid) in its feature set.

## Order flow composition: cancellations dominate

The counterintuitive fact interviewers love: in liquid US equities and futures, **the large majority of order messages — often 90%+ — are cancellations or modifications, not trades**. Trade-to-order ratios of 1:20 to 1:100 are normal. Market makers continuously reprice: every tick in a correlated instrument (SPY moves → cancel and re-quote every S&P name) triggers waves of cancel/replace. Consequences for the engineer: your book builder's hot path is **cancel**, not execution — hence the order-ID hash map; message rates during volatile opens hit millions/sec; and storage/replay systems size for message volume, not trade volume.

## Queue position value

Under FIFO, two orders at the same price are not equal. Being 1st in a 5,000-share queue at the best bid means you fill on the next modest sell order — and early fills at a level are *less* adversely selected (if the entire level trades through, the price is probably moving against everyone at it; the back of the queue fills only in that scenario). Being 4,900th means you fill mostly when you'd rather not. So queue position has quantifiable value — a meaningful fraction of the spread in tick-constrained names — and it's why makers don't casually cancel/rejoin (you forfeit priority) and why speed matters even for *passive* strategies: being first to a newly created price level wins the front of the queue.

## Mid-price vs microprice

The mid $\frac{P_b + P_a}{2}$ ignores the book's shape. The **microprice** weights each side by the *opposite* side's volume:

$$P_{\text{micro}} = \frac{V_a P_b + V_b P_a}{V_a + V_b}$$

With $P_b = 50.08$ ($V_b = 1200$), $P_a = 50.10$ ($V_a = 400$): $P_{\text{micro}} = (400 \cdot 50.08 + 1200 \cdot 50.10)/1600 = 50.095$ — above mid, consistent with $I = +0.5$ predicting an up-tick. Intuition: a heavy bid pushes fair value toward the ask, because the ask is what's about to break. Microprice is a better "fair value" input than mid for quoting and for marking short-horizon PnL, and it's a classic quick-derivation interview question.

## Sweeps and cancel cascades

A **sweep** is a single aggressive order (or burst) consuming multiple price levels at once — the signature of urgent, informed flow or a stop being triggered. The book's reaction is a **cancel cascade**: makers at deeper levels see the sweep on the feed and pull quotes within microseconds, so displayed depth evaporates precisely when a taker wants it most (liquidity is "a coward — never there when you need it"). Feature pipelines flag sweeps explicitly; execution algos pause after them rather than chasing vanished liquidity.

## Feed levels: L1, L2, L3

- **L1**: best bid/ask + last trade. Enough for a ticker, not for microstructure work.
- **L2**: aggregated depth per price level (price, total size, often order count) — e.g., 5–10 levels or full depth by level.
- **L3** (market-by-order): every individual order's add/modify/cancel/execute with order IDs — NASDAQ TotalView-ITCH is the canonical example. Required for queue-position modeling.

Feeds deliver **deltas** (add/cancel/execute messages) against a known state, plus periodic **snapshots** for recovery: process a snapshot, then apply buffered deltas with sequence numbers ≥ the snapshot's, and you're live. Getting that handoff right — no gaps, no double-applies — is a rite-of-passage bug for every feed-handler author.

## What quant devs actually build

The LOB is where quant devs earn their keep: **book builders** (decode ITCH/MDP3, maintain per-symbol books at millions of msgs/sec, nanosecond-timestamped), **feature pipelines** (imbalance, microprice, sweep detection, queue estimates computed on-tick and fed to strategies within microseconds), **simulators** (replay L3 history with realistic queue and fill modeling for backtests), and **execution/quoting engines** consuming all of it.

## Interview checkpoints

- Book design: sorted/array-indexed price levels, FIFO order queues per level, order-ID hash map for O(1) cancel — justified by cancel-dominated flow.
- Imbalance $I = \frac{V_b - V_a}{V_b + V_a}$ predicts short-horizon mid moves because the thin side depletes first; be able to give the mechanism, not just the formula.
- Know the flow stat: ~90%+ of messages are cancels/modifies; trade-to-order ratios of 1:20–1:100.
- Derive the microprice $\frac{V_a P_b + V_b P_a}{V_a + V_b}$ and explain the *opposite-side* weighting in one sentence.
- Queue position is an asset: front of queue = fast fills with less adverse selection; cancelling forfeits it.
- L1/L2/L3 distinctions cold, plus the snapshot + sequenced-deltas recovery pattern for feed handlers.
