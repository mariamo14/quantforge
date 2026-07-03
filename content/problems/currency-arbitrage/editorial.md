# Editorial

The reduction is the whole interview: **multiplicative cycles become additive under logs**, and "product > 1" becomes "sum of $-\log$ weights < 0" — a negative-cycle detection, which is Bellman-Ford's specialty.

$$\prod r_i > 1 \iff \sum \log r_i > 0 \iff \sum(-\log r_i) < 0$$

## Implementation choices worth explaining aloud

- **All-zeros initialization** replaces the textbook "add a virtual source with 0-weight edges to every node." They're mathematically identical (distance 0 is what the virtual source gives every node after one relaxation), but the all-zeros version is fewer moving parts. Either way, the point is to detect negative cycles in *any* component, not just ones reachable from node 1 — forget this and a disconnected arbitrage triangle slips through.
- **Early exit** when a full pass changes nothing: the distances have converged, so no negative cycle exists. On arbitrage-free inputs this usually terminates in a handful of rounds rather than $N-1$.
- **Epsilon discipline:** comparing doubles after ~$10^5$ additions of logs needs a tolerance. The statement's constructed margin (products ≥ 1.01 or ≤ 0.99 ⇒ log-sums bounded away from 0 by ~0.01) makes $10^{-9}$ comfortably safe. In a real system quotes have spreads and fees — the margin *is* the model.

## Follow-ups interviewers layer on

1. **Print the cycle:** track predecessors; from the relaxed edge's endpoint, walk `pred` $N$ times to guarantee you're *inside* the cycle, then loop until you revisit — the standard reconstruction subtlety.
2. **Fees:** multiply each rate by $(1 - \text{fee})$; the algorithm is unchanged — a good test of whether you understand the reduction or memorized it.
3. **Why not Floyd-Warshall?** It also detects negative cycles (negative diagonal) in $O(N^3)$ — fine at $N = 100$, worse at scale, and no early exit.
4. **Reality check:** real FX arbitrage vanishes in milliseconds; the *detection* pattern lives on in ETF/futures basis monitors and triangular crypto scanners.

## Complexity

$O(NM)$ worst case — $5 \times 10^5$ relaxations here, microseconds in practice.
