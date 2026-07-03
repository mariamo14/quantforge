---
title: Values, References & const
minutes: 13
---

Here is the single biggest mental-model shift coming from Java or Python: **in C++, a variable *is* the object, not a reference to it.** Internalize this and half the language snaps into focus.

## Variables are objects

In Java, `Order b = a;` copies a *reference*; `a` and `b` point at the same object, and mutating through `b` is visible through `a`. Python works the same way. In C++, the same line **copies the object**:

```cpp
struct Order {
    double price;
    int    qty;
};

Order a{100.25, 500};
Order b = a;        // COPY: b is a brand-new, independent Order
b.qty = 900;

// a.qty is still 500. b is not "pointing at" a — it IS its own object.
```

In Java, `b.qty = 900` would have changed the one shared object. In C++, there are two objects, each with its own storage. Assignment copies, passing to a function copies, storing in a `std::vector` copies — value semantics is the default everywhere.

## Stack vs. heap

Where do objects live? By default, on the **stack** — "automatic storage." `Order a{...};` inside a function puts `a` in the function's stack frame: allocation is essentially free (bump a pointer), and the object is destroyed automatically when it goes out of scope. This is the opposite of Java, where every non-primitive object lives on the garbage-collected heap.

The **heap** exists for when an object must outlive the scope that created it, or when size is only known at runtime:

```cpp
Order* p = new Order{100.25, 500};  // heap allocation, p is a pointer
// ... later, YOU must free it:
delete p;                            // forget this = memory leak
```

There is no garbage collector — with raw `new`, you own the cleanup. But hold that thought: modern C++ almost never writes raw `new`/`delete`. Containers like `std::vector` and smart pointers manage heap memory for you; the next lesson (RAII) tells that story. For now: **automatic storage is the default; the heap is opt-in.**

## References: aliases, not Java references

A C++ reference `T&` is a second name for an *existing* object:

```cpp
Order a{100.25, 500};
Order& r = a;       // r IS a — no copy, no new object
r.qty = 900;        // a.qty is now 900

// Order& bad;      // error: a reference must be bound at creation
// r = other;       // does NOT reseat r — it assigns other's value INTO a
```

Three properties make references different from Java/Python references: they can never be null, they must be bound when created, and they can never be re-pointed at another object. Assigning through a reference modifies the original object, always.

C++ also has **pointers** (`T*`): the nullable, reseatable cousin. A pointer can be `nullptr`, can be redirected (`p = &other;`), and requires `*p`/`p->` to reach the object. Prefer references when "always refers to something" holds; use pointers when nullability or reseating is genuinely needed.

## Passing parameters: the cost model

Value semantics has a price. Consider:

```cpp
double sum(std::vector<double> prices);        // by value: COPIES the vector
double sum(const std::vector<double>& prices); // by const ref: aliases it
```

If `prices` holds a million doubles, the first version copies ~8 MB on every call. The second passes what is effectively an address — a few bytes — and `const` promises the function won't modify the caller's data.

The default rule:

- **Cheap-to-copy types** (`int`, `double`, `bool`, pointers, small structs): pass **by value**.
- **Everything else** (`std::vector`, `std::string`, your own classes): pass **by `const T&`**.
- Pass by non-const `T&` only when the function's *job* is to modify the argument.

## const as a contract

`const` is a compiler-enforced promise. On a parameter, it means "I only read this." On a member function, it means "calling me doesn't change the object":

```cpp
class Position {
    double qty_ = 0.0;
    double avg_px_ = 0.0;
public:
    void fill(double qty, double px);          // mutates state
    double notional() const {                  // promises not to
        return qty_ * avg_px_;
    }
};
```

Mark every member function `const` unless it mutates — otherwise it can't even be called on a `const Position&` parameter. Interviewers notice missing `const`; it reads as inexperience.

## auto

`auto` deduces the type from the initializer. It shines when the type is obvious or noisy:

```cpp
auto it = book.find(order_id);          // iterator type: long and irrelevant
auto mid = (bid + ask) / 2.0;           // clearly double
```

It hurts when the type carries meaning the reader needs: `auto risk = compute();` tells you nothing — is that a `double`, a struct, a vector? Also note `auto` drops references: `auto v = get_vector();` copies; write `const auto&` to alias. Rule of thumb: use `auto` to remove noise, not to hide information.

## Translation table

| Java / Python idiom | C++ idiom |
|---|---|
| `Order b = a;` shares one object | `Order b = a;` copies; use `Order& b = a;` to alias |
| Every object on the GC heap | Stack by default; heap is explicit (and rare in modern code) |
| `null` reference | References can't be null; use `T*` (or `std::optional`) for "maybe" |
| Pass object → callee sees/mutates it | Pass by value copies; use `T&` to allow mutation |
| Read-only by convention (`final` fields help) | `const` enforced by the compiler |
| `var x = ...` | `auto x = ...` (but beware: `auto` copies unless you write `auto&`) |

## Interview checkpoints

- `Order b = a;` copies in C++ — value semantics by default, unlike Java/Python reference semantics.
- Automatic (stack) storage is the default: fast, scope-bound, no GC needed; `new` is explicit heap allocation and rare in modern C++.
- `T&` is a non-null, non-reseatable alias; `T*` is the nullable, reseatable alternative.
- Pass cheap types by value; pass containers and classes by `const T&` — copying a million-element vector per call is a real interview trap.
- `const` member functions and parameters are enforced contracts; write them by default.
