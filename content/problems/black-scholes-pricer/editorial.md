# Editorial

Direct translation of the formulas — the skill being tested is *care*, not cleverness.

## Where implementations go wrong

- **$d_1$ sign errors:** it's $r + \sigma^2/2$ in the numerator (risk-neutral drift of $\ln S$ plus the Itô half-vol correction *added back*). Writing $r - \sigma^2/2$ silently prices everything a touch wrong — put-call parity catches it instantly, which is why the statement tells you to check it.
- **The normal CDF:** `std::erf` is in `<cmath>` and gives $N(x) = \tfrac12(1 + \operatorname{erf}(x/\sqrt2))$ to full double precision. Hand-rolled Abramowitz-Stegun polynomial approximations (error ~$10^{-7}$) also pass at 4 decimals but are the wrong habit when the standard library does it better.
- **Reusing subexpressions:** compute $\sigma\sqrt{T}$ and $e^{-rT}$ once. In a real pricer these get called millions of times in calibration loops; the discipline matters.

## The checks that make you look senior

1. **Put-call parity** $C - P = S - Ke^{-rT}$ — model-free, holds exactly, catches most bugs.
2. **Delta relation** $\Delta_C - \Delta_P = 1$ — free given $N(-x) = 1 - N(x)$.
3. **Limits:** as $\sigma \to 0$, the call tends to $\max(S - Ke^{-rT}, 0)$; deep ITM call delta → 1. Sanity limits like these are how desks smoke-test pricers.

## Follow-ups interviewers reach for

Vega ($S\sqrt{T}\,\varphi(d_1)$), gamma ($\varphi(d_1)/(S\sigma\sqrt{T})$) — both need the normal *PDF*, not CDF — and implied volatility, which inverts this formula with Newton's method using vega as the derivative. If this problem took you five minutes, implement implied vol as an exercise; it's the natural sequel.
