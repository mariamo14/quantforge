# Editorial

Thirty lines of accounting that contain most of practical option theory. The simulation is nothing but the lesson's decomposition made mechanical: sell the option, hold $\Delta$ shares against it, and let the cash account absorb every flow.

## The bookkeeping discipline

Everything is a cashflow into one account — premium in, share purchases out, rebalances in/out, interest on the balance, final settlement. The two bugs that produce plausible-looking wrong answers:

1. **Order of operations per day:** grow cash *first* (interest accrues on yesterday's balance), then rebalance at today's price. Swapping them compounds a small error $N$ times.
2. **The final day is different:** no rebalance at $t_N$ — you unwind (sell the shares, pay the payoff). Rebalancing at $S_N$ with $T{-}t = 0$ also divides by zero in $d_1$; the loop structure (rebalance only when $i < n$) sidesteps both.

## What the numbers teach

- The hedged P&L is (approximately) the accumulated $\tfrac12\Gamma S^2(\sigma_{\text{impl}}^2 - \sigma_{\text{real}}^2)\Delta t$ — **the gamma/theta ledger from the Greeks lesson**. Calm path ⇒ you keep theta; violent path ⇒ gamma losses eat it.
- It is *not* exactly zero even when realized = implied: **discrete hedging error**, $O(\sqrt{\Delta t})$ noise from rebalancing daily instead of continuously. Halve the step, halve the variance of the error — a genuinely testable claim (and a hidden test hints at it: same path density, tighter P&L).
- The unhedged number swings an order of magnitude wider — printed side by side precisely so the point is unmissable.

## Interview leverage

"Sell a call and delta-hedge it — where does your P&L come from?" is a canonical derivatives interview question, and the answer this problem burns in: **you are short realized variance against the implied variance you sold**, plus discretization noise, plus (in reality) transaction costs that this simulation deliberately omits — mention all three and you're done.

## Complexity

$O(N)$, one pass, three doubles of state.
