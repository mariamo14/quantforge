Every strategy report includes **maximum drawdown**: the largest peak-to-trough decline of the cumulative P&L curve. It answers the question every risk manager asks first — "how much would I have been down if I'd joined at the worst moment?"

## Input

The first line contains $N$ — the number of trading days ($1 \le N \le 10^6$).

The second line contains $N$ integers $d_1, \dots, d_N$ — daily P&L in cents ($-10^9 \le d_i \le 10^9$).

## Output

Print two lines:

1. The **maximum drawdown** in cents: the maximum over all pairs $i \le j$ of $\text{cum}_i - \text{cum}_j$, where $\text{cum}_t = \sum_{s \le t} d_s$ (and the peak may also be the flat starting point, $\text{cum}_0 = 0$). Print `0` if the curve never declines.
2. The **day index** (1-based) at which the drawdown trough occurs — if several troughs achieve the maximum drawdown, the earliest.

## Notes

One pass: track the running peak of the cumulative curve; the drawdown at day $t$ is `peak − cum_t`. Beware: cumulative P&L over $10^6$ days at $10^9$ cents each exceeds 32-bit range by a factor of a million.
