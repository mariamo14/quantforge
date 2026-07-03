# Editorial

Maximum drawdown looks like it needs all pairs $(i, j)$ — $O(N^2)$ — but the peak that matters for any trough is simply the *highest point seen so far*. That observation collapses it to one pass:

```
cum += d[t]
drawdown = peak - cum      // vs best entry point so far
maxDD = max(maxDD, drawdown)
peak = max(peak, cum)
```

Note the order: compute the drawdown against the peak from *strictly before* updating the peak with today's value (a day can't be both peak and trough of the same drawdown unless drawdown is 0, which is handled naturally).

Starting `peak = 0` encodes the flat starting position — a strategy that loses from day one has a real drawdown even though the curve has no earlier "peak day."

## Edge discipline

- **Ties:** requiring the *earliest* trough means updating the trough only on strict improvement (`>`), not `>=`.
- **Overflow:** $10^6 \times 10^9 = 10^{15}$ — `int64_t` territory, and the reason the statement stresses it.
- A monotonically rising curve → drawdown `0`; the trough index convention (day 1) is then arbitrary but must be deterministic.

## Relatives worth knowing

This is Kadane's algorithm's mirror image (maximum subarray = maximum *gain* between trough and later peak). Interviewers often pivot: "now give me the longest drawdown *duration*" (track peak day index too) or "drawdown as a percentage of peak equity" (divide — but mind peak = 0).
