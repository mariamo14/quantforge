---
title: Binary Search on Time Series
minutes: 12
---

**Builds on:** *The <algorithm> Toolbox*

Binary search shows up in interviews far beyond "find x in a sorted array" — and in quant work it's the primitive underneath every timestamp lookup you'll ever do. The version that survives contact with real code is the **invariant framing**: forget "find the element," and instead maintain a half-open range $[lo, hi)$ across which some boolean property flips exactly once from false to true. You're searching for the flip point.

## The canonical bug-free implementation

```cpp
// Returns the first index in [0, n) where pred(v[i]) is true,
// or n if none. Requires: pred is false...false true...true.
template <typename T, typename Pred>
std::size_t first_true(const std::vector<T>& v, Pred pred) {
    std::size_t lo = 0, hi = v.size();      // answer is in [lo, hi]
    while (lo < hi) {
        std::size_t mid = lo + (hi - lo) / 2; // no overflow
        if (pred(v[mid])) hi = mid;           // mid could be the answer
        else              lo = mid + 1;       // mid is ruled out
    }
    return lo;                                // lo == hi == flip point
}
```

Why this never has the classic off-by-one or infinite-loop bugs: the invariant is *the answer is always in $[lo, hi]$*, and every iteration strictly shrinks the range — `hi = mid` shrinks because `mid < hi`, and `lo = mid + 1` shrinks because `mid >= lo`. When `lo == hi`, that's the answer. No `while (lo <= hi)`, no `hi = mid - 1` underflow, no special-casing empty input. Learn this one shape and every variant is a change of predicate.

## `lower_bound` vs `upper_bound`, precisely

Both are `first_true` with a specific predicate on a sorted range:

- `lower_bound(first, last, x)` → first element **≥ x** (predicate: `elem >= x`)
- `upper_bound(first, last, x)` → first element **> x** (predicate: `elem > x`)

With timestamped trades sorted by `ts`, and a query time `t`:

```cpp
auto cmp = [](const Trade& tr, Timestamp t) { return tr.ts < t; };
auto lb  = std::lower_bound(trades.begin(), trades.end(), t, cmp);
// lb: first trade with ts >= t  (trades AT or after t)
auto ub  = std::upper_bound(trades.begin(), trades.end(), t,
    [](Timestamp t, const Trade& tr) { return t < tr.ts; });
// ub: first trade with ts > t   (trades strictly after t)
// [lb, ub) is exactly the trades with ts == t — equal_range in one shot.
```

If you can state that last line unprompted, the interviewer relaxes.

## The quant use case: as-of lookups

"What was the book at 10:31:07.123?" You have events at irregular times; you want the **last event at or before t** — the prevailing state, not the next update.

```cpp
// events sorted by ts ascending
std::optional<BookSnapshot> as_of(const std::vector<Event>& events, Timestamp t) {
    auto it = std::upper_bound(events.begin(), events.end(), t,
        [](Timestamp t, const Event& e) { return t < e.ts; });
    if (it == events.begin()) return std::nullopt; // t precedes all data
    return std::prev(it)->snapshot;                // last event with ts <= t
}
```

The idiom is `upper_bound − 1`: `upper_bound` gives the first event *after* t, so the one before it is the last event at-or-before t. The edge case that separates candidates: when `t` is earlier than every event, `upper_bound` returns `begin()` and decrementing is undefined behavior — you must return "no data" (here, `nullopt`). Also be explicit about tie handling: with `upper_bound` an event exactly at `t` **is** included, which is what "as of" means; using `lower_bound` here silently excludes same-timestamp events and is a real lookahead/staleness bug in backtests.

This scales into the **as-of join**, the bread-and-butter of market microstructure research: align every trade with the quote prevailing at trade time to measure effective spread, signed order flow, or price impact. Conceptually it's the lookup above run per trade — $O(m \log n)$ — though when both series are sorted you'd do a single linear merge pass, $O(m + n)$. It's the same operation as `pandas.merge_asof` or kdb's `aj`; naming that shows you've done the research side.

## Binary search on the answer

Parametric search: sometimes the sorted thing isn't your data, it's the *answer space*. "Smallest window length $w$ such that some $w$-length window has volume ≥ V": feasibility is monotone (if $w$ works, $w+1$ works — false...false true...true again), so binary search over $w \in [1, n]$, checking each candidate with an $O(n)$ sliding-window pass: $O(n \log n)$ total. Whenever a problem says "minimize the maximum" or "smallest X achieving Y," ask: *is feasibility monotone in X?* If yes, binary search the answer.

## Floating-point binary search

Searching a continuous domain — the implied volatility matching a market option price, or the yield-to-maturity matching a bond price — the property is still monotone (price is monotone in vol, inversely monotone in yield), but **never** terminate on `lo == hi` or exact equality; floating point may never get there. Instead run a **fixed iteration count**:

```cpp
double lo = 1e-6, hi = 5.0;               // vol bracket
for (int i = 0; i < 60; ++i) {            // halves the bracket 60 times
    double mid = 0.5 * (lo + hi);
    (bs_price(mid) < market_price ? lo : hi) = mid;
}
```

Sixty halvings shrink any sane bracket below double precision, and the loop provably terminates. This is exactly the bisection fallback inside the implied-vol and YTM solvers in the CQF track — Newton's method converges faster when it converges, but bisection never diverges.

## The economics

Each lookup is $O(\log n)$ — about 27 comparisons for 100 million ticks. The price is keeping data sorted: one $O(n \log n)$ sort, or free if you append in arrival order. Sort once, query forever — that asymmetry is why virtually all tick stores keep time as the primary sort key.

## Interview checkpoints

- Write the half-open `[lo, hi)` binary search and state the invariant that makes it correct.
- Define `lower_bound` vs `upper_bound` exactly (first ≥ vs first >) and construct `equal_range` from them.
- Implement as-of lookup as `upper_bound − 1`; handle `t` before all data, and justify including events exactly at `t`.
- Recognize "smallest/largest X achieving Y" as binary search on the answer; state the monotone-feasibility requirement.
- Explain why floating-point bisection uses a fixed iteration count instead of epsilon-equality.
