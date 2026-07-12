# Editorial

Structurally identical to the implied-volatility solver — monotone forward function, unique root, bisection can't fail — but the *direction* flips: bond price **falls** as yield rises, so the bracket update inverts. Writing the comparison comment (`computed price too high ⇒ yield must be higher`) before coding is exactly how you avoid the sign bug that plagues first attempts.

## Bisection vs Newton here

Newton's derivative is free finance: $P'(y) = -D_{\text{mod}} \cdot P$ — modified duration, which you already compute in the pricing loop. Newton with duration converges in 3–4 iterations and is what real curve-building code uses (thousands of bonds, every tick). The production-grade answer to "how would you speed this up?" is: *Newton seeded with the current market yield, bisection fallback if the step exits the bracket* — the same hybrid as implied vol.

## Conventions matter more than math

YTM answers differ across systems not because of solvers but because of **day counts, settlement dates, and accrued interest** (clean vs dirty price). This problem pins whole-year maturities and clean conventions so there is exactly one answer; in interviews, *mentioning* that real YTM needs a day-count convention (30/360 vs ACT/ACT) is a strong signal even when the question ignores it.

## Where this runs in production

- **Curve bootstrapping:** solving yields/zero rates instrument by instrument to build the discount curve — this exact solver in a loop with dependencies.
- **Risk transformations:** converting price moves to yield moves (and back) via duration — the linearization this solver makes exact.
- **Relative value:** rich/cheap screens rank bonds by yield spread; a slow or fragile solver caps the universe you can scan.

## Complexity

$O(\text{iterations} \times N)$ per bond — bisection's ~200 × 60 = 12k pricing-loop steps, trivially fast. Newton cuts iterations 50×; at scale that matters.
