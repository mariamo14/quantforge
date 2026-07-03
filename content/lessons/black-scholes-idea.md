---
title: "Black-Scholes I: The Idea"
minutes: 11
---

**Builds on:** *Binomial Trees* (replication & risk-neutral pricing), *No-Arbitrage & Put-Call Parity*, and *Itô's Lemma & Geometric Brownian Motion*.

Black-Scholes is the load-bearing wall of derivatives pricing, and interviewers use it as a litmus test — not "can you recite the formula," but "do you understand *why* an option has a unique price at all?" This step is the *why*. No formula appears; the payoff is knowing exactly where next step's formula comes from.

## The assumptions (and where reality breaks them)

The model assumes:

1. **The stock follows geometric Brownian motion**: $dS_t = \mu S_t\,dt + \sigma S_t\,dW_t$ with constant drift $\mu$ and constant volatility $\sigma$.
   *Violated:* volatility is stochastic and clusters; returns have fat tails and jumps — crashes happen far more often than a lognormal allows.
2. **Continuous, frictionless trading** — no transaction costs, infinitely divisible shares, trade at any instant.
   *Violated:* discrete hedging, bid-ask spreads, market impact.
3. **Constant risk-free rate $r$**, borrow and lend freely at it.
   *Violated:* rates move; funding spreads exist.
4. **No dividends** (in the basic version), **short selling allowed**, **no arbitrage**.
   *Violated:* dividends exist (fixable), shorting can be constrained or costly.

Interviewers love: *"Which assumption is worst?"* Standard answer: constant volatility — its failure is so systematic that the market quotes the violation directly (the smile, two steps from now).

## The hedging miracle

Why should an option have a model-independent price? Because if you can build a self-financing portfolio of stock and cash that ends up with **exactly the option's payoff in every state of the world**, the option must cost the same as that portfolio today — otherwise buy the cheap one, sell the expensive one, and lock in riskless profit. The option price is a *hedging cost*, not a forecast.

The miracle is that one hedge suffices. Hold the option and short $\Delta = \frac{\partial V}{\partial S}$ shares against it, and the randomness **cancels**. Here's the sketch. Let $V(S, t)$ be the option value. Itô's lemma gives

$$dV = \left(\frac{\partial V}{\partial t} + \mu S \frac{\partial V}{\partial S} + \tfrac{1}{2}\sigma^2 S^2 \frac{\partial^2 V}{\partial S^2}\right)dt + \sigma S \frac{\partial V}{\partial S}\,dW.$$

Form the portfolio $\Pi = V - \Delta \cdot S$ with $\Delta = \frac{\partial V}{\partial S}$. The stock position's $dW$ exposure is $-\Delta\,\sigma S\,dW$, which cancels the option's $\sigma S \frac{\partial V}{\partial S}\,dW$ **exactly**. The portfolio is (instantaneously) riskless — and a riskless portfolio must earn the risk-free rate, $d\Pi = r\Pi\,dt$, or there's an arbitrage. Equating the two expressions for $d\Pi$ yields the **Black-Scholes PDE**:

$$\underbrace{\frac{\partial V}{\partial t}}_{\text{theta: time decay}} + \underbrace{\tfrac{1}{2}\sigma^2 S^2 \frac{\partial^2 V}{\partial S^2}}_{\text{gamma: convexity earning volatility}} + \underbrace{rS\frac{\partial V}{\partial S}}_{\text{delta financing: carry on the hedge}} - \underbrace{rV}_{\text{funding the position}} = 0.$$

Two things to notice and say out loud. First, **$\mu$ has vanished**, replaced by $r$: the hedger doesn't care where the stock is going, because they're hedged — directional opinion never enters the price. Second, the PDE is a *balance sheet in motion*: what the option loses to time decay (theta) is paid for by what its curvature earns from volatility (gamma) — the dynamic-Jensen term from Itô — net of financing. Every European payoff satisfies this same PDE; the specific payoff enters only as the terminal condition $V(S, T) = \text{payoff}(S)$.

## The equivalent route: risk-neutral valuation

The Feynman-Kac theorem says the solution of that PDE has a probabilistic representation:

$$V_0 = e^{-rT}\,\mathbb{E}^{\mathbb{Q}}[\text{payoff}(S_T)],$$

where under the **risk-neutral measure** $\mathbb{Q}$ the stock drifts at $r$ instead of $\mu$: $dS_t = r S_t\,dt + \sigma S_t\,dW_t^{\mathbb{Q}}$.

Why do the two views agree? Because replication forces them to. The hedger's cost of manufacturing the payoff is the price; and since hedging neutralizes all directional risk, that cost can be computed *as if* investors were risk-neutral — discount the expected payoff at $r$, under a measure where the stock also earns $r$. $\mathbb{Q}$ is not a belief about the world; it's a bookkeeping device that encodes hedging costs. Replication ⇒ the price *is* an expectation, just under the hedger's measure rather than the physical one.

## You've already seen this: the binomial tree

Nothing here is new — it's your binomial tree with the step size sent to zero. In the tree, you matched the option's up/down payoffs with $\Delta$ shares plus cash; here, continuous delta-hedging does the same state-matching instant by instant. The tree's risk-neutral probability $q = \frac{e^{r\Delta t} - d}{u - d}$ **becomes the measure $\mathbb{Q}$**; the tree's backward induction — discount the expected value one step back, repeat — **becomes the PDE**, which is exactly backward induction in infinitesimal steps. Monte Carlo pricers take the $\mathbb{Q}$-expectation route; finite-difference engines discretize the PDE route. A good quant-dev answer connects the two.

## Interview checkpoints

- List the BS assumptions with their real-world violations; nominate constant volatility as the worst (the market quotes its failure as the smile).
- Derive the BS PDE from the delta-hedging argument: short $\Delta = \partial V/\partial S$ shares, the $dW$ terms cancel, riskless ⇒ earns $r$. Explain **why $\mu$ drops out**.
- Name the PDE's terms: theta decay balanced against gamma (convexity × volatility), net of financing.
- State $V = e^{-rT}\mathbb{E}^{\mathbb{Q}}[\text{payoff}]$ and explain what $\mathbb{Q}$ is — a hedging-consistent pricing measure, not a forecast — and why replication makes the PDE and expectation routes agree.
- Connect to the binomial tree: the tree's $q$ is $\mathbb{Q}$ in embryo; backward induction is the PDE in discrete time.
