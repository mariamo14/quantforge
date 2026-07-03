# Editorial

Historical-simulation VaR is deliberately simple — no distributional assumption, just "replay history against today's portfolio." The implementation is a dot product, a sort, and an indexing convention.

## The convention is the hard part

Quantile definitions differ across textbooks, `numpy.percentile` modes, and risk systems — which is why the statement pins one down. With $T = 500$ and $c = 0.95$: $k = 25$, VaR is the 26th-worst loss, ES averages the 25 worst. Off-by-one here isn't pedantry: at $c = 0.99$, $k$ is small and one index shifts ES noticeably.

One genuinely sneaky detail: computing `(1-c)*T` in floating point. `0.05 * 500` can evaluate to `24.999999...`, and truncating gives 24, not 25. Adding an epsilon before the floor (`+1e-9`) — or computing in integers when $c$ has two decimals — avoids a wrong answer that is *invisible in testing with friendly numbers*. Risk engines have shipped this bug.

## VaR vs ES in one breath

VaR answers "what loss is exceeded only 5% of days" and says nothing about *how bad* those days are; ES answers "when we do breach, how bad is it on average." ES is coherent (subadditive — diversification never looks penalized) and is what Basel's FRTB uses. Saying that sentence, unprompted, is worth a lot in a risk-flavored interview.

## Extensions interviewers reach for

- **Full-revaluation vs delta approximation** for books with options (historical returns applied to risk factors, portfolio repriced).
- **Exponentially weighted** historical VaR (recent days matter more).
- **Backtesting:** count VaR breaches over the sample — roughly $(1-c)T$ expected; way more means the window missed a regime.

## Complexity

$O(TA)$ for returns, $O(T \log T)$ for the sort; a `nth_element` + partial sum does it in $O(T)$ if you're showing off.
