# Editorial

Implied vol is a one-dimensional root find on a function that is **strictly increasing** in $\sigma$ (vega $= S\sqrt{T}\varphi(d_1) > 0$). Monotonicity is what makes the problem well-posed: one price, one vol.

## Bisection: the bulletproof baseline

Bracket $[10^{-9}, 5]$, halve 200 times (or until the bracket is $< 10^{-12}$). Each step is one BS evaluation; 50 steps already give $\sim 10^{-15}$ precision. It cannot diverge, needs no derivative, and handles every corner of the surface. For 1000 queries it's instant — which is why the reference does exactly this.

## Newton: what production uses

$$\sigma_{n+1} = \sigma_n - \frac{\text{BS}(\sigma_n) - C_{\text{mkt}}}{\text{vega}(\sigma_n)}, \qquad \text{vega} = S\sqrt{T}\,\varphi(d_1)$$

Quadratic convergence — typically 3–5 iterations. The catch interviewers probe: **vega collapses** for deep ITM/OTM options (both $N(d_1)$ tails flatten), so a naive Newton step can overshoot wildly or divide by ~0. Production solvers guard Newton with a bisection fallback when the step leaves the bracket — a hybrid that is both fast and safe. (The state of the art is Jäckel's "Let's Be Rational," which gets machine precision in ~2 iterations via clever transformations — worth name-dropping.)

## Numerical hygiene that matters here

- Work with the *price residual*, not relative error — prices near intrinsic have tiny extrinsic value and relative error explodes.
- The no-arbitrage bounds in the statement aren't decoration: outside $(\max(S - Ke^{-rT}, 0), S)$ **no solution exists**, and a real system must reject the quote, not loop forever.
- Vol quotes cluster around 0.1–1.0, but crash tails print 2.0+; the wide bracket costs bisection almost nothing.

## Why desks care

Implied vol is the *coordinate system* of options trading: quotes, risk, and surface models all live in vol space. The inversion runs on every tick for thousands of strikes — accuracy *and* worst-case behavior both matter, which is exactly the bisection/Newton trade-off you just navigated.
