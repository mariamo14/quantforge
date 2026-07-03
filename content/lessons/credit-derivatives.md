---
title: Credit Risk & CDS
minutes: 14
---

# Credit Risk & CDS

Credit modeling asks one question — *will they pay me back?* — and has produced two entirely different schools of thought for answering it. Interviewers love this topic because it packs an elegant idea (Merton), a workhorse calculation (hazard rates and CDS spreads), and finance's most famous model-risk disaster (2008) into one conversation.

## School 1: Structural — Merton's one beautiful idea

Merton (1974): look *through* the balance sheet. A firm has assets worth $V_t$ and owes debt with face value $D$ due at time $T$. At maturity, one of two things happens:

- $V_T > D$: shareholders pay off the debt and keep the residual $V_T - D$.
- $V_T \le D$: shareholders exercise limited liability, hand the keys to the bondholders, and walk away with nothing.

Write those two cases as a payoff:

$$
E_T = \max(V_T - D,\, 0)
$$

That is *exactly* the payoff of a call option. **Equity is a call option on the firm's assets with strike equal to the face value of debt.** Limited liability *is* the optionality. And the bondholders hold the other side:

$$
D_T = \min(V_T,\, D) = D - \max(D - V_T,\, 0)
$$

— risk-free debt **minus a put option** on the firm's assets. Lending money is selling a put on the borrower's assets; the credit spread is the put premium amortized over the loan.

The consequences fall out immediately: default is not a surprise but the endpoint of asset value diffusing down toward the debt barrier; default probability rises with leverage ($D/V$) and asset volatility; equity holders near distress *want* volatility (they own the option, gamma is on their side) — which is precisely the shareholder/creditor risk-shifting conflict. Price equity with Black-Scholes on $V$, and you get default probabilities from market data — the idea behind Moody's KMV / distance-to-default. Weaknesses: asset value and vol are unobservable, and a diffusion can't jump, so short-dated spreads come out unrealistically near zero.

## School 2: Reduced-form — default as a Poisson jump

The reduced-form school doesn't ask *why* firms default. Default is an exogenous surprise: the **first jump of a Poisson process** with intensity (hazard rate) $\lambda$. Over any short interval $dt$, conditional on survival so far,

$$
\mathbb{P}(\text{default in } [t, t+dt] \mid \tau > t) = \lambda\, dt
$$

Survival probability compounds the non-default odds, giving exponential survival:

$$
Q(\tau > t) = e^{-\lambda t}
$$

(with time-dependent hazard, $Q(\tau > t) = e^{-\int_0^t \lambda(s)\,ds}$ — exactly analogous to discount factors built from forward rates, which is why credit quants think of $\lambda$ as a "credit-risky forward rate"). The framework is unashamedly a *calibration* device: choose $\lambda(t)$ to reprice traded CDS, then price other credit-contingent things consistently. Structural models explain; reduced-form models fit. Say that sentence in an interview.

## The credit spread: compensation for expected loss

Why does a risky bond yield more than a riskless one? Hold the bond over $dt$: with probability $\lambda\,dt$ the issuer defaults and you recover a fraction $R$ of par, losing $(1-R)$. Your expected loss rate per unit time is $\lambda(1-R)$. For you to break even relative to the risk-free bond, the extra yield — the spread $s$ — must compensate exactly that:

$$
s \approx \lambda\,(1 - R)
$$

Sanity-check the units: $\lambda$ is a probability per year, $(1-R)$ is the fraction lost, so $s$ is an expected loss per year — the same units as a yield. A name with $\lambda = 2\%$ and $R = 40\%$ should trade around $s \approx 0.02 \times 0.6 = 120$ bp.

## CDS mechanics

A credit default swap is insurance on a bond, unbundled from the bond:

- **Protection buyer** pays a running premium — the spread $s$ (quoted in bp per year on the notional) — on the **premium leg**, until maturity or default, whichever comes first.
- **Protection seller** pays $(1 - R)$ times notional on the **protection leg** if the reference entity defaults (settled by auction in practice).

The **par spread** is the $s$ that makes the swap worth zero at inception: equate the legs. With discount factors $D(t)$, survival curve $Q(t)$, and premium dates $t_i$ with accrual fractions $\Delta_i$:

$$
\underbrace{s \sum_i \Delta_i\, D(t_i)\, Q(t_i)}_{\text{premium leg (paid while alive)}} \;=\; \underbrace{(1 - R) \int_0^T D(t)\, \big(-dQ(t)\big)}_{\text{protection leg (paid at default)}}
$$

Note the structure: premium payments are weighted by survival probability (you only pay while the name is alive — the sum is the **risky annuity**), while protection payments are weighted by the density of default times, $-dQ(t) = \lambda(t) Q(t)\,dt$. With flat hazard, flat rates, and continuous premium payment, everything cancels and you recover:

$$
s = \lambda\,(1 - R)
$$

This is the **credit triangle** — three quantities, one relation, so any two give the third:

$$
\lambda \approx \frac{s}{1 - R}
$$

Traders use it constantly for mental math: a 300bp CDS with 40% recovery implies $\lambda \approx 5\%$ annual default intensity, i.e. roughly $1 - e^{-0.05 \times 5} \approx 22\%$ risk-neutral default probability over 5 years. (Risk-neutral, not real-world — CDS-implied default probabilities embed risk premia and systematically exceed historical default rates.)

## CVA in one paragraph

Post-2008, every derivative price includes **CVA (credit valuation adjustment)**: the expected loss from your *counterparty* defaulting while owing you money. Schematically, $\text{CVA} = (1-R)\int_0^T \mathbb{E}[\text{exposure}(t)]\, D(t)\, \big(-dQ(t)\big)$ — expected positive exposure weighted by counterparty default probability and loss given default. It turned counterparty credit from a back-office limit check into a priced, hedged, front-office quantity, and it's a major employer of quant devs: computing exposure profiles means Monte Carlo over every trade with every counterparty, netting sets, and collateral — a serious large-scale computing problem bolted onto the reduced-form machinery above.

## 2008 in one line

The Gaussian copula priced CDO tranches by summarizing default *dependence* in a single correlation parameter calibrated to thin data; when housing turned, realized dependence in the tail was far higher than the model's, senior "AAA" tranches that the model said were nearly riskless got wiped, and the lasting lesson is **model risk**: the danger wasn't the formula but an industry treating a calibration convention as truth.

## Interview checkpoints

- Merton in one line: equity $= \max(V_T - D, 0)$ = a call on firm assets struck at debt face value; debt = risk-free bond minus a put — limited liability is the option.
- Structural models *explain* default (leverage + asset vol); reduced-form models *fit* it (calibrate $\lambda$ to market spreads).
- Hazard rate: $Q(\tau > t) = e^{-\lambda t}$; hazard rates are to survival what forward rates are to discounting.
- Credit triangle: $s \approx \lambda(1-R)$ — spread = expected loss rate; be able to do the 300bp / 40% recovery → $\lambda \approx 5\%$ mental math.
- Par CDS spread: premium leg (spread × risky annuity, survival-weighted) = protection leg ($(1-R)$, default-density-weighted).
- CVA prices counterparty default into every trade; 2008 + Gaussian copula = the canonical model-risk story (correlation in one number, tails ignored).
