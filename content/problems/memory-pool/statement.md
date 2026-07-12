The *Low-Latency Patterns* lesson banned `new` on the hot path and said "use a pool." Build the pool: a fixed arena of $N$ equal-sized blocks with allocate and free — plus the bookkeeping that catches the bug every allocator must catch.

## Semantics

Blocks are indexed $0..N-1$, all initially free.

- `ALLOC` — return the **smallest free index** and mark it used; if nothing is free, report `FULL`.
- `FREE i` — release block $i$. If block $i$ is already free, report `DOUBLE_FREE` (and change nothing); otherwise report `OK`.

## Input

- Line 1: $N$ $M$ ($1 \le N \le 10^6$, $1 \le M \le 10^6$)
- Next $M$ lines: `ALLOC` or `FREE i` ($0 \le i < N$)

## Output

One line per operation: the allocated index or `FULL`; `OK` or `DOUBLE_FREE`.

## Constraints

$O(\log N)$ per operation. The smallest-index rule plus double-free detection is the whole design problem: a plain free-list stack gives $O(1)$ but the *wrong* index order; a linear scan gives the right order at $O(N)$. The intended structure is a **watermark + min-heap of freed indices** (with a used/free bitmap for the double-free check) — or a single `std::set`, at a constant-factor cost.
