The sliding-window pattern in its purest form — before VWAP adds weighting and rounding, master the naked mechanic: **add the newcomer, subtract the departer**.

Maintain the sum of the most recent $K$ values as a stream arrives.

## Input

- Line 1: $N$ and $K$ ($1 \le K \le N \le 10^6$)
- Line 2: $N$ integers $v_1 \dots v_N$ ($-10^9 \le v_i \le 10^9$)

## Output

$N$ lines: after each value $v_i$, the sum of the last $\min(i, K)$ values.

## Hints

- The whole point is to avoid re-adding $K$ values each step. Keep one running sum: add $v_i$; once $i > K$, also subtract $v_{i-K}$ (the value that just fell out of the window). Every update is two operations, no matter how big $K$ is.
- $K$ values of size $10^9$ sum to $10^{15}$ — `long long` territory (the lesson's range-math habit, again).
- Store the values in an array as they arrive so you can find $v_{i-K}$ when it's time to evict it.
