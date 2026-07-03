---
title: "Case Study: Design an Order Gateway"
minutes: 14
---

**Builds on:** How to Answer a System Design Question; Queues, Backpressure, and Idempotency

The prompt: *"Strategies submit orders; deliver them to the exchange safely at low latency."* The word doing the work is **safely**. Run the script.

## Step 1: Requirements

First we ask about latency: "What's the budget from strategy decision to wire?" Say the answer is single-digit microseconds through the gateway. Then throughput: a few thousand orders/sec normally, tens of thousands in a burst. Then the non-negotiables, which we state back explicitly because they *are* the design:

- **Never lose an order.** If a strategy submitted it, we must know its fate.
- **Never double-send.** A duplicate order is an unintended position — real money.
- **Always cancellable.** Whatever breaks, we must be able to pull our orders from the market.

A good follow-up here is: "When the gateway crashes with orders in flight, is it acceptable to auto-cancel everything at the exchange?" (Usually yes — and that answer becomes our safety net later.)

## Step 2: Capacity estimation

Do the math even though you suspect it's small:

$$10{,}000 \ \text{orders/sec} \times 200 \ \text{B} = 2 \ \text{MB/s} \approx 16 \ \text{Mbps}$$

Now the strong-candidate move — say it out loud: **"This is trivial bandwidth. This problem is not about scale; it's about correctness and latency."** Interviewers plant prompts like this deliberately. Candidates who reflexively start sharding a 2 MB/s workload have pattern-matched instead of engineered. One process on one machine handles this rate; every design decision from here is about never being wrong about money, and shaving microseconds.

## Step 3: High-level design

Narrate the path of one order:

1. **Strategy → gateway** over shared memory or a local socket.
2. **Pre-trade risk checks**, in-process: fat-finger limits (price/size sanity), position limits (would this order breach max exposure?), and a **rate throttle** — literally the token-bucket from earlier in this module, capping orders/sec per strategy so a bugged loop can't machine-gun the exchange.
3. **Order state machine.** Every order lives in exactly one state: $\text{NEW} \to \text{ACKED} \to \text{FILLED} \mid \text{CANCELLED} \mid \text{REJECTED}$ (with PARTIALLY_FILLED as a self-loop on the way). Every transition is **persisted to an append-only event log** before we act on it.
4. **Exchange session** — the venue's protocol (FIX or binary): per-session **sequence numbers** so both sides agree on what was sent, and **heartbeats** so a dead session is detected in seconds.
5. **Acks and fills flow back** through the same event log — one ordered record of everything we sent and everything the exchange told us. The log *is* the system of record; the in-memory state machine is just a cache of it.

Offer the menu: idempotency, crash recovery, or hot-path risk checks.

## Deep dive 1: Idempotency and exactly-once-to-exchange

"Never double-send" is the idempotency problem wearing a suit. Every order gets a unique, deterministic **client order ID** assigned at creation and journaled *before* sending. On any retry — timeout, session bounce, gateway restart — we send the *same* client order ID, and the exchange (or our own dedupe layer keyed on that ID) rejects the duplicate. The event log is the single source of truth: if the log says order 4711 was sent, we never construct a "new" order for the same intent; we query the fate of 4711. Exactly-once isn't a network property — networks give you at-least-once or at-most-once — it's an *end-to-end* property built from at-least-once delivery plus deduplication on a stable ID.

## Deep dive 2: Recovery after a crash

The gateway dies and restarts. Recovery is three moves:

1. **Replay the event log** to rebuild the state machine — every order back in its last known state.
2. **Reconcile with the exchange.** For anything in-flight (NEW, sent-but-unACKED), *don't guess* — ask: order status requests, or a **drop copy** feed (the exchange's independent record of our activity). The exchange's answer wins.
3. **The safety net: cancel-on-disconnect.** We pre-arrange with the exchange that if our session drops, they auto-cancel our resting orders. So the worst case during our blackout is bounded: we might miss fills, but we can't accumulate unknown exposure.

This is the answer to the killer follow-up from the method lesson — "what happens to in-flight orders?" — *reconcile, don't guess*, with cancel-on-disconnect bounding the damage while you do.

## Deep dive 3: Risk checks on the hot path

Every check sits on the critical path of every order, so nothing remote is allowed: no network call, no database read, no lock contention. Limits live **in-process** in memory, read lock-free; a separate control plane updates them out-of-band (e.g., risk desk pushes new limits, gateway atomically swaps a pointer to the new limit table). Reads cost nanoseconds; updates are rare and off the hot path. Trade-off stated properly: "In-process limits buy us nanosecond checks at the cost of a propagation delay when limits change — we bound that delay and alarm on staleness."

## Step 5: The failure walk

- **Gateway crashes mid-order.** Is the order at the exchange? Unknowable locally — replay the log, reconcile via order status/drop copy, and only then resume. Reconcile, don't guess.
- **Exchange session drops.** Heartbeats detect it in seconds; cancel-on-disconnect fires at the venue; on reconnect, sequence-number gap-fill tells us exactly which messages the exchange never received.
- **Risk-limit feed goes stale.** **Fail closed**: reject *new* orders, but keep cancels flowing — you must always be able to reduce risk, never forced to add it. Correctness of money over availability of order flow.

## Closing trade-off: sync vs async persistence

Persist-then-send: journal the order (fsync) *before* it goes to the wire — a crash can never lose a sent order, at the cost of ~10µs or more per order. Async journaling: send immediately, flush the log in the background — microseconds faster, with a tiny window where a crash loses the record of a sent order (recoverable via exchange reconciliation, but hairier). Real firms choose **per desk**: a market maker quoting thousands of times a second may take the async window; a desk sending large, rare orders takes the fsync. Ending on "it depends, and here's the axis it depends on" is exactly what senior candidates do.

## Interview checkpoints

- Why is announcing "this isn't a scale problem" after the capacity math a strong-candidate move?
- Draw the order state machine and explain why every transition hits the event log first.
- How do client order IDs + the event log + exchange-side dedupe combine into exactly-once?
- Walk crash recovery: replay, reconcile (order status/drop copy), cancel-on-disconnect — and why "reconcile, don't guess" is the only safe answer for in-flight orders.
- Why do stale risk limits fail closed for new orders but never block cancels?
