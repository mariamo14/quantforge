---
title: How Coding Problems Work Here
minutes: 8
---

**Builds on:** *Values, References & const*.

Before your first coding challenge, five minutes on how the judge works will save you an hour of confusion. Every problem on this site follows the same contract, and once you've internalized it, you can focus entirely on the actual puzzle.

## The contract: stdin in, stdout out

Your program reads its input from **standard input** (as if someone typed it) and prints its answer to **standard output**. No files, no arguments, no network. The judge feeds each test's input to your program, captures what it prints, and compares it — character by character, ignoring trailing spaces — against the expected output.

The skeleton of almost every solution:

```cpp
#include <iostream>

int main() {
    std::ios::sync_with_stdio(false);   // faster IO — explained below
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;                       // read
    long long total = 0;
    for (int i = 0; i < n; i++) {
        long long x;
        std::cin >> x;
        total += x;                      // compute
    }
    std::cout << total << '\n';          // print
    return 0;
}
```

`std::cin >> x` skips whitespace and newlines automatically — you almost never need to parse lines by hand. Print your answer followed by `'\n'`.

## Sample tests vs hidden tests

Each problem shows a few **sample tests** — you can see their input and expected output, and the **Run** button (⌘↵) checks your code against exactly those. When you **Submit** (⌘⇧↵), your code also runs against **hidden tests**: bigger inputs, edge cases, and adversarial data designed to catch shortcuts. Passing the samples but failing hidden tests usually means an overflow, an edge case (empty input, ties, negatives), or an algorithm that's too slow.

## Reading the verdicts

| Verdict | Meaning | First thing to check |
|---|---|---|
| **Accepted** | All tests passed 🎉 | — |
| **Wrong answer** | Output differs on some test | Edge cases; integer overflow; exact output format |
| **Compile error** | Code didn't build | The compiler message is shown verbatim — read it top-down |
| **Runtime error** | Program crashed | Out-of-bounds access, division by zero, unhandled input |
| **Time limit** | Too slow | Your algorithm's complexity, or unbuffered output |

## Three habits that prevent most failures

1. **Use `long long` by default** for anything that gets summed or multiplied. Problem constraints tell you the ranges — multiply the worst cases in your head. An `int` holds only about $2 \times 10^9$.
2. **The two fast-IO lines** (`sync_with_stdio(false)` and `cin.tie(nullptr)`) matter on large inputs. Also prefer `'\n'` over `std::endl` — `endl` forces a flush every line and can single-handedly cause a time-limit verdict.
3. **Re-read the output format** before submitting: one line or many, how many decimal places, what to print when there's no answer. Half of all "wrong answer" verdicts are formatting, not logic.

## Interview checkpoints

- Judged problems are a contract: read stdin, write stdout, match exactly.
- Samples are visible and checked by Run; Submit adds hidden tests with edge cases and scale.
- Default to `long long`; check the constraints for overflow before you code.
- `'\n'` over `std::endl`, plus the two fast-IO lines, on any large input.
- A wrong answer on hidden tests usually means an edge case or overflow — not bad luck.
