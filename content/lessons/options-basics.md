---
title: "Options: Calls & Puts"
minutes: 13
---

**Builds on:** forwards and futures, time value of money, expected value.

## The right, not the obligation

A forward *obligates* you to trade at the agreed price — even when it hurts. An **option** gives you the *right* to trade at an agreed price, with no obligation to use it. If exercising would lose you money, you simply walk away.

Rights are valuable, so unlike a forward, an option costs money upfront. That cost is the **premium**.

The cleanest intuition: **an option is insurance.** Suppose your portfolio is worth \$100 per share and you buy a *put* that lets you sell at \$90 anytime bad things happen by year-end. That is exactly a home-insurance policy: you pay a premium today; if disaster strikes (price crashes to 60), you "file a claim" and sell at 90 anyway; if nothing happens, the policy expires unused and the premium is the cost of sleeping well. The strike of 90 acts like a deductible — you absorb the first \$10 of loss, insurance covers the rest.

## Calls and puts

Two flavors, defined by the strike price $K$ (the agreed trade price) and expiry $T$:

- **Call** = the right to **buy** the asset at $K$. You want the price to go *up*.
- **Put** = the right to **sell** the asset at $K$. You want the price to go *down* (or you're insuring against it).

Payoffs at expiry, where $S_T$ is the asset's market price on expiry day:

$$\text{call payoff} = \max(S_T - K,\ 0) \qquad \text{put payoff} = \max(K - S_T,\ 0)$$

The $\max(\cdot, 0)$ is the whole story: when exercising would lose money, you don't exercise, and the payoff floors at zero. An option's payoff is never negative — the worst case is that it expires worthless.

## Building the hockey stick

Let's build the payoff shape row by row. Take $K = 100$.

| $S_T$ | Call: $\max(S_T - 100, 0)$ | Put: $\max(100 - S_T, 0)$ |
|------:|---------------------------:|--------------------------:|
| 70    | 0                          | 30                        |
| 85    | 0                          | 15                        |
| 100   | 0                          | 0                         |
| 115   | 15                         | 0                         |
| 130   | 30                         | 0                         |

Plot payoff against $S_T$ and you get the famous **hockey sticks**. The call is a flat line at zero until $S_T = 100$, then rises one-for-one with the price — flat blade, then upward handle. The put is its mirror image: it rises as prices *fall* below 100 (steeper the deeper the crash), and is flat at zero to the right of 100. Memorize these two shapes; every options position you'll ever see is built by stacking them.

## Payoff vs. profit: don't forget the premium

Payoff ignores what you paid to play. **Profit = payoff − premium.** Suppose the call with $K = 100$ cost a premium of 5.

| $S_T$ | Call payoff | Profit (payoff − 5) |
|------:|------------:|--------------------:|
| 90    | 0           | −5                  |
| 100   | 0           | −5                  |
| 105   | 5           | 0                   |
| 120   | 20          | +15                 |

The **breakeven** is $K + \text{premium} = 105$: the stock must rise past 105 before you're actually ahead. For a put with premium 4 and $K=100$, breakeven is $K - \text{premium} = 96$. Note the buyer's loss is capped at the premium, while the seller (writer) of the option pockets the premium but faces the open-ended other side.

## Moneyness vocabulary

Traders describe where the option stands *right now*, at current price $S$:

- **In the money (ITM):** exercising now would pay off. Call with $K=100$, stock at 115 → ITM by 15.
- **At the money (ATM):** $S \approx K$. Stock at 100 → ATM.
- **Out of the money (OTM):** exercising now pays nothing. Call with $K=100$, stock at 85 → OTM. (That same situation makes the $K=100$ **put** ITM by 15 — moneyness flips between calls and puts.)

## Why options cost money even when OTM

Here's a puzzle: stock at 95, call strike 100, expiring in three months. Exercising today pays nothing — yet the market charges a real premium for it. Why?

Because of *expected value*, which you already know. The option's value today reflects the probability-weighted average of what it might pay. Even an OTM option has some chance of finishing ITM, and the $\max(\cdot,0)$ asymmetry means the good scenarios count while the bad ones just floor at zero. Crude sketch: if there's a 30% chance the stock ends at 110 (payoff 10) and a 70% chance it ends below 100 (payoff 0), the expected payoff is $0.3 \times 10 = 3$ — a positive number for a currently worthless-to-exercise right. This "value from the chance of finishing ITM" is called **time value**, and it melts away as expiry approaches. (Turning this sketch into an actual fair price is genuinely subtle — hold that thought.)

## Three starter strategies, by table

Strategies are just sums of hockey sticks. Read each table row-wise and picture the combined shape.

**Protective put** — own stock (bought at 100) + own a put, $K = 95$. Portfolio insurance.

| $S_T$ | Stock | Put payoff | Total |
|------:|------:|-----------:|------:|
| 80    | 80    | 15         | 95    |
| 95    | 95    | 0          | 95    |
| 110   | 110   | 0          | 110   |

Downside floored at 95, upside intact. Textbook insurance.

**Covered call** — own stock (at 100) + *sell* a call, $K = 110$, collecting its premium.

| $S_T$ | Stock | Short call payoff | Total |
|------:|------:|------------------:|------:|
| 90    | 90    | 0                 | 90    |
| 110   | 110   | 0                 | 110   |
| 125   | 125   | −15               | 110   |

You keep the premium as income but your upside is capped at 110.

**Straddle** — buy a call *and* a put, both $K = 100$. A bet on a big move, direction unknown.

| $S_T$ | Call | Put | Total payoff |
|------:|-----:|----:|-------------:|
| 70    | 0    | 30  | 30           |
| 100   | 0    | 0   | 0            |
| 130   | 30   | 0   | 30           |

A "V" shape: profits if the stock moves *far* in either direction, loses both premiums if it sits still.

## What we have not done

Everything above assumed the premium was handed to us. The real question — **what is the fair premium?** — is where the mathematics begins, and it takes the next few lessons to answer. First stop: a no-arbitrage relationship that links call and put prices *without any model at all*.

## Interview checkpoints

- Call payoff $\max(S_T - K, 0)$; put payoff $\max(K - S_T, 0)$; option payoffs are never negative.
- Profit = payoff − premium; call breakeven $K + \text{premium}$, put breakeven $K - \text{premium}$.
- ITM / ATM / OTM describe where the current price sits relative to the strike (and flip between calls and puts).
- Time value = expected-value of the chance to finish ITM; it exists even for OTM options and decays toward expiry.
- Protective put = stock + put (floor); covered call = stock − call (capped upside for income); straddle = call + put at same strike (bet on a big move either way).
