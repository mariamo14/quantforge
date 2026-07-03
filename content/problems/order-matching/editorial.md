# Editorial

A matching engine is an order book plus one loop. The structure that makes the loop clean:

- Per side, `map<price, deque<Order>>`. The deque *is* time priority — arrivals `push_back`, fills consume `front`.
- Key the bid map with `std::greater<>` so `begin()` is always the best level on **both** sides — the matching loop then reads identically for buys and sells.

## The matching loop

For an incoming buy:

```text
while (qty > 0 && best ask price <= limit):
    fill min(qty, front.qty) at the RESTING price
    pop the resting order if emptied; erase the level if emptied
rest any remainder at the limit price
```

Three details graders (and production) care about:

1. **Fills print at the resting price.** The incoming order gets *price improvement* when it crosses a better level. Filling at the incoming price is the most common bug in this exercise — and would misprice every trade at a real exchange.
2. **Priority order:** price first (level iteration), then time (deque front). Never sort by id — time priority falls out of arrival order naturally.
3. **Level cleanup:** an empty deque must leave the map immediately, or the next `begin()` check reads a phantom level.

## Invariants worth stating aloud

After every event, the book never crosses: $\text{bestBid} < \text{bestAsk}$. If your remainder-resting logic ever violates this, matching stopped too early. Asserting this invariant in tests is exactly how real matching engines are validated (alongside replay determinism — same input stream, same trades, always).

## Complexity

Each order is added once and removed at most once: total work $O(M \log P)$ for level lookups plus $O(F)$ for $F$ fills.
