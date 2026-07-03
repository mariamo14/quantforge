---
title: "Case Study: Design a Market Data Pipeline"
minutes: 14
---

**Builds on:** How to Answer a System Design Question; Tick Data Storage

The prompt lands: *"Feed us live prices for 8,000 US equities to 50 strategy processes, with history for research."* Resist the urge to draw. Run the script.

## Step 1: Requirements

First we ask about consumers, because "feed us prices" hides three different products:

- **Trading strategies** — need microsecond delivery, every update, in order. No gaps tolerated silently.
- **Dashboards and risk monitors** — milliseconds are fine; they want the *current* price, not every tick along the way.
- **Research** — batch access to complete history; latency measured in "is it there by tomorrow morning."

A good follow-up here is: "What do we do about gaps — is a strategy allowed to trade on a book it *thinks* is complete?" (No. Gap detection and recovery is a functional requirement, not a nice-to-have.)

Then the numbers. "What's the message rate?" The interviewer says average ~500k msgs/sec across the feed. The strong candidate immediately asks: **"And at the open?"** US equity opens run roughly 10× average. Design for the open or you've designed for nothing — the open is when the money is made and when your system will be tested.

## Step 2: Capacity estimation

Do the arithmetic on the board:

$$5{,}000{,}000 \ \text{msgs/sec} \times 60 \ \text{B} \approx 300 \ \text{MB/s} \approx 2.4 \ \text{Gbps}$$

State the conclusion aloud: "2.4 Gbps peak fits a single 10 Gbps NIC with headroom. This is not a distributed-systems scale problem — one machine can ingest the entire feed. The hard problems are latency, gap handling, and fan-out to 50 consumers with wildly different speed requirements." Also note the storage side: 300 MB/s × ~6.5 trading hours ≈ 7 TB/day raw — that's the tick-store sizing from the storage lesson, and it confirms capture needs its own dedicated write path.

## Step 3: High-level design

Narrate along the data path — in, process, out, store:

1. **Data in.** The exchange publishes via **UDP multicast** on two redundant lines, A and B (same data, different network paths). We run **two feed handlers**, each listening to both lines, **arbitrating by sequence number**: take whichever copy of packet N arrives first, discard the duplicate. Line arbitration turns two lossy feeds into one nearly-lossless one for free.
2. **Processing.** Feed handlers decode the exchange's wire format into a **normalized internal format** so 50 downstream consumers don't each reimplement exchange quirks. Then **book builders**, sharded by symbol (e.g., hash symbol → 8 shards), maintain the live order book per instrument.
3. **Data out — two tiers.** Co-located strategies read from **shared-memory ring buffers**: sub-microsecond, kernel-bypass, but only for processes on the same box. Everyone else — dashboards, risk, remote consumers — subscribes to a **pub/sub bus** carrying the normalized stream at millisecond latency.
4. **Storage.** A **capture path** tees the *raw* feed (pre-normalization — you want the bytes as the exchange sent them, for replay and dispute resolution) to disk, flowing into the tick store for research.

Offer the menu: "I'd deep-dive gap recovery, the slow-consumer policy, or why two distribution tiers. Preference?"

## Deep dive 1: Gap recovery

UDP means packets *will* be lost. Every message carries a sequence number; the feed handler expects N+1 after N. On a gap, the recovery dance from the reliability lesson:

1. Mark the affected books **stale** — downstream strategies must know they can't trust them.
2. Request a **snapshot** of current book state from the exchange's recovery service (or a peer feed handler).
3. Meanwhile, **buffer** incoming incremental updates.
4. Apply the snapshot, then **replay buffered incrementals** with sequence numbers greater than the snapshot's, in order.
5. Mark books live again.

The subtle interview point: during recovery you're serving stale data, and the *policy* — do strategies flatten, hold, or keep quoting? — is a business decision the system must expose, not hide.

## Deep dive 2: Slow consumers

Fifty consumers means someone will fall behind. The cardinal rule from the backpressure lesson: **a slow consumer must never slow the producer.** So per-consumer buffers with an explicit overflow policy:

- **Dashboards:** **conflation** — keep only the latest update per symbol. A dashboard that missed 400 ticks of AAPL only ever wanted the current price anyway. Drop-oldest, coalesce, move on.
- **Trading strategies:** conflation is *forbidden* — a strategy that silently missed updates is trading on a fictional book. If a trading consumer overflows its ring, we **disconnect it loudly** and it must re-sync via the snapshot path. Fail visibly, never silently.

Trade-off, stated properly: "Conflation buys us bounded memory and an always-fresh view at the cost of losing the update sequence — acceptable for humans, disqualifying for algorithms."

## Deep dive 3: Why two distribution tiers?

Because one tier fails both audiences. Shared memory buys us microseconds at the cost of co-location and tight coupling; the pub/sub bus buys us reach and decoupling at the cost of milliseconds. Collapsing them means either dragging every dashboard into the data center or taxing every strategy with a network hop. Two tiers is the honest answer.

## Step 5: The failure walk

Kill each box aloud:

- **Feed handler A dies.** Handler B is already live (active-active, both arbitrating A/B lines) — consumers fail over to B's output. The restarted handler rejoins via snapshot + incremental replay, same dance as gap recovery.
- **Pub/sub bus falls behind.** Conflation absorbs it for dashboards; trading consumers aren't on this tier, so the hot path is untouched.
- **Capture falls behind.** It must **never block the hot path** — capture reads from its own NIC receive queue (or a hardware tap), so a slow disk loses history, never trading. We alarm on capture lag and backfill from the exchange's recorded feed if needed.

## Closing trade-offs

| Choice | Buys us | At the cost of |
|---|---|---|
| A/B arbitration | Near-zero packet loss | 2× network hardware |
| Normalized format | One decoder, many consumers | Extra hop, ~µs added latency |
| Shared-memory tier | Sub-µs fan-out | Co-location requirement |
| Conflation (slow tier) | Bounded memory, fresh view | Lost update sequence |
| Separate capture path | Hot path never blocks | Possible history gaps under stress |

## Interview checkpoints

- Why do we size for the open, and what's the peak-rate bandwidth math from first principles?
- Walk the gap-recovery dance: snapshot, buffer, replay, in the right order — and what "stale" means downstream.
- Why is conflation correct for dashboards and disqualifying for strategies?
- What does A/B line arbitration by sequence number achieve, and what does it cost?
- Why must the capture path be architecturally incapable of blocking the hot path?
