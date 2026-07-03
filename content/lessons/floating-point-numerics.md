---
title: Floating Point for Quants
minutes: 14
---

# Floating Point for Quants

Every quant dev interview loop has a floating-point question, because every P&L discrepancy, every backtest that won't reproduce, and every risk number that disagrees with the vendor's traces back to someone treating `double` like a real number. Interviewers want to see that you know the representation, can name the failure modes, and reach for the right fix without being told.

## IEEE 754 doubles: the representation

A `double` is 64 bits: 1 sign bit, 11 exponent bits, 52 mantissa bits. With the implicit leading 1, you get **53 bits of significand** ≈ 15–17 significant decimal digits. Every integer up to $2^{53} = 9{,}007{,}199{,}254{,}740{,}992$ is exactly representable; beyond that, consecutive doubles are more than 1 apart and integers start getting skipped.

**Machine epsilon** for double is $2^{-52} \approx 2.22 \times 10^{-16}$: the gap between 1.0 and the next representable double. A **ULP** (unit in the last place) is that gap *scaled to the magnitude of the number* — near $10^{12}$, one ULP is about $10^{-4}$. This is why "is the error small?" is meaningless without asking "relative to what?"

## The classic traps

**0.1 + 0.2 != 0.3.** Decimal fractions like 0.1 are repeating binary fractions; each rounds to the nearest double, and the sum rounds again: `0.1 + 0.2 == 0.30000000000000004`. Never `==` on computed floats.

**Catastrophic cancellation** — subtracting two nearby quantities annihilates the leading, *correct* digits and promotes accumulated noise. THE canonical example is variance via $E[X^2] - E[X]^2$:

```cpp
// BAD: for prices near 100.0 with tiny variance, sum_sq/n and mean*mean
// agree to ~12 digits; the subtraction leaves almost pure rounding noise
// and can even go negative.
double var = sum_sq / n - mean * mean;
```

The fix every interviewer wants to hear is **Welford's online algorithm** — one pass, numerically stable, and streaming-friendly (perfect for live market data):

```cpp
struct Welford {
    long long n = 0;
    double mean = 0.0, m2 = 0.0;

    void add(double x) {
        ++n;
        double d1 = x - mean;
        mean += d1 / n;
        m2   += d1 * (x - mean);   // uses the *updated* mean
    }
    double variance() const { return n > 1 ? m2 / (n - 1) : 0.0; }
};
```

**Accumulation error in long sums.** Naively summing $n$ values grows error like $O(n)$ ULPs in the worst case — summing a day of trade P&Ls (millions of terms) can lose several digits. **Kahan summation** carries the rounding error in a compensation term:

```cpp
double kahan_sum(std::span<const double> xs) {
    double sum = 0.0, c = 0.0;          // c = running compensation
    for (double x : xs) {
        double y = x - c;
        double t = sum + y;
        c = (t - sum) - y;              // recovers what the add lost
        sum = t;
    }
    return sum;
}
```

(Pairwise summation is the other acceptable answer — it's what NumPy uses.) Note Kahan *requires* that the compiler not "simplify" `(t - sum) - y` to zero — another reason `-ffast-math` is dangerous.

**Comparing floats.** The standard interview pattern combines an absolute tolerance (for values near zero) with a relative one (for everything else):

```cpp
bool almost_equal(double a, double b,
                  double abs_tol = 1e-12, double rel_tol = 1e-9) {
    double diff = std::abs(a - b);
    if (diff <= abs_tol) return true;                       // near zero
    return diff <= rel_tol * std::max(std::abs(a), std::abs(b));
}
```

Be ready to say *why both*: relative tolerance alone fails when comparing against 0.0; absolute alone fails at large magnitudes.

## Associativity is broken → reproducibility discipline

Floating-point addition is commutative but **not associative**: $(a + b) + c \ne a + (b + c)$ in general. Consequence: a parallel reduction (TBB, OpenMP, GPU) sums in a nondeterministic order, so the same backtest can produce a different P&L run to run. That's a research and compliance nightmare. The disciplines interviewers expect you to name: fix the reduction order (deterministic tree reduction), sum in higher precision (`long double` / double-double), or use integer/fixed-point accumulation for money. Also know that `-ffast-math` licenses the compiler to reassociate — great for throughput, fatal for bit-reproducibility, so firms scope it per-file if they use it at all.

## When to use integers instead

Prices and money often shouldn't be floats at all. Exchanges quote in **ticks**: represent price as `int64_t` ticks (or as a scaled integer, e.g. price × $10^8$ like many crypto venues) and P&L in integer minor units. You get exact arithmetic, exact comparison, associative summation, and no cumulative drift — convert to double only at the analytics boundary. A strong answer: "the matching-engine side of my code is integer ticks end to end; doubles appear only in signals and risk."

## Denormals: the performance cliff

Denormal (subnormal) numbers fill the gap between zero and the smallest normal double (~$2.2 \times 10^{-308}$), preserving gradual underflow. The catch: on many x86 cores, an operation producing or consuming a denormal takes a **microcode assist — up to ~100x slower**. A decaying EWMA or IIR filter that trails off toward zero can quietly fall into denormal territory and blow your latency budget. HPC and trading builds therefore set **FTZ** (flush-to-zero results) and **DAZ** (treat denormal inputs as zero):

```cpp
#include <xmmintrin.h>
#include <pmmintrin.h>
_MM_SET_FLUSH_ZERO_MODE(_MM_FLUSH_ZERO_ON);      // FTZ
_MM_SET_DENORMALS_ZERO_MODE(_MM_DENORMALS_ZERO_ON); // DAZ
```

Knowing this exists — and that it's per-thread state — is a strong latency-engineering signal.

## Float vs double

`float` gives 24-bit significand (~7 digits) but **twice the SIMD lanes** (8 floats vs 4 doubles per AVX2 register) and half the memory bandwidth and cache footprint. Rule of thumb: `float` for bulk signal math, ML feature pipelines, and anywhere ~7 digits suffices; `double` for accumulations, P&L, optimization routines, and anything involving subtraction of near-equal quantities. The trade-off answer interviewers want: it's a bandwidth/precision trade, and the danger concentrates in *reductions*, so a common pattern is float data with double accumulators.

## Interview checkpoints

- 64-bit double = 1 sign + 11 exponent + 52 mantissa bits; 53-bit significand ≈ 15–17 digits; integers exact up to $2^{53}$.
- Epsilon ($\approx 2.22\times10^{-16}$) is the gap at 1.0; a ULP scales with magnitude — always think in relative error.
- Variance via $E[X^2] - E[X]^2$ is catastrophic cancellation; the fix is Welford. Be able to write it.
- Long sums: Kahan (or pairwise) summation; know why `-ffast-math` breaks Kahan and reproducibility.
- Compare with absolute *and* relative tolerance; never `==`; explain why each alone fails.
- Prices in integer ticks, money in minor units; FTZ/DAZ for the denormal cliff; float-data/double-accumulator for SIMD hot paths.
