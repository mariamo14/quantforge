A classic quant interview problem with a beautiful reduction: given FX rates, decide whether **triangular (or longer) arbitrage** exists — a cycle of conversions that ends with more money than it started.

An arbitrage is a cycle $c_1 \to c_2 \to \dots \to c_k \to c_1$ whose rate product exceeds 1:

$$\prod_{\text{edges}} \text{rate}_{u \to v} > 1$$

## The reduction

Taking logs turns products into sums: a cycle with $\prod r > 1$ is a cycle with $\sum \log r > 0$, i.e. a **negative cycle** under edge weights $w_{u \to v} = -\log(\text{rate}_{u \to v})$. Bellman-Ford detects negative cycles in $O(NM)$: after $N-1$ rounds of relaxation, any edge that still relaxes proves one exists. (Run relaxation from a virtual source connected to all nodes with weight 0 so disconnected components are covered.)

## Input

The first line contains $N$ and $M$ — currencies and quoted rates ($2 \le N \le 100$, $1 \le M \le 5000$).

Each of the next $M$ lines: `u v rate` — you can convert 1 unit of currency $u$ into `rate` units of currency $v$ ($1 \le u, v \le N$, $u \ne v$, rate a decimal in $[0.0001, 10000]$).

## Output

A single line: `ARBITRAGE` if some cycle's rate product exceeds 1, otherwise `OK`.

Test cases are constructed with clear margins — every arbitrage cycle has product $\ge 1.01$ and, in arbitrage-free cases, every cycle has product $\le 0.99$ — so floating-point tolerance is not the difficulty.
