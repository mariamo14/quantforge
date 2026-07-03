---
title: Scaling: More Machine or More Machines
minutes: 11
---

**Builds on:** *How Programs Actually Run*, *Latency Numbers*.

So far, everything you've built lives on one machine. That works until it doesn't — and it stops working for one of two reasons. Either the machine runs out of capacity (CPU, RAM, disk, network), or the machine itself becomes the risk: if that one box dies, your whole system dies with it. Engineers call this a **single point of failure (SPOF)**. Scaling is the art of dealing with both problems.

## Two ways to scale

**Vertical scaling** (scaling *up*) means buying a bigger box: more cores, more RAM, faster NICs. It's beautifully simple — your code doesn't change, there's no coordination between machines, and everything stays in one memory space where a lookup costs nanoseconds instead of a network hop costing microseconds or milliseconds. The catch: there's a ceiling. At some point no bigger machine exists, and each step up costs disproportionately more.

**Horizontal scaling** (scaling *out*) means adding more boxes. There's effectively no ceiling — need double the capacity, rent double the machines. The price is **coordination pain**: machines must talk over a network, agree on who does what, and handle each other failing. Every distributed-systems headache you'll ever meet starts here.

Here's the twist most system-design courses won't tell you: **trading systems often prefer vertical scaling on the latency-critical path.** A single beefy machine with everything in RAM avoids network hops entirely. When your budget is microseconds, "just add another server" makes things *slower*, not faster. Keep this in your back pocket for interviews — it shows you understand that scaling out is a tool, not a religion.

## Load balancing: the restaurant host

Once you have several identical servers, someone must decide which request goes where. That's a **load balancer** — think of the host at a restaurant seating arriving guests across tables.

Two common strategies:

| Strategy | How it works | Weakness |
|---|---|---|
| Round-robin | Server 1, then 2, then 3, repeat | Ignores that some requests are heavier than others |
| Least-loaded | Send to whichever server is busiest the least | Needs live load info, slightly more complex |

Round-robin is the host seating parties in rotation regardless of table size; least-loaded is the host who actually checks which waiter is drowning.

## Replication: copies for reads and for safety

**Replication** means keeping copies of the same data on multiple machines. It buys you two things:

1. **Read scaling** — many clients can read from many replicas at once.
2. **Safety** — if one copy burns down, the data survives.

The usual arrangement is **primary/replica**: one primary accepts writes; replicas copy those writes and serve reads. One honest caveat you must always mention: **replication lag**. The replica is a follower, and copying takes time — milliseconds usually, sometimes seconds under load. So a read from a replica can be slightly stale. If you just wrote your position and immediately read it back from a replica, you might see the old value. Any design that replicates must decide whether stale reads are acceptable, and for how long.

## Partitioning: splitting the data itself

Replication copies *all* the data everywhere. **Partitioning** (also called **sharding**) splits data so each machine owns only a slice, chosen by a **partition key**.

In trading there's a gloriously natural key: **the symbol**. AAPL lives on shard 1, MSFT on shard 2, and so on. Every message about a symbol — quotes, trades, your own orders — routes to that symbol's shard, so each shard sees a consistent, ordered view of its own little world with no cross-machine chatter.

But sharding has a classic failure mode: the **hot shard**. Keys aren't equally popular. On a wild market day, everyone trades SPY, and the shard holding SPY melts while the shard holding sleepy small-caps idles. Mitigations exist (give hot symbols dedicated shards, split further), but the honest answer is: know your key distribution.

## Stateless vs stateful

A **stateless** service remembers nothing between requests — every answer depends only on the request itself (think: a service that computes an option price from inputs). Stateless services scale trivially: clone them, put a load balancer in front, done. Any copy can serve any request.

A **stateful** service holds data that requests depend on — an order book, a position tracker, a database. Now which machine you talk to *matters*, and that's exactly where replication and sharding earn their keep. Rule of thumb: **push state into as few places as possible, and keep everything around it stateless.**

## The quant twist

Put it all together and you get the standard shape of a trading platform:

- **Latency-critical paths** (market data → decision → order): shard by symbol, then scale each shard **up** — one fast machine per slice of the market, everything in memory.
- **Analytics, research, reporting**: scale **out** — hundreds of cheap machines chewing through historical data overnight, where nobody cares about an extra millisecond.

Same firm, both strategies, chosen deliberately.

## Interview checkpoints

- Explain vertical vs horizontal scaling and one real reason a trading hot path prefers vertical.
- Describe round-robin vs least-loaded load balancing with the restaurant-host analogy.
- State what replication lag is and why a replica read can be stale.
- Explain sharding by symbol and the hot-shard problem (everyone trades SPY).
- Say why stateless services scale trivially and stateful ones don't.
