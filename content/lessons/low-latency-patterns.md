---
title: Low-Latency Patterns for Trading Systems
minutes: 16
---

# Low-Latency Patterns for Trading Systems

Interviewers ask about low-latency patterns to test whether you think like a systems engineer under a real-time constraint — not "is it fast on average?" but "what is the *worst* thing that can happen on the tick-to-trade path?" This lesson is the catalogue of answers they expect.

## The latency mindset: tails and jitter

A trading system's P50 is almost irrelevant. You get picked off on your **P99.9**: the one-in-a-thousand event where a GC-like pause, a page fault, or a lock convoy makes you 100 µs late is exactly when everyone is racing for the same quote. So the discipline is about eliminating **jitter** — variance in latency — not just shaving the mean. Every pattern below removes a source of "sometimes this takes 1000x longer."

Corollary: report latency as a distribution (P50/P99/P99.9/max), never as an average.

## No allocation on the hot path

`new`/`malloc` may take a lock, walk free lists, or fault in pages via `mmap` — nanoseconds usually, milliseconds occasionally. The pattern: **allocate everything at startup, recycle at runtime.**

```cpp
// Fixed-capacity object pool: free-list of preallocated Orders
template <typename T, size_t N>
class Pool {
    std::array<std::aligned_storage_t<sizeof(T), alignof(T)>, N> slots_;
    std::vector<T*> free_;                     // preallocated, never grows
public:
    Pool() { free_.reserve(N);
             for (auto& s : slots_) free_.push_back(reinterpret_cast<T*>(&s)); }
    template <typename... A> T* acquire(A&&... a) {
        if (free_.empty()) return nullptr;     // explicit backpressure, no throw
        T* p = free_.back(); free_.pop_back();
        return std::construct_at(p, std::forward<A>(a)...);
    }
    void release(T* p) { std::destroy_at(p); free_.push_back(p); }
};
```

Variants: **arenas** (bump-pointer allocation, reset per cycle) for per-message scratch; `vector::reserve()` at startup so a hot-path `push_back` never reallocates; `std::pmr` allocators to inject these into standard containers. Also pin memory (`mlock`) and pre-fault it so the kernel can't page you out mid-tick.

## Ban exceptions, syscalls, and locks from the hot path

- **Exceptions**: the happy path is nearly free, but a *throw* is a slow, unbounded unwinding walk — and exception-safety machinery constrains the optimizer. Hot paths return error codes / `std::expected`.
- **Syscalls**: any syscall can be ~1 µs, and worse, it invites the scheduler to deschedule you. No logging via `write()`, no `gettimeofday` (use `rdtsc` or the vDSO), no blocking I/O. Log by writing to a lock-free ring drained by a cold thread.
- **Locks**: a contended mutex parks your thread via `futex` — an eternity plus a wakeup. Use single-writer designs and SPSC queues between pinned threads (`taskset`/`pthread_setaffinity_np`, ideally on isolated cores) so no lock is ever needed.

## Branches: help the predictor

A mispredicted branch costs ~15–20 cycles of flushed pipeline. Most branches in a feed handler are wildly skewed — tell the compiler:

```cpp
if (msg.type == MsgType::Quote) [[likely]] {
    on_quote(msg);              // 99.9% of traffic — keep this code hot & inline
} else [[unlikely]] {
    handle_admin(msg);          // moved out of line, cold section
}
```

`[[likely]]`/`[[unlikely]]` (C++20) shape code layout so the hot path is straight-line, dense in the instruction cache. For data-dependent unpredictable branches, prefer branchless forms (`cmov`-style arithmetic) — a predictable branch beats branchless, but an *unpredictable* branch loses to it.

## Virtual dispatch and its alternatives

A virtual call costs an extra dependent load (vtable pointer, then function pointer — potential cache misses), an indirect-branch prediction, and — the real killer — **it blocks inlining**, which blocks every downstream optimization. Alternatives:

```cpp
// CRTP: static polymorphism, fully inlinable, zero overhead
template <typename Derived>
struct StrategyBase {
    void on_tick(const Tick& t) { static_cast<Derived*>(this)->do_on_tick(t); }
};
struct MeanRevert : StrategyBase<MeanRevert> {
    void do_on_tick(const Tick& t) { /* ... */ }
};

// Closed set of types known at runtime: variant + visit
using Strategy = std::variant<MeanRevert, Momentum, Arb>;
std::visit([&](auto& s) { s.on_tick(t); }, strat);  // one switch, then inlined calls
```

Use CRTP when the type is known at compile time, `std::variant` for a small closed set chosen at runtime, and keep `virtual` for cold-path plugin boundaries where flexibility matters more than nanoseconds.

## Kernel bypass (concept level)

The kernel network stack costs several microseconds per packet: interrupt, context switch, `sk_buff` copies, socket locks. Competitive systems bypass it: the NIC DMAs packets into user-space rings and the app polls them directly — **DPDK**, Solarflare/Xilinx **Onload/ef_vi**, Mellanox **VMA**. The most aggressive shops push strategy logic into **FPGA/NIC hardware**. For interviews, know the *why* (skip interrupts, copies, and the scheduler) and the names; nobody expects you to have written a DPDK driver.

## Measurement: if you didn't measure it, it didn't happen

- **`rdtsc`** (via `__rdtsc()`) reads the TSC in ~10–20 cycles — the standard hot-path timestamp. Modern CPUs have `constant_tsc`/`invariant_tsc` so it ticks uniformly. Beware: it's not serializing (pair with `lfence` or use `rdtscp` when bracketing tiny regions), and convert ticks to ns via calibration.
- **`perf`**: `perf stat` for IPC, cache misses, branch misses; `perf record`/flamegraphs for where cycles go.
- **Pitfalls**: the compiler deleting your benchmarked code (use `benchmark::DoNotOptimize`); measuring a warm microbenchmark when production runs cold-cache; frequency scaling and turbo; coordinated omission (sampling latency only when you're ready hides the worst cases); averages hiding tails. Measure the P99.9 under realistic load, on the production-like box, with pinned cores.

## Busy-polling and staying warm

Blocking waits (`epoll`, condition variables) mean a wakeup path of microseconds and cold caches when you resume. Hot trading threads **busy-poll**: spin on the SPSC queue or NIC ring at 100% CPU on a dedicated, isolated core. Burning a core is the price of a ~10 ns reaction time.

Rare-but-critical paths (the actual order-send fires maybe once a minute) suffer cold I-cache, cold D-cache, cold branch predictors. The fix is **keeping paths warm**: periodically exercise the full send path with dummy/canary orders that are suppressed at the last hop, so when the real trigger arrives, everything is resident.

## Interview checkpoints

- Lead with tails: trading systems optimize P99.9 and jitter, not the mean — and name jitter sources (allocation, syscalls, scheduler, page faults).
- Hot path bans: no `new`, no throw, no syscalls, no locks — and know the replacement for each (pools/arenas, error codes, ring-buffer logging, SPSC + pinned threads).
- Explain what a virtual call really costs (dependent loads + no inlining) and when you'd reach for CRTP vs `std::variant` vs keeping `virtual`.
- `[[likely]]`/`[[unlikely]]` shape code layout; unpredictable branches may be worth making branchless.
- Kernel bypass in one sentence: poll the NIC from user space to skip interrupts, copies, and the scheduler (DPDK, Onload).
- Measurement literacy: `rdtsc` caveats, `perf`, DoNotOptimize, coordinated omission — and why hot loops busy-poll and warm their rare paths.
