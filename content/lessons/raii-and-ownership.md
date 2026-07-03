---
title: RAII & Ownership
minutes: 12
---

RAII is the single most important idea in C++, and interviewers use it as a litmus test: if you reach for `new`/`delete` in 2026, the interview is effectively over. The question behind every RAII question is *"do you understand that resource lifetime is a correctness problem, and that the type system can solve it for you?"*

## Resource lifetime = scope

C++ guarantees that when an object with automatic storage duration goes out of scope, its destructor runs — **deterministically**, in reverse order of construction, even if the scope is exited via `return`, `break`, or a thrown exception. RAII (Resource Acquisition Is Initialization) exploits this: acquire the resource in the constructor, release it in the destructor, and lifetime management becomes impossible to get wrong.

"Resource" is anything that must be released: heap memory, file descriptors, sockets, mutex locks, exchange sessions.

## Why manual `new`/`delete` fails

The naive version looks fine until an exception shows up:

```cpp
void process_order(const Order& o) {
    OrderContext* ctx = new OrderContext(o);
    validate(o);          // throws? -> ctx leaks
    route(*ctx);          // throws? -> ctx leaks
    delete ctx;
}
```

Every statement between `new` and `delete` is a potential leak path. Add early returns and the number of paths explodes. Exception-safe manual cleanup requires `try`/`catch` at every level, which nobody writes correctly. RAII collapses all exit paths into one:

```cpp
void process_order(const Order& o) {
    auto ctx = std::make_unique<OrderContext>(o);
    validate(o);          // throws? ~unique_ptr runs, ctx freed
    route(*ctx);
}   // freed here on the happy path
```

## `unique_ptr` as an ownership document

`std::unique_ptr<T>` is not just a leak-preventer — it is *documentation with teeth*. It says: exactly one owner exists, ownership is transferable only by explicit `std::move`, and copying is a compile error. It is a zero-overhead abstraction: same size as a raw pointer, destructor inlined to a single `delete`.

```cpp
auto book = std::make_unique<OrderBook>("AAPL");
auto other = book;             // compile error: copy deleted
auto other = std::move(book);  // OK: ownership transferred, book == nullptr
```

Prefer `make_unique` over `unique_ptr<T>(new T(...))`: it's exception-safe in complex expressions and never mentions `new`.

## Ownership in API signatures

Interviewers love asking "what does this signature tell you?" The modern convention:

```cpp
// Sink: callee TAKES ownership. Caller must std::move in.
void submit(std::unique_ptr<Order> order);

// Non-owning view: callee only observes/uses. Lifetime managed by caller.
void log_fill(const Order& order);       // must not be null
void maybe_update(Order* order);          // may be null, still non-owning

// Shared ownership: rare, and a design smell on hot paths (atomic refcount).
void subscribe(std::shared_ptr<FeedHandler> h);
```

Key rule: **raw pointers and references are fine — as non-owning views.** A raw pointer in a modern codebase means "I do not own this." Passing `unique_ptr` by value means "I am giving this to you." Passing `const unique_ptr<T>&` is almost always wrong — it forces the caller to have a `unique_ptr` while conveying no ownership semantics; take `const T&` instead.

## A trading-flavored RAII type

Wrap an exchange session so disconnects can never be forgotten:

```cpp
class OrderSession {
public:
    explicit OrderSession(std::string_view venue)
        : fd_{connect_to(venue)} {
        if (fd_ < 0) throw std::runtime_error("connect failed");
    }
    ~OrderSession() { if (fd_ >= 0) { send_logout(fd_); ::close(fd_); } }

    // Move-only: a session has exactly one owner.
    OrderSession(OrderSession&& o) noexcept
        : fd_{std::exchange(o.fd_, -1)} {}
    OrderSession& operator=(OrderSession&& o) noexcept {
        if (this != &o) { this->~OrderSession(); fd_ = std::exchange(o.fd_, -1); }
        return *this;
    }
    OrderSession(const OrderSession&) = delete;
    OrderSession& operator=(const OrderSession&) = delete;

    void send(const Order& o) { /* write to fd_ */ }
private:
    int fd_;
};
```

Notes an interviewer expects you to make unprompted: the move operations are `noexcept` (containers require this to move rather than copy on reallocation), the moved-from object is left in a valid state (`fd_ = -1`) so its destructor is a no-op, and copying is explicitly deleted because two owners of one socket is nonsense.

This pattern generalizes: `std::lock_guard` is RAII over a mutex, `std::jthread` is RAII over a thread (joins in the destructor), `std::ofstream` is RAII over a file.

## Classic interview traps

**Double delete.** Two raw pointers to one allocation, both `delete`d — UB, usually heap corruption. `unique_ptr` makes this structurally impossible; `shared_ptr` created *twice from the same raw pointer* reintroduces it:

```cpp
Order* p = new Order{};
std::shared_ptr<Order> a(p);
std::shared_ptr<Order> b(p);   // two control blocks -> double delete. Use make_shared.
```

**Use-after-free via views.** RAII manages owners, not observers. A `string_view` or reference into a destroyed object is still a dangling view:

```cpp
std::string_view symbol() {
    std::string s = load_symbol();
    return s;                    // dangles: s destroyed at return
}
```

**Leaking on exception** — the `new ... delete` gap shown above; the fix is always "wrap it in a type."

**Rule of zero.** If your class holds only RAII members (`string`, `vector`, `unique_ptr`), write *no* destructor and no copy/move operations — the compiler-generated ones are correct. Write the rule-of-five set only when you directly manage a raw resource, like `OrderSession` above.

## Interview checkpoints

- RAII ties resource release to scope exit via destructors, which run deterministically on every exit path — including exceptions.
- `unique_ptr` is a zero-overhead, move-only ownership statement; `make_unique` is the default way to allocate.
- Signature conventions: `unique_ptr` by value = ownership transfer (sink); raw pointer/reference = non-owning view; `const unique_ptr&` is a smell.
- Move operations on resource-owning types must be `noexcept` and must leave the source in a valid, destructible state.
- Rule of zero first; rule of five only when directly wrapping a raw resource.
- Common traps: double delete from two owners, dangling views (RAII doesn't protect observers), leaks in the `new`-to-`delete` window under exceptions.
