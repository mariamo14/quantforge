The most-asked screening question in software history, in its trading costume: your reconciliation report shows a combined notional, and you need the **two fills that sum to it**.

## Task

Given $N$ fill amounts and a target $T$, find indices $i < j$ with $a_i + a_j = T$.

If several pairs exist, report the one with the smallest $j$ (the earliest *completion*); among those, the smallest $i$. If none exists, report `NONE`.

## Input

- Line 1: $N$ $T$ ($2 \le N \le 2 \cdot 10^5$, $0 \le T \le 2 \cdot 10^9$)
- Line 2: $N$ amounts in integer cents ($0 \le a_i \le 10^9$)

## Output

One line: `i j` (1-based) or `NONE`.

## Constraints

$O(N)$ expected time — one pass with a hash map from value to its **earliest** index. The $O(N^2)$ double loop passes small tests and dies on the hidden ones; the tie-breaking rule is chosen so the natural one-pass solution is exactly right.
