---
title: Random Walks to Brownian Motion
minutes: 15
---

Brownian motion is the noise source for essentially every continuous-time model in finance. The fastest way to understand it — and to answer interview questions about it — is to build it from a coin flip.

## The coin-flip random walk

Flip a fair coin every time step; step $+1$ on heads, $-1$ on tails. After $n$ steps,

$$S_n = \sum_{i=1}^n X_i, \qquad X_i = \pm 1 \text{ with prob } \tfrac{1}{2}.$$

Then $\mathbb{E}[S_n] = 0$ and $\mathrm{Var}(S_n) = n$, so the typical displacement is $\sqrt{n}$ — the walk spreads like the **square root** of time, not linearly. That square-root scaling is the fingerprint of diffusion and the origin of $\sqrt{\Delta t}$ in every simulation you'll ever write.

## The scaling limit

Now speed the walk up. Take steps of size $\Delta x$ every $\Delta t$ units of time. Over horizon $t$ there are $t/\Delta t$ steps, so the variance is $(\Delta x)^2 \cdot t/\Delta t$. For a nontrivial limit as $\Delta t \to 0$, we need

$$\Delta x = \sqrt{\Delta t},$$

which gives variance $t$ at every horizon. By the CLT, the position at time $t$ — a sum of many i.i.d. steps — becomes normal. The limiting object is **standard Brownian motion** $W_t$. (This is Donsker's theorem; you only need the idea, not the name, but the name earns points.)

## Definition of standard Brownian motion

$W_t$ is the process with:

1. $W_0 = 0$;
2. **Independent increments:** $W_t - W_s$ is independent of everything up to time $s$;
3. **Stationary normal increments:** $W_t - W_s \sim N(0,\, t - s)$;
4. **Continuous paths** (no jumps).

Memorize this as a four-item list — "define Brownian motion" is a genuinely common opener, and candidates who forget path continuity or say "$N(0, t)$" instead of "$N(0, t-s)$" get flagged.

## Basic properties

From the definition, taking $s = 0$:

$$\mathbb{E}[W_t] = 0, \qquad \mathrm{Var}(W_t) = t, \qquad \mathrm{Cov}(W_s, W_t) = \min(s, t).$$

The covariance follows from independent increments: for $s < t$, write $W_t = W_s + (W_t - W_s)$; the increment is independent of $W_s$, so $\mathrm{Cov}(W_s, W_t) = \mathrm{Var}(W_s) = s$.

**Nowhere differentiable.** Over a short window $\Delta t$, the move is of size $\sqrt{\Delta t}$, so the difference quotient behaves like

$$\frac{W_{t+\Delta t} - W_t}{\Delta t} \sim \frac{\sqrt{\Delta t}}{\Delta t} = \frac{1}{\sqrt{\Delta t}} \to \infty.$$

Brownian paths are continuous but infinitely jagged — they have no velocity. This is *why* ordinary calculus fails on them and why Itô calculus exists (next lesson).

## Quadratic variation: $[W]_t = t$ — THE key fact

Chop $[0, t]$ into $n$ pieces and sum squared increments:

$$[W]_t = \lim_{n \to \infty} \sum_{i=1}^{n} \big(W_{t_i} - W_{t_{i-1}}\big)^2 = t.$$

Why: each squared increment has mean $\Delta t$ and variance of order $(\Delta t)^2$; summing $n = t/\Delta t$ of them gives mean $t$ and vanishing variance — so the sum converges to $t$ **deterministically**, not just on average. A smooth function's quadratic variation is zero; Brownian motion accumulates it at rate one.

The heuristic shorthand, used constantly in derivations:

$$(dW_t)^2 = dt, \qquad dW_t\,dt = 0, \qquad (dt)^2 = 0.$$

Squared Brownian noise is not smaller-order — it's *deterministic time*. This single fact generates the extra term in Itô's lemma, the $\tfrac{1}{2}\sigma^2 S^2 \partial_{SS}V$ term in Black-Scholes, and gamma P&L. If you retain one equation from this lesson, make it $[W]_t = t$.

## Martingale property

A martingale is a process whose best forecast of the future is its current value:

$$\mathbb{E}[W_t \mid \mathcal{F}_s] = W_s \quad (s \le t).$$

Proof in one line: $\mathbb{E}[W_t \mid \mathcal{F}_s] = W_s + \mathbb{E}[W_t - W_s \mid \mathcal{F}_s] = W_s + 0$, by independent, mean-zero increments. Martingales are the mathematical formalization of "no free lunch," and risk-neutral pricing amounts to finding a measure under which discounted asset prices are martingales. Useful companions to know: $W_t^2 - t$ and $e^{\theta W_t - \theta^2 t/2}$ (the exponential martingale) are also martingales — both appear in interview problems about hitting times.

## Adding drift and volatility: arithmetic Brownian motion

Real assets trend and have tunable risk. The simplest model:

$$X_t = X_0 + \mu t + \sigma W_t, \qquad dX_t = \mu\,dt + \sigma\,dW_t,$$

so $X_t \sim N(X_0 + \mu t,\ \sigma^2 t)$. $\mu$ is the **drift** (deterministic trend), $\sigma$ the **diffusion/volatility** (noise scale). This is the Bachelier model. Its flaw for stock prices — it goes negative — is what motivates *geometric* Brownian motion, where $\mu$ and $\sigma$ multiply the price level. (Bachelier isn't dead, though: it's used for spreads and was used for negative oil futures in 2020.)

## Simulation

Exact simulation on a grid follows directly from the increment distribution:

$$W_{t + \Delta t} = W_t + \sqrt{\Delta t}\; Z, \qquad Z \sim N(0, 1).$$

```cpp
std::mt19937_64 rng{42};
std::normal_distribution<double> Z{0.0, 1.0};
double W = 0.0, sqdt = std::sqrt(dt);
for (int i = 0; i < n_steps; ++i)
    W += sqdt * Z(rng);   // sqrt(dt), never dt — the classic bug
```

The most common junior-dev bug in the wild is scaling the shock by $\Delta t$ instead of $\sqrt{\Delta t}$, which makes volatility collapse as the grid is refined. Interviewers ask "why $\sqrt{\Delta t}$?" expecting exactly the variance argument: increments over $\Delta t$ have variance $\Delta t$, hence standard deviation $\sqrt{\Delta t}$. Note simulation of $W$ itself on a grid is *exact* — discretization error only enters once the SDE has state-dependent coefficients.

## Interview checkpoints

- I can define BM in four items: $W_0 = 0$; independent increments; stationary increments $W_t - W_s \sim N(0, t-s)$; continuous paths.
- Random walks spread like $\sqrt{t}$; the scaling limit needs $\Delta x = \sqrt{\Delta t}$ — that's where every $\sqrt{\Delta t}$ in simulation code comes from.
- Quadratic variation $[W]_t = t$, i.e. $(dW)^2 = dt$: squared noise is deterministic time. This is the source of the Itô correction and of gamma P&L.
- BM is a martingale: $\mathbb{E}[W_t \mid \mathcal{F}_s] = W_s$, one line from independent mean-zero increments; $W_t^2 - t$ is a martingale too.
- Paths are continuous but nowhere differentiable — difference quotients blow up like $1/\sqrt{\Delta t}$ — so ordinary calculus doesn't apply.
- $\mathrm{Cov}(W_s, W_t) = \min(s,t)$, and arithmetic BM $X_t = X_0 + \mu t + \sigma W_t$ is normal (can go negative — hence GBM for prices).
