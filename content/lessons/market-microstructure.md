---
title: Market Microstructure Fundamentals
minutes: 14
---

# Market Microstructure Fundamentals

Microstructure is the study of how trading actually happens — who trades, through what mechanisms, and why prices move the way they do at short horizons. Quant dev interviews use it to check that you understand the *business* your code serves. You don't need a PhD's depth; you need crisp definitions and one good concrete scenario per concept.

## Participants

- **Market makers** quote both a bid and an ask, hoping to earn the spread repeatedly while holding minimal inventory. Citadel Securities, Jane Street, Optiver, Virtu live here.
- **Takers** (aggressors) cross the spread with marketable orders because they value immediacy — arbitrageurs, momentum traders, anyone whose signal decays fast.
- **Institutional flow**: pensions and asset managers moving positions that are enormous relative to displayed liquidity (millions of shares vs. a few hundred at the touch). They don't care about the spread on one fill; they care about total **implementation cost** across a multi-hour execution.

## Limit vs market orders

A **limit order** says "buy up to 300 shares at \$50.10 or better" — it rests in the book if not immediately matchable, supplying liquidity, earning price improvement but risking non-execution. A **market order** says "buy 300 shares now at whatever the book offers" — guaranteed execution (up to available depth), unknown price. The fundamental tension every execution algorithm manages: **price certainty vs execution certainty**.

## What the spread compensates

The bid-ask spread is the market maker's gross revenue per round trip. It must cover three costs — interviewers often want all three named:

1. **Adverse selection**: some counterparties know something. When they trade with you, you lose on average (concrete scenario below).
2. **Inventory risk**: after buying at the bid you're long; the price can move against you before you unload. Wider spreads in volatile names compensate for this exposure, and makers **skew** quotes (lower both bid and ask when long) to shed inventory.
3. **Processing/fixed costs**: technology, colocation, exchange fees, capital, clearing.

In a liquid large-cap, adverse selection dominates the economics.

## Adverse selection: a concrete scenario

You're making markets in a mid-cap biotech, quoting \$20.00 × \$20.02, 500 up. A hedge fund's NLP pipeline parses an FDA press release 300 µs before your feed handler flags it: trial failed. They hit your \$20.00 bid for 500 shares. Two seconds later the stock trades \$18.50. You "earned" a two-cent spread and lost \$750 on inventory — you were **adversely selected**: filled precisely *because* your quote was stale. This is why makers pay for speed (fast cancels are defense, not offense), why spreads widen around scheduled news, and why toxic-flow detection is a real quant problem (see the imbalance discussion in the LOB lesson).

## Price-time priority

The standard continuous-market matching rule: better prices fill first; among orders at the same price, earlier arrivals fill first (FIFO). Consequences: queue position at a price level is valuable (worth roughly the spread times fill probability differential), being first to a new price level matters, and shaving latency literally buys you queue priority. Some markets (CME eurodollar options legacy, others) use **pro-rata** allocation instead — split by size — which changes optimal quoting entirely (oversizing gets you allocation).

## Maker-taker fees and tick sizes

Most US equity venues charge takers ~\$0.0030/share and rebate makers ~\$0.0020–0.0025. This changes the *effective* economics: capture a 1-cent spread and the rebate adds ~half a cent to the round trip. Inverted venues (taker rebate, maker fee) exist and attract distinct flow — routing logic must be fee-aware.

The **tick size** — minimum price increment, \$0.01 for US stocks above \$1 — sets spread economics. A "tick-constrained" stock (fair spread < 1 tick) has spreads pinned at the minimum and enormous queues at the touch: the game becomes queue position. A wide-tick or high-priced stock has multi-tick spreads and the game becomes price discovery within the spread.

## Auctions vs continuous trading

The open (9:30) and close (16:00) are **call auctions**: orders accumulate, the exchange computes the single price maximizing matched volume, everything crosses at that price. The close is the day's biggest liquidity event — index funds must trade at the closing price, so ~10%+ of daily volume prints there. Quant devs care because auctions have their own message types, imbalance feeds (NYSE/Nasdaq publish auction imbalance data pre-close), and strategies dedicated to them. Continuous trading between the auctions is the price-time-priority world above.

## Quoted vs effective spread

- **Quoted spread**: ask minus bid at a moment, e.g., \$50.10 − $50.08 = 2¢.
- **Effective spread**: $2 \times |P_{\text{exec}} - m|$ where $m\$ is the midpoint at order arrival. It measures what you actually paid: price improvement inside the spread shrinks it; walking the book past the touch grows it.

Effective < quoted on average means the market delivers price improvement; execution-quality reports (SEC Rule 605) are built on this statistic.

## Market impact and order slicing

An institution buying 500,000 shares of a name trading 2M/day can't send a market order — it would blow through the book and signal its intent (impact has a **temporary** component that decays and a **permanent** one that doesn't; empirically total impact scales roughly with the square root of participation). So parent orders are sliced into child orders:

- **TWAP**: equal slices over time — simple, predictable, gameable if detected.
- **VWAP**: slices proportional to the historical intraday volume curve (U-shaped: heavy at open/close), benchmarked against the day's volume-weighted average price.
- Beyond these: implementation-shortfall algos, liquidity-seeking algos, dark-pool pinging. Quant devs build the schedulers, the child-order placement logic, and the fill/venue analytics behind all of them.

## Fragmentation and the NBBO

One-liner to have ready: US equities trade on 16+ exchanges plus ~30 dark venues; the **NBBO** (National Best Bid and Offer) is the consolidated best bid and best ask across all exchanges, brokers must route to it or match it (Reg NMS order protection), and the SIP that consolidates it is slower than direct feeds — which is why every serious firm builds its own consolidated book from direct feeds.

## Interview checkpoints

- Name the three spread components — adverse selection, inventory risk, processing costs — and know that adverse selection dominates in liquid names.
- Tell an adverse-selection story with numbers: filled *because* you were stale, spread earned ≪ inventory loss; fast cancels are defense.
- Limit vs market = execution certainty vs price certainty; price-time priority makes queue position an asset you can value.
- Effective spread $= 2|P_{\text{exec}} - m|$; know why it can differ from quoted in both directions.
- Impact scales ~√participation and splits into temporary + permanent; VWAP follows the U-shaped volume curve, TWAP is uniform.
- One-liners ready: maker-taker rebates, tick-constrained stocks → queue games, close auction ≈ 10% of volume, NBBO/SIP vs direct feeds.
