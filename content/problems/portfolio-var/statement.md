Compute 1-day **historical-simulation VaR and Expected Shortfall** for a portfolio — the exact calculation a risk engine runs overnight, with the quantile conventions spelled out so there is exactly one right answer.

## Setup

A portfolio holds $A$ assets with weights $w_1, \dots, w_A$ (they sum to 1). You are given $T$ days of per-asset returns. The portfolio return on day $t$ is:

$$R_t = \sum_{a=1}^{A} w_a \, r_{a,t}$$

The **loss** on day $t$ is $L_t = -R_t$.

## Convention (follow exactly)

For confidence level $c$ (e.g. 0.95), let $k = \lfloor (1 - c) \cdot T \rfloor$, and sort the losses in **decreasing** order: $L_{(1)} \ge L_{(2)} \ge \dots \ge L_{(T)}$.

- $\text{VaR} = L_{(k+1)}$ — the smallest loss that only $k$ losses strictly rank above (or tie).
- $\text{ES} = \frac{1}{k}\sum_{i=1}^{k} L_{(i)}$ — the mean of the $k$ worst losses. If $k = 0$, define $\text{ES} = L_{(1)}$.

## Input

- Line 1: $A$ $T$ $c$ ($1 \le A \le 50$, $10 \le T \le 5000$, $c \in \{0.90, 0.95, 0.99\}$)
- Line 2: $A$ weights (decimals)
- Next $T$ lines: $A$ decimals each — day $t$'s returns for each asset (e.g. `-0.0123` = −1.23%)

## Output

One line: `VaR ES`, both as **positive** decimal fractions rounded to 6 decimal places (a loss of 2.5% prints as `0.025000`).
