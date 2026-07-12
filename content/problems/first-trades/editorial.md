# Editorial

One loop, three accumulators — but the two "hints" in the statement are real bugs that appear constantly in production code, which is why even the warm-up teaches them.

## The two lessons hiding here

1. **Range math before typing.** $10^5$ trades × $10^6$ quantity = $10^{11}$, which overflows `int` ($\approx 2.1 \times 10^9$) by a factor of fifty. The habit — multiply worst-case constraints in your head *before* choosing types — is the single highest-value reflex this entire track builds. It only gets more important: later problems overflow at $10^{18}$.
2. **Initialize extremes correctly.** Starting `min` at 0 means no price ever updates it. The two safe idioms: seed from the first element, or use a sentinel/`std::numeric_limits<long long>::max()`. (The reference uses `-1` as "unset" — fine because prices are positive; the limits version is more general.)

## The shape you'll reuse forever

Read a count, loop, accumulate, print — this exact skeleton underlies the order book, the matching engine, and the VWAP problems ahead. The only thing that changes is what happens inside the loop. Get comfortable with it here, where the inside is trivial.

## Complexity

$O(N)$ time, $O(1)$ memory — the categories you'll soon be stating out loud before writing any code, because interviewers expect it.
