---
title: The Mental Math Toolkit
minutes: 12
---

Trading-firm interviews time raw arithmetic — sequence drills, market-making games, quick EVs — and grade the *process* you verbalize, not just the answer. Speed here isn't talent; it's a small toolkit practiced until retrieval is instant. Here is that toolkit.

## Multiplication: split, square, and exploit symmetry

**Split on tens.** Break one factor at the tens boundary:

$$47 \times 83 = 47 \times 80 + 47 \times 3 = 3760 + 141 = 3901.$$

Always split the *same* factor and keep the running sum out loud ("thirty-seven sixty... plus one-forty-one... thirty-nine oh one"). Verbalizing is both what interviewers want and what stops you dropping a term.

**Squares near 50.** Since $(50+a)^2 = 2500 + 100a + a^2$, any square in the 40s–60s is three easy pieces:

- $47^2 = 2500 - 300 + 9 = 2209$
- $62^2 = 2500 + 1200 + 144 = 3844$

Near 100 the same idea gives $(100+a)^2 = 10000 + 200a + a^2$, so $96^2 = 10000 - 800 + 16 = 9216$.

**Difference of squares.** When factors straddle a nice midpoint, $(m-d)(m+d) = m^2 - d^2$:

$$48 \times 52 = 50^2 - 2^2 = 2500 - 4 = 2496, \qquad 39 \times 41 = 1600 - 1 = 1599.$$

Scan for this *first* — it turns a hard multiply into a subtraction.

## Division: multiply by memorized reciprocals

Division is slow; multiplication by a cached reciprocal is fast. Memorize cold:

| Fraction | Decimal |
|---|---|
| $1/6$ | $\approx 0.1667$ |
| $1/7$ | $\approx 0.1429$ |
| $1/8$ | $= 0.125$ |
| $1/12$ | $\approx 0.0833$ |

So $5/7 \approx 5 \times 0.1429 \approx 0.714$, and $7/12 \approx 7 \times 0.0833 \approx 0.583$. The sevenths cycle ($0.142857\overline{142857}$: 14, 28, 57...) is worth knowing in full — sevenths show up constantly in dice problems.

## Percentages and basis points: floor fluency

The conversions you must do without thinking:

- $1\% = 100\,\text{bp}$; $1\,\text{bp} = 0.01\% = 10^{-4}$.
- **1 bp of $10M = $1,000.** Anchor on this: 1 bp of \$1M is \$100, of \$100M is \$10,000. Then 3 bp of $250M = $3 \times 25 \times $1{,}000$... careful — do it as $250\text{M} \times 3 \times 10^{-4} = $75{,}000\$.
- **Per-annum ↔ per-day: divide by ~252** trading days. A 1% annual fee is $0.01/252 \approx 4 \times 10^{-5} \approx 0.4$ bp per day.
- **Volatility scales with $\sqrt{t}$**, so annual → daily vol divides by $\sqrt{252} \approx 15.87 \approx 16$. The classic: 16% annualized vol $\approx$ 1% daily move. Interviewers use this one as a shibboleth.

## Compounding: rule of 72 and the binomial expansion

**Rule of 72**: money at $r\%$ doubles in roughly $72/r$ years. Why it works: doubling needs $(1+r)^n = 2$, i.e. $n \ln(1+r) = \ln 2 \approx 0.693$. For small $r$, $\ln(1+r) \approx r$, giving $n \approx 69.3/r$. We say 72 instead of 69.3 because 72 divides cleanly by 2, 3, 4, 6, 8, 9, 12 — and the upward nudge partially offsets the $\ln(1+r) < r$ error at typical rates. At 6%: $72/6 = 12$ years (exact: 11.9).

**Binomial expansion** for powers:

$$(1+x)^n \approx 1 + nx + \binom{n}{2}x^2 \quad \text{for small } x.$$

So $(1.02)^{10} \approx 1 + 0.20 + 45(0.0004) = 1.218$ (exact: 1.2190). First order alone gives 1.20 — the second-order term is what earns you the extra sig fig.

## Square roots: nearest square plus linear correction

From the first-order expansion,

$$\sqrt{a^2 + b} \approx a + \frac{b}{2a}.$$

Examples: $\sqrt{17} \approx 4 + \tfrac{1}{8} = 4.125$ (exact 4.123); $\sqrt{60} \approx 8 - \tfrac{4}{16} = 7.75$ (exact 7.746). The estimate always overshoots slightly, so shade down for the third sig fig.

## Expected value at speed

Brainteaser EVs should be retrieval, not derivation: one die averages \$3.5\$; expected rolls to see a six is \$6$ (geometric, $1/p\$); max of two dice is $\frac{\sum_k k(2k-1)}{36} = \frac{161}{36} \approx 4.47$ — know that $P(\max = k) = \frac{2k-1}{36}$ and the sum pattern generalizes. In market-making games, quote around the EV with a spread that covers your uncertainty, and *say the EV out loud* as you quote.

## Practice protocol

- **10 minutes a day, timed.** Untimed practice doesn't transfer; the interview stressor is the clock.
- **Precision targets: 2 sig figs fast beats 4 slow.** State the rough answer immediately ("about 3,900"), then refine if there's time.
- **Verbalize while computing.** Interviewers grade the process — a clean spoken decomposition with a small slip scores better than silent staring followed by a bare number.
- Track error rate; if you're above ~10% wrong, slow down — accuracy first, then compress time.

## Self-drill: 10 questions

Cover the right column. Target: under 15 seconds each.

| # | Question | Answer |
|---|---|---|
| 1 | $47 \times 83$ | \$3901$ |
| 2 | $68^2$ | $4624$ |
| 3 | $97 \times 103$ | $9991$ |
| 4 | $39 \times 41$ | $1599$ |
| 5 | $5/7$ as a decimal | $\approx 0.714$ |
| 6 | 1.5 bp of $40M | $6,000 |
| 7 | 16% annual vol → daily vol | $\approx 1.0\%$ |
| 8 | Doubling time at 6% (rule of 72) | $\approx 12$ years |
| 9 | $\sqrt{17}$ | $\approx 4.12$ |
| 10 | $E[\max]\$ of two fair dice | $161/36 \approx 4.47$ |

Checks: #2 is $(70-2)^2 = 4900 - 280 + 4$; #3 is \$10000 - 9\$; #6 is $40\text{M} \times 1.5 \times 10^{-4}$; #7 divides by $\sqrt{252} \approx 15.87$.

## Interview checkpoints

- Scan for structure before grinding: difference of squares and near-50/near-100 squares turn multiplies into subtractions.
- Divide by multiplying: reciprocals of 6, 7, 8, 12 memorized to four decimals.
- Own the floor units: 1 bp of $10M = $1,000; annual → daily divides by 252 for rates, by $\sqrt{252} \approx 16$ for vol.
- Rule of 72 comes from $\ln 2 \approx 0.693$; use $(1+x)^n \approx 1 + nx + \binom{n}{2}x^2$ when 72 isn't enough.
- $\sqrt{a^2+b} \approx a + b/2a$, and it slightly overshoots — shade down.
- Verbalize the decomposition and lead with 2 sig figs fast; refine only if asked.
