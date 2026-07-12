The smallest Markowitz problem there is — two assets — solved in closed form. It's the *Portfolio Theory & CAPM* lesson's math made concrete, and the arithmetic version of the diversification free lunch.

For assets with volatilities $\sigma_1, \sigma_2$, correlation $\rho$, and expected returns $\mu_1, \mu_2$, a portfolio with weight $w$ in asset 1 (and $1-w$ in asset 2) has:

$$\mu_p = w\mu_1 + (1-w)\mu_2$$
$$\sigma_p^2 = w^2\sigma_1^2 + (1-w)^2\sigma_2^2 + 2w(1-w)\rho\sigma_1\sigma_2$$

Minimizing $\sigma_p^2$ over $w$ (set the derivative to zero) gives the **minimum-variance weight**:

$$w^* = \frac{\sigma_2^2 - \rho\sigma_1\sigma_2}{\sigma_1^2 + \sigma_2^2 - 2\rho\sigma_1\sigma_2}$$

Weights may be negative (a short position) — do **not** clamp them.

## Input

First line: $Q$ ($1 \le Q \le 1000$). Each of the next $Q$ lines: `mu1 sigma1 mu2 sigma2 rho` (decimals; $0.01 \le \sigma_i \le 1$, $-0.95 \le \rho \le 0.95$, $-0.2 \le \mu_i \le 0.4$; the denominator is bounded away from zero).

## Output

For each query, one line with three values rounded to 6 decimals: `w* mu_p sigma_p` — the minimum-variance weight in asset 1, and the resulting portfolio return and volatility.

## Check yourself

With $\sigma_1 = \sigma_2$ and any $\rho$, symmetry forces $w^* = 0.5$. With $\rho = -1$, the minimum-variance portfolio has $\sigma_p = 0$ — the perfect hedge from the lesson.
