# Editorial

Two passes, three accumulators, and every term stays small: deviations from the mean have the magnitude of the *noise*, not the *level*, so nothing cancels catastrophically. This is the same numerical lesson as Welford wearing regression clothes — and the pairing is deliberate: after these two problems, "never subtract two big nearly-equal sums" should be reflex.

## Why the raw-sums shortcut fails

$\sum x_i y_i - n\bar x\bar y$ subtracts two numbers that agree in as many digits as the data's level dominates its variation. Returns centered at $10^{-4}$ are fine; the hidden test with a constant offset baked in (levels, not returns — exactly what happens when someone regresses *prices*) destroys it. Which doubles as the finance lesson: **regress returns, not prices** — price regressions are almost always spurious (both series trend), a named trap since the 1920s.

## Connecting the numbers to the desk

- **Beta is the hedge ratio.** Pairs traders regress A on B and trade the residual; index-hedged books short $\beta \times$ notional of futures. The regression *is* the trade construction.
- **$R^2 = \rho^2$** for simple OLS — "how much variance does the hedge remove." An $R^2$ of 0.3 means your "hedged" book still carries 70% of the variance; saying that plainly is what risk managers want to hear.
- **Alpha** is what's left on average — the thing the whole industry is hunting. On short windows it is mostly noise; the ML lesson's out-of-sample discipline applies with full force.

## Interview escalations

Rolling beta (keep windowed deviation sums, or EWMA-weight the covariances — connects to the EWMA problem), robustness (one fat print dominates squared loss — winsorize or use Theil-Sen), and multiple regression ($\hat\beta = (X^TX)^{-1}X^Ty$, solved via Cholesky, never an explicit inverse). Each is one sentence in an interview; knowing *which* sentence is the skill.

## Complexity

$O(N)$, two passes. A one-pass Welford-style covariance update also works (and is the streaming answer) — mention it, then write the two-pass version, which is easier to get right under pressure.
