---
title: Monte Carlo Methods in Practice
minutes: 15
---

**Builds on:** *Itô Calculus* (simulating GBM) and *The Black-Scholes Framework* (the prices you're approximating).

# Monte Carlo Methods in Practice

Monte Carlo is the pricing method quant developers actually live in: it's embarrassingly parallel, it eats any payoff you can simulate, and its performance characteristics are governed by one deceptively simple formula. Interviews for dev roles lean hard on MC because it sits exactly at the intersection of math and engineering.

## The one formula that decides everything

Estimate $\theta = \mathbb{E}[f(X)]$ by averaging $N$ i.i.d. samples. The central limit theorem gives the standard error:

$$
\text{SE}(\hat\theta_N) = \frac{\sigma}{\sqrt{N}}, \qquad \sigma^2 = \mathrm{Var}(f(X))
$$

Two brutal consequences. First, the $\sqrt{N}$: **one more decimal digit of accuracy costs 100× the compute**. Second, and this is the strategic point: the error does **not depend on the dimension** of the problem. A 100-asset basket converges at the same $N^{-1/2}$ rate as a single stock.

Compare the deterministic alternatives. Trees and PDE grids have costs that grow **exponentially in dimension** — a grid with $m$ points per axis in $d$ dimensions has $m^d$ nodes (the curse of dimensionality). So the division of labor in every pricing library is:

- **Low dimension** (1–3 factors, early exercise): trees and PDEs win — fast, smooth Greeks.
- **High dimension** (baskets, path-dependent payoffs where each time step is effectively a dimension, hybrid/multi-asset exotics): **Monte Carlo owns it**.

Since you can't improve $\sqrt{N}$, the whole game is shrinking $\sigma$. That's variance reduction.

## Antithetic variates

For each draw $Z \sim \mathcal{N}(0,1)$, also use $-Z$, and average the pair: $\hat\theta = \frac{1}{2}\left(f(Z) + f(-Z)\right)$. The pair's variance is

$$
\mathrm{Var}\!\left(\tfrac{f(Z) + f(-Z)}{2}\right) = \frac{\mathrm{Var}(f(Z)) + \mathrm{Cov}\!\left(f(Z), f(-Z)\right)}{2}
$$

You win (per unit of work) exactly when the covariance is **negative**, and that is guaranteed when the payoff is a **monotone** function of $Z$ — when $Z$ pushes the payoff up, $-Z$ pushes it down, and the errors partially cancel. A vanilla call on $S_T = S_0 e^{(r - \sigma^2/2)T + \sigma\sqrt{T}Z}$ is monotone in $Z$: antithetics help. A straddle or a barrier payoff is not monotone: antithetics can do nothing or even hurt. Knowing the monotonicity condition — not just the trick — is the interview differentiator.

## Control variates

Suppose alongside your payoff estimate $\hat\theta$ you can compute, *on the same paths*, an estimate $\hat{C}$ of a quantity whose true value $\mathbb{E}[C]$ you know in closed form (e.g., pricing an arithmetic Asian option while the geometric Asian has an exact formula, or using the underlying stock itself, since $\mathbb{E}[e^{-rT}S_T] = S_0$). Then correct your estimate by how wrong the known one came out:

$$
\hat\theta_{cv} = \hat\theta + \beta\left(\mathbb{E}[C] - \hat{C}\right)
$$

This is unbiased for any $\beta$. Minimizing variance over $\beta$ gives $\beta^* = \mathrm{Cov}(\hat\theta, \hat{C}) / \mathrm{Var}(\hat{C})$ — a regression coefficient — and the residual variance is

$$
\mathrm{Var}(\hat\theta_{cv}) = \left(1 - \rho^2\right)\mathrm{Var}(\hat\theta)
$$

where $\rho$ is the correlation between $\hat\theta$ and $\hat{C}$. With $\rho = 0.99$ (routine for geometric-vs-arithmetic Asians), variance drops by 50×. Control variates are the highest-leverage technique in the toolbox when a correlated closed-form instrument exists. In practice $\beta^*$ is estimated from the samples (technically introducing $O(1/N)$ bias — a good thing to volunteer).

## Quasi-Monte Carlo, in one paragraph

Replace pseudo-random draws with **low-discrepancy sequences** (Sobol is the industry standard): deterministic points engineered to fill $[0,1]^d$ evenly instead of clumping randomly. The Koksma-Hlawka bound gives error $\sim (\log N)^d / N$ — asymptotically near-$1/N$ versus MC's $N^{-1/2}$, though the $(\log N)^d$ factor warns that raw QMC degrades in high nominal dimension. In finance it works far better than that bound suggests because payoffs have low *effective* dimension, which is boosted deliberately by a Brownian bridge or PCA construction of the paths that loads most variance onto the first coordinates. Randomized QMC (scrambling) restores error bars. Sobol + bridge is the default in serious equity/rates MC engines.

## Greeks by Monte Carlo

Pricing is half the job; desks need sensitivities. Three approaches, in ascending elegance:

**Finite differences ("bump and revalue"):** $\Delta \approx \frac{V(S_0 + h) - V(S_0 - h)}{2h}$. Simple and payoff-agnostic, but biased ($O(h^2)$ for central differences) and noisy — and if you don't reuse **common random numbers** across the bumped runs, the variance explodes as $O(1/h^2)$. Always bump with the same seeds.

**Pathwise derivative:** differentiate the payoff *along each path*, exchanging derivative and expectation. For a call under GBM, $\partial S_T / \partial S_0 = S_T / S_0$ (because $S_T$ is $S_0$ times a lognormal factor independent of $S_0$), so

$$
\frac{\partial}{\partial S_0}\, e^{-rT}\,(S_T - K)^+ = e^{-rT}\,\mathbf{1}_{\{S_T > K\}}\,\frac{S_T}{S_0}
$$

Unbiased and low variance — but it requires the payoff to be (almost everywhere) differentiable, so it fails for digitals. This is also the conceptual gateway to adjoint algorithmic differentiation (AAD), the modern production answer for thousands of Greeks at once.

**Likelihood ratio method:** differentiate the *density* instead of the payoff: $\partial_\alpha \mathbb{E}[f] = \mathbb{E}[f \cdot \partial_\alpha \ln p]$. The payoff is never differentiated, so discontinuous payoffs (digitals, barriers) are fine; the cost is typically higher variance. The trade-off pathwise-vs-LR is a classic interview fork.

## Seeding and reproducibility: the engineering discipline

This is where dev interviews are won. A price that can't be reproduced can't be debugged, diffed, or signed off. Non-negotiables: **explicit seeds** logged with every run; **counter-based or stream-splitting RNGs** (Philox, PCG, or skip-ahead Mersenne Twister) so that parallel workers get provably independent streams and the result is independent of thread scheduling; **common random numbers** for any A/B comparison (bumped Greeks, model-change P&L explain); and regression tests that pin exact prices at fixed seeds, with statistical (CI-based) tests layered on top. "Same seed → bit-identical price, different seed → statistically consistent price" is the invariant a production MC engine must satisfy.

## Interview checkpoints

- Error is $\sigma/\sqrt{N}$: 10× accuracy costs 100× compute, but the rate is dimension-free — hence MC for baskets/path-dependents, trees/PDEs for low-dimensional early exercise.
- Antithetics: pair $Z$ with $-Z$; helps iff $\mathrm{Cov}(f(Z), f(-Z)) < 0$, guaranteed for monotone payoffs — know a counterexample (straddle).
- Control variates: $\hat\theta_{cv} = \hat\theta + \beta(\mathbb{E}[C] - \hat{C})$, optimal $\beta$ is a regression slope, variance shrinks by $1 - \rho^2$; canonical example is geometric-Asian controlling arithmetic-Asian.
- Sobol/QMC: near-$1/N$ error, works because of low effective dimension + Brownian bridge; scrambling gives error bars.
- Greeks: bump (biased, needs common random numbers) vs pathwise ($e^{-rT}\mathbf{1}_{S_T>K}S_T/S_0$, needs differentiable payoff) vs likelihood ratio (handles digitals, more variance).
- Reproducibility: logged seeds, parallel-safe RNG streams, seed-pinned regression tests — say it before they ask.
