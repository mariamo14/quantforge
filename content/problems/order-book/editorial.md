# Editorial

This is the "book builder" — the component that turns an L3 event feed into queryable book state. The design question is *which structure serves which access pattern*:

| Need | Structure |
|---|---|
| Best bid / best ask | ordered map ends: `bids.rbegin()`, `asks.begin()` |
| Level quantity at arbitrary price | `map::find` — $O(\log P)$ |
| Cancel/execute by order id | `unordered_map<id, {side, price, qty}>` — $O(1)$ |

## The core insight

Cancels and executes reference an **order id**, not a price — so you need the id map to *find* the price, then the price map to *update* the level. Keeping the two views consistent is the entire difficulty; the cleanest way is a single `reduce(id, qty)` path used by both `C` (reduce by all remaining) and `X` (reduce by fill quantity), which erases the level at zero and the order at zero.

The subtle bug most first attempts have: forgetting to erase empty levels, which corrupts `Q BEST` (a level with 0 quantity is not a quote) — or erasing the level but leaving the dead order in the id map.

## Production comparison

Real book builders push this further:

- `std::map` nodes are cache-hostile; HFT books use flat arrays indexed by tick offset from a reference price, falling back to a tree for far levels.
- Per-order FIFO queues hang off each level when queue position matters (L3 vs L2).
- Sequence-number gaps from the feed trigger snapshot recovery — state must be rebuildable.

Saying those three sentences in an interview, after coding the map version cleanly, is a very strong signal.

## Complexity

$O(\log P)$ per add (amortized $O(1)$ for repeated prices via `operator[]` on an existing key — still a find), $O(\log P)$ per reduce, $O(1)$ per id lookup, $O(1)$ best-of-book.
