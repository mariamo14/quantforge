The lesson said a delta-hedged option book earns **gamma P&L versus theta bleed**, and that the real bet is realized versus implied volatility. Now *watch it happen*: simulate a desk that sells one call and delta-hedges it to expiry along a given price path.

## The recipe (follow exactly)

Given $S_0, K, r, \sigma$ (the implied vol used for both pricing and hedging), expiry $T$, and a path of $N$ daily closes $S_1, \dots, S_N$ (so $\Delta t = T/N$ and $S_N = S_T$):

1. **At $t_0$:** sell the call for its Black-Scholes price $C(S_0, T)$; buy $\Delta_0 = N(d_1(S_0, T))$ shares. Cash account: $C(S_0, T) - \Delta_0 S_0$.
2. **Each day $i = 1..N-1$:** first cash grows one step, $\text{cash} \mathrel{*}= e^{r\Delta t}$. Then rebalance to the new delta $\Delta_i = N(d_1(S_i, T - i\Delta t))$: $\text{cash} \mathrel{-}= (\Delta_i - \Delta_{i-1}) S_i$.
3. **At $t_N = T$:** grow cash one final step, sell the $\Delta_{N-1}$ shares at $S_N$, and pay the option's payoff $\max(S_N - K, 0)$.

The final cash is the **hedged P&L**. Also report the *unhedged* P&L for comparison: $C(S_0,T)e^{rT} - \max(S_N - K, 0)$.

## Input

- Line 1: `S0 K r sigma T N` ($0.05 \le \sigma \le 1$, $0.1 \le T \le 2$, $10 \le N \le 10^5$)
- Line 2: $N$ closes $S_1..S_N$ (decimals)

## Output

One line: `hedgedPnl unhedgedPnl`, both rounded to 4 decimal places.

## What to look for

On a calm path (realized vol < implied), the hedged P&L is **positive** — you sold expensive insurance. On a wild path it's negative. Either way it should be far smaller in magnitude than the unhedged number: that shrinkage *is* hedging.
