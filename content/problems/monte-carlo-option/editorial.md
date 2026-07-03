# Editorial

Monte Carlo pricing in three moves: simulate terminal prices under the **risk-neutral** measure, average the payoffs, discount. The details are where interviews are decided.

## The three classic mistakes

1. **Wrong drift.** Simulation for pricing uses $r$ (risk-neutral), not the real-world $\mu$ — and the log-space drift carries the Itô correction: $(r - \sigma^2/2)T$. Forgetting the $-\sigma^2/2$ overprices calls systematically (your simulated mean of $S_T$ becomes $S_0 e^{(r+\sigma^2/2)T}$ instead of the forward $S_0e^{rT}$).
2. **Scaling the shock wrong.** The Brownian increment over $T$ is $\sqrt{T} Z$, not $T Z$.
3. **Population vs sample deviation.** The standard error convention here divides by $N-1$; consistency matters when you report confidence intervals.

## What the standard error buys you

The MC estimator's error shrinks as $1/\sqrt{N}$ — to add one decimal of accuracy you need **100×** the paths. That's the number one thing to say about Monte Carlo in an interview, followed by how practitioners fight it: antithetic variates ($Z$ and $-Z$ pairs), control variates (use the known BS price of a related instrument), quasi-random (Sobol) sequences.

A two-pass variance loop is used here for clarity; Welford's online algorithm does it in one pass without catastrophic cancellation — the same algorithm from the sliding-windows lesson.

## Why give you the draws?

Determinism. `std::normal_distribution` is implementation-defined — the same seed produces different draws on libc++ vs libstdc++. Real quant infrastructure pins the RNG (own Ziggurat/Box-Muller over a fixed-bit generator) for reproducible research; the input format here just makes that decision for you.

Compare your MC price on the sample test against the closed-form Black-Scholes value — with $N = 10^5$ they agree to roughly the standard error, which *is* the sanity check.
