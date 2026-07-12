---
title: The <algorithm> Toolbox
minutes: 13
---

**Builds on:** *STL Containers: Complexity & Memory Layout*

Interviewers probe `<algorithm>` fluency for a simple reason: it's a proxy for having written real C++. Anyone can hand-roll a loop; someone who reaches for `nth_element` when asked for a percentile has shipped production code. Fluency also makes you faster and more correct under whiteboard pressure — the standard algorithms encode edge cases (empty ranges, single elements, duplicates) that hand-rolled loops routinely fumble.

## The workhorses

**`std::sort` with a custom comparator.** The canonical trading example: order book priority is price, then time.

```cpp
std::sort(orders.begin(), orders.end(),
    [](const Order& a, const Order& b) {
        if (a.price != b.price) return a.price > b.price; // bids: high first
        return a.ts < b.ts;                               // earlier first
    });
```

The classic bug: violating **strict weak ordering**. A comparator must return `false` for equal elements — `return a.price >= b.price;` is undefined behavior and will crash or silently corrupt sorts on real data. If `comp(a, b)` and `comp(b, a)` can both be true, you've written a landmine. Interviewers plant this deliberately.

**`std::stable_sort`.** `sort` may reorder equal elements; `stable_sort` preserves their original relative order at the cost of $O(n \log n)$ with extra memory (or $O(n \log^2 n)$ without). When does stability matter? **Time priority.** If your orders are already in arrival order and you sort by price only, `stable_sort` gives you price-time priority for free — equal-price orders stay in arrival order.

**`std::nth_element`.** Partial selection in expected $O(n)$: after the call, the element at position `n` is exactly what it would be in a full sort, with everything smaller before it. Perfect for percentiles:

```cpp
// 99% one-day VaR from a vector of P&L scenarios
auto k = pnl.begin() + pnl.size() / 100;
std::nth_element(pnl.begin(), k, pnl.end());
double var99 = -*k;   // 1st percentile of P&L
```

Saying "I don't need a full sort for a quantile" is exactly the instinct interviewers look for.

**`std::partial_sort`.** Top-k, sorted: `partial_sort(v.begin(), v.begin() + k, v.end(), by_notional)` gives your k largest trades in order in $O(n \log k)$ — cheaper than sorting a million fills to display ten.

**`std::lower_bound` / `std::upper_bound`.** Binary search on sorted data. Find the first trade at or after a timestamp:

```cpp
auto it = std::lower_bound(trades.begin(), trades.end(), t,
    [](const Trade& tr, Timestamp ts) { return tr.ts < ts; });
```

`lower_bound` returns the first element **not less than** the key; `upper_bound` the first **greater than**. This pair is the backbone of time-series lookups (next lesson).

**`std::accumulate` / `std::reduce`.** Summing is one line — but here's the classic trap:

```cpp
std::vector<double> pnl = {0.5, 0.25, 0.25};
auto total = std::accumulate(pnl.begin(), pnl.end(), 0);   // == 0 !!
auto right = std::accumulate(pnl.begin(), pnl.end(), 0.0); // == 1.0
```

The init argument's type drives the accumulation type. `0` is an `int`, so every partial sum truncates. This bug has burned real P&L reports; interviewers love it. `std::reduce` is the parallelizable cousin (requires associativity — floating-point sums may reorder).

**`std::min_element` / `std::max_element` / `std::minmax_element`.** Day's low, high, or both in one pass: `auto [lo, hi] = std::minmax_element(prices.begin(), prices.end());` — `minmax_element` does it in roughly $3n/2$ comparisons instead of $2n$.

**The `unique` + `erase` idiom.** Deduplicate consecutive quotes (e.g., collapse repeated identical top-of-book updates) on sorted or already-grouped data:

```cpp
quotes.erase(std::unique(quotes.begin(), quotes.end()), quotes.end());
```

`unique` only shuffles duplicates to the end and returns the new logical end — forgetting the `erase` is the standard flub.

**`std::partition`.** Split fills into buys and sells in $O(n)$ without sorting: `auto mid = std::partition(fills.begin(), fills.end(), [](auto& f){ return f.side == Side::Buy; });` — buys before `mid`, sells after. `stable_partition` preserves order within each group.

## C++20 ranges

Everything above has a `std::ranges::` version that takes the container directly and supports **projections**: `std::ranges::sort(orders, std::ranges::greater{}, &Order::price);` sorts by a member with no lambda. Views compose lazily: `orders | std::views::filter([](auto& o){ return o.qty > 0; })` iterates live orders without copying. Same iterators, same complexity, same machinery underneath — just cleaner call sites and better compile-time error messages when your comparator is wrong. Mentioning projections signals current C++.

## Complexity at a glance

| Algorithm | Complexity | Notes |
|---|---|---|
| `sort` | $O(n \log n)$ | introsort; not stable |
| `stable_sort` | $O(n \log n)$ | needs extra memory |
| `nth_element` | $O(n)$ expected | selection, not sort |
| `partial_sort` | $O(n \log k)$ | top-k sorted |
| `lower_bound` / `upper_bound` | $O(\log n)$ | requires sorted range |
| `accumulate` / `reduce` | $O(n)$ | mind the init type |
| `min/max/minmax_element` | $O(n)$ | minmax ≈ $3n/2$ comps |
| `unique`, `partition` | $O(n)$ | `unique` needs `erase` |

## The meta-lesson

The standard library's design insight is **decomposition**: algorithms don't know about containers, iterators bridge the two, and $M$ algorithms $\times$ $N$ containers costs $M + N$ implementations instead of $M \times N$. Practically: an `<algorithm>` call states intent (`nth_element` *says* "selection"), has been debugged for thirty years, and often beats your loop (introsort, branchless `partition` variants, vectorized `reduce`). In an interview, reaching for the named algorithm first and hand-rolling only when asked is the mark of experience.

## Interview checkpoints

- Can you write a price-then-time comparator and explain why `>=` breaks strict weak ordering?
- When would `stable_sort` be required for correctness in an order book? (Time priority among equal prices.)
- Why is `nth_element` the right call for VaR/percentiles, and what is its complexity?
- Spot the bug: `std::accumulate(prices.begin(), prices.end(), 0)` on a `vector<double>`.
- State precisely what `lower_bound` and `upper_bound` return on a sorted range.
