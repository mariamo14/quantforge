# Editorial

Sort by start, sweep once, carry the current merged interval: extend it while the next interval starts at or before its end, otherwise seal it and start fresh. Ten lines, but the details are where interval problems are won and lost.

## The details

- **`<=` not `<`.** Half-open intervals $[1,5)$ and $[5,9)$ describe continuous halting — no tradeable instant between them — so touching must merge. This convention question ("do adjacent intervals merge?") should be *asked* in an interview if the statement doesn't pin it; here it's pinned to expose the off-by-one.
- **`max` on the end.** An interval can be entirely *contained* in the current one ($[2, 3)$ inside $[1, 9)$); extending with `e` unconditionally instead of `max(end, e)` shrinks the merged interval — the second-most-common bug.
- **Sorting by start is sufficient.** Ties on start need no special handling: the sweep's `max` absorbs them. Sorting pairs lexicographically (the default) is fine.

## Why this shape recurs everywhere

Interval merging is the kernel of a family quants actually meet: computing **uptime** from overlapping outage reports, **netting exposure windows** across venues, building **tradeable-time calendars** for backtests (the direct use here — annualization should divide by tradeable time, not wall-clock time), and coverage checks on tick-data captures ("do these archive files cover the whole day?"). The follow-ups all reuse the sweep: total *un*-halted time within a session window (complement), maximum number of simultaneous halts (sort events, +1/−1 sweep), earliest gap of length $\ge g$.

## Complexity

$O(N \log N)$ for the sort, $O(N)$ sweep, output size ≤ input size. Timestamps to $10^{12}$ — `int64`, as always.
