Upgrade your EWMA tracker to the model that actually gets fitted on desks: **GARCH(1,1)**, which adds what EWMA lacks — a long-run level that volatility is pulled back toward.

$$\sigma_t^2 = \omega + \alpha\, r_{t-1}^2 + \beta\, \sigma_{t-1}^2$$

Seed with the long-run variance: $\sigma_1^2 = \dfrac{\omega}{1 - \alpha - \beta}$ (guaranteed $\alpha + \beta < 1$). Note the timing: day $t$'s variance uses day $t-1$'s return — today's forecast is made *before* today's return arrives.

Additionally, produce the **$k$-step-ahead forecast** after the last observation. With $\bar\sigma^2 = \omega/(1-\alpha-\beta)$ and persistence $\phi = \alpha + \beta$:

$$\sigma_{N+k}^2 = \bar\sigma^2 + \phi^{\,k-1}\left(\sigma_{N+1}^2 - \bar\sigma^2\right), \qquad \sigma_{N+1}^2 = \omega + \alpha r_N^2 + \beta \sigma_N^2$$

## Input

- Line 1: `omega alpha beta N k` ($10^{-8} \le \omega \le 10^{-4}$, $\alpha, \beta > 0$, $\alpha + \beta \le 0.999$, $2 \le N \le 10^6$, $1 \le k \le 252$)
- Line 2: $N$ daily returns (decimals)

## Output

Three lines, each an **annualized volatility** $\sqrt{252 \sigma^2}$ rounded to 6 decimals:

1. $\sigma_N^2$ — the model's variance on the last observed day
2. $\max_t \sigma_t^2$ — the peak over the sample
3. $\sigma_{N+k}^2$ — the $k$-step-ahead forecast

## Notes

The recursion is strictly sequential — one pass, $O(1)$ state, exactly like the EWMA problem. The forecast line is where GARCH differs from EWMA: it decays geometrically toward the long-run level instead of staying flat.
