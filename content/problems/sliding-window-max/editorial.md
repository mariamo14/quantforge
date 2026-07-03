# Editorial

The trick: an older price that is **less than or equal to** a newer price can *never* be the window maximum again — the newer price dominates it (larger or equal, and expires later). So we only need to remember prices that are strictly decreasing from oldest to newest.

Maintain a deque of **indices** whose prices are decreasing front→back:

1. **Arrival of $p_i$:** pop from the back every index whose price $\le p_i$ (dominated), then push $i$.
2. **Expiry:** if the front index has left the window ($\le i - K$), pop it.
3. **Answer:** the front's price.

Every index is pushed once and popped at most once → **amortized $O(1)$**, worst-case $O(N)$ total.

## Why indices, not values

Storing indices makes expiry a simple comparison (`front <= i - k`). Storing values requires care with duplicates — with `<=` in step 1, at most one copy of each value chain survives, but index-based is the version you can write bug-free under pressure.

## The interview escalation ladder

- $O(NK)$ rescan → shows you understand the problem.
- `std::multiset` insert/erase + `*rbegin()` → $O(N \log K)$, correct, easy — say it, then improve.
- Monotonic deque → $O(N)$, the expected final answer.
- Follow-up they love: "and rolling *minimum*?" (flip the comparison) — "and rolling *median*?" (two heaps or an order-statistics tree; genuinely harder).

The same structure computes rolling maxima for high-water marks, trailing stops, and Donchian channels — it earns its place in every quant utility library.
