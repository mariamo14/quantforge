---
title: Reliability: Designing for Failure
minutes: 11
---

**Builds on:** *Queues & Messaging*, *Scaling: More Machine or More Machines*.

Here is the mindset shift that separates junior designs from senior ones: **everything fails, all the time**. Disks die (a big data center loses several per day). Networks drop packets and sometimes whole links. Processes crash — yours, and the exchange's. None of this is exceptional; at scale it's Tuesday. Reliability engineering isn't about preventing failure. It's about designing so failure is *boring*.

## Measuring reliability: counting nines

**Availability** is the fraction of time a system is up, usually written in "nines":

| Availability | Nickname | Downtime per year |
|---|---|---|
| 99% | two nines | ~3.7 days |
| 99.9% | three nines | ~8.7 hours |
| 99.99% | four nines | ~52 minutes |
| 99.999% | five nines | ~5 minutes |

Each nine costs roughly 10× the engineering effort of the last. For a trading system, the math is sharper: markets are open ~6.5 hours a day, so "8.7 hours of downtime a year" landing during market hours could be an entire trading day gone.

## Redundancy: no single point of failure

The first tool is **redundancy**: two of everything that matters, so no single component's death takes you down. The quant example you'll meet again and again: **A/B market-data feeds**. Exchanges broadcast the same data on two independent feeds (different networks, different hardware). Feed handlers listen to both and use whichever packet arrives first — so one lost packet, or one dead feed, costs you nothing. When an interviewer asks "what if that component dies?", your reflex should be: where's the second one?

## Timeouts, retries, circuit breakers

Three small tools, endlessly examined in interviews:

**Timeouts.** Never wait forever. A call with no timeout turns a slow dependency into your own hang. Every network call gets a deadline, chosen from real latency numbers — if a service normally answers in 2 ms, waiting 30 seconds is not patience, it's denial.

**Retries.** If a call fails, try again — many failures are transient. But retries carry a trap you already have the vocabulary for: **retrying a non-idempotent operation duplicates it**. Send an order, the ack gets lost, you retry... and you may have just bought twice. This is why order systems lean on idempotency — unique client order IDs let the gateway recognize and discard the duplicate. Never say "retry" in an interview without saying "idempotent" in the same breath.

**Circuit breakers.** If a service is sick, a thousand clients retrying against it is a mob kicking a collapsed runner. A circuit breaker watches the failure rate and, past a threshold, *stops calling entirely* for a cooldown period — failing fast locally and giving the sick service room to recover. Named after the electrical panel in your house, and it works the same way.

## Failover: the standby and the state problem

When a primary machine dies, a **failover** promotes a replacement. Two flavors:

- **Hot standby:** a second copy runs continuously, ready to take over in milliseconds to seconds.
- **Cold restart:** spin up a fresh instance from scratch — minutes, maybe more.

The hard part isn't the swap; it's **state**. The standby must know *where the primary left off*: which orders are live, what positions are held, what sequence number was last processed. A standby with stale state is worse than none — it might re-send orders that were already filled. The standard answer is a **replicated event log**: the primary writes every state-changing event to a log that the standby consumes in real time, staying seconds — ideally milliseconds — behind. On failover, the standby replays to the end of the log and continues. (Notice: this is the durable queue from the last lesson, wearing a different hat.)

## The trading-specific stakes

In most industries an outage costs reputation. In trading, **a stuck order gateway is measured in dollars per second**: live orders you can no longer cancel are exposed to a moving market, and every second of paralysis is quantifiable P&L risk. The industry's answers are blunt and mandatory:

- **Kill switch:** one action that cancels all open orders and halts new ones. Every serious desk has one; regulators expect it.
- **Cancel-on-disconnect:** you ask the exchange, in advance, to cancel all your orders automatically if your connection drops. The exchange becomes your dead-man's switch.

Failure handling here isn't an ops nicety — it's a risk control with a dollar sign on it.

## Graceful degradation

Finally: when a system is overloaded, it shouldn't fail all-or-nothing. **Graceful degradation** means shedding the least important work first. In a trading system the priority order is unambiguous: **shed analytics before shedding order flow**. Dashboards can go stale; research queries can wait; the ability to manage live orders is the last thing standing. Stating that priority explicitly is exactly what interviewers listen for.

## Interview checkpoints

- Convert 99.9% and 99.99% availability into downtime per year from memory.
- Give an example of redundancy in market data (A/B feeds) and explain the "which packet arrives first" trick.
- Explain why a retry can double-trade and how idempotent order IDs prevent it.
- Describe hot standby vs cold restart and why the standby needs a replicated event log.
- Name the kill switch and cancel-on-disconnect, and which work to shed first under overload.
