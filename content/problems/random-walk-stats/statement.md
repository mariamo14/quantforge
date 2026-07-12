The *Simulating Randomness* lesson had you generate random walks; here you analyze one that's handed to you. No randomness in your code — the path is given, your job is to walk it and keep three running statistics. This is the exact skeleton every path-dependent computation uses, from drawdowns to barrier options.

A walk starts at position $0$ and takes $N$ steps of $+1$ or $-1$.

## Input

- Line 1: $N$ ($1 \le N \le 10^6$)
- Line 2: $N$ integers, each $+1$ or $-1$ (written as `1` or `-1`)

## Output

Three numbers on one line:

1. the **final position** after all $N$ steps
2. the **highest position** ever reached (including the starting 0 — a walk that only goes down still has a high of 0)
3. the number of **returns to zero**: how many steps end exactly at position 0

## Hints

One pass, three variables: `position`, `high`, `zeroCount`. Update `position` first, then compare. That's the whole problem — the value is in noticing how naturally "track a running extreme along a path" falls out, because the *Maximum Drawdown* problem ahead is this pattern with money attached.
