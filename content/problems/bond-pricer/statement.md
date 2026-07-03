Price a fixed-coupon bond and compute its risk numbers — the exact calculation behind every DV01 on a rates desk. Conventions are spelled out precisely; follow them to the letter.

## Setup

A bond has face value $F$, annual coupon rate $c$ (as a decimal), maturity of $n$ **whole years**, payment frequency $m$ (1 = annual, 2 = semiannual), and an annual yield $y$ (as a decimal) compounded $m$ times per year.

There are $N = n \cdot m$ periods. Each period pays a coupon $\frac{cF}{m}$; the face value is repaid at period $N$. The per-period discount rate is $y/m$.

$$P = \sum_{t=1}^{N} \frac{cF/m}{(1 + y/m)^t} + \frac{F}{(1 + y/m)^N}$$

**Macaulay duration** (in years) is the PV-weighted average time to cashflow:

$$D_{\text{mac}} = \frac{1}{P} \sum_{t=1}^{N} \frac{t}{m} \cdot \frac{CF_t}{(1 + y/m)^t}$$

where $CF_t$ is the total cashflow at period $t$ (coupon, plus face at $t = N$).

**Modified duration:** $D_{\text{mod}} = \dfrac{D_{\text{mac}}}{1 + y/m}$.

**Convexity** (in years²):

$$C = \frac{1}{P \, m^2} \sum_{t=1}^{N} \frac{t(t+1) \cdot CF_t}{(1 + y/m)^{t+2}}$$

## Input

The first line contains $Q$ ($1 \le Q \le 1000$). Each of the next $Q$ lines: `F c y n m` with $100 \le F \le 10^6$, $0 \le c \le 0.15$, $0.001 \le y \le 0.20$, $1 \le n \le 30$, $m \in \{1, 2\}$.

## Output

For each bond, one line: `price macaulay modified convexity` rounded to 4 decimal places each.
