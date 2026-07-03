---
title: Latency Numbers Every Developer Should Know
minutes: 10
---

Every experienced systems engineer carries a small table of numbers in their head: how long each basic operation takes. With it, you can judge a design in thirty seconds — before writing any code. This lesson gives you that table, in units a human can actually feel.

## The ladder, in human time

Raw latencies are hard to feel — what does 100 nanoseconds *mean*? So let's rescale: pretend **1 nanosecond = 1 second**. One CPU operation becomes one heartbeat, and everything else stretches accordingly. (A nanosecond is a billionth of a second; a microsecond (µs) is 1,000 ns; a millisecond (ms) is 1,000,000 ns.)

| Operation | Real time | Human scale (1 ns = 1 s) |
|---|---|---|
| One CPU operation | ~1 ns | 1 second |
| L1 cache read (fast on-chip memory) | ~1 ns | ~1 second |
| RAM read | ~100 ns | ~1.7 minutes |
| SSD random read | ~100–250 µs | ~1–3 days |
| Round trip inside a datacenter | ~500 µs | ~6 days — nearly a week |
| New York → London round trip (fiber) | ~70 ms | **~2.2 years** |

Check the math yourself: RAM at 100 ns → 100 seconds ≈ 1.7 minutes. An SSD read at 100 µs is 100,000 ns → 100,000 seconds ≈ 28 hours; slower SSD reads around 250 µs stretch to nearly 3 days. A datacenter round trip at 500 µs → 500,000 seconds ≈ 5.8 days. And 70 ms is 70,000,000 ns → 70 million seconds ≈ **810 days**.

Sit with that last row. If a CPU instruction is one second, asking a server in London for something is like mailing a letter and waiting *two years* for the reply. This is why "just make a network call" is never a neutral decision.

## The speed of light is a hard floor

Some of these numbers can never improve, because information cannot travel faster than light. In fiber-optic cable, light travels at roughly two-thirds of its vacuum speed — about 200,000 km/s, i.e. **~5 µs per kilometer**.

New York to Chicago is ~1,150 km in a straight line: 1,150 × 5 µs ≈ 5.75 ms one way in fiber — and real fiber routes bend around terrain, so in practice it's more like 6.5 ms. That's why firms built chains of **microwave towers** between the two cities: microwaves travel through air at nearly full vacuum light speed (~3.3 µs/km instead of 5), and towers can follow an almost perfectly straight line. Result: roughly **4 ms one way instead of ~6.5 ms**. Firms spent hundreds of millions of dollars to save about 2.5 milliseconds — because whoever sees a price change in Chicago first gets to act on it in New York first.

## The discipline: budget before you design

Here is the habit this table exists to build: **before designing anything, write down your time budget and count how many of each operation you can afford.** Two worked examples:

**How many messages fit through a 10 Gbps network link?** 10 gigabits/second = 10 × 10⁹ bits ÷ 8 = 1.25 × 10⁹ bytes per second. If each message is 100 bytes: 1.25 × 10⁹ ÷ 100 = **~12.5 million messages per second**. So a busy market data feed of a few million messages/sec fits comfortably — but only if your software can also *process* them that fast.

**How many RAM lookups fit in a 1 µs budget?** 1 µs = 1,000 ns. At ~100 ns per uncached RAM read: 1,000 ÷ 100 = **~10 lookups**. Ten. If your trading decision must complete in a microsecond, you get about ten trips to memory — no hash-map chains, no pointer-chasing through scattered objects, and certainly no disk or network. This single estimate explains most of the exotic-looking data structure choices in high-frequency trading code.

## Why quant firms obsess

Market prices change in **microseconds**. When new information hits, the profit goes to whoever reacts first; everyone slower trades at a stale price. Now reread the table: one SSD read costs ~100 µs — an eternity in which the market has moved hundreds of times. One trip to a database in another datacenter costs ~500 µs. A design that touches disk or crosses a datacenter *in the middle of a trading decision* hasn't merely added latency — it has lost the race before starting it. That's why the previous lesson's rule exists (everything in RAM on the hot path), and why interviewers will probe whether you instinctively count these costs.

Memorize the table. Not to recite it — to *feel* it. When someone proposes a design, you should hear "two years" every time a transatlantic call sneaks onto the critical path.

## Interview checkpoints

- Can you recite the ladder in rough numbers: cache ~1 ns, RAM ~100 ns, SSD ~100 µs, datacenter round trip ~500 µs, transatlantic ~70 ms?
- Can you explain why the speed of light sets a floor on latency, and why microwave beats fiber between cities?
- Given a link speed and message size, can you estimate messages per second (e.g. 100-byte messages on 10 Gbps → ~12.5 million/sec)?
- Given a latency budget, can you count affordable operations (e.g. ~10 RAM lookups in 1 µs)?
- Can you explain in one sentence why touching disk mid-decision disqualifies a trading system design?
