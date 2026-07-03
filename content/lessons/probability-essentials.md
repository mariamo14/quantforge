---
title: Probability Essentials for Quants
minutes: 15
---

**Builds on:** *Probability from Scratch* and *Random Variables & Expected Value* — this lesson deepens those foundations toward the distributions quants actually use.

Probability is the substrate of everything else in quant finance: pricing is an expectation, risk is a distribution, and Monte Carlo error is a CLT statement. Interviewers use probability questions as a fast filter, so these fundamentals need to be reflexive.

## Random variables and expectation as a fair price

A random variable $X$ is a function from outcomes to numbers. Its expectation

$$\mathbb{E}[X] = \sum_i x_i\, p_i \quad\text{or}\quad \mathbb{E}[X] = \int x\, f(x)\,dx$$

is the probability-weighted average — and in finance, it has a concrete meaning: **the fair price of a bet paying $X$** (ignoring discounting and risk premia). If a coin flip pays \$1 on heads, the fair price is \$0.50. Derivative pricing generalizes exactly this idea: a derivative's value is a (discounted, risk-adjusted) expectation of its payoff. Hold onto that; it becomes risk-neutral valuation later.

The single most-used tool in interview brainteasers is **linearity of expectation**:

$$\mathbb{E}[aX + bY] = a\,\mathbb{E}[X] + b\,\mathbb{E}[Y]$$

which holds **even when $X$ and $Y$ are dependent**. Classic pattern: "expected number of fixed points of a random permutation of $n$ items." Define indicator $I_k = 1$ if item $k$ is fixed; $\mathbb{E}[I_k] = 1/n$, so the answer is $n \cdot 1/n = 1$ — no dependence analysis needed. If a brainteaser asks for an expected count, reach for indicators first.

## Variance, covariance, correlation

Variance measures dispersion — in finance, **risk**:

$$\mathrm{Var}(X) = \mathbb{E}[(X - \mathbb{E}X)^2] = \mathbb{E}[X^2] - (\mathbb{E}X)^2.$$

Covariance measures co-movement:

$$\mathrm{Cov}(X,Y) = \mathbb{E}[XY] - \mathbb{E}[X]\mathbb{E}[Y], \qquad \rho_{XY} = \frac{\mathrm{Cov}(X,Y)}{\sigma_X \sigma_Y} \in [-1, 1].$$

The variance of a sum is where portfolios come from:

$$\mathrm{Var}(X + Y) = \mathrm{Var}(X) + \mathrm{Var}(Y) + 2\,\mathrm{Cov}(X, Y).$$

Unlike expectation, variance is **not** linear — the cross term is precisely why diversification works (covariances below $\sigma_X\sigma_Y$ shrink total risk).

## Independence vs. uncorrelated — a favorite trap

Independence means the joint distribution factorizes: $\mathbb{P}(X \in A, Y \in B) = \mathbb{P}(X \in A)\,\mathbb{P}(Y \in B)$. Independence $\Rightarrow$ zero correlation, but **not conversely**. Standard counterexample to have ready: $X \sim N(0,1)$, $Y = X^2$. Then $\mathrm{Cov}(X, Y) = \mathbb{E}[X^3] = 0$, yet $Y$ is a deterministic function of $X$. Correlation only detects **linear** dependence. This matters practically: asset returns can be uncorrelated day-to-day yet have strongly dependent volatilities (vol clustering).

One clean exception worth quoting: for **jointly normal** variables, uncorrelated does imply independent.

## Conditional expectation and the tower property

$\mathbb{E}[X \mid \mathcal{F}]$ is the best estimate of $X$ given information $\mathcal{F}$ — think of it as a random variable that has "averaged out" everything you don't yet know. The tower property (law of iterated expectations):

$$\mathbb{E}\big[\,\mathbb{E}[X \mid \mathcal{F}]\,\big] = \mathbb{E}[X].$$

Intuition: averaging your conditional forecasts over scenarios recovers the unconditional forecast. This is the engine behind martingale pricing ("today's price is the conditional expectation of tomorrow's") and behind solving multi-stage brainteasers by conditioning on the first step. Example: expected number of coin flips to get the first head — condition on flip one: $\mathbb{E}[N] = 1 + \tfrac{1}{2}\mathbb{E}[N] \Rightarrow \mathbb{E}[N] = 2$.

## LLN vs. CLT — and why CLT underpins everything

Let $X_1, X_2, \dots$ be i.i.d. with mean $\mu$, variance $\sigma^2$, and $\bar{X}_N = \frac{1}{N}\sum X_i$.

- **Law of Large Numbers:** $\bar{X}_N \to \mu$. The sample mean converges to the truth. It tells you Monte Carlo *works*, but not how fast.
- **Central Limit Theorem:** $\sqrt{N}\,(\bar{X}_N - \mu) \Rightarrow N(0, \sigma^2)$, i.e.

$$\bar{X}_N \approx \mu + \frac{\sigma}{\sqrt{N}}\, Z, \quad Z \sim N(0,1).$$

The CLT tells you the *error distribution*. Two enormous consequences:

1. **Monte Carlo error $\propto 1/\sqrt{N}$.** To halve your pricing error you need $4\times$ the paths. Interviewers love asking this. (It also motivates variance reduction: shrink $\sigma$ instead of growing $N$.)
2. **Parametric VaR.** Aggregated P&L across many positions is approximately normal, so risk becomes a quantile of a normal — the basis of the classic VaR formula.

Distinguish them crisply: LLN is about *convergence of the point estimate*; CLT is about *the fluctuations around it*.

## Normal and lognormal — why prices are lognormal

The normal $N(\mu, \sigma^2)$ has density $f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-(x-\mu)^2 / 2\sigma^2}$ and is closed under addition: sums of independent normals are normal.

$Y$ is **lognormal** if $\ln Y \sim N(\mu, \sigma^2)$. Why model prices this way?

- **Prices can't go negative**; a lognormal is supported on $(0,\infty)$.
- **Returns compound multiplicatively.** $S_T = S_0 \prod (1 + r_i)$, so $\ln S_T = \ln S_0 + \sum \ln(1+r_i)$: log-price is a *sum* of small shocks, hence approximately normal by the CLT — making the price itself lognormal.

A fact interviewers probe: if $\ln Y \sim N(\mu, \sigma^2)$ then

$$\mathbb{E}[Y] = e^{\mu + \sigma^2/2} \;>\; e^{\mu} = e^{\,\mathbb{E}[\ln Y]}.$$

The $\sigma^2/2$ is Jensen's inequality at work ($e^x$ is convex) and is the same correction that appears in the GBM solution as $-\sigma^2/2$.

## Moment generating functions — the intuition

$M_X(t) = \mathbb{E}[e^{tX}]$ packages every moment into one function: $\mathbb{E}[X^n] = M_X^{(n)}(0)$. Two reasons quants care:

- **Sums become products:** for independent $X, Y$, $M_{X+Y}(t) = M_X(t)\,M_Y(t)$ — the slick way to prove sums of normals are normal.
- The normal MGF $M(t) = e^{\mu t + \sigma^2 t^2 / 2}$ evaluated at $t=1$ *is* the lognormal mean above — one identity, used constantly in pricing.

## Interview brainteaser patterns

- **Indicators + linearity** for any "expected number of …" question.
- **Condition on the first step** for expected waiting times and recursive setups.
- **Symmetry** before computation (e.g., $\mathbb{P}(X > Y) = 1/2$ for i.i.d. continuous $X, Y$).
- **Check independence claims** — most traps hinge on assuming it where it doesn't hold.

## Interview checkpoints

- Linearity of expectation holds with **no independence needed** — my first move on any "expected count" is indicator variables.
- Uncorrelated $\ne$ independent; counterexample $X \sim N(0,1)$, $Y = X^2$; the converse *does* hold for jointly normal variables.
- Tower property: $\mathbb{E}[\mathbb{E}[X \mid \mathcal{F}]] = \mathbb{E}[X]$ — the backbone of martingale pricing and first-step conditioning.
- LLN says the Monte Carlo estimate converges; CLT says the error is $\sim \sigma/\sqrt{N}$ — halving error costs $4\times$ the paths.
- Prices are modeled lognormal because they're positive and log-returns add, so CLT normalizes the log.
- $\mathbb{E}[e^X] = e^{\mu + \sigma^2/2}$ for $X \sim N(\mu, \sigma^2)$ — Jensen's convexity correction that reappears in Black-Scholes.
