A momentum signal needs the **maximum mid-price over the last $K$ updates** — recomputed after *every* update, over a stream too fast for an $O(K)$ rescan.

This is the canonical **monotonic deque** problem, and it appears in quant interviews with remarkable regularity.

## Input

The first line contains $N$ and $K$ ($1 \le K \le N \le 10^6$).

The second line contains $N$ integers $p_1, \dots, p_N$ — mid-prices in ticks ($1 \le p_i \le 10^9$).

## Output

$N$ lines: after each update $i$, the maximum of the last $\min(i, K)$ prices.

## Constraints

Total time must be $O(N)$ — amortized $O(1)$ per update. An $O(NK)$ rescan or an $O(N \log K)$ multiset will exceed the time limit on the large hidden tests. (A multiset is a fine answer to mention in an interview — then improve it.)
