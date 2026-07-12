# Editorial

Three structures, each earning its place:

| Structure | Job | Cost |
|---|---|---|
| `watermark` | virgin blocks, handed out in order | $O(1)$ |
| min-heap of freed indices | recycled blocks, smallest first | $O(\log N)$ |
| `used` bitmap | double-free detection | $O(1)$ |

The watermark trick avoids pre-filling a heap with a million indices: blocks that have *never* been allocated don't need tracking, because they're handed out in order by a single counter. The heap only ever holds recycled indices. `ALLOC` compares the two sources and takes the smaller — note the freed indices are always `< watermark` by construction (you can only free what was allocated), so the comparison simplifies, but writing it defensively costs nothing.

## Why every allocator has the bitmap

Double-free is the allocator bug: freeing twice puts the same index in the free structure twice, and two later `ALLOC`s hand out the **same block to two owners** — silent, delayed, catastrophic corruption. Real allocators (and this problem) detect it at the `FREE`, when the evidence still exists. This is also exactly what ASan's "attempting double-free" check does — the lesson's sanitizer content, implemented by you.

## From exercise to production pool

A real trading-system pool differs in honest ways worth saying aloud: it hands out *pointers* (index × block size into one mmap'd arena — indices and pointers are interchangeable); it usually **doesn't** need smallest-index ordering (a LIFO free-list stack is $O(1)$ and cache-warm — the recently freed block is hot), so the interview's ordering requirement is really testing your data-structure selection; and thread-safety comes from one-pool-per-thread, not locks (the ownership discipline from the concurrency lesson). Knowing *which* requirements are load-bearing — and saying "drop smallest-index and this becomes an $O(1)$ stack" — is the senior move.

## Complexity

$O(\log N)$ worst-case per op, $O(N)$ bits + recycled-index storage.
