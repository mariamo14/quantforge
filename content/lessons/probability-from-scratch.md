---
title: Probability from Scratch
minutes: 12
---

## Two ways to say "how likely"

What does it mean that a coin has a 50% chance of landing heads? Two everyday answers, both correct:

1. **Long-run frequency.** Flip the coin 10,000 times and you'll see close to 5,000 heads. Probability is the fraction of times something happens if you repeat the experiment over and over.
2. **Fair betting odds.** A bet that pays $1 if the coin lands heads is worth 50 cents. If someone offered you that bet for 30 cents, you'd take it all day; at 70 cents you'd refuse. The fair price *is* the probability.

Keep both views in your pocket. The frequency view builds intuition; the betting view is how traders actually use probability — every price they quote is an implicit bet.

## Outcomes and events

An experiment's **sample space** is just the list of everything that could happen.

- One coin flip: {Heads, Tails} — 2 outcomes.
- One die roll: {1, 2, 3, 4, 5, 6} — 6 outcomes, each with probability 1/6 if the die is fair.
- Two coin flips: {HH, HT, TH, TT} — 4 outcomes, each 1/4.

An **event** is any collection of outcomes you care about. "Roll an even number" is the event {2, 4, 6}, with probability 3/6 = 1/2.

## Three rules you already believe

Probability has exactly three ground rules, and none of them will surprise you:

1. **Every probability is between 0 and 1.** 0 means "cannot happen," 1 means "certain." You can't be 120% sure.
2. **Something happens.** The probabilities of all outcomes in the sample space add to 1. A die shows *some* face: 1/6 × 6 = 1.
3. **Mutually exclusive events add.** If two events can't both happen (a die can't show 2 *and* 5 on one roll), the chance of "either one" is the sum: P(2 or 5) = 1/6 + 1/6 = 2/6 = 1/3.

Warning on rule 3: it only works when the events can't overlap. P(even) + P(more than 3) = 1/2 + 1/2 = 1 is *not* the chance of "even or more than 3," because 4 and 6 got counted twice.

## The complement trick: "at least one"

The chance something does *not* happen is 1 minus the chance it does. This sounds trivial, but it unlocks the single most common interview pattern: **"at least one."**

Question: roll a die 4 times — what's the probability of at least one six?

Counting the ways directly is painful (one six? two sixes? three?...). Flip it: "at least one six" fails only if *every* roll is a non-six. Each roll avoids a six with probability 5/6, and the rolls don't influence each other, so:

$$P(\text{no six in 4 rolls}) = \left(\tfrac{5}{6}\right)^4 = \tfrac{625}{1296} \approx 0.482$$

$$P(\text{at least one six}) = 1 - 0.482 \approx 0.518$$

Slightly better than a coin flip. Whenever you hear "at least one," compute 1 − P(none).

## Independence vs dependence

Two events are **independent** when knowing one tells you nothing about the other. A coin has no memory: after five heads in a row, the next flip is still 50/50. For independent events, probabilities multiply — that's exactly what we did with $(5/6)^4$ above.

Now the opposite. Draw two cards from a standard 52-card deck (which has 4 aces) *without putting the first card back*. What's the chance both are aces?

- First card is an ace: 4/52.
- Second card is an ace *given the first was*: only 3 aces remain among 51 cards, so 3/51.
- Both: $\frac{4}{52} \times \frac{3}{51} = \frac{12}{2652} \approx 0.0045$, about 1 in 221.

The second probability *changed* because of the first draw. That's **dependence**: the outcomes share information. Most interesting things in markets are dependent — today's news moves tomorrow's prices.

## Conditional probability: updating on information

**Conditional probability** is the chance of something *given* that you know something else. Notation: $P(A \mid B)$, read "probability of A given B." No formula needed yet — a table does all the work.

Track 100 days of weather and your umbrella habits:

|                | Umbrella | No umbrella | Total |
|----------------|---------:|------------:|------:|
| **Rain**       | 24       | 6           | 30    |
| **No rain**    | 10       | 60          | 70    |
| **Total**      | 34       | 66          | 100   |

Unconditionally, it rains 30 of 100 days: P(rain) = 0.30.

Now someone tells you: "she took her umbrella today." You're no longer looking at all 100 days — only the 34 umbrella days. Among those, it rained on 24. So

$$P(\text{rain} \mid \text{umbrella}) = \frac{24}{34} \approx 0.71$$

The information moved your estimate from 30% to 71%. That's all conditioning is: **shrink the world to the rows or columns consistent with what you know, then recount.** Notice it works in both directions and gives different answers: P(umbrella | rain) = 24/30 = 0.80, which is *not* 0.71 — a distinction sloppy thinkers miss constantly.

## Why traders live in probabilities

A trader quoting a price is stating odds. If a market maker bids $99.98 for a stock, she's betting it's worth more than that; every fill is a wager. When news breaks — an earnings report, a central-bank announcement — every professional in the market is doing the umbrella-table move: *given this new information, recount the possibilities and update the price.* Markets are, quite literally, machines for aggregating conditional probabilities into a single number. Learning to think this way is not optional in this field; it's the native language.

## Interview checkpoints

- Probability is both a long-run frequency and a fair betting price — a $1 bet on a 50% event is worth 50 cents.
- All probabilities live between 0 and 1, everything together sums to 1, and non-overlapping events add.
- "At least one" problems: compute 1 − P(none). At least one six in 4 rolls = $1 - (5/6)^4 \approx 0.518$.
- Independent events multiply (coins have no memory); dependent events don't (card draws without replacement change the deck).
- Conditioning = shrinking to the sub-table consistent with what you know and recounting; P(A|B) generally differs from P(B|A).
