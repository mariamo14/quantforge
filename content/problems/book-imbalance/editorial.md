# Editorial

Two formulas and an edge detector — deliberately simple code, because the value is in understanding *what* you're computing and the one classic bug in the counting.

## Reading the formulas

- **Imbalance** lives in $[-1, +1]$: $+1$ means all resting size is on the bid (heavy buying interest), $-1$ all on the ask. It is among the strongest *simple* predictors of the next mid-price move at horizons of seconds — and nearly useless at horizons of days. Knowing both halves of that sentence matters.
- **Microprice** cross-weights on purpose: with a huge bid queue ($V_b$ large), the traded price is more likely to end up at the ask ($P_a$) — the thin side gives way. So $V_b$ multiplies $P_a$. Writing $(V_bP_b + V_aP_a)/(V_b+V_a)$ — the "intuitive" same-side weighting — produces a *size-weighted mid* that moves the **wrong way**; it's the most common implementation error in first order-book feature pipelines, and the statement's emphasis exists because real desks have shipped it.

## The edge detector

"Crossed from below to at-or-above" is a **rising-edge** count, not a level count. Track the previous state (one boolean); increment only on the transition. Counting every update where imbalance ≥ θ (level-triggered) over-counts by orders of magnitude, and in a real strategy would mean firing an order on every tick while the book stays lopsided — the difference between an event and a state, a distinction that recurs in every alerting and signal system (compare the monitoring lesson's "alert on symptoms, page on transitions").

The first-update convention (counts if already above) is the natural initialization `wasBelow = true` — no special case needed.

## From here to a real signal

The production version adds: multiple depth levels (weighted imbalance), decay/smoothing (EWMA of imbalance — your EWMA problem), a fitted threshold rather than a given one, and an evaluation harness (does the signal predict the next move better than chance? — the backtester case study). This problem is deliberately the first station of that pipeline.

## Complexity

$O(1)$ per update. Doubles are safe: one subtraction, one division per formula, operands exact integers well inside $2^{53}$.
