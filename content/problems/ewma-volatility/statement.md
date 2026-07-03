Implement the **RiskMetrics EWMA volatility estimator** — the recursion that powered an entire generation of risk systems and still runs inside most of them.

Given daily returns $r_1, \dots, r_N$ and decay factor $\lambda$, the variance estimate evolves as:

$$\sigma_1^2 = r_1^2, \qquad \sigma_t^2 = \lambda\, \sigma_{t-1}^2 + (1 - \lambda)\, r_t^2 \quad (t \ge 2)$$

The **annualized volatility** on day $t$ is $\sqrt{252\, \sigma_t^2}$.

## Input

- Line 1: $\lambda$ and $N$ ($0.5 \le \lambda \le 0.999$, $2 \le N \le 10^6$)
- Line 2: $N$ daily returns as decimals (e.g. `-0.0231` = −2.31%)

## Output

Two lines, each rounded to 6 decimal places:

1. The final annualized volatility, $\sqrt{252\,\sigma_N^2}$
2. The **peak** annualized volatility over all days, $\max_t \sqrt{252\,\sigma_t^2}$

## Notes

The recursion is sequential by definition — process the stream in one pass with $O(1)$ state. This estimator needs no return history, which is exactly why risk systems love it.
