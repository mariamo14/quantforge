Bond markets quote **prices**, but everyone thinks in **yields** — so every rates system inverts the bond-pricing formula all day long. Like implied volatility, this is a root find on a monotone function; unlike vol, you already built the forward function in the *Bond Price* problem.

Given a bond's market price, find the annual yield $y$ (compounded $m$ times per year) such that:

$$P(y) = \sum_{t=1}^{N} \frac{cF/m}{(1 + y/m)^t} + \frac{F}{(1 + y/m)^N}$$

equals the observed price ($N = n \cdot m$ periods — the exact conventions from the *Bond Price, Duration & Convexity* problem).

Since price is **strictly decreasing** in yield, the root is unique. Bisection on $y \in [10^{-9}, 2]$ until the bracket is below $10^{-12}$ is bulletproof; Newton with duration as the derivative is the fast alternative.

## Input

First line: $Q$ ($1 \le Q \le 1000$). Each of the next $Q$ lines: `price F c n m` — observed price and the bond's terms ($100 \le F \le 10^6$, $0 \le c \le 0.15$, $1 \le n \le 30$ years, $m \in \{1, 2\}$). Every price corresponds to a true yield in $[0.0005, 0.5]$.

## Output

For each bond: the yield to maturity as a decimal, rounded to 6 places (e.g. `0.043700` for 4.37%).

## Sanity check

A bond priced exactly at face value has $y = c$ — par pricing, the identity you verified in the pricing problem, now running in reverse.
