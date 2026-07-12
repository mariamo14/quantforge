# Editorial

Backward induction with one twist: at every node, compare **continuing** (the discounted risk-neutral expectation) against **exercising now** ($K - S$). That single `max` is the entire difference between European and American pricing — and the reason no Black-Scholes-style closed form exists: the exercise boundary must be *discovered*, node by node.

## Implementation notes

- **One array suffices.** Level $i$ overwrites level $i+1$ in place because $V_{i,j}$ depends only on $V_{i+1,j}$ and $V_{i+1,j+1}$ — the classic $O(n)$-memory DP layout. At $n = 2000$ that's the difference between 16KB and a 16MB triangle.
- **Recompute stock prices per node** (as here, via `pow`) or track them incrementally (`stock *= d` across a level) — both are fine numerically at 4dp; the incremental version is faster and what you'd write in production.
- The comparison $\max(K - S, \text{cont})$ needs no `max(...,0)` guard: continuation is always ≥ 0, so worthless nodes stay 0 automatically.

## The finance in the numbers

- **$r = 0 \Rightarrow$ no early exercise.** The only reason to exercise a put early is to collect $K$ *now* and earn interest on it. Zero rates, zero hurry — American = European, a free correctness test.
- **The premium grows with $r$, depth ITM, and time.** A deep-ITM put with high rates exercises almost immediately; the tree's exercise boundary creeps toward the money as expiry nears.
- **Convergence:** CRR prices oscillate around the true value as $n$ grows, converging like $O(1/n)$. Practitioners average consecutive $n$'s or use smoothing; interviewers love asking why the oscillation happens (the strike zigzags between terminal nodes).

## Complexity

$O(n^2)$ time, $O(n)$ memory per query — at $n = 2000$, about 2M node updates, microseconds each side of the time limit.
