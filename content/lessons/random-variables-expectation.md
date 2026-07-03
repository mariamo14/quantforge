---
title: Random Variables & Expected Value
minutes: 12
---

## Attaching numbers to luck

Probability so far has been about *events* — rain or no rain, six or no six. Finance needs one more step: attaching a **number** to each outcome, because outcomes in markets are dollars.

A **random variable** is exactly that: a rule that assigns a number to every possible outcome of an experiment. Roll a die and get paid the face value in dollars — that payout is a random variable:

| Outcome (die face) | 1 | 2 | 3 | 4 | 5 | 6 |
|--------------------|---|---|---|---|---|---|
| Payout $X$         | $1 | $2 | $3 | $4 | $5 | $6 |
| Probability        | 1/6 | 1/6 | 1/6 | 1/6 | 1/6 | 1/6 |

Nothing fancy: a table of "what you get" and "how likely."

## Expected value: the long-run average — and the fair price

What is this die game *worth*? Play it 600 times: you'd expect about 100 ones, 100 twos, ... , 100 sixes, collecting roughly $100(1+2+3+4+5+6) = \$2100$, or **$3.50 per play**. That per-play average is the **expected value** (EV), written $E[X]$:

$$E[X] = \sum_i x_i \, p_i$$

— each possible value $x_i$ times its probability $p_i$, summed. For the die:

$$E[X] = 1\cdot\tfrac{1}{6} + 2\cdot\tfrac{1}{6} + 3\cdot\tfrac{1}{6} + 4\cdot\tfrac{1}{6} + 5\cdot\tfrac{1}{6} + 6\cdot\tfrac{1}{6} = \tfrac{21}{6} = 3.5$$

Two readings, matching our two views of probability:

1. **Long-run average:** play many times, average $3.50 per play.
2. **Fair price:** $3.50 is exactly what you should pay to play. Pay $3 and you profit 50 cents per play on average; pay $4 and you bleed. Notice EV can be a value no single play ever produces — no die shows 3.5.

## Linearity: expected values add — always

Roll two dice; what's the expected total? You don't need to enumerate all 36 combinations. Expected values simply add:

$$E[X + Y] = E[X] + E[Y] = 3.5 + 3.5 = 7$$

The remarkable part: this works **even when the outcomes influence each other**. Glue the dice together so they always show the same face — highly dependent! Each die alone still averages 3.5, so the sum still averages 7 (now the total is always an even number between 2 and 12, but its average is unchanged). Independence affects the *spread* of the sum, never its expected value. This property, called **linearity of expectation**, demolishes many scary-looking interview problems in one line.

## Variance and standard deviation: measuring spread

Two bets can share an average yet feel completely different. We need a number for "how far from average do results typically land?"

The **variance** is the expected squared distance from the mean:

$$\mathrm{Var}(X) = E\left[(X - E[X])^2\right]$$

We square so that misses above and below both count as positive (otherwise they'd cancel to zero). Squaring leaves units of "dollars squared," which is awkward — so we take the square root to get back to dollars: the **standard deviation**, $\sigma = \sqrt{\mathrm{Var}(X)}$.

Full computation. A bet pays **$0 or $10, each with probability 1/2**.

- Mean: $E[X] = 0 \cdot \tfrac12 + 10 \cdot \tfrac12 = 5$.
- Distances from the mean: $0 - 5 = -5$ and $10 - 5 = +5$.
- Squared distances: $25$ and $25$.
- Variance: $25 \cdot \tfrac12 + 25 \cdot \tfrac12 = 25$ (dollars squared).
- Standard deviation: $\sqrt{25} = \$5$.

So a typical outcome sits about $5 away from the $5 mean — which here is exactly right: every outcome is exactly $5 away.

## Variance is what finance calls risk

Compare two investments of $100, each with the same expected profit of $5:

- **Investment A:** always pays exactly $5. Mean $5, standard deviation $0.
- **Investment B:** pays **+$105 or −$95**, each with probability 1/2. Mean: $105 \cdot \tfrac12 + (-95)\cdot\tfrac12 = 52.5 - 47.5 = \$5$. Distances from the mean: $\pm 100$; squared: $10{,}000$; variance $= 10{,}000$; standard deviation $= \$100$.

Same expected value; utterly different investments. A would suit anyone; B can nearly wipe out your $100 stake half the time. **Risk, in its most basic quantitative form, is standard deviation** — and this example shows why average return alone never describes an investment.

The same lesson in pure form: a **fair game** is one with EV = 0. Flipping a coin for $1 (win $1 on heads, lose $1 on tails) is fair: EV = 0, σ = $1. Flipping a coin for your house is *also* fair — EV = 0 — but its standard deviation is the value of your house. Nobody sane treats those two games as equivalent. Expected value tells you the fair price; variance tells you whether you can survive the ride.

## The bridge to everything that follows

Here is where the whole course is headed, in one paragraph. Last lesson's big idea: an asset's price is the *discounted* value of its future cashflows. This lesson's big idea: an uncertain payoff has a *fair price* given by its expected value. Put them together and you have the master formula of quantitative finance: **the price of an uncertain future payoff is its discounted expected value** — average the payoff over the possible futures, weighted by the right probabilities, then discount that average back to today. Almost everything to come — bond pricing, option pricing, risk models — is refinement of that single sentence, and most of the refinement lies in three words: *the right probabilities*.

## Interview checkpoints

- A random variable assigns a number (usually dollars) to each outcome; it's fully described by a value–probability table.
- Expected value $E[X] = \sum x_i p_i$ is both the long-run average and the fair price of the bet; a fair die pays $E[X] = 3.5$.
- Linearity: $E[X+Y] = E[X] + E[Y]$ holds even for dependent variables — two dice sum to an expected 7 no matter how they interact.
- Variance is the expected squared distance from the mean; standard deviation is its square root, back in original units.
- Same EV can hide wildly different risk: +$105/−$95 coin flip has the same $5 mean as a sure $5 but a $100 standard deviation.
- Master formula ahead: price = discounted expected value of future payoffs, under the right probabilities.
