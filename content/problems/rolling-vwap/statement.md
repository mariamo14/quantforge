The **volume-weighted average price** over the last $K$ trades is a basic execution benchmark:

$$\text{VWAP} = \frac{\sum_i p_i v_i}{\sum_i v_i}$$

Maintain it over a sliding window of the most recent $K$ trades, in $O(1)$ per trade.

## Input

The first line contains $N$ and $K$ ($1 \le K \le N \le 2 \cdot 10^5$).

Each of the next $N$ lines contains a trade: price in **integer cents** $p_i$ ($1 \le p_i \le 10^7$) and volume $v_i$ ($1 \le v_i \le 10^4$).

## Output

After each trade, print the VWAP of the last $\min(i, K)$ trades **in cents, rounded half-up to the nearest integer cent**, formatted as dollars with exactly 2 decimals (e.g. `10023` cents → `100.23`).

Rounding half-up means: $\text{round}(x) = \lfloor x + 0.5 \rfloor$ — implemented in integers as `(num * 2 + den) / (den * 2)`.

## Notes

Keep running sums of $p_i v_i$ and $v_i$; subtract the trade falling out of the window. Use 64-bit integers throughout — $\sum p_i v_i$ can reach $2 \cdot 10^{16}$. No floating point is needed (or safe).
