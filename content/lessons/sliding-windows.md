---
title: Sliding Windows & Streaming Statistics
minutes: 12
---

# Sliding Windows & Streaming Statistics

Market data doesn't wait for you. A feed handler sees a tick once, updates its state, and moves on — there is no going back to re-scan the last million trades because your rolling mean needs recomputing. Every statistic you maintain must be updatable in **O(1)** (or amortized O(1)) per event. This constraint is the theme of this lesson, and it shows up constantly in quant dev interviews: "compute X over the last N trades / last 5 seconds, streaming."

## Rolling sum and mean: the ring buffer

For a fixed window of $N$ ticks, keep a ring buffer and a running sum. On each new price $x$: subtract the element falling out, add the new one.

```cpp
struct RollingMean {
    std::vector<double> buf;
    size_t idx = 0, count = 0;
    double sum = 0.0;
    explicit RollingMean(size_t n) : buf(n, 0.0) {}
    double push(double x) {
        sum += x - buf[idx];
        buf[idx] = x;
        idx = (idx + 1) % buf.size();
        count = std::min(count + 1, buf.size());
        return sum / count;
    }
};
```

Simple, O(1), cache-friendly. But there's a trap hiding in `sum` — more on that below.

## Rolling variance: Welford's algorithm

The naive formula $\operatorname{Var} = \frac{1}{n}\sum x_i^2 - \bar{x}^2$ is a classic interview landmine: it subtracts two large, nearly equal numbers. For prices like 4512.25, $\sum x^2$ is huge and the difference loses most of its significant digits — **catastrophic cancellation**. Welford's algorithm updates mean and the sum of squared deviations ($M_2$) incrementally and stably:

```cpp
struct Welford {
    long long n = 0;
    double mean = 0.0, M2 = 0.0;
    void push(double x) {
        ++n;
        double delta = x - mean;
        mean += delta / n;
        M2 += delta * (x - mean);   // note: uses the *updated* mean
    }
    double variance() const { return n > 1 ? M2 / (n - 1) : 0.0; }
};
```

For a *windowed* variance, pair Welford-style updates with a removal step (or maintain two Welford accumulators and merge). If asked in an interview, deriving the update $M_2 \mathrel{+}= \delta \cdot (x - \text{mean}_{\text{new}})$ from the definition earns real points.

## Rolling max/min: the monotonic deque

The classic. "Best bid over the last 1000 updates" — you can't afford O(N) per tick. Keep a deque of indices whose values are **monotonically decreasing** (for max). New element kills everything smaller from the back; expired indices fall off the front. Each element enters and leaves the deque once → **O(1) amortized**.

```cpp
std::deque<size_t> dq;  // indices, values decreasing
void push(size_t i, const std::vector<double>& v, size_t window) {
    while (!dq.empty() && v[dq.back()] <= v[i]) dq.pop_back();
    dq.push_back(i);
    if (dq.front() + window <= i) dq.pop_front();
    // v[dq.front()] is the rolling max
}
```

Interviewers love this because most candidates reach for a heap (O(log n), plus stale-entry headaches). Know the invariant cold: *the deque front is always the current window max; anything dominated by a newer, larger value can never be the answer again, so discard it.*

## Rolling VWAP

Volume-weighted average price over a window: maintain two rolling sums, $\sum p_i q_i$ and $\sum q_i$, each via ring buffer as above.

$$\text{VWAP} = \frac{\sum_i p_i q_i}{\sum_i q_i}$$

Watch the edge case: zero total volume in the window (illiquid symbol, quiet period). Say it out loud in the interview before the interviewer does.

## EWMA: the quant's favorite window

Hard windows have a discontinuity problem: a large trade dropping out of the window moves your statistic *now*, even though nothing just happened in the market. The exponentially weighted moving average avoids this:

$$\text{ema} \leftarrow \alpha x + (1-\alpha)\,\text{ema}$$

One multiply-add per tick, **no buffer at all**, and the influence of old data decays smoothly. Quants often prefer EWMA for volatility estimates and signal smoothing precisely because of the smooth decay, tiny memory footprint, and one tunable parameter ($\alpha$, or equivalently a half-life: $\alpha = 1 - 2^{-1/h}$). The trade-off: no exact "last N events" semantics, and you must decide how to handle irregular event spacing (time-decayed EWMA uses $\alpha = 1 - e^{-\Delta t/\tau}$).

## Pitfalls that separate candidates

- **Floating-point drift.** The ring-buffer trick `sum += x - old` accumulates rounding error forever in a long-running process. After a few billion ticks your "rolling sum" has quietly drifted. Mitigations: periodically recompute the sum from the buffer, use Kahan (compensated) summation, or use integers — prices in ticks and quantities in lots are exact in `int64_t`. Real trading systems do the last one.
- **Catastrophic cancellation.** Any formula of the shape *(big) − (big)* is suspect. The naive variance is the canonical example; quoting Welford is the canonical fix.
- **Windows by time vs. by count.** "Last 5 seconds" needs a deque of timestamped entries with eviction on each update — and you must handle bursts (thousands of events per millisecond) and gaps (nothing for a minute).
- **Warm-up.** What does your statistic return before the window fills? Return `nan`, the partial-window value, or suppress the signal — pick one deliberately and say why.

## Interview checkpoints

- Streaming constraint: every update must be O(1)/amortized O(1); you never re-scan history.
- Write Welford's variance update from memory and explain *why* the naive formula fails (catastrophic cancellation).
- Monotonic deque for rolling max/min: state the invariant and the amortized O(1) argument before coding.
- Rolling VWAP = two rolling sums; call out the zero-volume edge case unprompted.
- EWMA: one multiply-add, no buffer, smooth decay — know $\alpha$ vs. half-life and why quants often prefer it to hard windows.
- Long-running sums drift; fixes are periodic recompute, Kahan summation, or integer arithmetic in ticks/lots.
