# Editorial

Split the window into two ordered halves around the median: `low` holds the smaller half **plus the median** (so its maximum *is* the answer), `high` holds the larger half. Every operation preserves one invariant — `low.size() == high.size() + 1` — and everything else follows.

## The three bugs everyone writes

1. **Erasing by value.** `multiset::erase(x)` removes *all* copies of `x`; a window can legitimately contain duplicates. `erase(find(x))` removes exactly one — this single line is the most common wrong-answer cause.
2. **Erasing from the wrong side.** Decide the side with the same comparison used at insert (`x <= *low.rbegin()`), *before* any rebalancing disturbs the boundary. Erase from `high` when the value lives in `low` and `find` returns `end()` — instant UB.
3. **Rebalance direction.** After any insert/erase the sizes can be off by at most two; two `while` loops (not `if`s) restore the invariant from either direction and are easier to prove correct than clever case analysis.

## Two multisets vs two heaps

Heaps with lazy deletion also work (the *Top of Book* pattern), but the bookkeeping doubles: you must track *logical* sizes separately from physical heap sizes, since stale entries distort the balance. Multisets pay an extra constant factor for the same asymptotics and dramatically lower bug surface — the pragmatic interview choice unless the interviewer explicitly wants heaps.

## Why quants roll medians

A rolling median absorbs bad ticks (fat fingers, crossed feeds, busted prints) that would poison a rolling mean — it's a standard cleaning filter in front of signal pipelines. The generalization, rolling *percentiles*, drives spread monitors and anomaly detection; the two-container technique extends directly by changing the size ratio between the halves (e.g. 95/5 for a p95 tracker) — a follow-up interviewers reach for immediately.

## Complexity

$O(\log K)$ per update (multiset operations), $O(N \log K)$ total, $O(K)$ memory.
