Price an **American put** — the option Black-Scholes can't handle in closed form — on a Cox-Ross-Rubinstein binomial tree. This is the *Binomial Trees* lesson turned into code, and a genuinely common take-home at desks.

## The recipe (follow exactly)

With $n$ steps over maturity $T$, let $\Delta t = T/n$ and:

$$u = e^{\sigma\sqrt{\Delta t}}, \qquad d = \frac{1}{u}, \qquad q = \frac{e^{r\Delta t} - d}{u - d}$$

1. Terminal stock prices: $S_{n,j} = S_0\, u^{j} d^{\,n-j}$ for $j = 0..n$; terminal put values $V_{n,j} = \max(K - S_{n,j},\, 0)$.
2. Backward induction for $i = n-1 .. 0$:
   $$V_{i,j} = \max\Big(\underbrace{K - S_{i,j}}_{\text{exercise now}},\; \underbrace{e^{-r\Delta t}\big(q\,V_{i+1,j+1} + (1-q)\,V_{i+1,j}\big)}_{\text{continue}}\Big)$$
3. The price is $V_{0,0}$.

## Input

First line: $Q$ ($1 \le Q \le 200$). Each of the next $Q$ lines: `S K r sigma T n` (decimals; $1 \le S, K \le 10^4$, $0 \le r \le 0.15$, $0.05 \le \sigma \le 1.5$, $0.05 \le T \le 5$, $10 \le n \le 2000$).

## Output

For each query: the American put price, rounded to 4 decimal places.

## Sanity checks

With $r = 0$, American and European puts coincide (no reason to exercise early — no interest to earn on the strike). With deep-ITM high-$r$ cases, the American premium is clearly visible. Use $O(n)$ memory: one array, overwritten level by level.
