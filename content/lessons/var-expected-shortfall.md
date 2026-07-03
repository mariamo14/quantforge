---
title: VaR & Expected Shortfall
minutes: 12
---

Risk management needs to compress "how bad can it get?" into a number a desk head, a regulator, and a limit system can all use. Value-at-Risk (VaR) is that number; Expected Shortfall (ES) is its better-behaved successor. Interviewers probe whether you know the *precise definitions*, the three ways to compute them, and — most importantly — where VaR quietly lies to you.

## VaR: the definition (get the convention right)

**VaR at confidence level $\alpha$ over horizon $h$** is the loss threshold that losses exceed with probability only $1-\alpha$. Writing $L$ for the loss over the horizon (loss positive):

$$\text{VaR}_\alpha = \inf\{\ell : \mathbb{P}(L > \ell) \le 1-\alpha\}$$

— the $\alpha$-quantile of the **loss distribution**. "1-day 99% VaR of \$10M" means: on 99% of days we expect to lose less than \$10M; on ~1 day in 100, more. Two conventions trip people up in interviews: (1) VaR is quoted as a positive loss number; (2) always state the horizon *and* the confidence level — "our VaR is \$10M" is meaningless without both. Scaling rule of thumb: under i.i.d. normal returns, $h$-day VaR ≈ 1-day VaR × $\sqrt{h}$ (and know that this breaks under autocorrelation and vol clustering).

## Three ways to compute it

**1. Parametric (variance-covariance).** Assume portfolio P&L is normal with volatility $\sigma$ over the horizon. Then

$$\text{VaR}_\alpha = z_\alpha\,\sigma\,V,$$

with $z_{0.99} \approx 2.33$, $z_{0.95} \approx 1.645$, $V$ the portfolio value, and $\sigma$ typically from $\sqrt{w^\top\Sigma w}$. *Pros:* fast, analytic, easy to decompose into per-asset contributions. *Cons:* the normality assumption is exactly wrong in the tail — fat tails mean parametric VaR **understates** extreme risk; also poor for nonlinear positions (options), where delta-normal misses gamma.

**2. Historical simulation.** Replay the last $N$ days (e.g. 500) of market moves through today's portfolio, get $N$ hypothetical P&Ls, take the empirical quantile. *Pros:* no distributional assumption; captures fat tails and cross-asset dependence *as they occurred*; handles nonlinearity if you fully reprice. *Cons:* you only know history — if the window is calm, VaR is calm; it responds sluggishly to regime changes; the tail estimate rests on a handful of observations (the 99% quantile of 500 days is the 5th worst day).

**3. Monte Carlo.** Specify a model for risk-factor dynamics (which can include fat tails, stochastic vol, jumps), simulate thousands of paths, fully reprice the portfolio on each, take the quantile. *Pros:* most flexible; handles path-dependence and nonlinearity; you choose the distribution. *Cons:* computationally heavy (repricing a big options book × 100k scenarios is a real engineering problem — this is where quant devs live), and it's only as good as the model: garbage dynamics in, precise-looking garbage out.

## Where VaR fails

**Blind beyond the quantile.** VaR tells you the *threshold*, not what happens past it. Two books can share a \$10M 99% VaR while one loses \$11M in the bad 1% and the other loses \$500M. VaR literally cannot see the difference — and traders can (and did) exploit this by selling deep tail risk that boosts P&L while leaving VaR untouched.

**Not subadditive.** A risk measure should reward diversification: $\rho(A + B) \le \rho(A) + \rho(B)$. VaR can violate this. Tiny example: two independent bonds, each defaulting with probability 4% for a loss of 100 (else 0). At 95%: each bond alone has $\mathbb{P}(L > 0) = 4\% \le 5\%$, so $\text{VaR}_{95\%} = 0$. The portfolio of both defaults at least once with probability $1 - 0.96^2 \approx 7.8\% > 5\%$, so its VaR is 100. **Combined VaR (100) > sum of individual VaRs (0)** — diversification apparently *increased* risk. That's a broken measure: it means desk-level VaR limits don't safely aggregate to a firm-level number.

## Expected Shortfall

Fix both flaws by averaging over the tail instead of stopping at its edge:

$$\text{ES}_\alpha = \mathbb{E}\big[\,L \mid L > \text{VaR}_\alpha\,\big]$$

— the **expected loss given that you're in the bad tail** (also called CVaR; the fully rigorous form averages VaR levels across the tail, which handles discrete distributions). ES answers "when it's bad, how bad on average?" and it is a **coherent** risk measure: subadditive, monotonic, positively homogeneous, translation-invariant. In particular diversification never increases ES, so tail-risk limits aggregate sensibly. For a normal distribution, $\text{ES}_\alpha = \sigma V\,\phi(z_\alpha)/(1-\alpha)$ — e.g. 97.5% ES ≈ 99% VaR under normality, which is exactly why regulators chose that calibration.

## Backtesting

A VaR model makes a falsifiable claim: 99% 1-day VaR should be **exceeded on about 1% of days**. Backtesting counts exceptions ("breaches") over, say, 250 trading days and asks whether the count is statistically consistent with 1% (~2.5 expected) — a binomial test. Too many breaches → model understates risk; suspiciously few → too conservative (capital wasted). Also check **independence**: breaches clustering in one week means the model misses vol dynamics even if the annual count looks fine. Basel's traffic-light system (green/yellow/red zones by breach count) formalizes this. ES is harder to backtest directly (it's not "elicitable"), which is why practice backtests the VaR levels underpinning it.

**The regulatory one-liner to know:** under the Fundamental Review of the Trading Book (FRTB), Basel moved the market-risk capital standard from 99% VaR to **97.5% Expected Shortfall** — precisely because ES sees tail severity and aggregates coherently.

## Interview checkpoints

- Define VaR precisely as a loss quantile, with horizon and confidence level; know $z_{0.99} \approx 2.33$, $z_{0.95} \approx 1.645$ and $\text{VaR} = z_\alpha \sigma V$.
- Compare parametric vs historical vs Monte Carlo: speed vs realism vs modeling burden; which handles option nonlinearity.
- Explain the two VaR flaws: says nothing beyond the quantile; not subadditive — and reproduce the two-bond counterexample from scratch.
- Define $\text{ES} = \mathbb{E}[L \mid L > \text{VaR}]$ and list the coherence axioms, especially subadditivity.
- Backtesting = counting breaches vs binomial expectation, plus independence of breaches.
- One-liner: Basel FRTB replaced 99% VaR with 97.5% ES for market-risk capital.
