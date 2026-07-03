---
title: Why Ordinary Calculus Fails
minutes: 10
---

**Builds on:** *Random Walks to Brownian Motion* — especially quadratic variation.

This step is about one idea, and one idea only: **squared Brownian noise is not negligible — it's time.** Every pricing PDE, every simulation scheme, and the most-asked derivation in quant interviews sit on top of it. Get this in your bones and Itô's lemma (next step) is just bookkeeping.

## The problem with jagged paths

For a smooth path $x(t)$, the Taylor expansion of $f(x)$ gives

$$df = f'\,dx + \tfrac{1}{2} f''\,(dx)^2 + \cdots$$

and since $dx \sim dt$ for a smooth path, $(dx)^2 \sim (dt)^2$ is second-order — we drop it, and the ordinary chain rule survives.

Brownian motion breaks this. A Brownian increment over a time step $\Delta t$ has standard deviation $\sqrt{\Delta t}$, not $\Delta t$. So its **square** has size $\Delta t$ — the same order as time itself:

$$(dW_t)^2 \sim dt.$$

That's first order. It cannot be dropped. The path is so jagged that its squared wiggles accumulate at a steady, deterministic rate.

This is exactly the quadratic variation fact you met in the previous lesson, now in differential clothing: chop $[0, t]$ into $n$ pieces and sum the squared increments, and

$$\sum_{i} (\Delta W_i)^2 \to t \quad \text{as } n \to \infty,$$

i.e. $[W]_t = t$. Each squared increment is random, but there are so many of them that the law of large numbers averages the randomness away — the sum converges to plain time. A smooth path would give zero here. Brownian motion gives $t$, every time, on (almost) every path.

## The rulebook

All of stochastic calculus at the working-quant level compresses into a three-entry multiplication table:

$$(dW)^2 = dt, \qquad dW \cdot dt = 0, \qquad (dt)^2 = 0.$$

Why the other two entries vanish: $dW \cdot dt \sim \sqrt{dt} \cdot dt = dt^{3/2}$ and $(dt)^2$ are both smaller than $dt$, so in the limit they contribute nothing. Only $(dW)^2$ is promoted to first-class status. Everything that follows — Itô's lemma, the Black-Scholes PDE — is Taylor expansion plus this table.

## The flagship example, done slowly: $d(W_t^2)$

Ordinary calculus would say $d(W^2) = 2W\,dW$. Let's see why that's wrong by doing the honest discrete computation. Over one small step, the change in $W^2$ is

$$(W + \Delta W)^2 - W^2 = 2W\,\Delta W + (\Delta W)^2.$$

No approximation yet — that's just algebra. Now take the step small. The first term, $2W\,\Delta W$, is the ordinary-calculus term. The second term, $(\Delta W)^2$, is exactly the thing a smooth-world reflex tells you to discard — but we just established it has size $\Delta t$, and summing it across all the steps up to time $t$ gives the quadratic variation, which is $t$. So in the limit:

$$d(W_t^2) = 2W_t\,dW_t + dt.$$

**Sanity check by expectation.** The $dW$ term is mean-zero (it's a fair-game increment), so taking expectations gives $\mathbb{E}[W_t^2] = t$ — which matches $\mathrm{Var}(W_t) = t$ exactly. The ordinary-calculus answer $d(W^2) = 2W\,dW$ would predict $\mathbb{E}[W_t^2] = 0$: visibly, badly wrong. A worthwhile corollary to quote: $W_t^2 - t$ is a martingale.

## What the extra $dt$ *means*

Don't file the correction term as algebraic debris — it has content. $f(x) = x^2$ is **convex**, and a convex function of a noisy input drifts upward even when the input itself has no drift. Wiggle $W$ symmetrically around any point: the up-move gains more in $W^2$ than the down-move loses, because the parabola curves upward. Each wiggle deposits a little positive amount, at rate = (curvature) × (variance of the noise). That deposit is the $+dt$.

This is Jensen's inequality made dynamic, and it is the germ of **gamma** in options trading: a delta-hedged option position with positive curvature earns money from realized volatility, mechanically, wiggle by wiggle. When you meet the $\tfrac{1}{2}\sigma^2 S^2 \frac{\partial^2 V}{\partial S^2}$ term in the Black-Scholes PDE, it will be this exact effect wearing a suit.

## How to say it in an interview

The crisp phrasing: *"Brownian increments scale like $\sqrt{dt}$, so their squares are order $dt$ — first order, not negligible. Quadratic variation of Brownian motion equals elapsed time, so second-order Taylor terms survive, and the chain rule picks up a correction proportional to curvature."* If you can also produce the $d(W_t^2)$ computation from the discrete expansion in three lines, you've answered the standard warm-up before the GBM question.

## Interview checkpoints

- The ordinary chain rule fails because $(dW)^2 = dt$ is first-order in $dt$, not second — a direct restatement of quadratic variation $[W]_t = t$.
- The multiplication table: $(dW)^2 = dt$, $dW\,dt = 0$, $(dt)^2 = 0$ — everything else is Taylor expansion.
- I can derive $d(W_t^2) = 2W_t\,dW_t + dt$ from $(W + \Delta W)^2 - W^2$ in three lines, and note that $W_t^2 - t$ is a martingale.
- The extra $dt$ is convexity harvesting volatility (dynamic Jensen) — the germ of gamma in a hedged option book.
