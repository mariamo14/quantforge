---
title: Move Semantics & Value Categories
minutes: 14
---

Move semantics questions separate candidates who *use* C++ from candidates who *understand* it. On a trading desk, the practical stakes are copies you didn't know you were making: a `std::vector<Fill>` copied per tick is an allocation plus a memcpy on your hot path. Interviewers probe whether you know what `std::move` actually does (nothing, at runtime) and what a move actually costs.

## Value categories: the two-question intuition

Every expression is categorized by two properties: *does it have identity?* (can you take its address) and *can it be moved from?* The working mental model:

- **lvalue** — has a name/identity, will be used again: `order`, `book.bids()`, `*ptr`.
- **prvalue** — a temporary with no identity: `Order{...}`, `price * qty`, function returning by value.
- **xvalue** — "expiring value": has identity but you've promised it's done: `std::move(order)`.

rvalue = prvalue or xvalue. Overload resolution uses this: `T&&` binds to rvalues, `const T&` binds to anything. That's the entire dispatch mechanism behind moves.

## `std::move` is a cast

```cpp
template <class T>
constexpr std::remove_reference_t<T>&& move(T&& t) noexcept {
    return static_cast<std::remove_reference_t<T>&&>(t);
}
```

It generates **zero instructions**. It only relabels an lvalue as an xvalue so that a move constructor/assignment gets *selected*. If the type has no move operations, `std::move` silently produces a copy — a classic gotcha with `const` objects:

```cpp
const std::string sym = "AAPL";
auto s = std::move(sym);   // COPY: const std::string&& can't bind to string&&'s move ctor
```

The contract after a move: the source is in a **valid but unspecified state**. You may destroy it or assign to it; you may not assume its contents. For your own types, prefer leaving a deterministic empty state (null pointer, `-1` fd) — it makes the destructor trivially correct.

## Writing move operations

```cpp
class ExecutionReport {
    std::vector<Fill> fills_;
    char* raw_msg_ = nullptr;   // owned buffer from the wire
public:
    ExecutionReport(ExecutionReport&& o) noexcept
        : fills_{std::move(o.fills_)},
          raw_msg_{std::exchange(o.raw_msg_, nullptr)} {}

    ExecutionReport& operator=(ExecutionReport&& o) noexcept {
        if (this != &o) {
            delete[] raw_msg_;
            fills_   = std::move(o.fills_);
            raw_msg_ = std::exchange(o.raw_msg_, nullptr);
        }
        return *this;
    }
    ~ExecutionReport() { delete[] raw_msg_; }
    // copy ops deleted or defined as needed
};
```

Two things interviewers check: `noexcept` (without it, `std::vector` *copies* your elements during reallocation, because it can't guarantee the strong exception guarantee with a throwing move) and `std::exchange` to null out the source.

## Rule of zero / rule of five

The compiler generates move operations only if you declare **no** copy operations, no destructor, and no other move op. Declare any of the five and you should think about all five. Best answer in an interview: "I follow the rule of zero — hold resources via `vector`/`unique_ptr` members and let the compiler generate everything. I write the five only for types that directly own a raw resource."

## Copy elision and NRVO: moves that never happen

Guaranteed since C++17: a prvalue used to initialize an object is constructed **in place** — no copy, no move, nothing to elide:

```cpp
Order make_order() { return Order{sym, px, qty}; }  // constructed directly in caller's slot
```

NRVO (named RVO) — returning a named local — is a permitted-but-not-guaranteed optimization; when it doesn't fire, the return implicitly moves. Consequences you should state:

- **Never** write `return std::move(local);` — it *disables* NRVO and pessimizes to a forced move.
- Returning by value is the default idiom; output parameters are legacy style.

## Perfect forwarding, briefly

`T&&` where `T` is a *deduced* template parameter is a forwarding reference, not an rvalue reference. Reference collapsing lets `std::forward<T>` preserve the caller's value category:

```cpp
template <class... Args>
Order& emplace_order(Args&&... args) {
    return orders_.emplace_back(std::forward<Args>(args)...);
}
```

This is how `emplace_back` and `make_unique` avoid intermediate copies. Know the distinction: `Order&&` (concrete type) = rvalue reference; `T&&` (deduced) = forwards anything.

## The cost model: what's actually cheap to move

Moving is not free; it's *pointer shuffling*. Know the numbers:

| Type | Move cost |
|---|---|
| `std::vector<T>` | 3 pointer copies — O(1), independent of size |
| `std::string` (long) | 3 words, steals heap buffer |
| `std::string` (short, SSO) | **memcpy of the inline buffer — same as a copy** |
| `std::array<T, N>` | element-wise move — O(N), nothing to steal |
| `std::unique_ptr` | 1 pointer copy + null the source |
| POD struct (`Price`, `Quote`) | identical to copy; move buys nothing |

The SSO point is an interview favorite: moving a 6-char symbol string copies bytes anyway. And for a 32-byte trivially-copyable `Quote`, pass by value — moves and copies are the same instructions, and by-value avoids an indirection.

## Interview classic: a move-only `OrderHandle`

An order ID registered with the exchange must be cancelled exactly once — textbook move-only resource:

```cpp
class OrderHandle {
    Gateway* gw_ = nullptr;
    uint64_t id_ = 0;
public:
    OrderHandle(Gateway& gw, uint64_t id) noexcept : gw_{&gw}, id_{id} {}

    OrderHandle(const OrderHandle&) = delete;
    OrderHandle& operator=(const OrderHandle&) = delete;

    OrderHandle(OrderHandle&& o) noexcept
        : gw_{std::exchange(o.gw_, nullptr)}, id_{std::exchange(o.id_, 0)} {}
    OrderHandle& operator=(OrderHandle&& o) noexcept {
        if (this != &o) {
            reset();
            gw_ = std::exchange(o.gw_, nullptr);
            id_ = std::exchange(o.id_, 0);
        }
        return *this;
    }
    ~OrderHandle() { reset(); }

    void reset() noexcept { if (gw_) gw_->cancel(id_); gw_ = nullptr; }
    uint64_t id() const noexcept { return id_; }
};
```

Talk through it as you write: deleted copies enforce single ownership; moves are `noexcept` so it lives happily in a `std::vector<OrderHandle>`; the moved-from state (`gw_ == nullptr`) makes destruction a no-op; self-move-assignment is guarded.

## Interview checkpoints

- `std::move` is a compile-time cast to xvalue — zero runtime cost; it enables move selection, it doesn't move anything.
- Moved-from objects are valid-but-unspecified; design your own types to leave a deterministic empty state.
- Move operations must be `noexcept`, or `std::vector` falls back to copying on reallocation.
- C++17 guarantees elision for prvalues; `return std::move(local)` is an anti-pattern that defeats NRVO.
- Cost model: `vector` moves are 3 pointers; SSO strings and `std::array` move element-by-element; PODs gain nothing from moves.
- Rule of zero by default; write the full five (with `std::exchange`, self-assignment guard) only for direct resource owners like a move-only `OrderHandle`.
