# Editorial

For any sell day, the only buy worth considering is the **cheapest price seen before it**. Track that minimum as you scan and the $O(N^2)$ pair search collapses to one pass:

```
profit_i = p[i] - minSoFar
best     = max(best, profit_i)
minSoFar = min(minSoFar, p[i])
```

## The tie-breaking is where candidates slip

Both updates use **strict** comparisons, and that's not stylistic:

- `profit > bestProfit` keeps the *first* (earliest-sell) trade among equals — using `>=` would drift to the latest sell.
- `price < minPrice` keeps the *earliest* day the minimum was hit — using `<=` would slide the buy day to a later equal price.

The order of the two updates matters too: check the profit *before* updating the minimum, or a day could try to "buy and sell" at its own price. (Here that's harmless — profit 0 — but in the mirror problem, max drawdown, the same ordering bug produces real wrong answers.)

## Relatives

- This is **max drawdown reflected**: drawdown tracks the running *max* and measures drops; this tracks the running *min* and measures rises. Same scan, opposite sign — see *Maximum Drawdown*.
- It's also Kadane's algorithm in disguise: on the difference series $d_i = p_i - p_{i-1}$, the best trade is the maximum-sum subarray.
- Follow-ups interviewers use: at most **two** trades (dp over prefix-best + suffix-best), at most $k$ trades, or with a transaction fee. Being able to say "the one-pass min-tracking generalizes to a small DP over 'holding/not-holding' states" is the senior answer.

## Complexity

$O(N)$ time, $O(1)$ space, and with `int64_t` there is no overflow drama even at $10^9$ cents.
