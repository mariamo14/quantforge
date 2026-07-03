# Editorial

One loop over periods accumulates everything: PV, the PV-weighted time for Macaulay, and the convexity sum. The finance is in the conventions; the code is bookkeeping.

## Sanity anchors (know these cold)

- **Par bond:** when $c = y$, price = face. Instant pricer check, and the first thing an interviewer asks you to verify.
- **Zero-coupon:** Macaulay duration = maturity, exactly. A coupon bond's duration is always *less* than maturity — coupons pull the average cashflow time forward.
- **Inverse price-yield:** higher $y$ → lower $P$, and duration is precisely the (negative, scaled) slope: $\frac{dP}{dy} = -D_{\text{mod}} \cdot P$.

## How the numbers are used

The desk quotes risk as **DV01** $= D_{\text{mod}} \cdot P \cdot 10^{-4}$ — dollars per basis point. The second-order correction is convexity:

$$\Delta P \approx -D_{\text{mod}} P \,\Delta y + \tfrac{1}{2} C P (\Delta y)^2$$

Convexity is *good* for the holder (gains on big moves in either direction beat the linear estimate), which is why high-convexity bonds trade rich — a talking point that separates candidates who computed the number from those who understand it.

## Why the convexity formula has $t(t+1)$ and $m^2$

Differentiate the per-period discount factor twice: $\frac{d^2}{dy^2}(1+y/m)^{-t}$ brings down $t(t+1)/m^2$ and raises the exponent by 2 — the statement's formula is exactly $\frac{1}{P}\frac{d^2P}{dy^2}$. Duration is the first derivative, convexity the second: Taylor expansion, nothing more mysterious.

## Precision notes

`std::pow` per term is fine at this scale; an incremental `df *= invRate` multiply is faster and equally accurate over ≤ 60 periods. All sums are positive terms of similar magnitude — no cancellation risk, so plain doubles print stable 4-decimal answers.
