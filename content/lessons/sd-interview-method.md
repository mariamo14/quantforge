---
title: How to Answer a System Design Question
minutes: 12
---

**Builds on:** Anatomy of a Trading System; Queues, Backpressure, and Idempotency

You now know the parts: machines, networks, queues, databases, and the feed-handler-to-gateway spine of a trading system. This module is about assembling them under pressure. A system design interview is 45 minutes with a whiteboard and an open-ended prompt — "design a market data pipeline" — and the difference between a pass and a fail is almost never knowledge. It's *process*. Strong candidates run the same five-step script every time. Learn it here; the next three lessons are worked examples of it.

## Step 1: Requirements — and the numbers

Never draw a box before you've asked questions. First the functional requirements: what does the system actually do, who consumes it, what's explicitly out of scope? Then — and this is where candidates separate — **the numbers**:

- How many users, consumers, or symbols?
- What message or request rate? Average *and* peak?
- What latency target — and measured where, at which percentile?
- What durability does the data need? Can we ever lose a message?

Asking these is graded. Interviewers deliberately leave the prompt underspecified to see whether you notice. Guessing silently is penalized twice: once for skipping the question, and again when your design is sized for the wrong problem. A good phrasing: "Before I design anything — what's the peak message rate, and what latency does the fastest consumer need?"

**Quant-specific twist #1:** in consumer web design, scale questions are about user counts. In quant interviews, *latency budgets replace user counts*. "How many users?" becomes "how many microseconds, end to end, and where is the clock?"

## Step 2: Capacity estimation — size the problem

Two minutes of arithmetic tells you what class of system you're building. Do it out loud, on the board:

$$1{,}000{,}000 \ \text{msgs/sec} \times 100 \ \text{B} = 100 \ \text{MB/s} \approx 0.8 \ \text{Gbps}$$

That fits comfortably in one machine's 10 Gbps NIC. Conclusion, stated aloud: "This is not a horizontal-scaling problem — one well-built box can carry the whole feed. The hard parts will be latency and correctness." That single sentence reframes the entire interview, and it took thirty seconds of multiplication. Conversely, if the math had said 40 Gbps, you'd know you need sharding before you drew anything.

The rubric point here isn't precision — it's that your design decisions *follow from* numbers rather than fashion.

## Step 3: High-level design — boxes and arrows, narrated in order

Now draw. The trap is drawing boxes in the order you think of them. Instead, narrate along the data's path:

1. **Data in** — where do bytes enter the system?
2. **Processing** — what transforms or decisions happen?
3. **Data out** — who consumes results, and how are they delivered?
4. **Storage** — what gets persisted, and with what durability?

This order keeps you coherent and gives the interviewer natural places to interject. Keep the first pass shallow — five to eight boxes, no internals. Say explicitly: "That's the skeleton. Where would you like me to go deep?"

## Step 4: Deep dives — let the interviewer steer

You'll go deep on roughly **two components**. Let the interviewer pick, or offer a menu: "I could go into the fan-out mechanism or the recovery path — preference?" Depth on demand is a rubric line; depth nobody asked for is filibustering.

Inside a deep dive, state every trade-off in the canonical form: **"X buys us A at the cost of B."** "Shared memory buys us sub-microsecond fan-out at the cost of requiring co-located consumers." "Synchronous persistence buys us zero-loss recovery at the cost of ~10µs per order." This phrasing proves you understand that design is choosing costs, not avoiding them.

## Step 5: The failure walk — kill each box aloud

Before time runs out, point at each box and murder it: "The feed handler dies — what happens? The queue fills — what happens? The network partitions — what happens?" For each, name the detection mechanism, the recovery path, and what's lost or degraded during recovery.

**Quant-specific twist #2:** in web systems, availability usually wins — a stale page is fine. In trading, *correctness of money beats availability of pages*. It is almost always better to stop trading than to trade on wrong state. Say this.

**Quant-specific twist #3:** the killer follow-up in every quant design interview is **"what happens to in-flight orders?"** An order sent but not yet acknowledged when a component dies is neither definitely at the exchange nor definitely not. If your design has an answer ready (reconcile, don't guess — we'll build one in the order gateway case study), you're in the top decile.

## Timing a 45-minute round

| Phase | Minutes |
|---|---|
| Requirements & numbers | 5 |
| Capacity estimation | 5 |
| High-level design | 10 |
| Deep dives (×2) | 20 |
| Failure walk & wrap-up | 5 |

If you're still drawing boxes at minute 25, you've spent your deep-dive time — and deep dives carry the most rubric weight.

## The rubric interviewers actually use

Most firms grade on five axes: **structure** (did you run a coherent process?), **numbers** (did you ask for them and use them?), **trade-offs** (stated explicitly, both directions?), **depth on demand** (could you go two levels down when pushed?), and **communication** (could a teammate follow your board?). Notice what's absent: "got the same design the interviewer had in mind." There is no answer key. The script *is* the answer.

## Anti-patterns

- **Jumping to boxes before requirements.** The most common fail. It reads as "this person will build the wrong thing fast."
- **Buzzword salad.** "We'll use Kafka with Kubernetes and a Redis cache" — with no numbers attached — signals pattern-matching, not engineering. Name a technology only after the requirement that demands it.
- **Ignoring the numbers you asked for.** Asking "what's the peak rate?", hearing "5 million/sec," then drawing a single Python process. Worse than not asking.
- **Trade-off-free confidence.** Every "obviously we'd just..." costs you a rubric point. Nothing is free; say what each choice costs.

## Interview checkpoints

- Can you recite the five steps and the 5/5/10/20/5 timing without notes?
- Given "1M msgs/sec at 100 bytes each," can you produce Gbps in under 30 seconds and state what it implies?
- Can you state three trade-offs from earlier lessons in "X buys us A at the cost of B" form?
- What are the three quant-specific twists, and why does "what happens to in-flight orders?" have no safe lazy answer?
- Name the four anti-patterns and which rubric axis each one bleeds points from.
