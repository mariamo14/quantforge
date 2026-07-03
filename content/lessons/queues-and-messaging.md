---
title: Queues & Messaging
minutes: 11
---

**Builds on:** *Clients, Servers & TCP/UDP*, *Scaling: More Machine or More Machines*.

When program A calls program B directly — a function call, an HTTP request — A can only go as fast as B answers. Their speeds are **coupled**. If B slows down, A slows down. If B crashes mid-call, A's work is just... gone. For two services that naturally run at different speeds (a feed spitting out 100,000 messages a second, a database writing 5,000 a second), direct calls are a straitjacket.

## The mailbox

A **queue** decouples them. Think of a mailbox: the mail carrier (the **producer**) drops letters in and walks away — no need to wait for you to be home. You (the **consumer**) collect letters whenever you're ready. The mailbox itself is a **buffer**: a holding area, first-in-first-out.

```
producer ──▶ [ msg | msg | msg ] ──▶ consumer
                   (queue)
```

Producer and consumer now run at their own pace, connected only by the buffer between them.

## What a queue buys you — and what it costs

The buys:

- **Absorb bursts.** Markets are bursty — a news headline can produce a 50× message spike for two seconds. The queue soaks up the spike; the consumer drains it afterward.
- **Smooth load.** The consumer processes at a steady rate even when input is chaotic.
- **Survive crashes.** If the queue is durable (written to disk), a crashed consumer can restart and resume where it left off. Messages wait patiently.

The price:

- **Added latency.** Every message now sits in a buffer before being handled. Even an empty queue adds a hop.
- **Staleness.** If the queue backs up, the consumer is processing the *past*. A signal computed from a quote that's 500 ms old may be worse than no signal.

## Backpressure: the question every design must answer

Buffers are finite. RAM runs out. So every queued design must answer one blunt question: **when the queue fills, what happens?** There are only three options: **block** the producer (slow everything upstream), **drop** messages (lose data), or **crash** (lose everything). Anyone who hasn't chosen has chosen "crash" by default.

The right answer depends on the data — and trading gives you both extremes:

- **Market data:** drop. Old quotes are worthless once newer ones exist — you want the *current* state of the world. Standard pattern: **drop-oldest**, then **request a snapshot** from the source to resynchronize your view. Losing intermediate updates is fine if you can rebuild the current picture.
- **Orders:** NEVER drop. A dropped order (or worse, a dropped cancel) is real money and a compliance incident. Correct behavior: block the producer and **fire an alarm** so a human knows the system is saturated.

Same mechanism, opposite policies. Interviewers love this contrast.

## Pub/sub vs point-to-point

**Point-to-point:** each message is consumed by exactly one consumer. Right for work distribution — ten workers pulling jobs off one queue.

**Publish/subscribe (pub/sub):** one event, many independent subscribers, each getting their own copy. A trade print is a natural pub/sub event: the strategy engine, the P&L tracker, and the tick recorder all want it, none should steal it from the others.

## Delivery guarantees, in plain words

When networks and processes can fail mid-handoff, how many times does a message arrive?

| Guarantee | Meaning | Failure mode |
|---|---|---|
| At-most-once | Send and forget | Messages can vanish |
| At-least-once | Retry until acknowledged | Messages can duplicate |
| Exactly-once | Each message once, always | The myth |

**Exactly-once is (mostly) a myth** across unreliable networks: if the acknowledgment is lost, the sender can't tell "delivered" from "lost" and must either retry (risking a duplicate) or not (risking a loss). The practical answer is **at-least-once plus idempotency**. An operation is **idempotent** if doing it twice has the same effect as doing it once. Example: tag each order with a unique client order ID; if the gateway sees ID `ord-4217` twice, it submits once and ignores the repeat. Now duplicates are harmless, and at-least-once *behaves like* exactly-once.

## You've already built one

If you did the ring buffer problem in the C++ track — surprise, that **is** a queue: a fixed-size, in-memory, single-producer single-consumer queue, the fastest kind there is. The spectrum in real systems:

- **In-memory rings** between stages on the same machine: nanoseconds of latency, but contents die with the process.
- **Kafka-style durable logs** between systems: every message persisted and replayable (great for audit and recovery), at the cost of milliseconds.

Durability vs nanoseconds — choose per link, not per system.

## Interview checkpoints

- Explain how a queue decouples producer and consumer speeds (mailbox analogy).
- Name what a queue buys (bursts, smoothing, crash recovery) and its price (latency, staleness).
- Answer the backpressure question for market data (drop-oldest + snapshot) vs orders (block + alarm).
- Explain why exactly-once is a myth and how idempotency (client order IDs) fixes it in practice.
- Contrast in-memory rings vs durable Kafka-style logs and when each fits.
