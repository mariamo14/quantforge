# Editorial

Differentiate the variance, set to zero, rearrange — the two-asset case is the only Markowitz problem with a formula this clean, which is exactly why interviewers use it as a warm-up before asking about the general case.

## Reading the formula

$$w^* = \frac{\sigma_2^2 - \rho\sigma_1\sigma_2}{\sigma_1^2 + \sigma_2^2 - 2\rho\sigma_1\sigma_2}$$

- **Symmetry check:** $\sigma_1 = \sigma_2 \Rightarrow w^* = \tfrac12$ regardless of correlation.
- **Negative weights are information.** If $\rho\sigma_1\sigma_2 > \sigma_2^2$ (asset 1 much riskier and highly correlated), the optimizer *shorts* asset 1 as a hedge. Clamping to $[0,1]$ silently answers a different (long-only, constrained) question — say so rather than doing it by accident.
- **$\rho = -1$:** variance reaches exactly zero at $w^* = \sigma_2/(\sigma_1+\sigma_2)$ — the perfect hedge. Floating point may produce $-10^{-18}$ before the square root; the `max(var, 0)` guard is the polite way to handle it (and a nice thing to point out you did).

## The general case, in one breath

For $n$ assets the minimum-variance weights solve $\Sigma w = \lambda \mathbf{1}$, i.e. $w \propto \Sigma^{-1}\mathbf{1}$ — a linear system, not an inversion you'd literally perform (Cholesky solve). The practical catch interviewers probe: $\Sigma$ estimated from data is noisy, and $\Sigma^{-1}$ *amplifies* that noise into extreme weights — hence shrinkage estimators and weight constraints in real portfolio construction. Knowing the two-asset formula cold *and* why the $n$-asset version is fragile is the complete answer.

## Complexity

$O(1)$ per query. The value of this problem is entirely in the checks you can articulate, not the code.
