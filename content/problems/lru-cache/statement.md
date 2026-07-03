The most-asked data-structure design question in software interviews, trading firms included — an **LRU cache** with $O(1)$ operations. Here it caches instrument metadata by integer id, and you must also log evictions so the test can see your recency ordering is exactly right.

## Semantics

The cache holds at most $C$ key-value pairs, ordered by recency of use.

- `GET k` — if present, return the value and mark $k$ as most recently used; otherwise return `-1`.
- `PUT k v` — if $k$ exists, update its value and mark it most recently used. Otherwise insert it as most recently used; if the cache already holds $C$ entries, first **evict the least recently used** key.

## Input

The first line contains $C$ and $M$ ($1 \le C \le 10^5$, $1 \le M \le 4 \cdot 10^5$).

Each of the next $M$ lines is `GET k` or `PUT k v` ($0 \le k, v \le 10^9$).

## Output

- For each `GET`: one line with the value, or `-1`.
- For each `PUT` that evicts: one line `EVICT k` (before the insertion takes effect, i.e. the evicted key is reported at the moment it leaves).
- `PUT` without eviction prints nothing.

## Constraints

$O(1)$ per operation. The canonical structure: a doubly-linked list in recency order plus a hash map from key to list node — `std::list` with `splice` and `std::unordered_map` make this clean in C++.
