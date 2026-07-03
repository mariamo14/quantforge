Implement the Black-Scholes formulas for European options — the "hello world" of quant finance, and a real question at desks that want to see whether you can translate math to code without an off-by-one in $d_1$.

For spot $S$, strike $K$, rate $r$, volatility $\sigma$, and time to expiry $T$ (years):

$$d_1 = \frac{\ln(S/K) + (r + \sigma^2/2)\,T}{\sigma \sqrt{T}}, \qquad d_2 = d_1 - \sigma\sqrt{T}$$

$$C = S\,N(d_1) - K e^{-rT} N(d_2), \qquad P = K e^{-rT} N(-d_2) - S\,N(-d_1)$$

$$\Delta_{\text{call}} = N(d_1), \qquad \Delta_{\text{put}} = N(d_1) - 1$$

where $N(\cdot)$ is the standard normal CDF. Use

$$N(x) = \frac{1}{2}\left(1 + \operatorname{erf}\!\left(\frac{x}{\sqrt{2}}\right)\right)$$

with `std::erf` from `<cmath>`.

## Input

The first line contains $Q$ — the number of pricing requests ($1 \le Q \le 1000$).

Each of the next $Q$ lines: `S K r sigma T` (decimals; $0.01 \le S, K \le 10^5$; $0 \le r \le 0.20$; $0.05 \le \sigma \le 2$; $0.01 \le T \le 30$).

## Output

For each request, one line with four values separated by single spaces, each rounded to 4 decimal places:

`call put deltaCall deltaPut`

## Sanity checks worth coding

Put-call parity $C - P = S - Ke^{-rT}$ should hold to rounding; deltas satisfy $\Delta_{\text{call}} - \Delta_{\text{put}} = 1$.
