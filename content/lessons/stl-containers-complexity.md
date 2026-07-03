---
title: "STL Containers: Complexity & Memory Layout"
minutes: 15
---

Every quant dev loop has at least one container question, and the trap is answering with Big-O alone. On modern hardware, **memory layout dominates**: an O(log n) tree walk that misses cache on every node loses to an O(n) scan of a contiguous array for any n that fits in cache. Interviewers want the complexity table *and* the cache story *and* the judgment call.

## The table (complexity + layout)

| Container | Access | Insert/Erase | Find | Layout | Cache behavior |
|---|---|---|---|---|---|
| `vector` | O(1) | O(1) amortized at end; O(n) middle | O(n) / O(log n) sorted | one contiguous block | excellent |
| `deque` | O(1) | O(1) amortized both ends | O(n) | chunked blocks + index map | good within chunk |
| `list` | — | O(1) given iterator | O(n) | per-node heap allocs | terrible |
| `map` / `set` | — | O(log n) | O(log n) | red-black tree nodes | poor (pointer chase) |
| `unordered_map` | — | O(1) avg, O(n) worst | O(1) avg, O(n) worst | bucket array → node chains | mediocre (1–2 dereferences) |
| `flat_map` (C++23) / sorted `vector` | — | O(n) | O(log n) | contiguous | excellent |

## `vector`: growth, `reserve`, invalidation

`push_back` into a full vector allocates a new block (growth factor ~1.5–2×), moves every element, frees the old block. Amortized O(1): with factor $g$, total copies for $n$ inserts are bounded by $n \cdot \frac{g}{g-1}$ — geometric series, constant per element. But *individual* pushes are O(n) spikes — unacceptable mid-session, which is why trading code calls `reserve()` up front and treats reallocation on the hot path as a bug.

**Iterator invalidation — the classic question.** Know it cold:

- `vector`: reallocation invalidates *all* iterators/pointers/references. Insert/erase invalidates everything at or after the point of change even without reallocation.
- `deque`: insert at either end keeps references valid but invalidates iterators; middle insert invalidates everything.
- `list` / `map` / `set`: only erased elements are invalidated.
- `unordered_map`: rehash invalidates all *iterators* but **not** pointers/references to elements (nodes don't move).

The bug they want you to spot:

```cpp
std::vector<Order> orders = ...;
for (auto it = orders.begin(); it != orders.end(); ) {
    if (it->filled()) it = orders.erase(it);   // correct: use the returned iterator
    else ++it;
}
// or simply: std::erase_if(orders, [](const Order& o){ return o.filled(); });
```

Writing `orders.erase(it); ++it;` is UB. Since C++20, `std::erase_if` is the clean answer.

## `unordered_map`: what "O(1)" hides

Open-hashing design: `hash(key) % bucket_count` selects a bucket; each bucket is a linked chain of separately allocated nodes. When `size / bucket_count` exceeds `max_load_factor()` (default 1.0), the table rehashes — O(n), invalidating iterators.

The costs interviewers probe:

- **Every lookup is at least one pointer dereference into a random heap node** — a near-guaranteed cache miss. The node-based guarantee (stable references) is exactly what kills locality.
- **Worst case is O(n)**: all keys in one bucket. With attacker-controlled keys that's a DoS vector; with bad hash choices (e.g., hashing sequential order IDs with identity hash into power-of-two buckets) it happens by accident.
- Mitigations to name: `reserve(n)` to avoid rehashes, custom hash, or an open-addressing table (`absl::flat_hash_map`, `boost::unordered_flat_map`) that stores elements inline in the array — the standard's interface constraints (stable node addresses) prevent `std::unordered_map` from ever being that fast.

## `map`: the red-black tree earns its keep in an order book

`std::map` is a balanced binary tree of heap-allocated nodes: O(log n) everything, poor cache behavior — *but sorted iteration and ordered queries are O(1)-ish from an iterator*. That matters exactly when your keys have meaningful order. Price levels do:

```cpp
std::map<Price, Level, std::greater<>> bids;   // best bid = begin()
std::map<Price, Level, std::less<>>    asks;   // best ask = begin()

const auto& [best_px, best_lvl] = *bids.begin();       // O(1) from cached begin
auto it = asks.lower_bound(limit_px);                   // first ask >= limit: O(log n)
```

Top-of-book access, walking levels in price order for a sweep, range queries — all natural. `unordered_map<Price, Level>` gives none of this: "best bid" becomes an O(n) scan.

## `deque`, and `emplace` vs `push`

`deque` = an array of fixed-size chunks plus a small index map: O(1) push/pop at *both* ends with no reallocation of elements, references stable on end-insertion. Good for FIFO queues of pending orders; worse than `vector` for iteration (chunk boundary checks) — never the default.

`emplace_back(args...)` forwards arguments and constructs in place; `push_back(T{...})` constructs a temporary then moves it. For a cheap-to-move type the difference is one move — usually noise. It matters for non-movable types, or maps: `m.try_emplace(key, args...)` avoids constructing the value when the key already exists. Say that, and also say "I don't cargo-cult emplace — for scalars it's identical."

## Worked discussion: containers for an order book

The design question behind many interviews: store a limit order book. Options:

**`map<Price, Level>`** (per side): clean semantics, O(log n) insert/erase of levels, ordered walk for free. Downside: node allocations and pointer chasing on every touched level.

**Sorted `vector<Level>`**: contiguous, best cache behavior; binary search O(log n); insert/erase of a level is O(n) memmove. Key market insight that justifies it: **activity concentrates near the top of book**, so the shifted region is usually tiny, and a memmove of a few hundred contiguous bytes beats a rebalancing pointer chase.

**Dense array indexed by tick**: `levels[(px - base) / tick]` — O(1) direct addressing, ideal for instruments with a bounded, dense price grid (futures); wasteful for sparse/wide-ranging prices.

Senior answer: start with `map` for correctness, measure, then move hot instruments to a vector- or array-backed book; keep a side `unordered_map<OrderId, OrderRef>` for O(1) cancel/replace lookup, since cancels dominate message flow.

## Interview checkpoints

- Big-O is necessary, not sufficient: contiguous beats node-based for realistic n because of cache lines and prefetching.
- `vector` growth is amortized O(1) via geometric growth; `reserve()` up front — reallocation on a hot path is a latency spike and invalidates everything.
- Recite invalidation rules: vector (everything on realloc), unordered_map (iterators on rehash, references survive), list/map (only the erased element).
- `unordered_map` = buckets of heap nodes: O(1) average with a cache miss per lookup, O(n) worst case; flat/open-addressing maps fix the layout.
- `map`'s ordered iteration is why price levels live in trees or sorted vectors — best bid is `begin()`, sweeps walk in price order.
- Order book design: `map` for correctness first, sorted vector/tick-indexed array for the hot book, plus an ID→order hash map for O(1) cancels.
