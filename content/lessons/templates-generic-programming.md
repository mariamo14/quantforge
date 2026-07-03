---
title: Templates & Compile-Time C++
minutes: 15
---

HFT interviews go deep on templates for a simple reason: production trading code is template-heavy, and the interviewer needs to know you can read it, extend it, and explain *why* it's written that way. The one-line answer to "why" is **zero-cost abstraction** — templates let you write generic code that compiles down to exactly the code you'd have written by hand, with every call inlined and no dispatch at runtime.

## Function and class templates, deduction

```cpp
template <typename T>
T mid_price(T bid, T ask) { return (bid + ask) / T{2}; }

auto m1 = mid_price(100.25, 100.27);   // T deduced as double
auto m2 = mid_price(10025, 10027);     // T deduced as int64_t ticks
```

Each distinct `T` **instantiates** a separate function — monomorphization. The compiler sees the concrete types all the way down, so it can inline, constant-fold, and vectorize. Deduction happens from the arguments; since C++17, class templates deduce too (CTAD): `std::pair p{px, qty};`.

Two facts interviewers check: templates must generally live in headers (the definition must be visible at the point of instantiation), and mixed arguments don't deduce (`mid_price(100.25, 100)` fails — no conversion during deduction).

## Why HFT codebases are template-heavy

The alternative to a template is usually a virtual function. Compare:

```cpp
// Virtual: indirect call through vtable — can't inline,
// pollutes branch predictor, ~10-20+ cycles, blocks optimization across the call.
struct FeedHandler { virtual void on_quote(const Quote&) = 0; };

// Template: direct call, inlined, handler body fused into the loop.
template <typename Handler>
void decode_packets(std::span<const Packet> pkts, Handler& h) {
    for (const auto& p : pkts) h.on_quote(decode(p));   // static dispatch
}
```

With the template, the compiler knows the exact `Handler` type, inlines `on_quote`, and can keep book state in registers across iterations. The cost of virtual dispatch isn't just the indirect call — it's the **optimization barrier**: no inlining means no constant propagation, no vectorization across the boundary. That's the phrase to say in an interview.

## Concepts (C++20): constraints as documentation

Pre-C++20, a bad instantiation produced a 200-line error deep inside the template. Concepts move the check to the call site and *name* your requirements:

```cpp
template <typename T>
concept PriceLike = requires(T a, T b) {
    { a + b }  -> std::convertible_to<T>;
    { a < b }  -> std::convertible_to<bool>;
    requires std::regular<T>;   // copyable, default-constructible, equality-comparable
};

template <PriceLike P>
P clamp_to_band(P px, P lo, P hi) {
    return px < lo ? lo : (hi < px ? hi : px);
}

static_assert(PriceLike<double>);
// clamp_to_band(std::string{"x"}, ...) -> clean error: constraint not satisfied
```

Shorthand forms worth knowing: `void f(PriceLike auto px)` and `template <std::integral T>`. Concepts also drive overload selection — the most-constrained viable overload wins, replacing large swaths of old SFINAE/`enable_if` machinery. If you can say "concepts are constrained templates with named requirements checked at the call site, and they participate in overload resolution," you've answered the question.

## CRTP: static polymorphism for strategies

The Curiously Recurring Template Pattern gives you the *shape* of polymorphism — a base class defining a protocol — without the vtable:

```cpp
template <typename Derived>
class StrategyBase {
public:
    void on_quote(const Quote& q) {
        auto& self = static_cast<Derived&>(*this);
        if (self.should_trade(q))        // resolved at compile time, inlined
            self.send_order(q);
    }
};

class MomentumStrategy : public StrategyBase<MomentumStrategy> {
public:
    bool should_trade(const Quote& q) { return q.mid() > ema_; }
    void send_order(const Quote& q)   { /* ... */ }
private:
    double ema_ = 0;
};
```

`StrategyBase<MomentumStrategy>` knows the derived type statically, so the "virtual" calls are direct and inlinable. The trade-off: you lose runtime substitution — you can't hold a `std::vector<StrategyBase*>` of heterogeneous strategies. The honest interview answer: **use virtual when you need runtime selection of a handful of strategies at startup; use CRTP (or just templates) when the dispatch is on the per-message hot path.** C++23's deducing `this` largely supersedes CRTP syntax, worth mentioning for bonus points.

## `constexpr` / `consteval`: compute at compile time

Fixed-point price arithmetic is the canonical example — you need powers of ten, and there's no reason to compute them at runtime:

```cpp
consteval int64_t pow10(int n) {           // consteval: MUST run at compile time
    int64_t r = 1;
    for (int i = 0; i < n; ++i) r *= 10;
    return r;
}

template <int Decimals>
struct FixedPrice {
    static constexpr int64_t scale = pow10(Decimals);
    int64_t ticks;
    constexpr double to_double() const { return double(ticks) / scale; }
    friend constexpr auto operator<=>(FixedPrice, FixedPrice) = default;
};

using Px = FixedPrice<4>;                   // scale == 10'000, baked into the binary
static_assert(Px{123'456}.to_double() == 12.3456);
```

Distinctions to articulate: `constexpr` functions *can* run at compile time (and still work at runtime); `consteval` functions *must*; `static_assert` is your compile-time unit test. Lookup tables (checksum tables, tick-size ladders) built in `constexpr` functions ship as read-only data — zero startup cost.

## The trade-off: template bloat

Monomorphization has a bill. Every instantiation is new machine code: N strategies × M message types = N·M copies of the decode loop. Consequences: bigger binaries, longer compile times, and — the performance-relevant one — **instruction cache pressure**. An i-cache miss can cost more than the virtual call you avoided. Mature codebases mitigate with type erasure at cold boundaries (config, logging), explicit instantiation in one TU, and thin non-template cores under template shims. Showing you know templates aren't free is what separates a senior answer from an enthusiastic one.

## Interview checkpoints

- Templates monomorphize: each instantiation is concrete code the optimizer can fully inline — that's "zero-cost abstraction."
- Virtual dispatch costs more than the indirect call: it's an inlining/optimization barrier; that's why hot paths prefer templates or CRTP.
- Concepts are named, call-site-checked constraints that also steer overload resolution — the modern replacement for SFINAE.
- CRTP = static polymorphism: protocol of a base class, dispatch of a direct call; the price is no runtime substitution.
- `constexpr` may run at compile time, `consteval` must; use them for scale factors and tables, and `static_assert` the results.
- Know the cost: template bloat inflates binaries and i-cache footprint — type-erase at cold boundaries.
