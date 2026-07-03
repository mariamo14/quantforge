---
title: The Black-Scholes Framework
minutes: 20
---

Black-Scholes is the load-bearing wall of derivatives pricing. Interviewers use it as a litmus test: not "can you recite the formula," but "do you understand *why* an option has a unique price at all?" The deep idea is that under certain assumptions, an option's payoff can be perfectly **replicated** by dynamically trading the stock and a bond — so its price is forced by no-arbitrage, independent of anyone's opinion about where the stock is going.

## The assumptions (and where reality breaks them)

The model assumes:

1. **The stock follows geometric Brownian motion**: $dS_t = \mu S_t\,dt + \sigma S_t\,dW_t$ with constant drift $\mu$ and constant volatility $\sigma$.
   *Violated:* volatility is stochastic and clusters; returns have fat tails and jumps (crashes happen far more often than a lognormal allows).
2. **Continuous, frictionless trading** — no transaction costs, infinitely divisible shares, trade at any instant.
   *Violated:* discrete hedging, bid-ask spreads, market impact.
3. **Constant risk-free rate $r$**, borrow and lend freely at it.
   *Violated:* rates move; funding spreads exist.
4. **No dividends** (in the basic version), **short selling allowed**, **no arbitrage**.
   *Violated:* dividends exist (fixable), shorting can be constrained or costly.

Interviewers love: *"Which assumption is worst?"* The standard answer: constant volatility — its failure is so systematic that the market quotes its violation directly (the smile, below).

## Replication and no-arbitrage

Why should an option have a model-independent price? Because if you can build a self-financing portfolio of stock and cash that ends up with **exactly the option's payoff in every state of the world**, then the option must cost the same as that portfolio today. Otherwise you buy the cheap one, sell the expensive one, and lock in riskless profit. The option price is a *hedging cost*, not a forecast. Crucially, the drift $\mu$ never enters — the hedger doesn't care where the stock goes, because they're hedged.

## Sketch of the PDE derivation

Let $V(S,t)$ be the option value. Itô's lemma (the stochastic chain rule — the extra term exists because $(dW)^2 = dt$) gives

$$dV = \left(\frac{\partial V}{\partial t} + \mu S \frac{\partial V}{\partial S} + \tfrac{1}{2}\sigma^2 S^2 \frac{\partial^2 V}{\partial S^2}\right)dt + \sigma S \frac{\partial V}{\partial S}\,dW.$$

Now form the hedged portfolio $\Pi = V - \Delta \cdot S$ with $\Delta = \frac{\partial V}{\partial S}$ shares held short. The $dW$ terms cancel exactly — the portfolio is (instantaneously) riskless. A riskless portfolio must earn the risk-free rate, $d\Pi = r\Pi\,dt$, or there's an arbitrage. Equating the two expressions for $d\Pi$:

$$\frac{\partial V}{\partial t} + \tfrac{1}{2}\sigma^2 S^2 \frac{\partial^2 V}{\partial S^2} + rS\frac{\partial V}{\partial S} - rV = 0.$$

This is the **Black-Scholes PDE**. Notice: $\mu$ has vanished, replaced by $r$. Every European payoff satisfies this PDE; the payoff enters only as the terminal condition $V(S,T) = \text{payoff}(S)$.

## Risk-neutral valuation: the equivalent route

The Feynman-Kac theorem says the solution of that PDE has a probabilistic representation:

$$V_0 = e^{-rT}\,\mathbb{E}^{\mathbb{Q}}[\text{payoff}(S_T)],$$

where under the **risk-neutral measure** $\mathbb{Q}$ the stock drifts at $r$ instead of $\mu$: $dS_t = r S_t\,dt + \sigma S_t\,dW_t^{\mathbb{Q}}$. Intuition: because the hedger neutralizes all directional risk, pricing works *as if* investors were risk-neutral. $\mathbb{Q}$ is not a belief about the world — it's a bookkeeping device that encodes hedging costs. This is the route Monte Carlo pricers take, and the PDE route is what finite-difference engines discretize; a good quant dev answer connects the two.

## The formula

For a European call with strike $K$ and maturity $T$:

$$C = S\,N(d_1) - K e^{-rT} N(d_2),$$

$$d_1 = \frac{\ln(S/K) + \left(r + \tfrac{1}{2}\sigma^2\right)T}{\sigma\sqrt{T}}, \qquad d_2 = d_1 - \sigma\sqrt{T},$$

where $N(\cdot)$ is the standard normal CDF. Read it as: (what you expect to receive) minus (what you expect to pay), each properly weighted.

**Interpretations interviewers probe:**

- $N(d_2) = \mathbb{Q}(S_T > K)$: the **risk-neutral probability the option finishes in the money**. So $Ke^{-rT}N(d_2)$ = PV of the strike you pay, times the probability you pay it.
- $N(d_1)$ is the option's **delta**, $\partial C/\partial S$. It is also the exercise probability under the *stock-numéraire* measure — which is why $d_1 > d_2$: conditioning on high stock paths tilts the probability up.

## Put-call parity

Hold a call and short a put, same $K$, $T$. At expiry the payoff is $\max(S_T - K, 0) - \max(K - S_T, 0) = S_T - K$ — **in every state**. A portfolio of one share minus $Ke^{-rT}$ in bonds has the same terminal value. No-arbitrage forces equal prices today:

$$C - P = S - Ke^{-rT}.$$

This is **model-free** — it needs no Black-Scholes assumptions beyond frictionless markets, which is exactly why interviewers ask it. It also means calls and puts at the same strike must carry the same implied volatility.

## Implied volatility and the smile

Every input to $C$ is observable except $\sigma$. **Implied volatility** inverts the formula: given a market price, find the $\sigma$ that reproduces it (numerically — Newton's method converges fast because vega is smooth and positive; a classic quant-dev coding question).

If Black-Scholes were right, implied vol would be one flat number across all strikes. Instead, plotting implied vol against strike gives a **smile** (or an equity **skew**: OTM puts trade at higher implied vol than OTM calls). The market charges more for crash protection than a lognormal world justifies — fat left tails, stochastic vol, jumps. The smile is the market quoting the model's failure *in the model's own units*. Practitioners still use BS as a quoting convention and hedging framework: "wrong model, right language."

## Interview checkpoints

- Can you derive the BS PDE from the delta-hedging argument, and explain **why $\mu$ drops out**?
- State $V = e^{-rT}\mathbb{E}^{\mathbb{Q}}[\text{payoff}]$ and explain what $\mathbb{Q}$ is (a hedging-consistent pricing measure, not a forecast).
- Interpret $N(d_1)$ (delta) vs $N(d_2)$ (risk-neutral ITM probability) — and know they're different.
- Derive put-call parity from a static no-arbitrage portfolio; know it's model-free.
- Explain the volatility smile as evidence against constant $\sigma$ / lognormality, and why implied vol is still the market's quoting language.
- Be ready to code an implied-vol solver (Newton with vega, bisection fallback).
