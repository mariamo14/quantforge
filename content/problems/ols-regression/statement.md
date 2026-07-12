Fit the workhorse of quantitative finance: **ordinary least squares** on two return series — asset returns $y$ against market returns $x$. The slope is the hedge ratio (beta), and computing it *stably* is the point.

## The formulas (compute via deviations — see below)

$$\beta = \frac{\sum_i (x_i - \bar{x})(y_i - \bar{y})}{\sum_i (x_i - \bar{x})^2} \qquad \alpha = \bar{y} - \beta\bar{x}$$

$$R^2 = \frac{\left[\sum_i (x_i - \bar{x})(y_i - \bar{y})\right]^2}{\sum_i (x_i - \bar{x})^2 \cdot \sum_i (y_i - \bar{y})^2}$$

**Required approach:** two passes — compute $\bar x, \bar y$ first, then accumulate the three deviation sums. The one-pass "raw sums" shortcut ($\sum xy - n\bar x\bar y$ etc.) suffers exactly the catastrophic cancellation you met in the Welford problem, and the hidden tests include data with large means and tiny variation to punish it.

## Input

- Line 1: $N$ ($3 \le N \le 10^6$)
- Line 2: $N$ values of $x$ (market returns, decimals)
- Line 3: $N$ values of $y$ (asset returns, decimals)

$\sum(x_i - \bar x)^2$ is guaranteed nonzero.

## Output

One line: `beta alpha r2`, each rounded to 6 decimal places.

## Reading the result

$\beta = 1.3$ means the asset moves 1.3% per 1% market move — and shorting $1.3 \times$ notional of the market hedges it. $R^2$ says how much of the asset's variance that hedge removes.
