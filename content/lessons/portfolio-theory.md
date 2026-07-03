---
title: Portfolio Theory & CAPM
minutes: 15
---

Modern portfolio theory (Markowitz, 1952) formalizes one idea: **risk is a property of the portfolio, not of the individual asset**. What matters about a stock is not its own volatility, but what it does to the whole. This lesson builds from portfolio variance to the CAPM, then to the caveats that make this an active engineering problem — which is where quant devs come in.

## Portfolio risk and the free lunch

Let $w \in \mathbb{R}^n$ be portfolio weights, $\mu$ the vector of expected returns, and $\Sigma$ the covariance matrix of returns. Then

$$\mathbb{E}[R_p] = w^\top \mu, \qquad \sigma_p^2 = w^\top \Sigma w = \sum_{i,j} w_i w_j \sigma_i \sigma_j \rho_{ij}.$$

Expected return is linear in weights; risk is **quadratic** and depends on correlations. That asymmetry is the entire subject.

**Diversification** is the consequence. For $n$ equally-weighted assets with common variance $\sigma^2$ and pairwise correlation $\rho$:

$$\sigma_p^2 = \frac{\sigma^2}{n} + \left(1 - \frac{1}{n}\right)\rho\sigma^2 \;\xrightarrow{n\to\infty}\; \rho\sigma^2.$$

Idiosyncratic risk (the $\sigma^2/n$ term) diversifies away for free; **systematic risk (the correlated part) does not**. "Diversification is the only free lunch in finance" — you reduce risk without giving up expected return. But the floor $\rho\sigma^2$ is why 2008-style events hurt: correlations spike toward 1 exactly when you need diversification most.

## The efficient frontier

Minimize $w^\top \Sigma w$ subject to a target return $w^\top\mu = \bar{r}$ (and $w^\top \mathbf{1} = 1$). Tracing out solutions over $\bar{r}$ gives a hyperbola in (risk, return) space; its upper branch is the **efficient frontier** — portfolios where you cannot get more return without more risk. Everything below it is dominated. The math is a quadratic program with linear constraints, solvable in closed form via Lagrange multipliers — a favorite whiteboard exercise.

## Add a risk-free asset: the CML and two-fund separation

Introduce an asset with return $r_f$ and zero variance. Mixing it with any risky portfolio traces a **straight line** in (σ, return) space. The best such line is the one tangent to the efficient frontier — the **capital market line**:

$$\mathbb{E}[R_p] = r_f + \frac{\mathbb{E}[R_T] - r_f}{\sigma_T}\,\sigma_p,$$

where $T$ is the **tangency portfolio**. This yields **two-fund separation**: every investor, regardless of risk appetite, should hold the *same* risky portfolio $T$ and merely adjust the mix with cash (or leverage). Risk preference changes the dose, not the recipe.

The slope of that line is the **Sharpe ratio**:

$$\text{Sharpe} = \frac{\mathbb{E}[R_p] - r_f}{\sigma_p}$$

— excess return per unit of risk, the standard currency for comparing strategies. (Know the annualization: multiply a daily Sharpe by $\sqrt{252}$.)

## CAPM

If everyone does the mean-variance math with the same inputs, the tangency portfolio must be the **market portfolio** (markets have to clear), and an equilibrium pricing relation follows:

$$\mathbb{E}[R_i] - r_f = \beta_i\,\big(\mathbb{E}[R_m] - r_f\big), \qquad \beta_i = \frac{\mathrm{Cov}(R_i, R_m)}{\mathrm{Var}(R_m)}.$$

Read it as: **only systematic risk is compensated**. Idiosyncratic risk can be diversified away, so the market pays you nothing for bearing it. An asset's fair excess return is proportional to how much market risk it adds.

$\beta_i$ is precisely the **slope of the regression** of the asset's excess returns on the market's:

$$R_i - r_f = \alpha_i + \beta_i (R_m - r_f) + \varepsilon_i.$$

The intercept $\alpha$ is return **not explained by market exposure** — under CAPM it should be zero for everything. "Alpha" in industry speech means exactly this residual: performance beyond what your factor exposures would earn passively. When someone claims alpha, the first question is "against which betas?" — plenty of claimed alpha is just unpriced beta to a missing factor.

## Critiques and reality

- **Estimation error dominates.** $\mu$ is nearly impossible to estimate from historical data (standard error of a mean shrinks like $1/\sqrt{T}$ in *years*), and the optimizer is an "error maximizer": it loads up on assets whose returns are overestimated. Naive Markowitz out-of-sample often loses to equal weighting.
- **Covariance at scale.** With $n$ assets you need $n(n+1)/2$ covariance entries; for $n = 3000$ that's ~4.5M parameters from limited data. The sample covariance matrix is singular when $n > T$. Fixes: **shrinkage** (Ledoit-Wolf), **factor models** ($\Sigma = B \Sigma_f B^\top + D$ with $k \ll n$ factors, reducing parameters to $\mathcal{O}(nk)$ and making $\Sigma$ well-conditioned and fast to invert).
- **CAPM empirically fails** in detail: low-beta stocks earn more than they should, and value/size/momentum effects persist — motivating **multi-factor models** (Fama-French, and the factor zoo beyond). CAPM survives as the *language* (beta, alpha, systematic vs idiosyncratic), not as the final model.

## Why quant devs should care

Portfolio construction is a systems problem: building and inverting large covariance matrices (never invert explicitly — Cholesky-solve), running constrained quadratic optimizers fast enough for daily or intraday rebalance, computing factor exposures across thousands of names, and handling missing/asynchronous data. Interviewers use this material to test whether you can connect linear algebra to money: e.g., "your optimizer wants a 40x leveraged position — what went wrong?" (answer: near-singular $\Sigma$ or noise in $\mu$).

## Interview checkpoints

- Write $\sigma_p^2 = w^\top \Sigma w$ and explain why correlation, not individual volatility, drives portfolio risk.
- The equal-weight limit $\sigma_p^2 \to \rho\sigma^2$: idiosyncratic risk diversifies away, systematic risk doesn't.
- Two-fund separation: risk-free asset + tangency portfolio; the CML's slope is the max Sharpe ratio (annualize daily by $\sqrt{252}$).
- State CAPM, define beta as a regression slope, define alpha as the intercept — and be ready for "is that alpha or hidden beta?"
- Know why naive Markowitz fails in practice: $\mu$ estimation error, ill-conditioned sample covariance; name shrinkage and factor models as fixes.
- Connect to engineering: factor models compress $\Sigma$ from $\mathcal{O}(n^2)$ to $\mathcal{O}(nk)$ parameters and make optimization tractable at scale.
