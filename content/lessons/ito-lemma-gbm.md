---
title: Itô's Lemma & Geometric Brownian Motion
minutes: 12
---

**Builds on:** *Why Ordinary Calculus Fails* — the rulebook $(dW)^2 = dt$, $dW\,dt = 0$, $(dt)^2 = 0$.

Last step established that squared Brownian noise is time. This step packages that fact into the working tool — Itô's lemma — and immediately spends it on the single most-asked derivation in quant interviews: solving geometric Brownian motion.

## Itô's lemma: Taylor plus the rulebook

Let $X_t$ follow the SDE $dX_t = a(t, X_t)\,dt + b(t, X_t)\,dW_t$, and let $f(t, x)$ be smooth. Then

$$df = \left( \frac{\partial f}{\partial t} + a\,\frac{\partial f}{\partial x} + \frac{1}{2} b^2\, \frac{\partial^2 f}{\partial x^2} \right) dt \;+\; b\,\frac{\partial f}{\partial x}\, dW_t.$$

Read it as: **ordinary chain rule plus the Itô correction** $\tfrac{1}{2} b^2 f_{xx}\,dt$. There is no new machinery here. Derivation sketch, which you should be able to reproduce: Taylor-expand $f$ to second order in $dt$ and $dx$, substitute $dX = a\,dt + b\,dW$, apply the multiplication table — $(dX)^2 = b^2 (dW)^2 = b^2\,dt$, with every cross term dying — and keep everything of order $dt$. The correction is (curvature) × (variance rate): the dynamic-Jensen effect from last step, now with a coefficient.

## GBM: the interview centerpiece

The standard stock model makes drift and noise proportional to the price level:

$$dS_t = \mu S_t\,dt + \sigma S_t\,dW_t.$$

**Claim:** $S_t = S_0 \exp\!\big( (\mu - \tfrac{\sigma^2}{2})\,t + \sigma W_t \big)$.

**Derivation (know this cold).** Apply Itô to $f(S) = \ln S$, with $a = \mu S$, $b = \sigma S$, $f' = 1/S$, $f'' = -1/S^2$:

$$d(\ln S_t) = \left( \mu S \cdot \frac{1}{S} + \frac{1}{2} \sigma^2 S^2 \cdot \left(-\frac{1}{S^2}\right) \right) dt + \sigma S \cdot \frac{1}{S}\, dW_t = \left( \mu - \frac{\sigma^2}{2} \right) dt + \sigma\, dW_t.$$

Log-price is arithmetic Brownian motion; integrate and exponentiate. So $\ln S_t \sim N\big(\ln S_0 + (\mu - \tfrac{\sigma^2}{2}) t,\ \sigma^2 t\big)$ — log-returns are normal, the price is lognormal and strictly positive.

## Why $-\sigma^2/2$? (the interview favorite)

*"The SDE says the expected instantaneous return is $\mu$ — so why isn't the drift of log-price $\mu$?"* Both statements are true; they answer different questions.

- **Arithmetic mean:** $\mathbb{E}[S_t] = S_0 e^{\mu t}$ exactly. Check via the lognormal mean formula: $\exp\big((\mu - \tfrac{\sigma^2}{2})t + \tfrac{1}{2}\sigma^2 t\big) = e^{\mu t}$ — the $\pm\sigma^2/2$ terms cancel.
- **Geometric (compound) growth:** the *median* path, and the almost-sure long-run growth rate, is $\mu - \sigma^2/2$. Volatility drags compounding: gain 10% then lose 10% and you sit at $0.99$, not back at par.

It's Jensen's inequality — $\ln$ is concave, so $\mathbb{E}[\ln S_t] < \ln \mathbb{E}[S_t]$, and the gap is exactly $\tfrac{\sigma^2}{2}t$. The mean is dragged up by a few lucky, enormous paths; the typical path grows slower. Crisp interview phrasing: *"the mean grows at $\mu$, the typical path grows at $\mu - \sigma^2/2$; the difference is volatility drag."*

## Ornstein–Uhlenbeck: mean reversion in one paragraph

Not everything trends. Interest rates, volatility, and pairs-trade spreads pull back toward a level, and the workhorse model is the OU process $dX_t = \kappa(\theta - X_t)\,dt + \sigma\,dW_t$: $\theta$ is the long-run mean, $\kappa$ the reversion speed (half-life $\ln 2 / \kappa$), and the drift is a restoring force — above $\theta$ it pushes down, below it pushes up. Solving with the integrating factor $e^{\kappa t}$ (the SDE analogue of a linear ODE) shows $X_t$ is Gaussian with mean decaying exponentially to $\theta$ and stationary variance $\sigma^2/(2\kappa)$ — noise injection balanced against mean reversion. Stat-arb desks fit OU to spreads to size and time entries; as the Vasicek rate model, its Gaussian nature allows negative values — a bug in the 1990s, arguably a feature after 2015.

## Euler–Maruyama: simulating an SDE

Given $dX = a(t, X)\,dt + b(t, X)\,dW$, step forward with

$$X_{t+\Delta t} = X_t + a(t, X_t)\,\Delta t + b(t, X_t)\,\sqrt{\Delta t}\; Z, \qquad Z \sim N(0,1).$$

The one thing people get wrong: the noise term scales with $\boldsymbol{\sqrt{\Delta t}}$, **not** $\Delta t$ — that square root is the entire content of Brownian scaling, and writing `sigma * dt * Z` is the classic bug.

```cpp
// GBM, Euler-Maruyama vs exact
S_euler *= 1.0 + mu * dt + sigma * sqdt * Z(rng);
S_exact *= std::exp((mu - 0.5 * sigma * sigma) * dt + sigma * sqdt * Z(rng));
```

Facts a quant dev is expected to know: Euler has **strong order 0.5** (pathwise error $\sim \sqrt{\Delta t}$) and **weak order 1** (error in expectations $\sim \Delta t$) — for pricing, weak order is what matters. For GBM specifically, *don't* use Euler: the log-space solution above is exact for any step size, while naive Euler can even produce negative prices. Euler earns its keep on models without closed forms (local vol, Heston — where extra care is needed to keep variance nonnegative).

## Interview checkpoints

- Itô's lemma: $df = (f_t + a f_x + \tfrac{1}{2} b^2 f_{xx})\,dt + b f_x\,dW$ — Taylor to second order plus the rulebook; the correction is curvature × variance.
- GBM solution via Itô on $\ln S$: $S_t = S_0 \exp((\mu - \sigma^2/2)t + \sigma W_t)$; log-returns normal, prices lognormal and positive.
- The $-\sigma^2/2$ is volatility drag: $\mathbb{E}[S_t] = S_0 e^{\mu t}$, but the median/typical path compounds at $\mu - \sigma^2/2$ (Jensen on $\ln$).
- OU: $dX = \kappa(\theta - X)dt + \sigma dW$ — mean reversion with half-life $\ln 2/\kappa$, stationary variance $\sigma^2/2\kappa$; the model for rates and spreads.
- Euler–Maruyama replaces $dW$ with $\sqrt{\Delta t}\,Z$ (never $\Delta t\,Z$); weak order 1, strong order 0.5 — and for GBM I'd simulate the exact log-space solution instead.
