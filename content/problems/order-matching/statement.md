Implement the core of an exchange: a **continuous matching engine** with strict **price-time priority**.

Incoming limit orders match against the opposite side while prices cross; any unfilled remainder rests in the book.

## Matching rules

An incoming **buy** matches while the book's best ask satisfies $\text{ask} \le \text{buyPrice}$; an incoming **sell** matches while $\text{bid} \ge \text{sellPrice}$.

- Better-priced resting orders trade first; at the same price, **earlier orders trade first** (time priority).
- Each fill trades $\min(\text{remaining incoming}, \text{remaining resting})$ shares **at the resting order's price**.
- A resting order filled to zero leaves the book. Leftover incoming quantity is added to the book at its limit price.

## Input

The first line contains $M$ ($1 \le M \le 10^5$). Each of the next $M$ lines:

`id side price qty` — a new limit order (`B` or `S`), ids unique and increasing, $1 \le \text{price} \le 10^9$, $1 \le \text{qty} \le 10^6$.

## Output

- For **each fill**, in the order fills occur: `TRADE buyId sellId price qty`
- After all $M$ orders are processed, print the final book: first `BOOK BIDS`, then each remaining bid as `id price qty` from best (highest price, oldest first) to worst; then `BOOK ASKS` and each ask from best (lowest price, oldest first) to worst.

## Notes

The natural structure is a `std::map<price, std::deque<Order>>` per side. Watch the classic bug: fills happen at the **resting** price, not the incoming one.
