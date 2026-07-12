---
title: "Monitoring a Trading System"
minutes: 12
---

**Builds on:** *Anatomy of a Trading System*, *Reliability: Designing for Failure*

Observability for a trading system boils down to answering three questions in real time: **are we making money, are we safe, are we fast?** Everything in this lesson is one of those three questions wearing a different hat. The interview version — "how would you know your system is broken?" — is asked constantly, and a vague answer ("uh, we'd have alerts") is a red flag. This lesson is the concrete answer.

## Latency: histograms, not averages

The single most common monitoring sin is reporting average latency. Averages hide disasters. Worked example: suppose in one second your system handles 1,000 messages — 999 of them in 10 µs and one in 10 ms (10,000 µs). The average is

$$\frac{999 \times 10 + 10{,}000}{1{,}000} \approx 20\ \mu s$$

Twenty microseconds. Looks great. Meanwhile one order sat for ten milliseconds — an eternity during which the market moved and you got picked off. The **p99.9** of that distribution is 10 ms, and it tells the truth the average buried. Trading latency distributions are heavy-tailed (GC pauses, page faults, queue buildups), and the tail is where the money is lost, so you track **p50 / p99 / p99.9** from real histograms (HDR-style bucketed counters are the standard tool).

One trap inside the trap: **never average percentiles across shards.** The mean of ten servers' p99s is not the fleet's p99 — percentiles don't compose that way. Merge the histograms first, then compute the percentile.

## Counters: the flow of orders

Latency says how fast; counters say whether the machine is flowing at all. The core set:

| Counter | Derived red flag |
|---|---|
| Orders sent / acked | Ack rate dropping → exchange session sick or gateway wedged |
| Orders rejected | Reject spike → bad symbology, risk-limit trips, or a runaway strategy |
| Market-data messages, gap count | Gaps → your book may be wrong; everything downstream is suspect |
| Fills received | Fills without matching sent orders → session/state corruption |

The pattern: raw counters are cheap to maintain (an atomic increment), and the *ratios and rates* derived from them are the actual signals. "Sent 500 orders, acked 460" is a five-alarm fire even if every individual ack was fast.

## Business metrics are monitoring too

A system can be fast, flowing, and still hemorrhaging money. Business metrics belong on the same dashboards with the same alerting:

- **Position vs limits** — per symbol, per strategy, aggregate. The risk system *is* a monitoring system; it just has permission to act.
- **P&L drift vs expected** — realized P&L diverging from the model's expectation is often the earliest sign of a bug (stale data, sign error, bad fill handling) before any system metric complains.
- **Fill ratio** — fills per order sent. A collapsing fill ratio means you're quoting off-market or too slow; an anomalously *high* one can mean you're the one getting adversely selected.

If your monitoring story in an interview covers CPU and latency but never mentions position or P&L, you've described a web service, not a trading system.

## Alerting discipline

Alerts are for humans, and humans are the scarcest resource in the loop.

- **Alert on symptoms, not causes.** Page on "no acks for 5 seconds" or "gap count rising," not on "CPU at 80%." High CPU with normal latency and flow is trivia; the symptom-level alert catches every cause, including the ones you didn't predict.
- **Page only on actionable things.** If the runbook entry for an alert is "usually fine, ignore," delete the alert or demote it to a dashboard.
- **Alert fatigue kills.** A pager that cries wolf trains people to ack-and-ignore, and then the one real page — the strategy that's leaking money at 3:47 pm — gets the same reflexive dismissal. Every noisy alert you tolerate actively erodes the value of every real one. Ruthlessly pruning alerts is not laziness; it's what keeps the channel trustworthy.

## Logging on the hot path

You cannot `printf` on the hot path — formatting and syscalls cost microseconds and, worse, unpredictable ones. The standard pattern: the hot thread writes small **binary records into a lock-free ring buffer** (a few nanoseconds: timestamp, event id, raw values), and a background thread drains the ring, formats, and writes to disk off the critical path. This is the same single-producer/single-consumer ring-buffer machinery you've built elsewhere in this course, pointed at a new problem. Corollary: if the drain thread falls behind, you drop or overwrite log records — decide *which* deliberately, and count the drops (a counter you also monitor).

## Dashboards, alerts, and post-trade analysis

Three tools, three time horizons. **Alerts** interrupt a human *now* for things that can't wait. **Dashboards** support the human who is already looking — the trader glancing between fills, the on-call engineer triaging a page. **Post-trade analysis** runs after the close with no latency budget: full-fidelity replay, slippage attribution, latency regression across days. A common design error is cramming post-trade questions into real-time dashboards (expensive, cluttered) or leaving real-time questions to post-trade (you find out tomorrow that you lost money today).

## Deploy day: canary with size

The final practice that ties it together: never deploy a strategy change at full size. **Canary it** — run the new build on one instance, one symbol, or tiny size, and watch *exactly the same metrics*: latency percentiles, ack/reject rates, fill ratio, P&L vs expected. If the metrics are your definition of healthy, the canary is a controlled experiment against that definition. No new dashboards needed on deploy day is itself a sign your monitoring was right all along.

## Interview checkpoints

- Reproduce the worked example: 999 messages at 10 µs plus 1 at 10 ms gives a ~20 µs average but a 10 ms p99.9 — and explain why the tail matters in trading.
- Know why you can't average percentiles across shards, and what to do instead (merge histograms, then compute).
- Name the counter-derived red flags: ack rate dropping, reject spikes, market-data gaps — and what each implies.
- Insist that business metrics (position vs limits, P&L drift, fill ratio) are first-class monitoring, not a separate concern.
- Explain hot-path logging: binary records into a ring buffer, drained and formatted off-thread, with drops counted.
