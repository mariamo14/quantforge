---
title: "Volatility: Realized, EWMA, GARCH"
minutes: 15
---

# Volatility: Realized, EWMA, GARCH

Price is observable. Volatility is not. Every number anyone quotes for "the vol" is the output of an **estimator** or a **model**, and each choice embeds assumptions. Interviewers use volatility questions to test whether you understand that distinction — and whether you know the one empirical fact that all of this machinery exists to capture.

## Estimating what you can't see

The workhorse estimator is close-to-close **realized volatility**. Take $n$ daily log returns $r_t = \ln(P_t / P_{t-1})$, assume mean zero (over daily horizons the drift is negligible relative to noise — estimating it adds more error than it removes), and compute the annualized variance:

$$
\hat\sigma^2 = \frac{252}{n} \sum_{t=1}^{n} r_t^2
$$

The factor 252 is the number of trading days per year. Variance of i.i.d. returns scales linearly with time, so volatility scales with the **square root** of time:

$$
\hat\sigma_{\text{annual}} = \sqrt{252}\;\hat\sigma_{\text{daily}}
$$

A daily vol of 1% is an annual vol of roughly 16% — the "rule of 16" ($\sqrt{252} \approx 15.87$). Interviewers expect this conversion to be instant.

The estimator's weakness: with a short window it's noisy; with a long window it's stale. This tension is the entire motivation for what follows.

## The stylized fact: volatility clusters

If returns were i.i.d., yesterday's turbulence would say nothing about today's. Empirically the opposite holds: **large moves follow large moves, calm follows calm**. Returns themselves are nearly uncorrelated, but *squared* returns are strongly autocorrelated for weeks. This is volatility clustering — *the* stylized fact of financial returns — and it means volatility is forecastable even when direction is not. Every model below is an attempt to exploit it.

## EWMA / RiskMetrics

A rolling window weights the last $n$ days equally and day $n{+}1$ at zero — an arbitrary cliff. The exponentially weighted moving average replaces the cliff with geometric decay:

$$
\sigma_t^2 = \lambda\,\sigma_{t-1}^2 + (1-\lambda)\,r_t^2
$$

Unrolling the recursion, the weight on the return from $k$ days ago is $(1-\lambda)\lambda^k$: every observation counts, recent ones count more. RiskMetrics standardized $\lambda = 0.94$ for daily data, which puts a half-life on information of $\ln(0.5)/\ln(0.94) \approx 11$ days.

Why exponential weighting? It's the cleanest resolution of the **responsiveness vs noise trade-off**. Small $\lambda$ reacts fast to a regime change but is jumpy (effectively a short window); large $\lambda$ is smooth but slow (long window). $\lambda = 0.94$ is a pragmatic compromise that fit a wide panel of assets well. Bonus points for noting the recursion is $O(1)$ per update with $O(1)$ state — you never store the window — which is why it's beloved in production risk systems.

EWMA's limitation: it has no anchor. After a shock it drifts wherever the data pushes it and **never reverts to a long-run level**, and its $k$-day-ahead forecast is flat at today's estimate.

## GARCH(1,1)

GARCH adds exactly the missing ingredient — a long-run mean:

$$
\sigma_t^2 = \omega + \alpha\, r_{t-1}^2 + \beta\, \sigma_{t-1}^2
$$

Read the three terms as forces: $\omega$ pulls toward a baseline, $\alpha$ injects news (yesterday's squared return), $\beta$ carries memory (yesterday's variance estimate). Provided $\alpha + \beta < 1$, taking unconditional expectations of both sides ($\mathbb{E}[r_{t-1}^2] = \mathbb{E}[\sigma_{t-1}^2] = \bar\sigma^2$) gives the long-run variance the process mean-reverts to:

$$
\bar\sigma^2 = \frac{\omega}{1 - \alpha - \beta}
$$

**Persistence** is $\alpha + \beta$: how slowly shocks decay. Equity index fits routinely give $\alpha \approx 0.05$–\$0.10$, $\beta \approx 0.90$, so $\alpha + \beta \approx 0.97\$–\$0.99\$ — shocks take months to wash out, which is precisely volatility clustering rendered in two parameters.

The connection interviewers fish for: **EWMA is degenerate GARCH**. Set $\omega = 0$ and $\alpha + \beta = 1$ (with $\alpha = 1 - \lambda$, $\beta = \lambda$) and GARCH(1,1) collapses exactly to the EWMA recursion — an integrated (IGARCH) process with infinite-memory persistence and no mean reversion. That's not trivia; it tells you *when* each model is appropriate: EWMA for short-horizon risk where you just want to track current vol, GARCH when the forecast horizon is long enough that mean reversion matters.

## Term structure of forecasts

GARCH's mean reversion produces a forecast **term structure**. The $k$-step-ahead variance forecast decays geometrically toward the long-run level:

$$
\mathbb{E}_t\!\left[\sigma_{t+k}^2\right] - \bar\sigma^2 = (\alpha + \beta)^{\,k-1} \left( \sigma_{t+1}^2 - \bar\sigma^2 \right)
$$

If current vol is above $\bar\sigma$, the forecast curve slopes down; if below, up — qualitatively matching how implied vol term structures behave after a shock (short-dated vol spikes, long-dated barely moves). EWMA, by contrast, forecasts a flat line.

## Implied vs realized: the variance risk premium

Everything above is backward-looking (**realized/physical measure**). **Implied volatility** is forward-looking: the $\sigma$ that makes a market option price match Black-Scholes — the market's risk-neutral consensus. Systematically, implied exceeds subsequently realized volatility; the gap is the **variance risk premium**. It isn't (only) a forecast error: sellers of options are short convexity and short crash risk, and they charge for it. This premium is why "short vol" strategies earn steady carry punctuated by occasional disasters, and mentioning it shows you understand that implied vol is a *price*, not merely a prediction.

## Interview checkpoints

- Vol is not observable — everything is an estimator; know $\hat\sigma^2 = \frac{252}{n}\sum r_t^2$ and the $\sqrt{252}$ (rule-of-16) annualization cold.
- Volatility clustering is *the* stylized fact: returns uncorrelated, squared returns strongly autocorrelated — that's why vol is forecastable.
- EWMA: $\sigma_t^2 = \lambda\sigma_{t-1}^2 + (1-\lambda)r_t^2$, $\lambda = 0.94$ daily, weights $(1-\lambda)\lambda^k$, $O(1)$ updates; exponential decay is the responsiveness-vs-noise compromise.
- GARCH(1,1): know all three terms, the long-run variance $\bar\sigma^2 = \omega/(1-\alpha-\beta)$, and persistence $\alpha+\beta$ (typically $\approx 0.98$ for equities).
- The punchline connection: EWMA = GARCH with $\omega = 0,\ \alpha + \beta = 1$ — no mean reversion, flat forecasts.
- Implied > realized on average: the variance risk premium — implied vol is a price with a risk premium in it, not just a forecast.
