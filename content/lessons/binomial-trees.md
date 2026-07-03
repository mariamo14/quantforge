---
title: Binomial Trees & American Options
minutes: 16
---

# Binomial Trees & American Options

The binomial tree is the simplest model in which the deepest idea in derivatives pricing — **replication** — can be seen with bare hands. If you understand the one-period tree, you understand *why* risk-neutral pricing works. Everything else (Black-Scholes, Monte Carlo, PDEs) is that same idea with more machinery.

## One period: price anything by replication

A stock trades at $S$. Over one period $\Delta t$ it moves to either $uS$ (up) or $dS$ (down), with $d < e^{r\Delta t} < u$. A bond grows risk-free at rate $r$. You want to price a derivative paying $V_u$ in the up state and $V_d$ in the down state — *any* payoff, not just a call.

Build a portfolio of $\Delta$ shares and $B$ in bonds and force it to match the payoff in both states:

$$
\Delta u S + B e^{r\Delta t} = V_u, \qquad \Delta d S + B e^{r\Delta t} = V_d
$$

Two equations, two unknowns:

$$
\Delta = \frac{V_u - V_d}{S(u - d)}, \qquad B = e^{-r\Delta t}\,\frac{u V_d - d V_u}{u - d}
$$

Since the portfolio replicates the derivative exactly, no-arbitrage says the derivative *must* cost the same as the portfolio:

$$
V = \Delta S + B = e^{-r\Delta t}\left[\, q V_u + (1-q) V_d \,\right], \qquad q = \frac{e^{r\Delta t} - d}{u - d}
$$

Look at what happened. The price is a discounted expectation under a probability $q$ — but $q$ contains **no beliefs about the stock**. Nobody's forecast of the up-move probability appears anywhere. $q$ is manufactured purely from $u$, $d$, and $r$ by the no-arbitrage condition $d < e^{r\Delta t} < u$ (which guarantees $0 < q < 1$, so it behaves like a probability). This is the **risk-neutral probability**: an accounting device that emerges from replication, not a statement about the world. This distinction — real-world $p$ vs risk-neutral $q$ — is one of the most reliable interview probes in existence.

Also note: $\Delta$ is a discrete version of the option's delta, $\partial V / \partial S$. Replication and hedging are the same computation.

## Multi-period: backward induction

Chain $n$ one-period trees together. Terminal stock prices are $S_0 u^j d^{n-j}$ for $j = 0, \dots, n$. Pricing is a backward sweep:

1. At maturity, set node values to the payoff, e.g. $\max(S_T - K, 0)$.
2. Step back one layer at a time, applying the one-period formula at every node:

$$
V = e^{-r\Delta t}\left[\, q V_u + (1-q) V_d \,\right]
$$

3. The value at the root is the price.

The tree **recombines** (an up-then-down lands on the same node as down-then-up), so layer $k$ has $k+1$ nodes, not $2^k$.

## CRR parameterization and convergence

Cox-Ross-Rubinstein choose

$$
u = e^{\sigma\sqrt{\Delta t}}, \qquad d = \frac{1}{u} = e^{-\sigma\sqrt{\Delta t}}
$$

so the tree's log-price steps have the right variance $\sigma^2 \Delta t$ and the tree recombines around a level grid. As $\Delta t \to 0$ the binomial log-price process converges (central limit theorem) to Brownian motion with drift, and the binomial price of a European option converges to the **Black-Scholes** price. In practice convergence is $O(\Delta t)$ with a characteristic sawtooth oscillation in $n$ caused by where the strike falls relative to the terminal nodes — a detail interviewers love because it separates people who have actually implemented a tree from those who haven't.

## The real payoff: American options

Black-Scholes gives Europeans in closed form, so why do trees survive? **Early exercise.** American options have no closed-form price, but backward induction handles them with a one-line change. At each node, the holder chooses between exercising now and holding on:

$$
V = \max\!\left(\, \text{payoff},\; e^{-r\Delta t}\left[\, q V_u + (1-q) V_d \,\right] \right)
$$

The tree computes the continuation value anyway; you just compare it to intrinsic value. The set of nodes where exercise wins traces out the **early exercise boundary**.

### Interview classic: American calls on a non-dividend stock are never exercised early

Prove it. A European call satisfies $C \ge \max(0,\, S - Ke^{-rT})$ (from put-call parity, or directly: a portfolio of the call plus $Ke^{-rT}$ in bonds is worth at least $S$ at maturity). The American call is worth at least the European. So for $r > 0$, $T > 0$:

$$
C_{\text{Amer}} \;\ge\; C_{\text{Eur}} \;\ge\; S - Ke^{-rT} \;>\; S - K
$$

The living option is *always* worth strictly more than the exercise value $S - K$. Exercising early throws away time value and pays the strike sooner than necessary. If you want the stock, sell the call and buy the stock — you come out ahead. Hence American call = European call when there are no dividends. (Dividends break this: exercising just before an ex-dividend date to capture the dividend can be optimal.)

**American puts are different.** Deep in the money, the put's value is capped near $K$, and receiving $K$ *now* beats receiving $K$ later — interest on the strike is a real benefit that can outweigh remaining optionality. So American puts carry a genuine early exercise premium even without dividends, and the binomial tree is the standard way to price them.

## Engineering: complexity and memory

An $n$-step tree has $\sum_{k=0}^{n}(k+1) = O(n^2)$ nodes, and the backward sweep touches each once, so time is $O(n^2)$. Memory does **not** need to be $O(n^2)$: you only ever need the current layer to compute the previous one. Keep a single array of size $n+1$ and overwrite it in place as you walk backward — $O(n)$ memory:

```python
for step in range(n - 1, -1, -1):
    for j in range(step + 1):
        cont = disc * (q * V[j + 1] + (1 - q) * V[j])
        V[j] = max(payoff(S0 * u**j * d**(step - j)), cont)  # American
```

Mentioning the rolling array unprompted is a cheap way to signal you think like a developer, not just a formula-memorizer.

## Interview checkpoints

- Derive $q = \frac{e^{r\Delta t} - d}{u - d}$ from replication, and explain why it contains no real-world probabilities — no-arbitrage, not beliefs.
- Know that $d < e^{r\Delta t} < u$ is exactly the no-arbitrage condition and exactly what makes $0 < q < 1$.
- American pricing is one line: $V = \max(\text{payoff},\ e^{-r\Delta t}(qV_u + (1-q)V_d))$ at every node.
- Prove the classic: $C \ge S - Ke^{-rT} > S - K$, so American calls on non-dividend stocks are never exercised early; explain why puts (and dividend-paying calls) are.
- CRR: $u = e^{\sigma\sqrt{\Delta t}}$, $d = 1/u$; converges to Black-Scholes as $\Delta t \to 0$, with sawtooth oscillation in $n$.
- Complexity: $O(n^2)$ time, $O(n)$ memory with a rolling array — say this before they ask.
