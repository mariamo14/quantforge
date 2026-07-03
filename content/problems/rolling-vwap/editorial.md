# Editorial

Two running sums make the window $O(1)$: add the incoming trade's $p_i v_i$ and $v_i$, subtract the trade that just left. Storing the raw arrays (or a ring buffer of the last $K$ trades) provides the eviction values.

## The two traps

1. **Overflow.** $p \le 10^7$, $v \le 10^4$ → a single term reaches $10^{11}$ and the window sum $2 \cdot 10^{16}$. That's fine for `int64_t` but silently wraps 32-bit ints — the first hidden test targets exactly this.
2. **Float rounding.** Computing `(double)notional / volume` and rounding is wrong at the boundary: a double cannot represent the exact ratio and can land a hair below `x.5`, rounding down where exact math rounds up. Pure integer rounding half-up:
   $$\left\lfloor \frac{2 \cdot \text{num} + \text{den}}{2 \cdot \text{den}} \right\rfloor$$
   is exact for all inputs.

## Why quants care

VWAP is the standard benchmark for execution quality ("did we beat VWAP?") and VWAP-slicing is a baseline execution algo. The windowed version here is the streaming form you'd maintain in a live execution monitor — same pattern as rolling means, rolling variance (Welford), and EWMA in the sliding-windows lesson.

## Complexity

$O(1)$ per trade, $O(K)$ memory (only the window needs to be retained).
