---
title: Simulating Randomness
minutes: 11
---

**Builds on:** *Random Walks to Brownian Motion*.

The previous lesson made two claims that deserve to be *seen*, not just believed: that a random walk drifts nowhere on average yet wanders a typical distance of $\sqrt{n}$, and that this square-root behavior is the fingerprint of all diffusion. This lesson shows you how to check both with twenty lines of code — and that habit of *simulating first* is the bridge to everything that follows.

## The experiment

Flip a fair coin $n$ times: heads is a step of $+1$, tails a step of $-1$. Track the running total. In C++:

```cpp
#include <random>
#include <cmath>
#include <cstdio>

int main() {
    std::mt19937 rng(42);                        // fixed seed = reproducible
    std::bernoulli_distribution coin(0.5);

    const int trials = 100000, n = 10000;
    double sumFinal = 0, sumSquared = 0;
    for (int t = 0; t < trials; t++) {
        long long position = 0;
        for (int i = 0; i < n; i++) {
            position += coin(rng) ? 1 : -1;
        }
        sumFinal += position;
        sumSquared += (double)position * position;
    }
    std::printf("mean final position: %.3f\n", sumFinal / trials);
    std::printf("typical distance:    %.1f  (sqrt(n) = %.1f)\n",
                std::sqrt(sumSquared / trials), std::sqrt((double)n));
    return 0;
}
```

Run it and two numbers appear: the mean final position is essentially **0** (no drift), and the typical distance — the root of the average *squared* position — lands almost exactly on $\sqrt{10000} = 100$. The theory from last lesson, reproduced on your machine in a second.

## Why squared distance is the right thing to track

The *average* position is useless (positives and negatives cancel), and the average *absolute* distance is awkward mathematically. The average **squared** distance is the one that behaves beautifully: each independent ±1 step adds exactly 1 to it, so after $n$ steps it equals $n$, exactly. No approximation. That quantity — accumulated squared movement — has a name you will meet formally in the next lesson: **quadratic variation**. When you get there, remember that you have already computed it here.

## Three disciplines that make simulation a tool, not a toy

1. **Fix the seed.** `std::mt19937 rng(42)` makes every run identical, so a change in output means a change in *code*, not luck. Production research pins seeds for exactly this reason (and the Monte Carlo problems on this site sidestep the issue by handing you the draws).
2. **Scale the shock by $\sqrt{\Delta t}$.** To simulate a continuous process over small time steps, the random increment is $\sigma\sqrt{\Delta t}\,Z$ — the square root is the same $\sqrt{n}$ law you just verified, and forgetting it is the most common Monte Carlo bug in existence.
3. **Check a known answer first.** Before trusting a simulation of something you *can't* solve, reproduce something you *can* (like $\sqrt{n}$ here). Every serious quant validates the pipeline on a closed-form case before pointing it at the unknown.

## What this buys you next

The next lesson asks why ordinary calculus fails for Brownian paths, and the entire answer hangs on one fact: squared increments **don't vanish** — they add up to real time, just like your simulation's squared distance added up to $n$. You've now touched that fact with your own hands, which makes the algebra ahead an observation rather than a leap of faith.

## Interview checkpoints

- A fair ±1 walk has mean position 0 but typical distance $\sqrt{n}$ — and you can verify both in 20 lines.
- Average *squared* distance grows by exactly 1 per step: the seed of quadratic variation.
- Fix RNG seeds; reproducibility turns simulation into engineering.
- Brownian increments scale as $\sqrt{\Delta t}$, never $\Delta t$ — the classic Monte Carlo bug.
- Validate any simulator against a known closed form before using it on the unknown.
