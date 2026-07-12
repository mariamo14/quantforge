The sequel to *Best Single Trade*, and the point where greedy dies: given a price series, maximize total profit from **at most two** buy-sell trades that do not overlap (you must sell before buying again). Taking the two best single trades independently double-counts days — this needs dynamic programming.

## Input

- Line 1: $N$ ($2 \le N \le 10^6$)
- Line 2: $N$ prices in integer cents ($1 \le p_i \le 10^9$)

## Output

One line: the maximum total profit in cents (\$0\$ if no profitable trade exists). Doing fewer than two trades — one, or none — is allowed.

## Constraints

$O(N)$ time. Two classic linear approaches both pass:

- **Split-point:** `best1[i]` = best single trade in the prefix ending at $i$, `best2[i]` = best single trade in the suffix starting at $i$; answer = $\max_i(\text{best1}[i] + \text{best2}[i+1])$, handled carefully at the edges. $O(N)$ extra memory.
- **State machine:** sweep once holding four running values — best cash after {first buy, first sell, second buy, second sell} — updating each from the previous. $O(1)$ memory, and it generalizes to $k$ trades.
