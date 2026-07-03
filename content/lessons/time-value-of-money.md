---
title: The Time Value of Money
minutes: 12
---

## $100 today beats $100 next year

Offer someone a choice: $100 right now, or $100 in one year. Everyone takes the money now — and not just out of impatience. There's a hard financial reason: money you hold today can be put to work. Deposit $100 in a savings account paying 5% **interest** (a fee the bank pays you for lending it your money), and in a year you'll have $105. So "$100 today" is really "$105 next year" in disguise. It strictly beats $100 next year.

This idea — that money has a time dimension, and earlier money is worth more — is called the **time value of money**. It is the single most-used idea in all of finance.

## Future value: rolling money forward

Stay with the savings account. Put in $100 at 5% per year and leave it alone:

- **After year 1:** $100 × 1.05 = **$105.00**
- **After year 2:** $105 × 1.05 = **$110.25** — notice you earned $5.25 this year, not $5. The extra $0.25 is interest earned *on last year's interest*.
- **After year 3:** $110.25 × 1.05 = **$115.7625 ≈ $115.76**

Interest earning interest is called **compounding**, and it's why each year's gain is bigger than the last. In general, multiplying by $(1+r)$ once per year for $n$ years gives the **future value** formula:

$$FV = PV \, (1 + r)^n$$

where $PV$ is the **present value** (what you start with today), $r$ is the interest rate per period as a decimal (5% → 0.05), $n$ is the number of periods, and $FV$ is the future value (what you'll have). Check: $100 × (1.05)^3 = 100 × 1.157625 = 115.76$. ✓

## Present value: running the film backwards

Now flip the question. Someone promises you $115.76 in three years. What is that promise worth *today*, if money earns 5%? Just undo the compounding — divide instead of multiply:

$$PV = \frac{FV}{(1 + r)^n}$$

$PV = 115.76 / (1.05)^3 = 115.76 / 1.157625 = 100$. The promise of $115.76 in three years is worth exactly $100 today. Translating future money into today's money is called **discounting** — you "discount" the future amount because you'd rather have money now.

A useful repackaging: the **discount factor** is today's price of $1 delivered later:

$$DF = \frac{1}{(1+r)^n}$$

At 5% for three years, $DF = 1/1.157625 \approx 0.8638$. Read it literally: a promise of $1 in three years trades for about 86.4 cents today. To value *any* future payment, multiply it by the right discount factor.

## Compounding frequency — and where $e$ comes from

Banks don't have to compound once a year. "10% per year, compounded monthly" means: each month you earn 10%/12 ≈ 0.833%, twelve times a year. More frequent compounding means interest starts earning interest sooner, so you end up with slightly more.

Watch $100 for one year at a 10% annual rate:

- **Compounded once:** $100 × 1.10 = **$110.00**
- **Compounded monthly:** $100 × (1 + 0.10/12)^{12} = 100 × 1.10471 = **$110.47**
- **Compounded every day:** $100 × (1 + 0.10/365)^{365} ≈ **$110.516**
- **Compounded every instant:** ≈ **$110.517**

Notice the amounts climb but level off. Compounding more and more often does *not* make you rich — it converges to a ceiling. That ceiling is described by the special number $e \approx 2.71828$, which you can think of as exactly this: **what compounding every instant converges to.** The continuous-compounding formula is

$$FV = PV \, e^{rt}$$

where $t$ is time in years. Check: $100 × e^{0.10} = 100 × 1.10517 = 110.52$, matching the ceiling above. Quants love continuous compounding because $e^{rt}$ is smooth and easy to manipulate mathematically — and this is the same $e$ behind the log returns from the previous lesson.

## Why this is the bedrock of ALL pricing

Here is the big claim, and it's worth reading twice: **every financial asset is a bundle of future cashflows, and its price is what those cashflows are worth today.**

- A bond is literally a list of future payments — discount each one and add them up: that's the bond's price.
- A stock is a claim on a company's future profits — harder to forecast, but the logic is identical.
- Even complicated derivatives are, at bottom, promises of future money under certain conditions.

Pricing anything therefore boils down to two questions: *what cashflows will I get, and when?* — and then: *what is each one worth today?* The second question is always answered by discounting. Master $PV = FV/(1+r)^n$ and you hold the master key.

## The Rule of 72

A mental shortcut worth memorizing: money doubles in roughly **72 ÷ (interest rate in percent)** years.

- At 6%: 72/6 = 12 years to double. (Exact answer: 11.9 years.)
- At 9%: 72/9 = 8 years. (Exact: 8.04.)
- At 12%: 72/12 = 6 years. (Exact: 6.12.)

Interviewers use this to test whether you can estimate quickly without a calculator.

## Interview checkpoints

- $100 today beats $100 next year because today's money can earn interest in the meantime.
- Future value rolls money forward: $FV = PV(1+r)^n$; compounding means interest earns interest.
- Present value runs it backwards: $PV = FV/(1+r)^n$ — this is called discounting.
- The discount factor $1/(1+r)^n$ is today's price of $1 delivered in the future.
- More frequent compounding converges to continuous compounding, $FV = PV\,e^{rt}$; and the Rule of 72 estimates doubling time as 72 divided by the rate in percent.
- Every asset's price is the discounted value of its future cashflows — this is the foundation of all pricing.
