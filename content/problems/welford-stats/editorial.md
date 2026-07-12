# Editorial

Three lines of update, decades of production use. The trick is that Welford accumulates **deviations from the running mean** — quantities of the same small magnitude as the noise itself — instead of raw sums that grow with the data's *level*.

## Why the naive formula explodes

With prices near $10^8$ and moves near \$1\$: $\sum x^2$ has terms of $10^{16}$; over $10^6$ points the sum reaches $10^{22}$, far beyond the $2^{53} \approx 9 \times 10^{15}$ range where doubles are exact — every addition rounds off more than the entire *signal*. Then $\sum x^2 - n\bar x^2$ subtracts two numbers agreeing in their first ~15 digits to extract a difference living in digit 16: **catastrophic cancellation**, negative variances, `nan` after the square root. The hidden test with offset $10^8$ makes this vivid.

## Why Welford is stable

$\delta = x - m$ is small (the deviation), $\delta \cdot (x - m_{\text{new}})$ is small-squared, and $M$ grows like $n \cdot \text{variance}$ — magnitudes stay commensurate, no cancellation. The clever detail: the update uses the deviation from the **old** mean times the deviation from the **new** mean, which is what makes the recurrence exact in real arithmetic (worth deriving once on paper — interviewers occasionally ask).

## Variations worth knowing cold

- **Windowed:** Welford doesn't support removal directly; for sliding windows use paired accumulators or store the window (the rolling-VWAP approach). For most quant uses, EWMA variance is the practical windowed alternative.
- **Parallel/batched:** Chan's formula merges two Welford states $(n_a, m_a, M_a) + (n_b, m_b, M_b)$ — this is how map-reduce jobs and SIMD lanes compute stable variance. Mentioning "Welford merges associatively via Chan" is a senior flourish.
- **Covariance:** the same pattern extends to running covariance (deviation-product accumulator) — the building block for streaming betas and correlations.

## Complexity

$O(1)$ per update, two doubles of state — and unlike the naive formula, correct.
