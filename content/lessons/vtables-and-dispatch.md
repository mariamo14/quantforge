---
title: Virtual Dispatch Under the Hood
minutes: 14
---

# Virtual Dispatch Under the Hood

Interviewers at trading firms ask about virtual functions for two reasons. First, it's a cheap filter: if you can't sketch a vtable, you probably haven't thought hard about what your code compiles to. Second, it opens the real conversation they want to have — *what does dispatch cost on a hot path, and what are the alternatives?* This lesson gives you both layers.

## What the compiler actually generates

When a class has at least one virtual function, the compiler emits:

- **One vtable per class** (per most-derived type, roughly): a static, read-only array of function pointers, one slot per virtual function, living in the binary's data segment.
- **One vptr per object**: a hidden pointer member, set by the constructor to point at the class's vtable.

```cpp
struct OrderHandler {
    virtual void on_fill(double px, int qty) = 0;
    virtual ~OrderHandler() = default;
};

struct LoggingHandler : OrderHandler {
    void on_fill(double px, int qty) override { /* ... */ }
};

void notify(OrderHandler& h) {
    h.on_fill(101.25, 300);   // indirect call through h's vptr
}
```

The call `h.on_fill(...)` compiles to roughly: load the vptr from the object, load the slot for `on_fill` from the vtable, call through that pointer. Two dependent loads plus an indirect call.

**Object layout consequence:** adding the first virtual function grows every object by one pointer. `sizeof(LoggingHandler)` with no data members is 8 bytes on x86-64, not 1. If you have millions of small order objects, that vptr is real memory and real cache pressure. Constructors also spend an instruction storing the vptr — and during construction, the vptr points at the *current* class's vtable, which is why virtual calls in constructors don't dispatch to the derived override.

## The honest cost model

Interviewers love candidates who don't parrot "virtual functions are slow." The indirect call itself is a few nanoseconds on a modern core with a warm branch target buffer — often indistinguishable from a direct call. The *real* costs are:

1. **Inlining is blocked.** The compiler usually can't see through the call, so it can't inline, and therefore can't do the follow-on optimizations (constant propagation, vectorization, dead-code elimination) that inlining unlocks. This is the dominant cost.
2. **Branch-target and i-cache pressure.** A megamorphic call site (many receiver types) defeats the indirect branch predictor; each mispredict costs ~15–20 cycles, and jumping between many implementations thrashes the instruction cache.
3. **Data cache**: the vptr load touches the object, the vtable load touches another cache line.

So the right interview answer is: "the indirection is cheap; the lost inlining and predictor pressure are what hurt, and only on per-message hot paths."

## Virtual destructors — the classic screen question

```cpp
OrderHandler* h = new LoggingHandler{};
delete h;   // fine only because ~OrderHandler() is virtual
```

If the base destructor is **not** virtual, `delete` through a base pointer where the dynamic type differs is **undefined behavior** ([expr.delete]) — not "the derived destructor just doesn't run," but full UB (in practice: skipped derived cleanup, wrong operator delete, possibly a wrong-address free with multiple inheritance). Rule of thumb to recite: *a base class should have either a `virtual` destructor or a `protected` non-virtual one* (the latter forbids deletion through the base at compile time).

## Pure virtual and abstract classes

`virtual void on_fill(...) = 0;` makes the class abstract: it can't be instantiated, and derived classes must override to become concrete. A pure virtual function *can* still have a definition (useful for a default a derived class may call explicitly as `Base::f()`). Pure virtual destructors are legal but must be defined out of line, because derived destructors call them.

## Devirtualization: getting direct calls back

The compiler may replace the indirect call with a direct (inlinable) one when it can prove the dynamic type:

- **`final`**: mark the class or function `final` and calls through a pointer to that type devirtualize. Cheap, local, do it.
- **Local knowledge**: if the compiler sees the object's construction in the same scope, it knows the type.
- **LTO / whole-program**: with link-time optimization the compiler can see the whole class hierarchy and devirtualize speculatively.
- **PGO**: profile-guided optimization can insert a guarded direct call for the common type — `if (vptr == &LoggingHandler_vtable) inlined_body(); else indirect_call();`

## Alternatives for hot paths

When dispatch is per-message and the type set is closed, mention these:

**CRTP** — compile-time polymorphism, zero overhead, fully inlinable:

```cpp
template <class Derived>
struct FeedHandler {
    void on_packet(const Packet& p) {
        static_cast<Derived*>(this)->handle(p);  // resolved at compile time
    }
};

struct ItchHandler : FeedHandler<ItchHandler> {
    void handle(const Packet& p) { /* ... */ }
};
```

**`std::variant` + `std::visit`** — value semantics, closed set of types, no heap, no vptr per object:

```cpp
using Msg = std::variant<AddOrder, CancelOrder, Trade>;

void process(Msg& m) {
    std::visit([](auto& msg) { apply(msg); }, m);  // jump table, often inlined
}
```

**Deducing this (C++23)** — `template <class Self> void on_packet(this Self&& self, ...)` gives CRTP-like static dispatch without the boilerplate base-class template. Worth a one-line mention to signal currency.

## When virtual is completely fine

This is where strong candidates separate themselves: **nuance beats dogma**. Virtual dispatch is the right tool for the control plane — strategy configuration, venue adapters chosen at startup, logging sinks, admin commands, anything invoked thousands of times per second or less. A 2 ns indirect call on a code path that runs at startup, or once per order rather than once per market-data tick, is irrelevant next to a single cache miss (~100 ns) or a syscall. Saying "I'd keep the market-data decode loop variant-based, but the strategy plug-in interface stays virtual because flexibility matters more there" is exactly the judgment interviewers are probing for.

## Interview checkpoints

- Sketch it: one vtable per class (static), one vptr per object (set in the constructor); a virtual call is two loads + an indirect call.
- The real cost of `virtual` is blocked inlining and branch-target/i-cache pressure, not the ~few-ns indirection.
- Deleting a derived object through a base pointer without a virtual destructor is UB — base classes need a virtual or protected non-virtual destructor.
- First virtual function adds `sizeof(void*)` to every object; virtual calls in constructors dispatch to the class under construction.
- Devirtualization levers: `final`, visible construction, LTO, PGO's speculative guarded calls.
- Hot-path alternatives: CRTP, `std::variant` + `std::visit`, C++23 deducing this — but defend virtual for control-plane code.
