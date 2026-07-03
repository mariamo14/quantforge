Price a European call by **Monte Carlo simulation** under geometric Brownian motion. To keep the answer deterministic (and to test the finance, not the RNG), the standard normal draws are **given to you** in the input.

Under the risk-neutral measure, the terminal price for draw $Z_i$ is:

$$S_T^{(i)} = S_0 \exp\left(\left(r - \frac{\sigma^2}{2}\right) T + \sigma \sqrt{T}\, Z_i\right)$$

The Monte Carlo estimate of the call price is the discounted average payoff:

$$\hat{C} = e^{-rT} \cdot \frac{1}{N} \sum_{i=1}^{N} \max\!\left(S_T^{(i)} - K,\, 0\right)$$

Also report the **standard error** of the estimator:

$$\text{SE} = e^{-rT} \cdot \frac{s}{\sqrt{N}}$$

where $s$ is the *sample* standard deviation (divide by $N-1$) of the undiscounted payoffs.

## Input

- Line 1: `S0 K r sigma T` (decimals; same ranges as the Black-Scholes problem)
- Line 2: $N$ — the number of paths ($2 \le N \le 10^5$)
- Line 3: $N$ decimals — the draws $Z_1, \dots, Z_N$

## Output

One line: `price standardError`, both rounded to 4 decimal places.

## Notes

Accumulate payoff sums in `double` (they stay well within range). Compute the variance as $\frac{1}{N-1}\left(\sum p_i^2 - N \bar p^2\right)$ or with a two-pass loop — either passes.
