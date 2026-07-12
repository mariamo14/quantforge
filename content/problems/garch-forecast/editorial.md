# Editorial

Same one-pass shape as EWMA, two upgrades: a floor ($\omega$) and mean reversion ($\alpha + \beta < 1$). Those two constants change the model's personality entirely.

## The timing subtlety that catches people

Day $t$'s variance is a **forecast made with day $t-1$'s information**: $\sigma_t^2$ uses $r_{t-1}$, not $r_t$. Get this wrong (using today's return in today's variance) and you've built a model that peeks — the same lookahead sin the ML lesson warns about, in miniature. The loop structure here (update from `prevReturn` *before* storing the new return) encodes the timing correctly.

## Why the forecast formula works

Take expectations of the recursion: tomorrow's expected variance is $\omega + \phi \sigma^2$ with $\phi = \alpha + \beta$. Iterate $k$ times and the deviation from the long-run level $\bar\sigma^2 = \omega/(1-\phi)$ shrinks by $\phi$ each day — geometric decay:

$$\sigma_{N+k}^2 - \bar\sigma^2 = \phi^{\,k-1}(\sigma_{N+1}^2 - \bar\sigma^2)$$

With typical equity fits ($\phi \approx 0.98$), the half-life is $\ln 2/\ln(1/0.98) \approx 34$ days — vol shocks fade over weeks, not days. EWMA is the $\phi = 1$ boundary: shocks never fade, forecasts stay flat forever. The forecast line of this problem is precisely the feature EWMA can't produce.

## Term structures from one recursion

Averaging the $k$-step forecasts over $k = 1..21$ gives the model's 1-month vol forecast — compare it to 1-month implied vol and you have the crudest version of a variance-risk-premium signal. Interviewers like asking how you'd get a *term structure* out of GARCH; this formula is the answer.

## Numerics

All sequential multiply-adds on doubles — deterministic across correct implementations. `std::pow(phi, k-1)` with $k \le 252$ is safe; for $\phi^k$ with huge $k$ you'd use `exp(k*log(phi))` awareness, worth mentioning aloud.
