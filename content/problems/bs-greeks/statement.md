Extend your Black-Scholes pricer with the numbers desks actually watch all day: the **Greeks**. Same $d_1, d_2$ as before; now you also need the standard normal **density** $\varphi(x) = \frac{1}{\sqrt{2\pi}} e^{-x^2/2}$ (not the CDF!).

For a European call:

$$\Delta = N(d_1) \qquad \Gamma = \frac{\varphi(d_1)}{S\sigma\sqrt{T}} \qquad \text{vega} = S\,\varphi(d_1)\sqrt{T}$$

$$\Theta = -\frac{S\,\sigma\,\varphi(d_1)}{2\sqrt{T}} - rKe^{-rT}N(d_2)$$

(Θ per **year**; vega per unit of vol — report the raw derivatives, no per-day or per-1% scaling.)

## Input

First line: $Q$ ($1 \le Q \le 1000$). Each of the next $Q$ lines: `S K r sigma T` (same ranges as the Black-Scholes Pricer problem).

## Output

For each query, one line: `delta gamma vega theta`, each rounded to 6 decimal places.

## Sanity anchors

Gamma and vega are identical for the call and the put at the same strike (differentiate put-call parity twice / by σ). Delta of an ATM call ≈ 0.5-and-a-bit. Theta is almost always negative for calls — time hurts the holder.
