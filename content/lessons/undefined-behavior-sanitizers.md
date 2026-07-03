---
title: Undefined Behavior & Sanitizers
minutes: 14
---

# Undefined Behavior & Sanitizers

Trading firms run C++ at `-O3` next to real money, so they need engineers who understand the language's sharpest edge. Interviewers probe UB because it tests whether you think of C++ as "assembly with classes" (wrong, dangerous) or as a contract with an aggressive optimizer (right). Expect both conceptual questions and "what's wrong with this snippet?" screens.

## What UB actually is

Undefined behavior is not an error code, an exception, or a crash. It is a **contract violation**: the standard places requirements on your program, and if you break them, the standard places *no* requirements on the implementation. Critically, the compiler **assumes UB never happens** and optimizes under that assumption. UB doesn't mean "something bad happens at that line" — it means the compiler was allowed to transform your whole program as if that line were unreachable or its preconditions always held. Symptoms can appear far away, only at `-O2`, or only on one compiler version.

## The greatest hits

**Signed integer overflow:**

```cpp
int pos = INT_MAX;
pos += 1;               // UB (unsigned would wrap; signed does not)
```

**Out-of-bounds access:**

```cpp
std::array<double, 8> levels{};
double x = levels[8];   // UB — one past the end
```

**Use-after-free:**

```cpp
auto* o = new Order{...};
book.erase(o);          // deletes o internally
log(o->px);             // UB
```

**Data race** — two threads touch the same non-atomic object, at least one writes, no synchronization. Any race is UB, even "benign" flag polling.

**Strict aliasing violation:**

```cpp
float f = 1.5f;
auto bits = *reinterpret_cast<uint32_t*>(&f);   // UB
auto ok   = std::bit_cast<uint32_t>(f);          // C++20, correct
```

**Uninitialized read:**

```cpp
int qty;                // no initializer
if (qty > 0) { ... }    // UB: reading an indeterminate value
```

**Null dereference**, dangling references to expired temporaries, `std::vector` iterator invalidation after `push_back` — same family.

## "The compiler exploited my UB": a concrete example

The classic overflow check:

```cpp
bool will_overflow(int x) {
    return x + 1 < x;    // intended: detect INT_MAX
}
```

Since signed overflow is UB, the compiler may assume `x + 1` never overflows, so `x + 1 < x` is provably false — GCC and Clang compile this function to `return false;` at `-O2`. Your safety check is deleted *because* it could only ever trigger via UB. The same mechanism deletes null checks that occur after a dereference: the compiler reasons "the pointer was already dereferenced, so it can't be null here."

The correct check: `x == std::numeric_limits<int>::max()`, or do the arithmetic in a wider type, or use compiler builtins like `__builtin_add_overflow`.

## Why does UB exist at all?

Two honest reasons interviewers want to hear:

1. **Performance headroom.** If signed overflow were defined to wrap, `for (int i = 0; i < n; ++i)` could not be assumed to terminate or be rewritten with 64-bit induction variables; bounds checks on every access would cost real throughput. UB lets the optimizer assume the happy path.
2. **Portability.** Historically, hardware disagreed (trap representations, ones' complement, segmented memory). Leaving behavior undefined let each platform do the fast native thing.

## The toolbox

- **ASan** (`-fsanitize=address`): heap/stack/global buffer overflows, use-after-free, use-after-return, double-free. ~2x slowdown, ~2–3x memory. The workhorse for memory bugs.
- **UBSan** (`-fsanitize=undefined`): signed overflow, misaligned access, null deref, out-of-bounds on arrays with known size, invalid shifts, bad enum values. It is *cheap* — run it always in CI, and consider `-fsanitize-trap=undefined` variants in staging.
- **TSan** (`-fsanitize=thread`): data races. ~5–15x slowdown and heavy memory, so it gets its own CI job. Essential for lock-free code: it understands C++ atomics and memory orders, so it catches the race you introduced by "optimizing" an `acquire` load down to `relaxed`. Note ASan and TSan can't be combined in one build.
- **MSan** (`-fsanitize=memory`): uninitialized reads. Powerful but demanding — every library in the process (including libc++) must be instrumented, so it's Clang-only and mostly seen at big shops with hermetic builds.

**Valgrind vs sanitizers:** Valgrind (memcheck) needs no recompilation and sees uninitialized memory, but runs 20–50x slower via dynamic binary translation and misses stack overflows that ASan's redzones catch. Sanitizers are compile-time instrumentation: much faster, better reports, but you need to rebuild the world. Modern default: sanitizers in CI, Valgrind for binaries you can't rebuild.

**Baseline discipline:** build with `-Wall -Wextra -Werror` (many UB precursors are warnings first — uninitialized variables, mismatched signs), and test the *optimized* build: UB frequently only manifests at `-O2`, so a Debug-only test suite provides false comfort.

## How trading firms test UB-prone lock-free code

A ring buffer or seqlock between a market-data thread and a strategy thread is exactly where UB hides. The realistic answer to "how would you gain confidence in this?" is a layered one:

1. **TSan under stress**: dedicated tests hammering the structure from many threads for minutes, on hardware with weak-ish ordering if possible; races are probabilistic, so soak time matters.
2. **Formal-ish reasoning**: write down the happens-before argument per the C++ memory model — which release store pairs with which acquire load — and review it like a proof. Tools like model checkers (e.g., herd-style litmus tests) or a reference implementation under a model-checking harness back this up.
3. **Degrade-and-check**: assert invariants (sequence numbers monotone, checksums over payloads) in stress builds so a torn read fails loudly instead of silently corrupting a price.

Saying "I'd just run it a lot" fails; saying "TSan + stress + a written memory-order argument" passes.

## Interview probes you should expect

"What's UB here?" snippets: an `int` loop counter overflowing, `v[i]` vs `v.at(i)`, returning a reference to a local, reading a union member other than the last written (UB in C++, unlike C), shifting by ≥ bit-width, calling a virtual function during construction (defined, but a common trick question — know the difference). Practice classifying: UB vs unspecified vs implementation-defined.

## Interview checkpoints

- UB is a contract violation the compiler assumes never happens — effects are global, non-local, and optimization-dependent, not a crash at that line.
- Know the hit list cold: signed overflow, OOB, use-after-free, data races, strict aliasing, uninitialized reads, null deref.
- Be able to explain why `if (x + 1 < x)` gets compiled to `false` — and give the correct overflow check.
- Match sanitizer to bug: ASan = memory errors, UBSan = cheap always-on, TSan = races (own build, own CI job), MSan = uninit reads (rebuild everything).
- Valgrind: no rebuild, 20–50x slower; sanitizers: rebuild, ~2x, better reports.
- For lock-free code: TSan + long stress runs + an explicit happens-before argument, tested at `-O2`, not just Debug.
