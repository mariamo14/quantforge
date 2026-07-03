---
title: The Greeks & Hedging
minutes: 15
---

The Greeks are the partial derivatives of an option's value with respect to market inputs — the local sensitivities a trading desk actually manages. Interviewers care less about formulas and more about **signs, shapes, and the P&L story**: if the market moves, who makes money and why?

## Delta: directional exposure

$$\Delta = \frac{\partial V}{\partial S}$$

For a Black-Scholes call, $\Delta = N(d_1) \in (0,1)$; for a put, $\Delta = N(d_1) - 1 \in (-1,0)$. Delta is the hedge ratio: hold $-\Delta$ shares against a long option and you're locally immune to small moves in $S$.

**ATM intuition:** an at-the-money call has $\Delta \approx 0.5$ — roughly a coin flip on finishing in the money, so you pick up about half of each small stock move. (Precisely, ATM delta is slightly above 0.5 because $d_1$ contains the $+\tfrac{1}{2}\sigma^2 T$ term.) Deep ITM calls behave like stock ($\Delta \to 1$); deep OTM like nothing ($\Delta \to 0$). Traders also use delta as a rough moneyness label: "the 25-delta put."

## Gamma: curvature

$$\Gamma = \frac{\partial^2 V}{\partial S^2} = \frac{\partial \Delta}{\partial S}$$

Gamma measures how fast your delta changes. It's **positive for long options** (calls *and* puts — same gamma by put-call parity) and it **peaks at the money, sharpening as expiry approaches**: near expiry an ATM option's delta snaps from ~0 to ~1 across the strike, so the curvature there is huge, while far from the strike it's dead.

Long gamma is a lovely position: whichever way the stock moves, your delta moves in your favor — you get longer as it rallies, shorter as it falls. Rehedging then means **buy low, sell high mechanically**. The catch: you pay for this through theta.

## Vega, theta, rho

**Vega** $= \frac{\partial V}{\partial \sigma}$: sensitivity to implied volatility. Positive for long calls and puts — more uncertainty makes optionality worth more, and the payoff's convexity means you benefit from dispersion. Largest ATM and grows with maturity ($\text{vega} \propto S\sqrt{T}\,\phi(d_1)$).

**Theta** $= \frac{\partial V}{\partial t}$: time decay. Typically **negative for long options** — as time passes with nothing happening, optionality bleeds away. (Edge case interviewers like: deep ITM European puts can have positive theta, since you're waiting to collect $K$ and discounting works in your favor.)

**Rho** $= \frac{\partial V}{\partial r}$: positive for calls (the strike you'll pay is discounted more heavily), negative for puts. Usually the least important Greek for short-dated equity options.

## The delta-hedged P&L decomposition

This is **the** interview topic. Suppose you're long an option and delta-hedged. Taylor-expand the option value over a small time step:

$$\delta V \approx \Delta\,\delta S + \tfrac{1}{2}\Gamma\,(\delta S)^2 + \Theta\,\delta t + \text{vega}\,\delta\sigma.$$

The hedge kills the $\Delta\,\delta S$ term. With implied vol unchanged, the hedged P&L over the step is

$$\text{P\&L} \approx \tfrac{1}{2}\Gamma\,(\delta S)^2 + \Theta\,\delta t.$$

Gamma gains are paid for by theta. In the Black-Scholes world these exactly offset *on average* — indeed the BS PDE itself says $\Theta + \tfrac{1}{2}\sigma^2 S^2 \Gamma \approx 0$ for a delta-hedged, financed position. Substituting that in gives the famous **realized-vs-implied** form:

$$\text{P\&L} \approx \tfrac{1}{2}\Gamma S^2\left[\left(\frac{\delta S}{S}\right)^2 - \sigma_{\text{imp}}^2\,\delta t\right].$$

Read it aloud: each period, you earn gamma-weighted **(realized variance − implied variance)**. A delta-hedged long option is not a bet on direction; it is a **bet that realized volatility will exceed the implied volatility you paid**. If the stock moves more than the implied vol "breakeven" (daily move $\approx S\,\sigma_{\text{imp}}/\sqrt{252}$), you win; if it sits still, theta eats you. This single equation is the reason options desks talk about "buying vol" and "selling vol."

## Discrete hedging error

Black-Scholes assumes continuous rehedging. Real desks hedge discretely — daily, or on delta thresholds — so replication is imperfect. Key facts to know:

- Discrete hedging makes the P&L **noisy but unbiased** (in the BS world): hedging error has mean ~0 and standard deviation $\mathcal{O}(1/\sqrt{n})$ for $n$ rebalances. Hedging 4× as often halves the noise.
- There's a tradeoff: more rebalancing → less variance but more **transaction costs**. Costs grow with turnover, so real hedging frequency is an optimization, not "as often as possible."
- Hedging error is largest where gamma is largest — ATM near expiry, where "pin risk" lives: a tiny move through the strike flips your required hedge from 0 to a full share.

## Classic interview questions

- *"You're long an ATM straddle, delta-hedged. The stock gaps 5% overnight. P&L?"* — You make money: $\tfrac{1}{2}\Gamma(\Delta S)^2$ on the gap dwarfs one night's theta (assuming implied vol didn't collapse).
- *"Stock doesn't move for a month. Long option position?"* — You bleed theta; realized vol < implied vol.
- *"Why do calls and puts at the same strike have the same gamma and vega?"* — Put-call parity: $C - P = S - Ke^{-rT}$ is linear in $S$ and independent of $\sigma$, so all second-order and vol sensitivities match.
- *"What happens to ATM gamma as expiry approaches?"* — It blows up (like $1/(\sigma S\sqrt{T})$); OTM/ITM gamma collapses to zero.
- *"Is delta a probability?"* — Not exactly: $N(d_1)$ is the exercise probability under the stock measure; $N(d_2)$ is the risk-neutral one.

## Interview checkpoints

- Know signs of all five Greeks for calls and puts, and where each peaks (delta S-shape; gamma/vega ATM; ATM gamma explodes near expiry, vega grows with $\sqrt{T}$).
- ATM call delta ≈ 0.5 — and *why* (coin-flip moneyness, plus the small $\tfrac{1}{2}\sigma^2 T$ correction).
- Write the hedged P&L decomposition: $\tfrac{1}{2}\Gamma(\delta S)^2 + \Theta\,\delta t$, and the gamma-theta tug-of-war it encodes.
- State the punchline: delta-hedged options are a bet on **realized vs implied vol**, with breakeven daily move $\approx S\sigma_{\text{imp}}/\sqrt{252}$.
- Discrete hedging: unbiased error shrinking like $1/\sqrt{n}$, traded off against transaction costs.
- Long options = long gamma = long convexity: rehedging buys low and sells high, paid for via theta.
