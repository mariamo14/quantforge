Your first judged problem — deliberately gentle. The goal is to make friends with the read-compute-print loop from the *How Coding Problems Work Here* lesson, because every problem after this one uses exactly the same shape.

A stream of trades arrives. For each trade you get a price (in integer cents) and a quantity. Report four summary numbers.

## Input

- Line 1: $N$ — the number of trades ($1 \le N \le 10^5$)
- Next $N$ lines: `price qty` ($1 \le \text{price} \le 10^9$, $1 \le \text{qty} \le 10^6$)

## Output

One line with four numbers separated by spaces:

1. the number of trades (yes, just $N$ — a free warm-up)
2. the total quantity across all trades
3. the lowest price seen
4. the highest price seen

## Hints

- Total quantity can reach $10^5 \times 10^6 = 10^{11}$ — that's why the lesson said to default to `long long`.
- Initialize the minimum with the *first* trade (or a huge constant) — starting `min` at 0 is the classic first-timer bug, since no price is ever below it.
