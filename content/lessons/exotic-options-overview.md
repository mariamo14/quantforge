---
title: "Beyond Vanilla: Exotic Options"
minutes: 14
---

**Builds on:** *Black-Scholes II: The Formula*, *Monte Carlo Methods in Practice*

Vanilla calls and puts depend on one number: the terminal price $S_T$. The exotic zoo is best organized not as a list of names but by *what breaks*. Two things, mainly: **path-dependence** (the payoff depends on where the price went, not just where it ended) and **early exercise** (someone gets to make a decision before expiry). Add a third troublemaker — discontinuous payoffs — and you can classify almost anything a desk will show you.

## Digitals: the $N(d_2)$ you already know

A cash-or-nothing digital (binary) call pays \$1 if $S_T > K$ and nothing otherwise. Under Black-Scholes its price is

$$e^{-rT} N(d_2)$$

You have seen this before: in the vanilla call formula $C = S_0 N(d_1) - Ke^{-rT}N(d_2)$, the term $N(d_2)$ is exactly the risk-neutral probability that the option finishes in the money. A digital is that probability, discounted. Pricing it is trivial.

Hedging it is not. The digital's payoff is a step function, so near expiry with $S \approx K$ its delta

$$\Delta = \frac{e^{-rT}\, n(d_2)}{S \sigma \sqrt{T}}$$

blows up as $T \to 0$: the delta profile becomes a spike at the strike. A \$10M-notional digital an hour before expiry, spot sitting on the strike, forces you to buy and sell enormous amounts of stock as spot wobbles across $K$. In practice desks replicate digitals with a **tight call spread** (long a call at $K - \epsilon$, short at $K + \epsilon$, scaled by $1/2\epsilon$), which caps the delta at the cost of a conservative price. Interviewers love this: "how do you hedge a digital near expiry?" is a classic.

## Barriers: options with an off switch

A **knock-out** option dies if the underlying touches a barrier $H$ before expiry; a **knock-in** only comes alive if the barrier is touched. Each comes in up/down flavors (up-and-out, down-and-in, etc.).

Barriers are **cheaper than vanillas**, and the reason is pure logic: the knock-out pays off on a strict subset of the paths on which the vanilla pays off, and the knock-in likewise. Zero extra upside, strictly less coverage, lower price. That is exactly why clients buy them — a corporate that believes the barrier "won't be hit" buys cheaper protection.

The two flavors are joined by **in-out parity**: for European payoffs with the same strike, barrier, and expiry (and no rebates),

$$\text{KI} + \text{KO} = \text{vanilla}$$

Every path either touches the barrier or it doesn't, so holding both replicates the vanilla exactly. Price one, get the other free.

One subtlety that separates textbook answers from desk answers: **monitoring frequency**. A barrier observed continuously is hit more often than one checked once a day at the close, so a daily-monitored knock-out is worth *more* than its continuously-monitored twin. The standard fix (Broadie–Glasserman–Kou) prices the discrete barrier by shifting it: use $H e^{\pm 0.5826\, \sigma\sqrt{\Delta t}}$ (plus for up barriers, minus for down), where $\Delta t$ is the monitoring interval and $0.5826 \approx -\zeta(1/2)/\sqrt{2\pi}$.

## Asians: averaging kills variance

An average-price (Asian) call pays $\max(\bar{S} - K, 0)$ where $\bar{S}$ is the average of the price over a set of fixing dates. Averaging is smoothing: the variance of an average of correlated observations is lower than the variance of the endpoint. For a continuously monitored geometric average, the log-average has variance $\sigma^2 T/3$ — an effective volatility of $\sigma/\sqrt{3} \approx 0.58\sigma$. Less variance means less optionality, so **Asians are cheaper than vanillas**.

Corporates love them for exactly the reason they exist: a treasurer hedging fuel or FX exposure doesn't care about the price on one scary afternoon — they buy or sell *every month*, so their true exposure is to the average. An Asian matches the hedge to the flow and costs less.

Pricing: the arithmetic average of lognormals is **not lognormal**, so there is no Black-Scholes-style closed form. You either run **Monte Carlo** (with the geometric Asian, which *does* have a closed form, as a control variate — this is the canonical control-variate example) or use **moment-matching** approximations that fit a lognormal to the average's first two moments.

## Lookbacks, briefly

A floating-strike lookback call pays $S_T - \min_{t \le T} S_t$: you buy at the low. Its put cousin sells at the high. Perfect hindsight is the most option you can buy, and the price reflects it — a lookback costs roughly **twice** a comparable at-the-money vanilla. They are rarer trades, but a favorite interview foil: "which is worth more, a lookback or an Asian?" (Lookback, and you should be able to say why in one sentence: max beats average.)

## Which tool for which exotic

| Feature | Best tool | Why |
|---|---|---|
| Early exercise (American, Bermudan) | Tree / lattice | Backward induction handles the exercise decision naturally |
| Path-dependence, high dimension (Asians, baskets) | Monte Carlo | Cost scales gently with dimension; averaging along paths is free |
| Barriers in low dimension | PDE (finite differences) | Barrier is just a boundary condition; fast and accurate greeks |

These overlap — you *can* price a barrier by MC — but each choice has a failure mode (MC struggles with early exercise without Longstaff–Schwartz; trees and PDEs curse-of-dimensionality out beyond 2–3 factors).

## The model-risk punchline

Everything above quietly assumed flat Black-Scholes volatility. Real desks don't price exotics that way: exotics are sensitive to *which* volatility applies at *which* strike and time, so they are priced with the **smile** — a local volatility surface (Dupire) or a stochastic volatility model (Heston and friends) calibrated to vanilla prices. A barrier's value depends heavily on the vol near the barrier; flat-vol BS gets it visibly wrong.

And the deepest point: the pricing formula is the easy part. Two desks with the same model will quote similar prices; the P&L difference comes from **hedging** — managing the exploding digital delta, the barrier's gamma flip, the Asian's decaying vega. Desks earn their pay on the hedge, not the price.

## Interview checkpoints

- Price a digital call instantly: $e^{-rT}N(d_2)$ — and explain why $N(d_2)$ is the risk-neutral ITM probability.
- Explain the digital hedging problem near expiry and the call-spread replication fix.
- State in-out parity ($\text{KI} + \text{KO} = \text{vanilla}$) and why barrier options are cheaper than vanillas.
- Say why Asians are cheaper (variance of the average is lower) and why arithmetic Asians need MC or moment-matching.
- Match exotic to pricing tool: tree for early exercise, MC for path-dependence/high dimension, PDE for low-dimensional barriers.
