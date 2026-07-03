The warm-up screen question at half the trading firms in existence: given a price series, find the best **buy once, sell once** trade — in one pass.

## Input

The first line contains $N$ ($2 \le N \le 10^6$).

The second line contains $N$ integers — prices in cents ($1 \le p_i \le 10^9$).

## Output

If no profitable trade exists (prices never rise), print a single line: `0`.

Otherwise print two lines:

1. The maximum profit in cents.
2. `buyDay sellDay` (1-based, buy strictly before sell).

**Tie-breaking (follow exactly):** among all trades achieving the maximum profit, choose the one with the smallest **sell** day; among those, the smallest **buy** day.

## Constraints

$O(N)$ time, $O(1)$ extra space. The classic mistake is $O(N^2)$ over all pairs — the hidden tests won't let it through.
