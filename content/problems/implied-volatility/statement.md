Markets don't quote option prices in volatility — they quote prices, and every desk *inverts* Black-Scholes to get the **implied volatility**. That inversion is a root-finding problem you will implement many times in a quant career; do it once properly here.

Given a European call's market price $C_{\text{mkt}}$, find the $\sigma$ such that:

$$\text{BS}(S, K, r, \sigma, T) = C_{\text{mkt}}$$

where $\text{BS}$ is the Black-Scholes call formula (see the *Black-Scholes Pricer* problem; $N(x) = \tfrac12(1 + \operatorname{erf}(x/\sqrt2))$).

Since vega $\partial C/\partial \sigma > 0$, the root is unique — any correct solver converges to the same answer. Bisection on $\sigma \in [10^{-9}, 5]$ is bulletproof; Newton with vega is faster. Iterate until the interval (or update) is below $10^{-10}$.

## Input

The first line contains $Q$ ($1 \le Q \le 1000$).

Each of the next $Q$ lines: `price S K r T` — the observed call price and the remaining parameters (decimals). Every price is guaranteed to lie strictly within the no-arbitrage bounds $\left(\max(S - Ke^{-rT}, 0),\; S\right)$, with true implied volatility in $[0.01, 4]$.

## Output

For each query: the implied volatility, rounded to 6 decimal places.
