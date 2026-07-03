# Editorial

`std::priority_queue` gives $O(1)$ top and $O(\log n)$ push — but no way to remove an arbitrary element. **Lazy deletion** converts "erase now" into "ignore later":

- **Cancel:** just record the id in a hash set. $O(1)$, nothing touches the heap.
- **Query:** while the heap's top is a cancelled id, pop it (and drop the id from the set — each cancellation is consumed exactly once). What remains on top is the true best.

## Why the accounting works

Every element is pushed once and popped at most once, so the total cleanup work across the whole run is bounded by the number of pushes — **amortized $O(\log M)$** per event even though a single query may pop many stale entries. This amortization argument is precisely what a good interviewer wants you to articulate.

One subtlety: stale entries below the top stay in the heap, possibly for the entire run. Memory is $O(\text{adds})$, not $O(\text{active})$ — acceptable here; if it weren't, you'd rebuild the heap when the garbage ratio passes a threshold (same trick as tombstone compaction).

## Heaps vs `std::map`

A `std::map<price, count>` solves this too, with true erase. The heap version wins when you only ever need the extreme (smaller constants, contiguous storage) and is the *only* option in pattern cousins: merging $k$ sorted feeds, timer wheels with cancellable timeouts, Dijkstra with decrease-key-by-reinsertion. That's why interviews ask for it by name.

## Complexity

Add/cancel $O(\log M)$/$O(1)$; query amortized $O(\log M)$; memory $O(M)$.
