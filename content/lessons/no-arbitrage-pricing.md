---
title: No-Arbitrage & Put-Call Parity
minutes: 11
---

**Builds on:** forwards and futures, options basics, time value of money.

## The law of one price

Here is the single most important sentence in derivatives pricing:

> Two positions with **identical payoffs in every future scenario** must cost the same today.

Why must they? Suppose position A and position B pay exactly the same amount in every possible state of the world, yet A costs 98 and B costs 100. Then anyone can buy A, sell B, and pocket \$2 today. At expiry the payoffs cancel perfectly — whatever A pays you, you owe on B — so the \$2 is kept **risk-free**, in every scenario, from zero net risk. That is an **arbitrage**: a strategy with zero net cost (or better) today, no possibility of loss, and a positive probability (here, certainty) of profit. Real markets are full of people hunting for exactly this, and their buying of A and selling of B pushes the two prices together. "No-arbitrage" pricing means: assume the free lunches are gone, and see what prices *must* be.

You already used this once. The forward price $F = S_0(1+r)^T$ came from cash-and-carry: two ways of guaranteeing delivery of the asset, hence one price.

## Replication: the master move

The law of one price becomes a *pricing machine* through **replication**: to price something hard, build the same payoff out of things whose prices you already know. Then the hard thing's price is just the sum of the parts. No forecasting, no opinion about where the market is going. We now use this to derive the most famous model-free result about options.

## Put–call parity, slowly

Setup: a stock at price $S_0$ today; a **call** and a **put** on it, same strike $K$, same expiry $T$; risk-free rate $r$. All European-style (exercisable only at expiry — assume that throughout). Compare two portfolios formed *today*:

- **Portfolio A:** one call + cash of $\dfrac{K}{(1+r)^T}$ invested at the risk-free rate.
- **Portfolio B:** one put + one share of the stock.

The cash amount in A is exactly the present value of $K$ — by time value of money, it grows to precisely $K$ at expiry. (In continuous-compounding notation, which you'll meet later, the same amount is written $Ke^{-rT}$; the logic is unchanged.)

Now check every possible future. At expiry there are only two cases:

| At expiry | Case $S_T > K$ | Case $S_T \le K$ |
|---|---:|---:|
| **A:** call | $S_T - K$ | \$0$ |
| **A:** cash | $K$ | $K$ |
| **A total** | $S_T$ | $K$ |
| **B:** put | $0$ | $K - S_T$ |
| **B:** stock | $S_T$ | $S_T$ |
| **B total** | $S_T$ | $K\$ |

Walk through it. If the stock ends high ($S_T > K$): the call pays $S_T - K$, add the matured cash $K$, total $S_T$. Meanwhile the put expires worthless and the stock is worth $S_T$. Identical. If the stock ends low ($S_T \le K$): the call dies worthless, leaving just the cash $K$; the put pays $K - S_T$, which tops the stock up from $S_T$ to exactly $K$. Identical again.

Both portfolios are worth $\max(S_T, K)$ in **every** scenario. By the law of one price, they must cost the same today:

$$C + \frac{K}{(1+r)^T} = P + S_0$$

where $C$ and $P$ are today's call and put prices. Rearranged into its most-quoted form:

$$C - P = S_0 - \frac{K}{(1+r)^T}$$

This is **put–call parity**.

## A numeric check

Stock at $S_0 = 100$, strike $K = 100$, $T = 1$ year, $r = 5\%$. The present value of the strike is \$100 / 1.05 = 95.24\$. Parity says

$$C - P = 100 - 95.24 = 4.76.$$

So if the one-year at-the-money call trades at $C = 10$, the put *must* trade at $P = 10 - 4.76 = 5.24$. Suppose instead someone offers the put at 7 — too expensive by 1.76. Then sell the put and the stock, buy the call and the bond (portfolio A costs \$10 + 95.24 = 105.24\$; selling B brings in \$7 + 100 = 107\$): pocket \$1.76 today, and at expiry the two sides cancel *exactly* in every scenario. Free money — so quotes like that get arbitraged away within moments.

## What parity buys you

- **Instant pricing.** Know the call? The put price follows by arithmetic (and vice versa). Desks quote one and derive the other.
- **A mispricing detector.** Any violation of parity is a direct arbitrage recipe: buy the cheap portfolio, sell the rich one.
- **Model independence — the real power.** Look back at the derivation: we never said *anything* about how the stock price moves. No probabilities, no volatility, no distribution. Parity holds under every model of the world, which makes it a sanity check that any pricing model whatsoever must pass. Results this robust are rare and precious.

Note what parity does *not* do: it gives you the **difference** $C - P$, not $C$ or $P$ individually. Pinning down the call price itself is a harder problem — the replication argument needs an actual model of uncertainty.

## Next: build the simplest model of uncertainty

To price the call on its own, we'll let the stock do the simplest random thing imaginable: over one period it moves either up or down — two branches, a tree. Amazingly, that toy world is enough to replicate an option payoff exactly and squeeze out a unique no-arbitrage price. That's the next module.

## Interview checkpoints

- Law of one price: identical payoffs in every scenario ⇒ identical price today; otherwise buy cheap, sell dear, keep a riskless profit.
- Arbitrage, precisely: zero (or negative) cost today, no scenario with a loss, some scenario with a gain.
- Put–call parity: $C + K/(1+r)^T = P + S_0$, i.e. $C - P = S_0 - K/(1+r)^T$ (continuous form: $C - P = S_0 - Ke^{-rT}$), for European options on a non-dividend stock.
- Proof in one line: call + PV(K) and put + stock are both worth $\max(S_T, K)$ at expiry.
- Parity is model-free — it constrains $C - P$ under any dynamics, but pricing $C$ alone requires a model.
