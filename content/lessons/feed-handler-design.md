---
title: Design a Feed Handler
minutes: 15
---

"Design a feed handler" is the systems-design question for quant dev roles. It tests protocol knowledge, low-latency mechanics, and failure-mode thinking in one shot. The winning move is to run it like a real design review: pin down requirements, decompose into a pipeline, then volunteer the failure modes before the interviewer asks.

## Step 1: Nail the requirements out loud

Weak candidates start drawing boxes. Strong candidates ask four questions first:

- **Which venue and protocol?** Nasdaq TotalView-ITCH (order-by-order L3 over MoldUDP64) is a different problem from CME MDP 3.0 (SBE-encoded incrementals plus a separate snapshot channel). Name a concrete protocol and design against it.
- **L2 or L3?** L3 (every add/cancel/execute, per-order) means you rebuild the book yourself and can compute queue position. L2 (aggregated price levels) is smaller but lossy. Downstream needs decide this.
- **Latency budget?** A market-making strategy wanting single-digit microseconds wire-to-strategy forces kernel bypass and spin loops. A research capture pipeline tolerating milliseconds can use the kernel stack and batch to disk.
- **Downstream consumers?** How many strategies, do they need the full book or top-of-book, conflated or every update?

State your assumptions ("ITCH, full L3, ~5 µs budget, 10 strategy threads") and move on.

## Step 2: The pipeline

### Packet capture

Exchanges publish redundant **A and B multicast feeds** — same messages, different network paths. Join both groups (kernel bypass via a userspace NIC stack if the budget demands it) and **arbitrate by sequence number**: take whichever copy of sequence $n$ arrives first, discard the duplicate. This is line arbitration — it halves effective loss probability and often shaves latency, since A/B race each other.

### Decoder

Binary wire format in, normalized structs out. The key phrase is **zero-copy**: don't memcpy the payload into an intermediate buffer — cast a view over the packet bytes (the message layouts are fixed-offset by design) and read fields in place. Only materialize the small normalized event you pass downstream. Branch on message type with a jump table; keep the hot path free of allocation.

### Sequencer and gap detection

Every message carries a sequence number; the sequencer enforces in-order delivery. On a gap (expected $n$, got $n+k$), you have two recovery paths:

1. **Retransmission request** for small gaps, if the venue offers a request channel (MoldUDP64 does).
2. **Snapshot recovery** for large gaps or startup. This is the part interviewers probe, so say the dance precisely:
   - Keep listening to the incremental feed and **buffer every delta** — do not drop them.
   - Request/receive the **snapshot**, which is stamped with the last sequence number it incorporates, say $S$.
   - Apply the snapshot to build the book state as of $S$.
   - **Replay buffered deltas with sequence > $S$** in order; discard buffered deltas with sequence ≤ $S$ (already baked into the snapshot).
   - Now you're live and consistent. If a gap opens in the buffered stream itself, restart the dance.

While gapped, mark the book **stale** so strategies stop quoting off it.

### Book builder

Per-symbol order books. For L3: a hash map from order ID → order (price, qty, side), plus per-side price levels. Price levels want cache-friendly access — a flat array indexed by price tick around the touch beats a red-black tree for the hot inner levels; most updates hit within a few ticks of the BBO. Book updates must be branch-light and allocation-free.

### Distribution

Publish normalized events to strategies over **SPSC (single-producer single-consumer) lock-free ring buffers** — one ring per consumer, **one writer per symbol shard** so no two threads ever write the same symbol's stream. Sequence-stamped slots let consumers detect overruns. SPSC beats MPMC here because the single-writer invariant removes CAS contention from the hot path.

## Step 3: Threading model — discuss the trade-off

Two canonical options:

- **Single-threaded spin loop**: one pinned core does capture → decode → book → publish. Zero cross-core handoffs, zero synchronization, best per-message latency. Ceiling: one core's throughput; a burst on one symbol delays every other symbol (head-of-line blocking).
- **Sharded by symbol hash**: hash symbol → shard, one pinned thread per shard, each running its own spin loop end-to-end. Scales with cores, isolates hot symbols. Costs: the fan-out point (which thread reads the NIC?), possible resequencing complexity if one venue stream carries many symbols, and hot-symbol imbalance if the hash puts two heavy names on one shard.

The strong answer: start single-threaded, measure, shard only when one core saturates — and shard *end-to-end* rather than pipelining stages across cores, because stage-pipelining adds a queue hop (and its latency) per stage.

## Step 4: Measurement hooks

Timestamp at three points: **NIC hardware timestamp** on arrival, **post-decode**, **post-publish**. Report **histograms, not averages** — p50 tells you nothing; p99.9 during the open is what kills you. Wire-to-publish latency at the 99.9th percentile under replayed peak load is the number to quote.

## Step 5: Volunteer the failure modes

- **Gap storms**: during volatility, loss spikes and naive per-gap snapshot requests melt the recovery channel. Coalesce gaps, rate-limit requests, fall back to one snapshot resync.
- **Exchange replays / dup sequences**: after venue failover, sequences can restart or replay. Handle "sequence went backwards" explicitly (reset epoch, resync) instead of asserting.
- **Slow consumers**: a strategy thread stalls and its ring fills. Choose **drop with overrun detection** (consumer notices, requests a book snapshot from the handler) over backpressure — one slow strategy must never stall market data for the rest.
- **Symbol fan-out hot spots**: one symbol (index future on CPI day) dominates traffic; hashing doesn't save you. Support pinning hot symbols to dedicated shards.

## What strong vs. weak sounds like

Weak: draws "network → parser → book → strategy," hand-waves recovery as "re-request the data," proposes locks around the book.

Strong: names a protocol, walks the snapshot+incremental replay with the $> S$ condition, arbitrates A/B by sequence, justifies SPSC over MPMC, quotes p99.9 not mean, and raises gap storms and slow consumers unprompted.

## Interview checkpoints

- Ask venue/protocol, L2 vs L3, latency budget, and consumers *before* designing — assumptions change the whole architecture.
- A/B feed arbitration: accept the first copy of each sequence number from either line; it cuts loss and latency.
- Snapshot recovery verbatim: buffer deltas → apply snapshot at seq $S$ → replay only buffered deltas with seq $> S$.
- Distribution is SPSC rings, one writer per symbol shard; slow consumers get drops + resync, never backpressure.
- Threading: single pinned spin loop first, shard by symbol hash when a core saturates; watch hot-symbol imbalance.
- Quote latency as histogram percentiles (p99/p99.9) at NIC/decode/publish points — never averages.
