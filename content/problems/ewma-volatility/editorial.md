# Editorial

The whole estimator is three doubles of state: $\lambda$, $\sigma_t^2$, and (here) the running peak. That frugality is the point — no window to store, no history to age out, one multiply-add per observation.

## Why exponential weighting

A hard window (say, 20 days) gives every day inside it equal weight and day 21 *zero* weight — so vol estimates jump when a big return **falls out** of the window ("ghosting"), an artifact with no market meaning. EWMA decays smoothly: day-$k$-ago's weight is $(1-\lambda)\lambda^k$. With RiskMetrics' $\lambda = 0.94$, the half-life is $\ln 2 / \ln(1/0.94) \approx 11$ days — responsive to regime shifts yet stable through noise.

## Small implementation notes that generalize

- Track the max of $\sigma_t^2$ and take one square root at the end (monotonicity of $\sqrt{\cdot}$) — cheaper and immune to needless rounding.
- The recursion is *inherently sequential*: today depends on yesterday. You cannot parallelize it naively — worth saying in an interview when asked "how would you speed this up?" (Answer: across symbols, not across time.)
- Annualization multiplies **variance** by 252, not volatility — i.e. vol scales with $\sqrt{252} \approx 15.87$. Mixing these up is a classic sanity-check failure: daily 1% vol should annualize to ~16%, not 252%.

## Where this sits in the model zoo

EWMA is GARCH(1,1) with $\omega = 0$ and $\alpha + \beta = 1$ — the boundary case with **no mean reversion**: shocks persist forever in expectation and the long-run variance is undefined. GARCH adds a floor ($\omega$) and pull toward it. When an interviewer asks "what's wrong with EWMA?", that's the answer they want: no unconditional variance, forecasts are flat at the current level, and $\lambda$ is imposed rather than estimated.
