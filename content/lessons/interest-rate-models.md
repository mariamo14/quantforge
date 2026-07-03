---
title: Interest Rate Models
minutes: 15
---

# Interest Rate Models

Equity models get one lucky break: a stock is a single traded price, and GBM is a passable first model for it. Rates give you none of that. Interviewers use this topic to check whether you understand *why* the rates world needed its own modeling tradition — and what a quant developer actually touches day to day.

## Why a rate is not a stock

Three structural differences kill the GBM-by-default instinct:

1. **Mean reversion.** Central banks and macro cycles tether rates to a range. A stock at \$400 can drift to \$4000; a short rate at 4% does not drift to 40%. Any sane rate model needs a force pulling toward a long-run level.
2. **You're modeling a curve, not a point.** "The interest rate" is really a whole term structure $\{P(t,T)\}_T$ of discount bonds, all traded, all moving together in correlated ways (level, slope, curvature). A model of one number must *imply* a consistent, arbitrage-free curve — a much stronger constraint than anything equity models face.
3. **Rates went negative.** EUR, JPY and CHF rates spent years below zero. Lognormal dynamics forbid that; the market repriced its intuitions, and "negative rates are impossible" became a model assumption that failed in production.

## Short-rate models: Vasicek

Model the instantaneous short rate $r_t$ as an Ornstein-Uhlenbeck process:

$$
dr = \kappa(\theta - r)\,dt + \sigma\,dW
$$

Read it mechanically: when $r > \theta$ the drift is negative, when $r < \theta$ it's positive — a spring pulling toward $\theta$ with stiffness $\kappa$ (the mean-reversion speed), plus Gaussian noise. The stationary distribution is normal with mean $\theta$ and variance $\sigma^2 / (2\kappa)$: mean reversion doesn't just center the rate, it *caps the long-run variance*, unlike Brownian motion whose variance grows without bound.

The payoff for this simplicity: **closed-form bond prices**. Because the model is affine, zero-coupon bonds take the exponential-affine form

$$
P(t,T) = e^{A(t,T) - B(t,T)\,r_t}, \qquad B(t,T) = \frac{1 - e^{-\kappa (T-t)}}{\kappa}
$$

with $A$ a known (messier) function of $\kappa, \theta, \sigma$. The whole yield curve is a deterministic function of one state variable $r_t$ — analytically beautiful, and the reason Vasicek remains the pedagogical and risk-engine workhorse.

The famous flaw: $r_t$ is Gaussian, so **it goes negative with positive probability**. For decades this was recited as a defect; post-2015 Europe, it's arguably a feature. Say both halves in an interview.

## CIR: the square-root fix

Cox-Ingersoll-Ross scales the noise by $\sqrt{r}$:

$$
dr = \kappa(\theta - r)\,dt + \sigma\sqrt{r}\,dW
$$

As $r \downarrow 0$ the diffusion switches off while the drift $\kappa\theta > 0$ keeps pushing up, so the origin repels the process. The **Feller condition**

$$
2\kappa\theta > \sigma^2
$$

is the precise statement: when it holds, the rate never touches zero; if it fails, zero is attainable (though still not crossed). CIR is also affine, so bonds are again exponential-affine with different $A, B$. Trade-off: positivity and level-dependent vol, at the cost of a clunkier distribution (noncentral chi-squared) and trickier simulation.

## Calibration vs specification: Hull-White

Here's the conceptual pivot interviewers probe. Vasicek has three constants — it can't reproduce today's observed discount curve except by luck. Pricing a derivative with a model that misprices the *underlying curve itself* is dead on arrival. Hull-White's move: keep the dynamics, promote the anchor to a function of time,

$$
dr = \kappa\left(\theta(t) - r\right)dt + \sigma\,dW
$$

and choose $\theta(t)$ so the model reprices **today's entire curve exactly**. That's the difference between *specifying* dynamics (how rates move) and *calibrating* to markets (matching what's traded now). Hull-White keeps analytic bonds and cheap trees/PDE lattices, which is why it's still everywhere for Bermudan swaptions and XVA. The philosophical cost: recalibrating $\theta(t)$ every day quietly admits the model is a curve-consistent interpolator, not a law of nature.

## The conceptual leap: HJM and LMM

Short-rate models generate the curve from one unobservable state. The Heath-Jarrow-Morton framework inverts the approach: take the **whole forward curve** $f(t,T)$ as the state and model its dynamics directly, $df(t,T) = \mu(t,T)\,dt + \sigma_f(t,T)\,dW$. The stunning result: **no-arbitrage fully determines the drift from the volatility structure** (under the risk-neutral measure, $\mu(t,T) = \sigma_f(t,T)\int_t^T \sigma_f(t,s)\,ds$). You choose how the curve wiggles; arbitrage-freeness dictates how it drifts. There is no drift left to calibrate — the initial curve is an *input*, fitted by construction.

The LIBOR Market Model (LMM/BGM) makes this tradable: model discrete market forward rates, each lognormal under its own forward measure, so caplets price by Black's formula — the model speaks the market's native quoting language. Cost: high-dimensional, Monte Carlo only, no low-dimensional lattice.

## Which model for which job

- **Risk / scenario generation:** Vasicek/CIR-style factor models — parsimonious, fast, stationary.
- **Pricing curve-dependent exotics (Bermudans, callables):** Hull-White or other calibrated short-rate models on lattices; LMM when payoffs depend on the joint behavior of many forwards.
- **P&L explain / hedging:** whatever the desk's pricing model is, bumped consistently — model coherence matters more than model sophistication.

## What a quant dev actually touches

Honesty wins interviews: most rates-desk dev work is **curve infrastructure**, not stochastic calculus. **Bootstrapping**: build discount factors $P(0,T)$ by solving instrument-by-instrument (deposits, futures, swaps) so each market quote reprices exactly, with interpolation choices (log-linear on $\ln P$ vs monotone splines on forwards) that visibly change forward curves — post-2008 this means **multi-curve**: OIS for discounting, separate projection curves. **Discount factors** as the atomic pricing object: every cashflow is $\text{CF} \times P(0,T)$. **DV01 / bumping**: risk is computed by bumping quotes 1bp, rebootstrapping, and repricing —

$$
\text{DV01} = \frac{\partial V}{\partial y} \times 1\text{bp}
$$

per bucket — so the dev problems are caching, dependency graphs (which trades depend on which curves), and making a few thousand bump-reprices fast and bit-reproducible.

## Interview checkpoints

- Three reasons rates ≠ stocks: mean reversion, the whole curve is the object, and negative rates actually happened.
- Vasicek $dr = \kappa(\theta - r)dt + \sigma dW$: OU process, affine bond prices $P = e^{A - Br}$ with $B = \frac{1 - e^{-\kappa(T-t)}}{\kappa}$, Gaussian so rates can go negative.
- CIR adds $\sqrt{r}$; Feller condition $2\kappa\theta > \sigma^2$ keeps the rate strictly positive.
- Hull-White = Vasicek with $\theta(t)$: the specification-vs-calibration distinction — fit today's curve exactly by construction.
- HJM/LMM leap: model the whole forward curve; no-arbitrage *forces* the drift from the chosen volatilities — nothing left to guess.
- Dev reality: bootstrapping, multi-curve discounting, DV01 by bump-and-rebootstrap — know why caching and reproducibility dominate the engineering.
