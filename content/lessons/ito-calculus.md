---
title: Itô Calculus & SDEs
minutes: 18
---

Itô calculus is the chain rule for processes driven by Brownian motion. Every pricing PDE, every simulation scheme, and the most-asked derivation in quant interviews (GBM's solution) sit on top of one idea: **squared Brownian noise is not negligible — it's time**.

## Why the ordinary chain rule fails

For a smooth path $x(t)$, Taylor expansion of $f(x)$ gives $df = f'\,dx + \tfrac{1}{2} f''\,(dx)^2 + \cdots$, and $(dx)^2 \sim (dt)^2$ is second-order — dropped. But Brownian increments have size $\sqrt{dt}$, so

$$(dW_t)^2 \sim dt,$$

which is **first order** and cannot be dropped. This is exactly the quadratic variation fact $[W]_t = t$ in differential clothing. The multiplication table to memorize:

$$(dW)^2 = dt, \qquad dW \cdot dt = 0, \qquad (dt)^2 = 0.$$

Everything in this lesson is Taylor expansion plus this table.

## Itô's lemma

Let $X_t$ follow the SDE $dX_t = a(t, X_t)\,dt + b(t, X_t)\,dW_t$, and let $f(t, x)$ be smooth. Then

$$df = \left( \frac{\partial f}{\partial t} + a\,\frac{\partial f}{\partial x} + \frac{1}{2} b^2\, \frac{\partial^2 f}{\partial x^2} \right) dt \;+\; b\,\frac{\partial f}{\partial x}\, dW_t.$$

Read it as: ordinary chain rule **plus the Itô correction** $\tfrac{1}{2} b^2 f_{xx}\,dt$. The correction exists because $f$'s curvature interacts with the noise: a convex function of a noisy input drifts upward even when the input has no drift (Jensen's inequality, made dynamic). Derivation sketch: Taylor-expand $f$ to second order, substitute $dX = a\,dt + b\,dW$, apply the multiplication table, keep terms of order $dt$.

## Worked example: $d(W_t^2)$

Take $f(x) = x^2$, $X = W$ (so $a = 0$, $b = 1$): $f_x = 2W_t$, $f_{xx} = 2$, hence

$$d(W_t^2) = 2 W_t\, dW_t + dt.$$

Sanity check by expectation: the $dW$ term is mean-zero, so $\mathbb{E}[W_t^2] = t$ — matching $\mathrm{Var}(W_t) = t$. Ordinary calculus would have given $d(W^2) = 2W\,dW$, predicting $\mathbb{E}[W_t^2] = 0$: visibly wrong. Corollary worth quoting: $W_t^2 - t$ is a martingale. This tiny example is a favorite warm-up before the GBM question.

## Geometric Brownian motion — the interview centerpiece

The standard stock model makes drift and noise proportional to the price level:

$$dS_t = \mu S_t\,dt + \sigma S_t\,dW_t.$$

**Claim:** $S_t = S_0 \exp\!\big( (\mu - \tfrac{\sigma^2}{2})\,t + \sigma W_t \big)$.

**Derivation (know this cold).** Apply Itô to $f(S) = \ln S$, with $a = \mu S$, $b = \sigma S$, $f' = 1/S$, $f'' = -1/S^2$:

$$d(\ln S_t) = \left( \mu S \cdot \frac{1}{S} + \frac{1}{2} \sigma^2 S^2 \cdot \left(-\frac{1}{S^2}\right) \right) dt + \sigma S \cdot \frac{1}{S}\, dW_t = \left( \mu - \frac{\sigma^2}{2} \right) dt + \sigma\, dW_t.$$

Log-price is arithmetic Brownian motion; integrate and exponentiate. So $\ln S_t \sim N\big(\ln S_0 + (\mu - \tfrac{\sigma^2}{2}) t,\ \sigma^2 t\big)$ — the price is lognormal, strictly positive.

## Why $-\sigma^2/2$? (the interview favorite)

The apparent paradox: the SDE says expected instantaneous return is $\mu$, yet the exponent grows at only $\mu - \sigma^2/2$. Both are true; they answer different questions.

- **Arithmetic mean:** $\mathbb{E}[S_t] = S_0 e^{\mu t}$ exactly — check via the lognormal mean formula: $\exp\big((\mu - \tfrac{\sigma^2}{2})t + \tfrac{1}{2}\sigma^2 t\big) = e^{\mu t}$. The $\pm \sigma^2/2$ terms cancel.
- **Geometric (compound) growth:** the *median* path, and the almost-sure long-run growth rate, is $\mu - \sigma^2/2$. Volatility drags compounding: gain 10% then lose 10% and you're at $0.99$, not back to par.

It's Jensen's inequality: $\ln$ is concave, so $\mathbb{E}[\ln S_t] < \ln \mathbb{E}[S_t]$, and the gap is exactly $\tfrac{\sigma^2}{2} t$. A crisp phrasing for interviews: "the mean grows at $\mu$, the typical path grows at $\mu - \sigma^2/2$; the difference is volatility drag."

## Ornstein–Uhlenbeck: mean reversion

Not everything trends. Interest rates, volatility, and pairs-trade spreads pull back toward a level. The OU process:

$$dX_t = \kappa\,(\theta - X_t)\,dt + \sigma\, dW_t,$$

with $\theta$ the long-run mean, $\kappa$ the reversion speed (half-life $= \ln 2 / \kappa$), $\sigma$ the noise. The drift is a restoring force: above $\theta$ it pushes down, below it pushes up. Solving (integrating factor $e^{\kappa t}$, the SDE analogue of a linear ODE):

$$X_t = \theta + (X_0 - \theta) e^{-\kappa t} + \sigma \int_0^t e^{-\kappa (t - s)}\, dW_s,$$

so $X_t$ is Gaussian with mean decaying exponentially to $\theta$ and stationary variance $\sigma^2 / (2\kappa)$ — noise injection balanced against mean-reversion. As the Vasicek model for rates, its Gaussian nature allows negative values — a bug in the 1990s, arguably a feature after 2015. Stat-arb desks fit OU to spreads to size and time entries.

## Euler–Maruyama discretization

Given $dX = a(t, X)\,dt + b(t, X)\,dW$, step with

$$X_{t+\Delta t} = X_t + a(t, X_t)\,\Delta t + b(t, X_t)\,\sqrt{\Delta t}\; Z, \qquad Z \sim N(0,1).$$

```cpp
// GBM, Euler-Maruyama vs exact
S_euler *= 1.0 + mu * dt + sigma * sqdt * Z(rng);
S_exact *= std::exp((mu - 0.5 * sigma * sigma) * dt + sigma * sqdt * Z(rng));
```

Facts a quant dev is expected to know: Euler has **strong order 0.5** (pathwise error $\sim \sqrt{\Delta t}$) and **weak order 1** (error in expectations $\sim \Delta t$) — for pricing, weak order is what matters. For GBM specifically, *don't* use Euler: the log-space solution is exact for any step size, and naive Euler can even produce negative prices. Euler earns its keep on models without closed forms (local vol, Heston — where extra care is needed to keep variance nonnegative).

## Interview checkpoints

- The chain rule fails because $(dW)^2 = dt$ is first-order; Itô's lemma is Taylor to second order plus the table $(dW)^2 = dt$, $dW\,dt = (dt)^2 = 0$.
- Itô's lemma: $df = (f_t + a f_x + \tfrac{1}{2} b^2 f_{xx})\,dt + b f_x\,dW$ — ordinary chain rule plus a convexity-times-variance correction.
- I can derive $d(W_t^2) = 2W_t\,dW_t + dt$ in three lines and note that $W_t^2 - t$ is a martingale.
- GBM solution via Itô on $\ln S$: $S_t = S_0 \exp((\mu - \sigma^2/2)t + \sigma W_t)$; log-returns are normal, prices lognormal.
- The $-\sigma^2/2$ is volatility drag: $\mathbb{E}[S_t] = S_0 e^{\mu t}$ but the median/typical path compounds at $\mu - \sigma^2/2$ (Jensen on $\ln$).
- OU: $dX = \kappa(\theta - X)dt + \sigma dW$ — mean reversion with half-life $\ln 2/\kappa$, stationary variance $\sigma^2/2\kappa$; the workhorse for rates and spreads.
- Euler–Maruyama replaces $dW$ with $\sqrt{\Delta t}\,Z$; weak order 1, strong order 0.5 — and for GBM I'd simulate the exact log-space solution instead.
