---
title: Machine Learning in Finance
minutes: 14
---

ML interviews at quant firms are rarely about architectures. They're about whether you understand **why finance breaks textbook ML** — and whether you'd notice when your beautiful backtest is a mirage. A strong engineer who knows the failure modes beats a Kaggle grandmaster who doesn't.

## Why finance is a hostile domain

**Low signal-to-noise.** In vision, the label is essentially a deterministic function of the input. In markets, tomorrow's return is *almost entirely* noise: a daily-horizon strategy with an information coefficient (correlation between forecast and outcome) of 0.02 can be excellent. Formally, if $r_{t+1} = f(x_t) + \varepsilon_{t+1}$ with $\mathrm{Var}(f) \ll \mathrm{Var}(\varepsilon)$, then $R^2$ of a few basis points to a fraction of a percent is the realistic ceiling. Consequences: flexible models overfit noise almost instantly, sample sizes that feel large aren't, and evaluation error bars are enormous.

**Non-stationarity.** The data-generating process drifts: regimes change (rates, volatility, microstructure rules), and — uniquely — the market *adapts to you*. A genuine signal decays as others find it and trade it away. There is no fixed distribution to converge to, so "train once, deploy forever" fails by design; models need retraining schedules and decay monitoring.

## Lookahead and leakage: the cardinal sin

**Leakage** = any information in your training/features that would not have been available at decision time. It is the single most common way finance ML dies, and interviewers *will* probe it. Classic forms:

- Using close prices to generate a signal you pretend to trade *at that same close*.
- Features built with statistics computed over the full sample (e.g., normalizing by full-history mean/std — the future leaks through the scaler).
- Survivorship bias: training on today's index constituents means every historical name you see "survived."
- Restated/revised data: fundamentals and economic figures get revised; using the revised value backdates knowledge. Point-in-time databases exist precisely for this.
- Label leakage across overlapping samples — which motivates the next section.

Rule: every feature at time $t$ must be computable from a snapshot of the world at $t$ (or honestly lagged). Timestamp discipline is an *engineering* problem — this is why quant devs own so much of the ML pipeline.

## Purged and embargoed walk-forward CV

Standard $k$-fold CV shuffles data — catastrophic for time series, since the model trains on the future. But even plain walk-forward has a subtler leak when **labels overlap in time**. Concretely: suppose your label at time $t$ is the return over $[t, t+5]$ days. A training sample at $t = 99$ and a test sample at $t = 101$ have overlapping label windows — the training label already contains part of the test outcome. The model gets graded on information it partially saw.

The fix (López de Prado's protocol):

- **Walk-forward:** train only on data strictly before the test block; step the split forward through time.
- **Purging:** drop training samples whose label window overlaps the test set's label windows. In the example, purge training points in $(96, 101)$ so no training label reaches into test territory.
- **Embargo:** additionally drop a buffer *after* the test set before training resumes (when doing multiple splits), because serial correlation in features/volatility lets test-period information seep into immediately-following samples. A ~1% embargo of the sample is a common default.

Be able to draw this on a whiteboard: a timeline with a train block, a purged gap, a test block, an embargo gap.

## Backtest overfitting

Run enough experiments and something "works" by chance. If you test $N$ independent strategies with zero true skill, the expected best in-sample Sharpe grows like $\sqrt{2\ln N}$ — try 100 variants and your best backtest looks great *for free*. This is multiple-testing bias, and it's the default state of quant research, since every hyperparameter sweep, feature tweak, and re-run is another trial.

The **deflated Sharpe ratio** formalizes the correction: given how many trials you ran and the variance of Sharpe estimates (which widens with non-normal returns and short samples), what's the probability the observed Sharpe exceeds what pure selection luck would produce? Intuition to state in interviews: *a backtest Sharpe is a maximum over trials, not a draw — so judge it against the distribution of maxima.* Practical hygiene: count and log every trial, hold out truly untouched data, prefer economically-motivated features over mined ones, and expect out-of-sample performance to be a fraction of in-sample.

## Features: returns, not prices

Prices are non-stationary (roughly integrated of order 1); their sample statistics don't converge and models latch onto level artifacts. Use **returns** — $r_t = \ln(P_t/P_{t-1})$ — or other (near-)stationary transforms: spreads and ratios, z-scores against *rolling, past-only* windows, rank/cross-sectional normalization, volatility-scaled returns. Log returns aggregate additively across time, which simplifies both math and labels. Beware transforms that reintroduce leakage (that full-sample scaler again). Fractional differencing is the exotic answer if asked how to keep memory while achieving stationarity.

## Where ML actually works — and where it's hype

ML earns its keep where data is plentiful, feedback is fast, and the target is more structured than "predict tomorrow's return":

- **Execution:** predicting short-horizon price impact, optimal order slicing and scheduling, venue/routing choice — millions of samples per day, clear cost-based objective.
- **Market-making:** quote placement and **inventory management** as sequential decision problems; short horizons mean the signal-to-noise is comparatively decent.
- **NLP:** extracting sentiment/events from news, filings, transcripts — turning unstructured text into features, where modern language models genuinely moved the needle.
- Also real: volatility forecasting, cross-sectional factor combination, dataset cleaning/entity matching.

The hype zone: end-to-end deep networks ingesting raw prices to predict long-horizon returns. Too little signal, too little stationary data, and the market arbitrages away whatever such a model finds.

**Linear models are strong baselines.** With signal this faint, the bias-variance tradeoff favors heavy bias: ridge/lasso regression on well-engineered features is robust to noise, interpretable, cheap to retrain, and *hard to beat*. The professional workflow is: linear baseline first; complexity must pay rent — demonstrate out-of-sample improvement *after* costs over the linear model. Saying this in an interview signals maturity; reaching for a transformer first signals the opposite.

## Interview checkpoints

- Explain low signal-to-noise concretely: IC ≈ 0.02 can be a great daily signal; flexible models overfit noise.
- Non-stationarity is structural: regimes shift and alpha decays *because* the market adapts; models need retraining and decay monitoring.
- Name four leakage modes (same-bar execution, full-sample normalization, survivorship bias, restated data) and the rule: features at $t$ use only information available at $t$.
- Draw purged + embargoed walk-forward CV and explain *why* overlapping label windows leak.
- Backtest overfitting: best-of-$N$ Sharpe grows like $\sqrt{2\ln N}$; deflated Sharpe judges the observed number against selection luck; log your trials.
- Returns not prices (stationarity); linear models as the baseline that complexity must beat out-of-sample, after costs.
