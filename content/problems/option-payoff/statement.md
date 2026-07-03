Compute what an options position is worth **at expiry** — the payoff tables from the *Options: Calls & Puts* lesson, turned into code. No pricing, no models: just the contract definitions.

A portfolio holds positions. Each position is a quantity (positive = long, negative = short) of one instrument:

- `C K` — a call with strike $K$: worth $\max(S_T - K, 0)$ at expiry
- `P K` — a put with strike $K$: worth $\max(K - S_T, 0)$
- `S` — one share of the stock: worth $S_T$

The portfolio's payoff at terminal price $S_T$ is the quantity-weighted sum.

## Input

- Line 1: $N$ $M$ — positions and scenarios ($1 \le N \le 100$, $1 \le M \le 1000$)
- Next $N$ lines: `qty C K` or `qty P K` or `qty S`, with quantity a (possibly negative) integer, $|qty| \le 1000$; strikes and prices are integers in **cents** ($1 \le K \le 10^7$)
- Last line: $M$ terminal prices $S_T$ in cents

## Output

For each scenario, one line: the total portfolio payoff **in dollars with exactly 2 decimals** (it can be negative, e.g. `-25.00`).

## Try it on paper first

A *straddle* — long 1 call and 1 put at the same strike \$100 — pays $|S_T - 100|$: it profits from a big move in either direction. Your code should reproduce the payoff table you built in the lesson.
