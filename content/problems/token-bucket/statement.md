Every order gateway enforces a **rate throttle** — a pre-trade risk check that stops a runaway strategy from firing thousands of orders per second at the exchange. The industry-standard mechanism is the **token bucket**, and in this problem you build one.

## The token bucket

A bucket holds at most $C$ tokens and starts **full**. Tokens refill continuously at $R$ tokens per second. Each order consumes exactly 1 token:

- If at least 1 token is in the bucket → the order is **allowed** (consume 1 token).
- Otherwise → **rejected** (nothing is consumed).

This allows bursts of up to $C$ orders while capping the sustained rate at $R$ per second — exactly the two knobs a risk desk wants.

## Exact arithmetic (follow this to the letter)

Timestamps are integers in **milliseconds**, so refill amounts can be fractional tokens. To keep everything exact, work in **millitokens** (1 token = 1000 millitokens):

- Start with $C \times 1000$ millitokens.
- On an event at time $t$, first refill: add $(t - t_{\text{prev}}) \times R$ millitokens (per-ms rate is $R$ millitokens), capping at $C \times 1000$. ($t_{\text{prev}}$ = previous event's time; no refill on the first event.)
- An order needs $\ge 1000$ millitokens; consuming takes exactly 1000.

All values fit in a signed 64-bit integer.

## Input

- Line 1: $C$ $R$ $M$ — capacity, refill rate (tokens/sec), event count ($1 \le C, R \le 10^6$, $1 \le M \le 2 \cdot 10^5$)
- Next $M$ lines: `ORDER t` with non-decreasing integer timestamps $0 \le t \le 10^{12}$ ms

## Output

For each order: `ALLOW` or `REJECT` on its own line.
