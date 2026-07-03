# Editorial

Two structures, each covering the other's weakness:

- **Hash map** (`key → node`) gives $O(1)$ *find*, but no ordering.
- **Doubly-linked list** in recency order gives $O(1)$ *reorder* (unlink + relink at front) and $O(1)$ *evict* (the back), but $O(N)$ find.

Every operation is: find via the map, then touch the list — and `std::list::splice` is the star. It moves a node to the front **without invalidating any iterators**, which is exactly the guarantee that lets the map keep pointing at list nodes while they shuffle around. Knowing that splice is $O(1)$ and iterator-stable is the difference between "knows the STL" and "has read about it."

## The classic bugs

1. **Evict before insert, not after** — insert-then-evict can evict the very key you just added when capacity is 1. (The eviction log in this problem exists precisely to catch this.)
2. **GET must refresh recency.** A read *is* a use. Forgetting the splice on GET produces a FIFO cache that passes small tests and fails interleaved ones.
3. **PUT on an existing key refreshes too** — and must not evict, even at capacity.
4. Erase from the map **using the evicted node's key** before popping the node — pop first and you've destroyed the key you needed.

## Production notes

`std::list` + `unordered_map` is the interview answer; real hot-path caches avoid the per-node allocation with an **intrusive** list over a preallocated node pool (indices instead of pointers) — same asymptotics, far better cache behavior, no allocator on the fast path. Trading systems use exactly this shape for symbol → book lookups, session tables, and FIX order-id maps. The natural follow-ups: LFU (per-frequency buckets of LRU lists), TTL expiry (a second ordering by deadline), and thread safety (shard the cache; a global lock serializes everything).

## Complexity

$O(1)$ amortized per operation, $O(C)$ memory.
