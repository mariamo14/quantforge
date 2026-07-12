---
title: Concurrency in Practice
minutes: 15
---

**Builds on:** *The C++ Memory Model & Atomics*.

You know what `memory_order_acquire` means. This lesson is about the other 95% of threaded code: the tools you reach for daily, the design questions that decide whether a system is debuggable, and the patterns interviewers ask you to write on a whiteboard.

## Threads: `std::thread` and `std::jthread`

`std::thread` has a sharp edge: if a `std::thread` object is destroyed while still *joinable* (you never called `join()` or `detach()`), the destructor calls `std::terminate()`. An early return or an exception between construction and `join()` kills your process.

C++20's `std::jthread` fixes this with RAII semantics: its destructor requests a stop and then joins automatically.

```cpp
#include <thread>

void worker(std::stop_token st) {
    while (!st.stop_requested()) {
        // do work
    }
}

void run() {
    std::jthread t{worker};   // stop_token supplied automatically
    // ... may throw or return early ...
}   // ~jthread(): request_stop(), then join(). No terminate, no leak.
```

The `std::stop_token` gives you cooperative cancellation for free — the loop polls it instead of you hand-rolling an `atomic<bool> done` flag. Prefer `jthread` in new code; mention it in interviews and you signal you've written C++ this decade.

## The ownership question

Before you pick a synchronization primitive, answer this: **for every piece of mutable data, who owns it?** Every threaded design must answer it explicitly, and most concurrency bugs are a failure to.

The sanity default: **one writer per datum**. Each piece of state has exactly one thread that mutates it; everyone else either doesn't touch it, or reads it through a deliberate, explicit channel (a queue, an atomic snapshot, a mutex-guarded copy). Designs where "anyone might write anything" require synchronization *everywhere*, and you will miss a spot.

Corollary: the best synchronization is none — data confined to one thread needs no locks at all. Trading systems take this to the extreme (see below).

## Mutexes: `lock_guard`, `scoped_lock`, and deadlock

The default tool for shared mutable state is a mutex, and you never lock it manually — RAII wrappers guarantee unlock on every exit path, including exceptions:

```cpp
std::mutex m;
int balance = 0;

void deposit(int amt) {
    std::lock_guard<std::mutex> lk(m);   // locks now, unlocks in destructor
    balance += amt;
}
```

`std::scoped_lock` (C++17) is the modern superset: same idea, but it can take **multiple mutexes at once** and locks them with a deadlock-avoidance algorithm (equivalent to `std::lock`).

**Deadlock** needs two locks and two orders. Thread A holds `m1`, wants `m2`; thread B holds `m2`, wants `m1`; both wait forever. Two standard cures:

1. **Global lock ordering.** Every thread that needs both `m1` and `m2` acquires them in the same fixed order. Simple, but a convention the compiler won't enforce.
2. **All-or-nothing acquisition.** `std::scoped_lock lk(m1, m2);` acquires both atomically-in-effect — internally it lock/try-locks in a loop, backing off and retrying so no cycle of partial holds can form. Two threads doing `scoped_lock(a, b)` and `scoped_lock(b, a)` will *not* deadlock.

```cpp
void transfer(Account& from, Account& to, int amt) {
    std::scoped_lock lk(from.m, to.m);   // safe regardless of argument order
    from.balance -= amt;
    to.balance   += amt;
}
```

## `condition_variable` done correctly

A condition variable lets a thread sleep until a condition becomes true, without spinning. Two rules make it correct:

1. **Always wait on a predicate in a loop.** Wakeups can be *spurious* (the OS may wake a waiter with no notify at all), and even a real notify can race: between the notify and your wake-up, another consumer may have already consumed the item. The predicate re-check handles both.
2. **Mutate the shared state under the same mutex the waiter uses.** Otherwise the notify can slip into the gap between the waiter's check and its sleep, and the waiter sleeps forever.

The predicate-overload of `wait` bakes the loop in — use it:

```cpp
std::mutex m;
std::condition_variable cv;
std::queue<Order> q;

void produce(Order o) {
    {
        std::lock_guard lk(m);
        q.push(std::move(o));
    }                       // unlock before notify: waiter wakes into a free mutex
    cv.notify_one();
}

Order consume() {
    std::unique_lock lk(m);              // unique_lock: wait() must unlock/relock
    cv.wait(lk, [&] { return !q.empty(); });   // == while (!pred) wait(lk);
    Order o = std::move(q.front());
    q.pop();
    return o;
}
```

Note the `std::unique_lock` — `cv.wait` releases the mutex while sleeping and re-acquires before returning, which `lock_guard` can't express.

## When to use what

| Tool | Use for | Notes |
|---|---|---|
| `std::mutex` + RAII lock | **Default.** Any shared mutable state, any invariant spanning multiple fields | Correct first, fast later. Uncontended locks are cheap. |
| Atomics | Counters, flags (`stop`, `ready`), sequence numbers, SPSC ring-buffer indices | Single word, single invariant. If two variables must stay consistent, atomics alone won't save you. |
| Lock-free structures | Only with a **benchmark that demands it** | Enormously hard to get right (ABA, memory reclamation). Use a vetted library, and only after profiling shows the mutex is the bottleneck. |

The failure mode interviewers watch for is reaching for atomics or lock-free tricks to look clever. The senior answer is: mutex until measured.

## Thread pools — and why trading systems often don't

A thread pool amortizes thread-creation cost: N worker threads pull tasks from a shared queue. Great for throughput-oriented servers with independent, irregular tasks.

Low-latency trading systems usually prefer the opposite: **pinned threads with owned data**. One thread per role (market-data ingest, strategy, order gateway), each pinned to a dedicated core, each owning its state outright, connected by SPSC queues. Why:

- **Cache warmth.** The strategy thread's hot data stays in that core's L1/L2. A pool task migrating across cores restarts cold every time.
- **Predictability.** No queue contention, no scheduler roulette, no task waiting behind an unrelated slow task. Tail latency is what kills you, and pools add variance.
- **Ownership clarity.** One writer per datum falls out of the architecture for free — most data needs no synchronization at all.

This is the same story as the low-latency lesson: the fastest synchronization is the one you designed away.

## Sanitizer discipline

**Run ThreadSanitizer on every threaded test.** Non-negotiable. Data races are UB, and racy code can pass a thousand runs and fail in production at 3am.

```
g++ -fsanitize=thread -g -O1 test_queue.cpp && ./a.out
```

TSan dynamically detects data races on the interleavings your test actually exercises — so it can miss races your test never triggers, but it essentially doesn't false-positive on real races. Expect ~5–15x slowdown; run it in CI, not just locally. (Don't mix `-fsanitize=thread` with ASan in the same binary.) A "TSan-clean under a stress test" habit is worth more than any amount of code review.

## Interview classics

**1. Implement a thread-safe queue.** The expected sketch is exactly the mutex + condition_variable pattern:

```cpp
template <typename T>
class ThreadSafeQueue {
    mutable std::mutex m_;
    std::condition_variable cv_;
    std::queue<T> q_;
public:
    void push(T v) {
        {
            std::lock_guard lk(m_);
            q_.push(std::move(v));
        }
        cv_.notify_one();
    }
    T pop() {                       // blocking pop
        std::unique_lock lk(m_);
        cv_.wait(lk, [&] { return !q_.empty(); });
        T v = std::move(q_.front());
        q_.pop();
        return v;
    }
    bool try_pop(T& out) {          // non-blocking variant
        std::lock_guard lk(m_);
        if (q_.empty()) return false;
        out = std::move(q_.front());
        q_.pop();
        return true;
    }
};
```

Talking points: predicate loop (spurious wakeups), `unique_lock` for `wait`, notify outside the lock as a minor optimization, and shutdown (add a `closed_` flag, wait on `!q_.empty() || closed_`).

**2. "What's wrong with this code?" — double-checked locking.**

```cpp
Widget* instance = nullptr;   // BROKEN
std::mutex m;

Widget* get() {
    if (instance == nullptr) {            // (1) unsynchronized read — data race
        std::lock_guard lk(m);
        if (instance == nullptr)
            instance = new Widget();      // (2) may publish pointer before
    }                                     //     Widget's construction is visible
    return instance;
}
```

Two bugs: the read at (1) races with the write at (2) — UB by definition — and even on hardware where the race "works," another thread can observe a non-null pointer to a not-yet-constructed object, because nothing orders the construction before the pointer store. Fixes, in order of preference: a function-local `static Widget w;` (C++11 guarantees thread-safe initialization — the "Meyers singleton"), `std::call_once`, or an `std::atomic<Widget*>` with release store / acquire load if they insist you fix the pattern itself.

**3. False sharing, one line.** Two threads writing *different* variables that share a 64-byte cache line ping-pong the line between cores and destroy scaling — separate hot per-thread data with `alignas(std::hardware_destructive_interference_size)`.

## Interview checkpoints

- Why does `std::jthread` exist? (A joinable `std::thread` destructor calls `std::terminate`; `jthread` request-stops and joins in its destructor, and supplies a `stop_token` for cooperative cancellation.)
- What's the first question to ask about any threaded design? (Who owns each piece of data — default to one writer per datum; unowned shared mutable state is where the bugs live.)
- Why must `condition_variable::wait` use a predicate loop? (Spurious wakeups exist, and a notified condition may already be consumed by the time you run — re-check under the lock.)
- How does `std::scoped_lock(m1, m2)` avoid deadlock, and what's the alternative? (All-or-nothing multi-lock via a try-and-back-off algorithm; the alternative is a global lock-acquisition order.)
- Why do trading systems prefer pinned threads with owned data over thread pools? (Cache warmth on a dedicated core, predictable tail latency, and ownership that eliminates most synchronization.)
- What are the two bugs in classic double-checked locking? (The unsynchronized first check is a data race, and nothing orders object construction before pointer publication — fix with a Meyers singleton, `call_once`, or acquire/release atomics.)
