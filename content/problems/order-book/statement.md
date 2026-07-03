The canonical quant developer take-home: maintain a **limit order book** from an event stream, supporting add, cancel, execute, and queries.

All prices are integer ticks. Every order has a unique integer id.

## Input

The first line contains $M$ — the number of events ($1 \le M \le 2 \cdot 10^5$). Each of the next $M$ lines is one of:

- `A id side price qty` — add order `id` (`B` = bid, `S` = ask) for `qty` shares at `price`
- `C id` — cancel the remaining quantity of order `id` (guaranteed to exist with qty > 0)
- `X id qty` — execute (fill) `qty` shares of order `id` (guaranteed ≤ remaining qty)
- `Q BEST` — query best bid and ask
- `Q VOL side price` — query total resting quantity on `side` at `price`

Constraints: $1 \le \text{price} \le 10^9$, $1 \le \text{qty} \le 10^6$. Orders whose quantity reaches zero (via `X`) leave the book.

## Output

For each query, print one line:

- `Q BEST` → `bestBidPrice bestAskPrice`, using `-` for an empty side (e.g. `100 102`, `- 102`, `- -`)
- `Q VOL side price` → the total quantity at that level (0 if the level is empty)

## Notes

Aim for $O(\log P)$ per book-changing event ($P$ = number of price levels) and $O(1)$ per id lookup. The intended structure: `std::map<price, levelQty>` per side plus a hash map from id to (side, price, remaining qty). This is the exact "book builder" you would write for an L3 feed.
