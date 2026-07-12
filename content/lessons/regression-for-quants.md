---
title: Regression for Quants
minutes: 15
---

**Builds on:** *Random Variables & Expected Value*, *Portfolio Theory & CAPM*.

Regression is the workhorse of quantitative finance. Hedge ratios, factor models, pairs trades, signal research — underneath, almost all of it is one idea: fit a line, study what the line explains, and study what it doesn't.

## OLS from first principles

We have paired observations $(x_i, y_i)$, $i = 1, \dots, n$ — say $x$ is the daily return of an index and $y$ the daily return of a stock. We model

$$y = \alpha + \beta x + \varepsilon$$

and choose $\alpha$ (the intercept) and $\beta$ (the slope) to minimize the **sum of squared errors**:

$$S(\alpha, \beta) = \sum_{i=1}^{n} \left( y_i - \alpha - \beta x_i \right)^2.$$

This is *ordinary least squares* (OLS). Set both partial derivatives to zero. First, $\partial S / \partial \alpha = -2 \sum_i (y_i - \alpha - \beta x_i) = 0$ gives

$$\alpha = \bar y - \beta \bar x,$$

where $\bar x$ and $\bar y$ are the sample means — the fitted line passes through the point of means $(\bar x, \bar y)$. Substituting into $\partial S / \partial \beta = -2 \sum_i x_i (y_i - \alpha - \beta x_i) = 0$ and simplifying yields

$$\beta = \frac{\sum_i (x_i - \bar x)(y_i - \bar y)}{\sum_i (x_i - \bar x)^2} = \frac{\text{Cov}(x, y)}{\text{Var}(x)}.$$

Name every term: $\text{Cov}(x, y)$ is the sample covariance — how $x$ and $y$ move together; $\text{Var}(x)$ is the sample variance of the regressor — how much $x$ moves at all. So $\beta$ is *co-movement per unit of $x$'s own movement*: how many units $y$ moves, on average, when $x$ moves one unit. And $\alpha$ is whatever average level of $y$ is left over once $\beta x$ is accounted for — in finance, the return not explained by the benchmark.

## $R^2$: fraction of variance explained

Decompose the variance of $y$ into the part the line captures and the residual part. Define fitted values $\hat y_i = \alpha + \beta x_i$ and residuals $e_i = y_i - \hat y_i$. Then

$$R^2 = 1 - \frac{\sum_i e_i^2}{\sum_i (y_i - \bar y)^2},$$

the **fraction of $y$'s variance explained by the model**. For simple (one-regressor) OLS with an intercept, there is a clean identity:

$$R^2 = \rho^2,$$

the square of the correlation between $x$ and $y$. A stock with $\rho = 0.7$ to the index has $R^2 = 0.49$: about half its variance is market; the other half is idiosyncratic. That residual half is where stock-specific alpha (or hedged risk) lives.

## Why quants live on regression

**Hedge ratios are betas.** To hedge asset A with asset B, you want the position in B that minimizes the variance of the combined book. That minimizer is exactly the OLS slope: hedge ratio $= \beta_{A|B} = \text{Cov}(r_A, r_B)/\text{Var}(r_B)$. This is the same $\beta$ as in the CAPM lesson — CAPM's market beta is just the regression of an asset's excess returns on the market's, and "beta-hedging" a portfolio means shorting $\beta$ units of the index per unit of portfolio.

**Pairs trading is a regression residual.** Regress the price (or log-price) of A on B; the residual $e_t = A_t - \alpha - \beta B_t$ is the *spread*. If the pair is genuinely cointegrated, the spread mean-reverts: trade it when it stretches, unwind when it snaps back. The regression defines both the hedge ratio ($\beta$ units of B per unit of A) and the signal (the residual's z-score).

**Factor models are multiple regression.** Fama–French, Barra-style risk models, and every "smart beta" product regress asset returns on a handful of factor returns (market, size, value, momentum, ...). The loadings are betas, the factor part is the systematic risk you can hedge or harvest, and the residual is idiosyncratic return. One regression, run cross-sectionally or in time series, is the backbone of risk decomposition at essentially every fund.

**Residuals are the de-trended signal.** This is the general pattern: regression splits $y$ into "explained by things I know" and "everything else." The everything-else — the residual — is $y$ with the known effects stripped out. Signal research is largely the craft of regressing out the boring parts (market, sector, known factors) and hunting for structure in what remains.

## The traps interviewers probe

**Correlation is not causation.** A significant $\beta$ means $x$ and $y$ co-move in your sample. It does not mean $x$ drives $y$ — both may load on a common factor, or the relationship may be an artifact of the period. Regression describes; it does not explain.

**Outliers dominate squared loss.** Squaring errors means one point with a 10-sigma residual contributes as much as a hundred 1-sigma points. One bad print — a fat-fingered tick, an unadjusted split — can move your beta materially. One-liner on remedies: robust alternatives exist — least absolute deviations ($L_1$), Huber loss, or simply winsorizing/clipping returns before fitting — all of which cap the influence any single observation can have.

**Non-stationarity: beta drifts.** The beta of a stock to the index is not a constant of nature; leverage, business mix, and regimes change it. A beta estimated over five years may badly describe next month. Standard practice: estimate on **rolling windows** (recompute over the trailing $k$ observations) or with **EWMA weighting** (exponentially down-weight old data), and watch the estimate's trajectory, not just its level.

**Overlapping returns inflate significance.** If you regress weekly returns sampled daily (each observation shares four days with the next), consecutive observations are mechanically autocorrelated. Naive standard errors assume independent errors, so they come out far too small and $t$-statistics far too large — you'll "discover" relationships that aren't there. Use non-overlapping periods, or correct the standard errors (Newey–West / HAC).

**In-sample vs out-of-sample.** Same discipline as the ML lesson: a fit evaluated on the data that produced it is flattery, not evidence. Hold out data (or walk forward in time — never shuffle time series), fit on the past, evaluate on the future. A hedge ratio, like a model, is only as good as its out-of-sample performance.

## Numerical hygiene

Textbook shortcut formulas like $\text{Cov} = \frac{1}{n}\sum x_i y_i - \bar x \bar y$ subtract two large, nearly equal numbers when the data has a big mean relative to its spread (prices, timestamps) — **catastrophic cancellation** can wipe out every significant digit. Compute via **deviations from means** instead:

```cpp
// Two-pass: numerically safe simple OLS
double xbar = mean(x), ybar = mean(y);
double sxy = 0.0, sxx = 0.0;
for (size_t i = 0; i < n; ++i) {
    double dx = x[i] - xbar;
    sxy += dx * (y[i] - ybar);
    sxx += dx * dx;
}
double beta  = sxy / sxx;
double alpha = ybar - beta * xbar;
```

For streaming data, this is the same lesson as Welford's algorithm for variance: maintain running means and update centered sums incrementally, never accumulate raw $\sum x^2$ and subtract at the end.

## Multiple regression in three sentences

With $k$ regressors, stack them into an $n \times k$ matrix $X$ (one column per regressor, typically including a column of ones for the intercept) and the model becomes $y = X\beta + \varepsilon$ with the closed-form OLS solution $\hat\beta = (X^T X)^{-1} X^T y$. In practice you never form the inverse explicitly: you solve the linear system $(X^T X)\hat\beta = X^T y$ — via Cholesky factorization of the symmetric positive-definite matrix $X^T X$ (or, more stably, a QR factorization of $X$ itself) — because solving is cheaper and more numerically accurate than inverting, and explicit inverses amplify error when $X^T X$ is ill-conditioned (collinear regressors). Everything from the simple case carries over: coefficients are partial betas ("effect of $x_j$ holding the others fixed"), and the residual is $y$ with all $k$ effects regressed out.

## Interview checkpoints

- Derive simple OLS: minimize $\sum (y_i - \alpha - \beta x_i)^2$ to get $\beta = \text{Cov}(x,y)/\text{Var}(x)$ and $\alpha = \bar y - \beta \bar x$, and explain what each term measures.
- What is $R^2$, and what is its relationship to correlation in simple OLS? ($R^2$ = fraction of variance explained; $R^2 = \rho^2$ with one regressor and an intercept.)
- Why is the minimum-variance hedge ratio a regression beta, and how does that connect to CAPM? ($\beta = \text{Cov}/\text{Var}$ minimizes hedged variance; CAPM beta is the same regression against the market.)
- Name the classic regression traps: outliers under squared loss, drifting betas (rolling/EWMA), overlapping returns inflating $t$-stats, and correlation ≠ causation.
- Numerics: why compute covariance via deviations from means, and why Cholesky-solve $(X^TX)\hat\beta = X^Ty$ instead of inverting $X^TX$?
