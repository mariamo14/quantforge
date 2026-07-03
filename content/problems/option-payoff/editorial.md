# Editorial

Three `max` expressions and a weighted sum — the value of this exercise is that after writing it, payoff diagrams stop being pictures you memorize and become code you can query.

## The structure worth internalizing

Every position value at expiry is a **piecewise-linear function of $S_T$** with a kink at its strike. A portfolio is a sum of such functions — so its payoff diagram is piecewise linear with kinks only at the strikes involved. That's why strategy diagrams (straddles, spreads, collars) all look like connected line segments, and why evaluating at a handful of terminal prices (below the lowest strike, at each strike, above the highest) characterizes the whole strategy. Interviewers use exactly that trick to sketch payoffs instantly.

## Implementation notes

- **Integer cents everywhere**: strikes, prices, and quantities are integers, so payoffs are exact — no floating point needed or wanted. The only care is printing negative amounts (`-25.00`): take the absolute value, print the sign separately. Negative-money formatting is a real-world bug factory.
- Short positions are just negative quantities — no special cases. Selling a call is `-1 C K`. The symmetry falls out of the arithmetic.
- Overflow check (a habit by now): $|qty| \le 10^3$, value $\le 10^7$ cents, $N \le 100$ → total $\le 10^{12}$, comfortably `int64_t`.

## Sanity checks that connect to the lessons

- Long 1 `C 10000` + short 1 `P 10000` + nothing else should equal `S_T - 100.00` at every price — that's **put-call parity's payoff leg** ($C - P = S - K$ at expiry) from the *No-Arbitrage* lesson.
- A straddle's payoff table should be the V shape: at strikes 100 with $S_T \in \{80, 100, 120\}$ → 20.00, 0.00, 20.00.
- A *covered call* (long stock, short call) flattens above the strike — capped upside, exactly like the lesson's table.

You now have the payoff half of options. The premium half — what these positions should cost *today* — is the next several lessons: trees, then Black-Scholes.
