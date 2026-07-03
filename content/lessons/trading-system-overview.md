---
title: Anatomy of a Trading System
minutes: 13
---

**Builds on:** *Queues & Messaging*, *Reliability: Designing for Failure*.

You now have all the parts: machines, queues, replicas, failovers. Time to assemble them into the thing this track has been building toward — a map of an automated trading system. Learn this map cold; half of quant-dev system design interviews are some corner of it.

## The big map

Data flows left to right; risk checks wrap everything:

```
exchange ──▶ feed handlers ──▶ book builders ──▶ strategy engine
                                                      │
exchange ◀── order gateway ◀── risk checks ◀──────────┘
```

| Component | Job in one line |
|---|---|
| Feed handler | Receives raw exchange packets, decodes them into normalized messages |
| Book builder | Applies updates to maintain the live order book (bids/asks per symbol) |
| Strategy engine | Watches books and signals, decides to buy/sell |
| Risk checks | Vetoes orders that break limits (size, price, position, rate) |
| Order gateway | Encodes orders into the exchange's protocol, manages the session |

And the support cast, off the fast path but essential:

- **OMS (Order Management System):** bookkeeping for every order's state — new, acknowledged, partially filled, filled, canceled, rejected. The system's memory.
- **Position & P&L tracking:** what do we hold, what is it worth, how much have we made or lost — updated with every fill.
- **Drop-copy reconciliation:** the exchange sends an independent copy of all your executions to a separate listener; you continuously compare it against what your OMS *thinks* happened. When they disagree, alarms ring. It's the double-entry accounting of trading.
- **Monitoring:** dashboards, alerts, heartbeats — the humans' window in.

## One order's life, with a stopwatch

Follow a single trade through a competitive (HFT-grade) system. Numbers are rough orders of magnitude — interviewers want the *shape*, not exact figures:

| Step | What happens | Rough budget |
|---|---|---|
| 1 | Market data packet arrives at the NIC | — (clock starts) |
| 2 | Feed handler decodes the packet | ~1 µs |
| 3 | Book builder updates the order book | ~100s of ns |
| 4 | Strategy sees the update, signal fires | ~1 µs |
| 5 | Pre-trade risk checks pass | ~100s of ns |
| 6 | Gateway encodes the order, hits the wire | ~1 µs |
| 7 | Network to exchange + exchange ack | ~10s of µs and up |

Steps 2–6 are **tick-to-trade** latency: packet-in to order-out. Competitive firms land in single-digit microseconds; specialized hardware (FPGAs) goes under a microsecond. Notice what's *not* here: no database writes, no cross-machine hops, no waiting. Everything on this path lives in memory on one machine — the vertical-scaling twist from the scaling lesson, in action.

## Hot path vs everything else

This is the central design tension of the whole field. The **hot path** — steps 2 through 6 — must be *fast above all*. Everything else must be *correct above all*, and may take milliseconds without anyone caring.

The trick is keeping the second group from slowing the first. The answer is the queue: the hot path fires events into a buffer and moves on, **never waiting** for downstream. The OMS, P&L tracker, and tick recorder consume from that buffer at their own pace. Fast things never wait for slow things; slow things get everything eventually.

## Where each earlier lesson plugs in

- **Queues:** between every stage boundary above — feed handler to strategy, hot path to OMS. Backpressure policy differs per link: market data drops-oldest, order events never drop.
- **Replication:** the OMS and position state are exactly the "state problem" from the reliability lesson — a replicated event log feeds a hot standby, so a gateway failover doesn't forget which orders are live.
- **Sharding:** the whole pipeline is naturally sharded **by symbol** — one instance per slice of the market, each scaled up, none talking to the others on the hot path.
- **Reliability:** A/B feeds into the feed handlers; kill switch and cancel-on-disconnect on the gateway; shed analytics before order flow.

## Vocabulary interviews expect

| Term | Meaning |
|---|---|
| Tick-to-trade | Latency from market-data packet in to order packet out |
| Hot path | The latency-critical chain (data → decision → order) |
| OMS / EMS | Order Management System (state bookkeeping) / Execution Management System (order routing & working) |
| Drop copy | Exchange's independent feed of your executions, used for reconciliation |
| Kill switch | One action that cancels all orders and halts trading |

Use these naturally and you sound like you've been on a desk; define them crisply when asked and you sound like you understand it too.

## Interview checkpoints

- Sketch the pipeline: feed handler → book builder → strategy → risk → gateway, with risk wrapping order flow.
- Walk one order end-to-end with rough budgets and define tick-to-trade.
- Explain the hot path vs correct-but-slower split, and how queues keep the slow side from blocking the fast side.
- Say what an OMS does and what drop-copy reconciliation catches.
- Point to where sharding by symbol and OMS replication fit in the map.
