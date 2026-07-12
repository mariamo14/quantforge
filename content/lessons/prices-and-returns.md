---
title: Prices and Returns
minutes: 12
---

Every conversation in finance — every chart, every model, every interview question — rests on one small idea: measure *change relative to what you started with*. This lesson gives you that idea properly. By the end you will know what a return is, why percentages behave strangely when you chain them together, and why quants keep a second kind of return (the "log return") in their toolkit.

## Why prices alone can mislead

Two stocks each rise by \$5 today. Same news? Not at all.

- Stock A started the day at \$10 and ended at \$15.
- Stock B started at \$1,000 and ended at \$1,005.

Stock A's owners saw their money grow by half. Stock B's owners barely noticed anything. The dollar move was identical; the *experience* was completely different. That's why finance almost never compares raw prices. It compares **returns**: the change in price *relative to where you started*.

## Simple return

The **simple return** answers: "for every dollar I put in, how much did I gain or lose?"

$$r = \frac{P_1 - P_0}{P_0}$$

Here $P_0$ is the starting price ("P-zero", the price at time 0), $P_1$ is the ending price, and $r$ is the return.

Worked examples:

- Stock A: $r = (15 - 10)/10 = 5/10 = 0.50$. You gained 50 cents per dollar invested: a **+50%** return.
- Stock B: $r = (1005 - 1000)/1000 = 5/1000 = 0.005$, i.e. **+0.5%**.
- A loss: a stock falls from \$80 to \$60. $r = (60 - 80)/80 = -20/80 = -0.25$, i.e. **−25%**. Negative returns are just losses; the formula handles them automatically.

## Converting between percent and decimal

**5%** and **0.05** are the same number written two ways: five per hundred. To convert, divide the percentage by 100 (so 5% becomes 0.05), or multiply the decimal by 100 (so 0.05 becomes 5%).

Formulas always use the decimal form. If you invest \$200 and earn 5%, your gain is \$200 × 0.05 = \$10 — not \$200 × 5. Mixing up the two forms is the most common beginner slip in all of finance, so pause here until the conversion feels automatic.

## Compounding: returns multiply, they don't add

Suppose you earn +10% in year one and +10% in year two. Total: +20%? No — slightly better, because in year two you earn 10% on a *bigger* pile.

Start with \$100. After year one: \$100 × 1.10 = \$110. After year two: \$110 × 1.10 = \$121. That's +21%, not +20%. Each period, your money gets multiplied by $(1 + r)$ — one dollar of principal plus $r$ of gain. Chaining periods means chaining multiplications:

$$1 + r_{\text{total}} = (1 + r_1)(1 + r_2)$$

Now the classic trap. You gain **+50%**, then lose **−50%**. Back to even? Work it out with \$100:

- After +50%: \$100 × 1.50 = \$150.
- After −50%: \$150 × 0.50 = \$75.

You're down \$25 — a **−25%** total return. Check with the formula: $(1.50)(0.50) = 0.75 = 1 + (-0.25)$. The −50% hit a larger amount than the +50% helped. Symmetric percentages are not symmetric in dollars. Interviewers love this one.

## Log returns: the returns that DO add

Adding is easier than multiplying, so quants often use a second flavor: the **log return**,

$$r_{\log} = \ln\!\left(\frac{P_1}{P_0}\right)$$

where $\ln$ is the **natural logarithm** — the function that undoes "e to the power of." You don't need deep familiarity with it yet; you only need its superpower: *logs turn multiplication into addition*. Since multi-period growth is a product of $(1+r)$ factors, taking logs makes multi-period returns a simple **sum**:

$$\ln\frac{P_2}{P_0} = \ln\frac{P_1}{P_0} + \ln\frac{P_2}{P_1}$$

And for small moves, log and simple returns are nearly identical. Example: a +5% simple return means $P_1/P_0 = 1.05$, and $\ln(1.05) \approx 0.0488$ — about 4.88%, very close to 5%. For a tiny move like +0.1%, $\ln(1.001) \approx 0.0009995$ — essentially indistinguishable. Only for big moves do they diverge: $\ln(1.50) \approx 0.405$, quite different from 0.50.

## Choosing between them

- **Simple returns** answer money questions: "how many dollars did the portfolio make?" They are also the right tool for combining assets — a portfolio's return is the average of its holdings' simple returns, weighted by how much you hold of each.
- **Log returns** shine across *time*: summing daily log returns gives the total log return, which makes statistical analysis and modeling much cleaner. Most quant research on time series uses log returns.

## A worked example, day by day

A stock over four days:

| Day | Price $P$ | Simple return $\frac{P_t - P_{t-1}}{P_{t-1}}$ | Log return $\ln(P_t / P_{t-1})$ |
|----:|----------:|--------------------------------:|--------------------------------:|
| 0   | 100.00    | —                               | —                                |
| 1   | 102.00    | $2/100 = +2.00\%$               | $\ln(1.0200) \approx +1.98\%$    |
| 2   | 99.96     | $-2.04/102 = -2.00\%$           | $\ln(0.9800) \approx -2.02\%$    |
| 3   | 104.96    | $5.00/99.96 = +5.00\%$          | $\ln(1.0500) \approx +4.88\%$    |

Check the additivity claim: the log returns sum to $1.98\% - 2.02\% + 4.88\% = 4.84\%$, and indeed $\ln(104.96/100) \approx 4.84\%$. The simple returns sum to $5.00\%$, but the true total simple return is $(104.96-100)/100 = 4.96\%$ — close, but not equal. Adding simple returns is only an approximation.

## Interview checkpoints

- Compare returns, not prices: a \$5 move means very different things on a \$10 stock and a \$1,000 stock.
- Simple return: $r = (P_1 - P_0)/P_0$; negative values are losses, and 5% means 0.05 in formulas.
- Multi-period returns multiply via $(1+r)$ factors: +50% then −50% leaves you at −25%, not zero.
- Log returns $\ln(P_1/P_0)$ add across time, and for small moves they nearly equal simple returns ($\ln 1.05 \approx 0.0488$).
- Use simple returns for dollar/portfolio questions, log returns for time-series analysis and modeling.
