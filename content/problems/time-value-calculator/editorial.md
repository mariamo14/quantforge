# Editorial

One growth factor does both directions: $(1+r)^n$ multiplies going forward in time, divides going backward. That symmetry is the entire concept — discounting **is** compounding run in reverse.

## The two ideas hiding in three lines

1. **Compounding is multiplicative.** Year two's interest is earned on year one's interest. Over long horizons this dominates everything: at 7%, money doubles roughly every $72/7 \approx 10$ years (the Rule of 72 from the lesson) — so 40 years ≈ 4 doublings ≈ 16×, where simple interest would give only 3.8×.
2. **A discount factor is a price.** $1/(1+r)^n$ is literally what \$1 delivered in $n$ years costs today. Real pricing systems keep a table of discount factors (a "curve") and value any future cashflow by multiplying. When you later meet bond pricing — $P = \sum CF_t \cdot DF_t$ — it is this problem in a loop.

## Notes for later problems

- `std::pow(1+r, n)` is fine here. In tight loops (a million cashflows), you'd compute the factor once per (r, n) or accumulate it incrementally — the habit shows up in the *Bond Price, Duration & Convexity* problem.
- We used doubles for a *display* calculation. When money must be **exact** — accounting, notional sums — you'll switch to integer cents; that's the point of *Fixed-Point Notional* in the C++ track.
- Continuous compounding $e^{rt}$ is the limit of compounding ever more often; quant models use it because calculus prefers $e^{x}$. Same idea, smoother math.
