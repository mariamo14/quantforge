---
title: Heaps, Priority Queues & Top-of-Book
minutes: 12
---

**Builds on:** *STL Containers: Complexity & Memory Layout* (C++ track) — `std::priority_queue` internals.

# Heaps, Priority Queues & Top-of-Book

"What's the best bid right now?" is the most-asked question in a trading system, and the heap is the textbook answer for *give me the extreme element fast*. This lesson covers heap mechanics, the `std::priority_queue` gotchas interviewers probe, the lazy-deletion trick, and the honest comparison against `std::map` for order book levels.

## Binary heap mechanics

A binary heap is a complete binary tree stored flat in an array: children of index $i$ live at $2i+1$ and $2i+2$. The heap property (max-heap: parent ≥ children) gives:

| Operation | Complexity |
|---|---|
| peek top | $O(1)$ |
| push (sift up) | $O(\log n)$ |
| pop (sift down) | $O(\log n)$ |
| build from n items | $O(n)$ (bottom-up heapify — a favorite follow-up) |
| find arbitrary element | $O(n)$ — heaps are *not* search structures |

The array layout means great cache behavior near the top — where trading workloads spend all their time.

## `std::priority_queue` and its big limitation

```cpp
std::priority_queue<Order, std::vector<Order>, BidCmp> bids; // max first
```

It supports `push`, `pop`, `top` — and nothing else. **No decrease-key, no erase-by-id.** In trading this matters immediately: most order flow is *cancellations*. An order sitting in your heap gets cancelled — you can't remove it.

## Lazy deletion: the interview trick

Pair the heap with a hash set of cancelled ids. On cancel: mark the id, don't touch the heap. On access: pop stale entries until the top is live.

```cpp
struct BestBidTracker {
    std::priority_queue<std::pair<double, uint64_t>> heap; // (price, id)
    std::unordered_set<uint64_t> cancelled;

    void add(double px, uint64_t id) { heap.push({px, id}); }
    void cancel(uint64_t id)         { cancelled.insert(id); }

    std::optional<double> best() {
        while (!heap.empty() && cancelled.count(heap.top().second)) {
            cancelled.erase(heap.top().second);
            heap.pop();
        }
        return heap.empty() ? std::nullopt
                            : std::optional<double>(heap.top().first);
    }
};
```

Each element is pushed once and popped once, so cleanup is **O(log n) amortized** per operation. The trade-off to state aloud: memory grows with cancelled-but-unpopped entries (fine when cancels eventually reach the top; risky if deep entries linger forever — mention periodic rebuild as the escape hatch). This exact pattern is a staple of quant dev interviews: "support insert, delete-by-id, and get-max."

## Two heaps for top-of-book

Bids want the *highest* price first, asks the *lowest*:

```cpp
std::priority_queue<double> bids;                               // max-heap
std::priority_queue<double, std::vector<double>,
                    std::greater<double>> asks;                 // min-heap
```

Best bid = `bids.top()`, best ask = `asks.top()`, spread = difference, mid = average. Combined with lazy deletion you have a workable top-of-book tracker. (Related two-heap classic: streaming median with a max-heap of the lower half and a min-heap of the upper half — same muscle, frequently asked.)

## K-way merge of sorted feeds

You receive $k$ time-sorted streams — one per venue — and must produce one globally ordered tape. Heap of size $k$ holding the head of each stream: pop the earliest, push that stream's next event. **O(log k)** per event, $O(k)$ memory. This is both a real feed-handler task and a standard interview question ("merge k sorted lists"). Tie-breaking on equal timestamps (by venue, by sequence number) is a good detail to raise unprompted.

## Heap vs `std::map` for book levels

Interviewers often ask: "you're building a limit order book — heap or ordered map for the price levels?"

**Heap:**
- O(1) top — and top-of-book is the hot query.
- Can't inspect the middle: "what's the size at the 5th level?" requires destroying the heap.
- Deletion by price needs lazy deletion; updating a level's quantity in place is awkward.

**`std::map<Price, Level>`:**
- Everything is O(log n): insert, erase-by-key, find.
- Ordered iteration — walk the top 10 levels for a depth snapshot, trivially.
- `begin()`/`rbegin()` give best ask/bid; erasing an emptied level is clean.

In practice, real book builders often use neither pure form: prices are integers in ticks and mostly cluster near the touch, so a **contiguous array (or vector) of levels indexed by tick offset** beats both on cache locality, with a hash map from order id to order for O(1) cancels. Saying this — *"map for correctness and iteration, flat array indexed by price for the hot path, because prices are dense integers near the touch"* — is a strong-signal answer.

Rule of thumb: heap when you only ever need the extreme (top-of-book alerting, k-way merge, timer queues); map/array when you need the book's *shape*.

## Interview checkpoints

- Heap = complete tree in an array; children at $2i+1$, $2i+2$; push/pop $O(\log n)$, top $O(1)$, heapify $O(n)$.
- `std::priority_queue` has no erase/decrease-key — lazy deletion with a hash set of dead ids is the standard workaround; know its amortized cost and memory caveat.
- Two heaps: max-heap bids, min-heap asks — also the streaming-median pattern.
- K-way merge of $k$ sorted feeds: heap of stream heads, $O(\log k)$ per event; mention timestamp tie-breaking.
- Heap vs map for book levels: O(1) top and no mid inspection vs ordered iteration and O(log n) everything.
- Bonus signal: real books use flat arrays indexed by integer tick price + hash map by order id, because cancels dominate flow and locality wins.
