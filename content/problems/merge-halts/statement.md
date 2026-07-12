Regulatory halts, exchange outages, circuit breakers — your backtester receives them as a messy pile of possibly-overlapping intervals, and every downstream calculation ("how long was trading actually possible today?") needs them **merged**.

## Task

Given $N$ halt intervals $[s_i, e_i)$ in milliseconds (half-open: trading resumes exactly at $e_i$), merge all overlapping *or touching* intervals ($[1, 5)$ and $[5, 9)$ merge into $[1, 9)$) and report the result.

## Input

- Line 1: $N$ ($1 \le N \le 2 \cdot 10^5$)
- Next $N$ lines: $s_i$ $e_i$ ($0 \le s_i < e_i \le 10^{12}$), in **no particular order**

## Output

- Line 1: $M$ — the number of merged intervals, and the total halted time in ms, separated by a space
- Next $M$ lines: the merged intervals `s e`, sorted by start

## Constraints

$O(N \log N)$ — sort by start, then one linear sweep carrying the current merged interval. The classic off-by-one to avoid: with half-open intervals, *touching* means `next.start <= current.end` (not `<`).
