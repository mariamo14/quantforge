---
title: The Quant Career Map
minutes: 12
---

You're learning the material. This lesson is about where it leads: what the roles actually are, how firms differ, how the interviews differ, and how to pick a target honestly — because "quant" is not one job, and preparing for the wrong one wastes months.

## The three core roles

**Quant Developer** — builds the systems everything else runs on: market-data feed handlers, order gateways, backtesting engines, risk systems, research platforms. The craft is software engineering under unusual constraints — performance, correctness, and uptime, with real money on the line. Interviews are C++/systems-heavy: memory model, data structures, low-latency design, OS and networking fundamentals, plus enough probability to prove you can talk to the people using your systems. This is QuantForge's core audience — most of this site's tracks aim here.

**Quant Researcher** — finds the signals. Hypothesize, test, and productionize predictive relationships in market data: alpha research, model building, statistical validation. The craft is applied statistics and ML with brutal empirical discipline (markets are noisy, non-stationary, and full of false positives). Interviews are math/stats/ML-flavored — probability puzzles, stochastic processes, linear regression under adversarial questioning, ML theory — and at many firms the hiring template is PhD-shaped: not always a hard requirement, but the interview assumes research maturity.

**Quant Trader** — makes real-time decisions with the firm's capital: managing positions, quoting, sizing risk, and handling the situations models don't cover. The craft is fast, calibrated judgment under uncertainty. Interviews famously stress mental math, probability brainteasers, market-making games ("make me a market on X, now I trade against you — adjust"), and expected-value reasoning under pressure. Less coding, more thinking-out-loud.

**Adjacent roles, one line each:**
- **Risk quant** — models and monitors the risk of everyone else's positions; more common at banks and multi-strategy funds; math-heavy, steadier pace.
- **FPGA engineer** — implements the fastest tick-to-trade paths in hardware; Verilog/VHDL plus networking; the extreme end of the latency arms race.
- **Data engineer** — builds the pipelines that acquire, clean, and serve the terabytes of market and alternative data research runs on; increasingly critical and chronically undersupplied.

## Firm types: same title, different job

The same "quant developer" title means meaningfully different work depending on the firm.

**HFT firms / market makers** (proprietary trading firms): the technology *is* the edge. Strategies are often simple to state; winning means being faster and more reliable than the competition. Devs are first-class citizens — often the majority of the firm — and the work is deep systems engineering: kernel bypass, lock-free structures, nanosecond-level measurement. Small teams, flat structure, high intensity.

**Hedge funds / quant PMs** (statistical arbitrage, multi-strategy pods): the edge is research depth and capacity — signals that scale to large capital over hours-to-months horizons, not microseconds. Devs build research platforms, backtesters, and execution systems; latency matters but rarely dominates. More separation between research and engineering at some funds, tight integration at others — worth probing in interviews.

**Banks** (sell-side): quants price derivatives, build risk and margin systems, and support trading desks under heavy regulation. Larger organizations, more process, more legacy code, broader scale. The work is steadier and the hours generally saner; the ceiling on comp and autonomy is lower than the buy side, but it's a common and respectable entry point, and derivatives-pricing skills learned there travel well.

| | HFT / market maker | Hedge fund / quant PM | Bank |
|---|---|---|---|
| **Pace** | Intense; production incidents measured in dollars per second | Research-cycle driven; intense around deployment | Steadier; process and release cycles |
| **What wins** | Speed and reliability — tech is the edge | Signal quality and capacity — research is the edge | Scale, correctness, regulatory compliance |
| **Tech stack** | Modern C++, FPGA, kernel bypass, custom everything | Python + C++, large data infrastructure, cloud | Java/C++/Python, large legacy systems |
| **Comp structure** | Salary + discretionary bonus tied to firm/desk PnL; bonus can dominate | Salary + bonus; pods often pay a formulaic PnL cut | Salary + bonus; more stable, smaller upside |
| **Team shape** | Small, flat, dev-heavy | Pods or central platform teams | Large hierarchical orgs |

(Comp levels move with markets and seniority; distrust any source quoting precise numbers. The structural point is stable: prop firms and pods tie pay tightly to PnL, banks pay more predictably with less upside.)

## How interviews differ — and which track serves which role

- **Quant dev:** C++ language and memory-model depth, data structures and algorithms, concurrency, low-latency systems design, OS/networking, some probability. → This site's *C++*, *Concurrency*, *Low-Latency Systems*, and *Data Structures* tracks are the spine; the *Probability* track is your insurance for the crossover round.
- **Quant researcher:** probability and statistics in depth, regression and time series, ML theory and practice, research-design judgment, some coding (usually Python, occasionally C++). → The *Probability*, *Statistics & Regression*, and *ML* tracks map directly; the coding tracks matter at the "can you implement your own research" bar, not the systems bar.
- **Quant trader:** mental math under time pressure, probability brainteasers, market-making games, EV and risk intuition. → The *Probability* and *Brainteaser* material is the direct preparation; markets knowledge from the *Finance* track (CAPM, hedging, market microstructure) gives you the vocabulary.
- **By firm type:** HFT interviews push the technical bar hardest (expect deep C++ and systems for devs, speed for traders); hedge funds weight research design and statistics more; banks add derivatives pricing, regulatory context, and generally calibrate to a broader engineering profile.

## Progression, and the dev → researcher question

Typical paths: dev → senior dev → tech lead / infrastructure owner, or toward the trading side as a strategy/execution developer sitting with a desk. Researchers progress toward owning signals, then a book, then a pod. Traders progress by PnL. Compensation and autonomy at the top of each track are comparable — a principal engineer who owns the trading platform at an HFT firm is not the junior partner.

The question everyone asks: **can I start as a dev and move to research?** Honest answer: it's common, it's possible, and it's *much* easier at firms where devs sit with researchers and traders — small prop shops and integrated pods, where you see the strategies, absorb the intuition, and can start contributing analysis alongside infrastructure. It's harder at firms with a hard wall between "the platform org" and "the research org," where you'd effectively re-interview. If the transition is your plan, weight firm structure heavily in your choice — ask directly in interviews where devs sit and whether anyone has made the move. And know that the transition is earned with statistics and market intuition built on the side, not granted for tenure.

## How to choose

The energy test: **do you want to build the engine, or drive the car?** If your best days are the ones where you made something fast, correct, and elegant — and the market it trades is interesting context — you're a dev. If you'd rather stare at data hunting for a pattern nobody else has found, and the infrastructure is just a means, you're a researcher. If you crave the scoreboard — real-time decisions, immediate feedback, PnL with your name on it — you're a trader. Most people, when honest, know.

And a structural argument for the path this site centers: **quant dev is the most robust entry point into the industry.** Every firm type needs many of them — there are simply more seats. The interview is the most learnable of the three (systems and C++ yield to deliberate practice in a way that research taste does not). The skills transfer completely — a quant dev who leaves the industry is a strong systems engineer anywhere; a signal researcher's edge is less portable. And once you're inside, you can see the other roles up close before betting your career on one.

None of this is easy. The bar is genuinely high, the interviews are demanding, and the first job is the hardest to get. But the material is learnable, the map is knowable, and you're already doing the work. Pick the seat that matches your energy, prepare for *that* interview, and go get it.

## Interview checkpoints

- Explain the three core roles in one line each: devs build the systems, researchers find the signals, traders make real-time risk decisions — and name what each interview stresses.
- How does "quant dev" differ at an HFT firm vs a hedge fund vs a bank? (Tech-is-the-edge latency work; research-platform and execution work; regulated pricing/risk systems at scale.)
- What's the honest answer on the dev-to-researcher transition? (Common and possible, but far easier at firms where devs sit with researchers — firm structure matters more than ambition.)
- Why is quant dev a robust entry point? (Most seats, most learnable interview, fully transferable skills, and a view of the other roles from inside.)
- What's the energy test for choosing a role, and why does comp structure differ across firm types? (Build the engine vs drive the car; prop firms and pods tie pay to PnL, banks trade upside for stability.)
