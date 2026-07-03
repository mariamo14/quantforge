---
title: "Black-Scholes II: The Formula"
minutes: 12
---

**Builds on:** *Black-Scholes I: The Idea* — the PDE, risk-neutral valuation, and why $\mu$ never enters.

Last step earned the right to write the formula: solve the BS PDE with terminal condition $\max(S_T - K, 0)$, or equivalently take the $\mathbb{Q}$-expectation of the payoff over a lognormal $S_T$. Either route lands here.

## The call formula

For a European call with spot $S$, strike $K$, rate $r$, volatility $\sigma$, maturity $T$:

$$C = S\,N(d_1) - K e^{-rT} N(d_2),$$

$$d_1 = \frac{\ln(S/K) + \left(r + \tfrac{1}{2}\sigma^2\right)T}{\sigma\sqrt{T}}, \qquad d_2 = d_1 - \sigma\sqrt{T},$$

where $N(\cdot)$ is the standard normal CDF.

## Reading each piece aloud

The formula is (what you expect to receive) minus (what you expect to pay), each properly weighted:

- **$N(d_2) = \mathbb{Q}(S_T > K)$** — the **risk-neutral probability the option finishes in the money**. So $Ke^{-rT}N(d_2)$ is the present value of the strike you'll pay, times the probability you pay it.
- **$S\,N(d_1)$** — the expected-stock-given-exercise leg: the present value of receiving the share *only in the states where you exercise*. It's larger than $S \cdot \mathbb{Q}(S_T > K)$ because exercise happens precisely on the high-stock paths; the conditioning tilt is why $d_1 > d_2$. (Formally, $N(d_1)$ is the exercise probability under the stock-numéraire measure.)
- **$N(d_1)$ is also the option's delta**, $\partial C / \partial S$ — the hedge ratio from the previous step, handed to you in closed form. Interviewers probe whether you know $N(d_1)$ and $N(d_2)$ are different things: hedge ratio vs. exercise probability.

## The put, via parity

No new derivation needed. Put-call parity, $C - P = S - Ke^{-rT}$ (model-free — a static portfolio argument), gives

$$P = Ke^{-rT}N(-d_2) - S\,N(-d_1),$$

using $N(-x) = 1 - N(x)$. Same $d_1, d_2$; mirrored probabilities.

## A fully worked example

Take $S = 100$, $K = 100$, $r = 5\%$, $\sigma = 20\%$, $T = 1$ year.

$$d_1 = \frac{\ln(100/100) + (0.05 + \tfrac{1}{2}(0.20)^2) \cdot 1}{0.20\sqrt{1}} = \frac{0 + 0.07}{0.20} = 0.35, \qquad d_2 = 0.35 - 0.20 = 0.15.$$

From normal tables, $N(0.35) \approx 0.6368$ and $N(0.15) \approx 0.5596$. The discount factor is $e^{-0.05} \approx 0.9512$, so $Ke^{-rT} \approx 95.12$. Then

$$C = 100 \times 0.6368 - 95.12 \times 0.5596 \approx 63.68 - 53.23 \approx \$10.45.$$

Read the pieces back: the option is about 56% likely (risk-neutrally) to finish in the money; its delta is about 0.64 — an at-the-money-ish call hedges with roughly 64 shares per 100 options, more than 50 because the forward sits above the strike. The put by parity: $P = 10.45 - 100 + 95.12 \approx \$5.57$. Memorize the shape of this example — "ATM, 20 vol, one year, 5% rate $\Rightarrow$ call $\approx$ \$10.45" is a standard mental benchmark.

## Sanity limits

Always check a formula at its edges:

- **$\sigma \to 0$:** the stock grows deterministically at $r$; both $d_1, d_2 \to \pm\infty$ depending on whether the forward $Se^{rT}$ is above or below $K$. The call becomes $\max(S - Ke^{-rT}, 0)$ — pure discounted intrinsic on the forward. No volatility, no optionality premium.
- **Deep ITM ($S \gg K$):** $N(d_1), N(d_2) \to 1$, so $C \to S - Ke^{-rT}$ — the call is a forward purchase; delta $\to 1$.
- **Deep OTM ($S \ll K$):** both CDFs $\to 0$, $C \to 0$, delta $\to 0$ — the option is a lottery ticket losing its last value.

## Implied volatility: the inverse problem

Every input to $C$ is observable except $\sigma$. **Implied volatility** runs the formula backwards: given a market price, find the $\sigma$ that reproduces it. There's no closed form — solve numerically. Newton's method converges fast because vega ($\partial C / \partial \sigma$) is smooth and strictly positive, and the price is monotone in $\sigma$; keep a bisection fallback for the flat-vega wings. This is a classic quant-dev coding question.

If Black-Scholes were right, implied vol would be one flat number across all strikes. It isn't: plot implied vol against strike and you get a **smile** (or in equities a **skew** — OTM puts trade at higher implied vol than OTM calls). The market charges more for crash protection than a lognormal world justifies: fat left tails, stochastic vol, jumps. The smile is where the model confesses — the market quoting the model's failure *in the model's own units*. Practitioners keep BS anyway, as a quoting convention and hedging framework: "wrong model, right language."

**Next up:** the two coding problems that cash this lesson in — a Black-Scholes pricer, then the implied-vol solver (Newton with vega, bisection fallback).

## Interview checkpoints

- Write the call formula and read each piece: $N(d_2)$ = risk-neutral ITM probability; $S N(d_1)$ = expected-stock-given-exercise leg; $N(d_1)$ = delta — and know that $N(d_1) \ne N(d_2)$.
- Get the put from parity, $C - P = S - Ke^{-rT}$, and remember parity is model-free.
- Reproduce the benchmark: $S = K = 100$, $r = 5\%$, $\sigma = 20\%$, $T = 1$ $\Rightarrow$ $d_1 = 0.35$, $d_2 = 0.15$, $C \approx \$10.45$.
- Check limits without recomputing: $\sigma \to 0$ gives discounted intrinsic on the forward; deep ITM $\to$ forward (delta 1); deep OTM $\to 0$.
- Explain implied vol as the inverse problem (Newton on a monotone, smooth-vega function) and the smile/skew as evidence against constant $\sigma$ and lognormality.
