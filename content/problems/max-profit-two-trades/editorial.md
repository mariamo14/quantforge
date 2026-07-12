# Editorial

Four states, four `max` updates per price — the state machine reads as "the best cash position achievable, having completed each stage of the two-trade plan":

| State | Meaning | Update |
|---|---|---|
| `buy1` | holding after first buy | $\max(\text{buy1}, -p)$ |
| `sell1` | flat after first sell | $\max(\text{sell1}, \text{buy1} + p)$ |
| `buy2` | holding after second buy | $\max(\text{buy2}, \text{sell1} - p)$ |
| `sell2` | flat after second sell | $\max(\text{sell2}, \text{buy2} + p)$ |

## The two subtleties worth saying aloud

1. **Same-day chaining is harmless.** Updating all four states with the same price lets, e.g., `buy2` use *today's* `sell1` — a same-day sell-and-rebuy. That phantom trade has zero effect on profit (sell at $p$, buy at $p$), so the relaxed ordering is safe — and it's why "at most two" falls out automatically: unused trades degenerate to zero-profit no-ops. Interviewers who ask "doesn't this allow buying and selling on the same day?" want exactly this answer.
2. **Initialization.** Buy states start at $-\infty$ (never legally "holding" before any price), sell states at 0 (doing nothing is allowed). Using `INT64_MIN/4` rather than `INT64_MIN` avoids overflow when adding a price to the sentinel — a tiny detail with a real crash behind it.

## Generalizations (the actual interview payoff)

- **$k$ trades:** the same machine with $2k$ states — $O(Nk)$ time, $O(k)$ memory. When $k \ge N/2$ the constraint stops binding and the answer is the sum of all positive daily moves (greedy) — knowing the crossover is a senior flourish.
- **Split-point view:** prefix-best + suffix-best arrays make the "two trades" structure visible and debuggable — the version to write if the state machine feels like magic under pressure. Same $O(N)$.
- With **transaction fees** or **cooldowns**, only the update formulas change; the state-machine skeleton survives. That robustness is why this pattern is worth internalizing rather than memorizing.

## Complexity

$O(N)$ time, $O(1)$ memory, single pass, `int64` throughout ($10^9$ prices × profits stack safely).
