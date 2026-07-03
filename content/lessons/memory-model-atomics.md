---
title: The C++ Memory Model & Atomics
minutes: 18
---

**Builds on:** *Values, References & const* and *STL Containers* — you should be comfortable with C++ object basics before touching atomics.

# The C++ Memory Model & Atomics

If you interview for a quant dev role, someone *will* probe your understanding of the memory model. It's the perfect filter question: it separates engineers who have shipped multithreaded, latency-critical code from those who have only read about `std::thread`. Trading systems are full of single-producer/single-consumer queues, sequence locks, and lock-free tickers — all of which are wrong-by-default unless you understand happens-before.

## Why reordering exists

Both the compiler and the CPU reorder your code, and both do it for speed:

- **Compiler**: it may hoist loads out of loops, sink stores, eliminate "redundant" reads, and reorder independent operations. It only promises that a *single-threaded* observer can't tell the difference (the as-if rule).
- **CPU**: modern x86 has store buffers — a store may become visible to other cores *after* a later load executes (StoreLoad reordering). ARM is far weaker and reorders much more aggressively.

So this classic "flag protocol" is broken:

```cpp
// Thread 1                       // Thread 2
data = 42;                        while (!ready) {}   // may never see true,
ready = true;                     use(data);          // or see ready==true but data==0
```

Nothing stops the compiler from reordering the stores, caching `ready` in a register forever, or the CPU from making `ready` visible before `data`.

## Data race = undefined behavior

The standard is blunt: if two threads access the same memory location, at least one access is a write, and the accesses aren't synchronized, the program has **undefined behavior**. Not "stale value" — UB. The compiler is allowed to assume races don't happen and optimize accordingly. Interviewers love asking this because many candidates think a racy read merely returns a torn or old value. It doesn't; the whole program is meaningless.

## `std::atomic` and happens-before

`std::atomic<T>` gives you two things: race-free access, and the ability to establish **happens-before** edges between threads via memory orderings.

The key rule: a **release store** *synchronizes-with* an **acquire load** that reads the stored value. Everything sequenced before the release store becomes visible to everything sequenced after the acquire load.

```cpp
std::atomic<bool> ready{false};
int data = 0;   // plain int — protected by the ordering

// Producer
data = 42;                                     // A
ready.store(true, std::memory_order_release);  // B: nothing above sinks below B

// Consumer
while (!ready.load(std::memory_order_acquire)) {} // C: nothing below hoists above C
assert(data == 42);                                // guaranteed: A happens-before this
```

Mnemonic: **release = publish** (make my prior writes visible), **acquire = subscribe** (see the publisher's prior writes).

## `seq_cst`: the default and its cost

Every atomic op defaults to `memory_order_seq_cst`, which additionally guarantees a *single total order* of all seq_cst operations that all threads agree on. That's the strongest — and priciest — option: on x86, a seq_cst store compiles to `xchg` or `mov` + `mfence` (a full barrier that drains the store buffer, ~tens of cycles), whereas a release store is a plain `mov`. On ARM the gap is bigger. In hot paths, defaulting to seq_cst is leaving latency on the table; but reach for it when you genuinely need a global order (e.g., the classic IRIW / Dekker-style patterns).

## `relaxed`: counters and stats

`memory_order_relaxed` guarantees atomicity and per-variable modification order, but **no** cross-thread ordering. Perfect for statistics where you only care about the eventual total:

```cpp
std::atomic<uint64_t> msgs_processed{0};
msgs_processed.fetch_add(1, std::memory_order_relaxed);  // hot path: no fences
```

Never use relaxed to guard other data — that's exactly the broken flag example above.

## A spinlock

A textbook interview exercise — note the orderings and the test-and-test-and-set to avoid hammering the cache line:

```cpp
class Spinlock {
    std::atomic<bool> locked_{false};
public:
    void lock() {
        for (;;) {
            if (!locked_.exchange(true, std::memory_order_acquire)) return;
            while (locked_.load(std::memory_order_relaxed))  // spin read-only
                ;  // consider __builtin_ia32_pause() / std::this_thread::yield()
        }
    }
    void unlock() { locked_.store(false, std::memory_order_release); }
};
```

Acquire on lock and release on unlock make the critical section behave like a mutex: writes inside it are visible to the next locker.

## Atomics vs mutex

- A **mutex** is easier to reason about, handles arbitrary critical sections, and an uncontended lock/unlock is just a couple of atomic ops (~20 ns). Contended, it may syscall (`futex`) and put threads to sleep — milliseconds of jitter. Unacceptable on a trading hot path.
- **Atomics/lock-free** avoid syscalls and priority inversion and give bounded latency, but only compose for small, carefully designed protocols. The honest interview answer: prefer a mutex until profiling or latency requirements say otherwise; on the hot path, design so you need neither (SPSC, single-writer).

## The classic: SPSC queue synchronization

The single-producer/single-consumer ring buffer is *the* canonical quant-dev interview question. Two indices, each written by exactly one thread:

```cpp
template <typename T, size_t N>  // N power of two
class SpscQueue {
    std::array<T, N> buf_;
    alignas(64) std::atomic<size_t> head_{0};  // written by consumer
    alignas(64) std::atomic<size_t> tail_{0};  // written by producer
public:
    bool push(const T& v) {
        size_t t = tail_.load(std::memory_order_relaxed);        // own index
        if (t - head_.load(std::memory_order_acquire) == N) return false; // full
        buf_[t % N] = v;                                          // write slot first
        tail_.store(t + 1, std::memory_order_release);            // then publish
        return true;
    }
    bool pop(T& out) {
        size_t h = head_.load(std::memory_order_relaxed);         // own index
        if (h == tail_.load(std::memory_order_acquire)) return false;    // empty
        out = buf_[h % N];                                        // read slot first
        head_.store(h + 1, std::memory_order_release);            // then free it
        return true;
    }
};
```

The reasoning you should narrate: the producer's **release store to `tail_`** publishes the slot write; the consumer's **acquire load of `tail_`** subscribes to it, so the element is fully constructed before it's read. Symmetrically, the consumer releases `head_` so the producer's acquire of `head_` knows the slot has been fully consumed before overwriting it. Loads of your *own* index can be relaxed — you're the only writer. The `alignas(64)` keeps the two indices off the same cache line (see the cache lesson). No seq_cst needed anywhere.

## Interview checkpoints

- A data race on a non-atomic is UB, not "a stale read" — say this precisely.
- Release store synchronizes-with the acquire load that reads it; that edge is what makes non-atomic `data` safe to read.
- "Release = publish my writes, acquire = subscribe to theirs" — be ready to annotate any flag/queue example.
- Know the cost story: seq_cst store = full fence on x86; release store = plain `mov`; relaxed fetch_add for counters.
- Be able to write the SPSC queue from memory and justify every memory_order, including why own-index loads are relaxed.
- Atomics vs mutex: mutexes can syscall and sleep (jitter); lock-free gives bounded latency but only for small protocols.
