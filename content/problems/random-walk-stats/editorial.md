# Editorial

Three variables riding along one pass — the smallest possible instance of *path-dependent* computation, which is the theme of half of quantitative finance.

## The pattern, named

At each step you update the state (`position`), then update statistics *derived* from the path so far (`high`, `zeroCount`). The order matters: statistics look at the position *after* the step. This tiny discipline — state first, then observers — scales directly to:

- **Maximum drawdown** (DS&A track): same loop, tracking the running *peak* and the deepest fall from it.
- **Barrier options** (CQF exotics): "did the path ever touch level $B$?" is your `high` with a comparison.
- **Delta-hedge P&L**: a whole cash account rides along the price path, updated in a strict per-step order.

Interviewers reach for path problems constantly because they test whether you can keep several evolving quantities straight in one loop — this problem is that skill with the training wheels still on.

## Two footnotes worth knowing

- The **high including the start**: initializing `high = 0` (the starting position) handles the all-downhill walk for free. Extremes should be seeded from a real point on the path, echoing the min-price lesson from *Your First Feed*.
- **Returns to zero** are rarer than intuition suggests — a fair walk of a million steps typically returns only a few hundred times, and the *time between* returns has infinite expectation. That counterintuitive sparseness is a classic brainteaser topic (arcsine law territory) you now have hands-on feel for.

## Complexity

$O(N)$ time, $O(1)$ memory — you never need to store the path at all.
