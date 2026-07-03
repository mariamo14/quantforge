---
title: Cache-Friendly Code
minutes: 14
---

# Cache-Friendly Code

Big-O tells you nothing about a factor-of-50 gap between L1 and DRAM. In trading systems, where a full tick-to-trade path might have a budget of a few microseconds, a handful of cache misses *is* your budget. Interviewers ask about caches because it predicts whether your "correct" code will actually be fast — and because candidates who know only algorithmic complexity write linked-list order books that get destroyed in production.

## The memory hierarchy

Approximate numbers for a modern x86 server (know these cold; interviewers ask):

| Level | Size | Latency |
|---|---|---|
| L1 data cache | 32–48 KB / core | ~1 ns (4–5 cycles) |
| L2 | 512 KB–2 MB / core | ~4 ns (~14 cycles) |
| L3 (shared) | tens of MB | ~15–40 ns |
| DRAM | GBs | ~80–100 ns |

One DRAM access costs as much as ~80–100 L1 hits. A single miss can cost more than the entire arithmetic in your pricing function.

## Cache lines: memory moves in 64-byte chunks

The cache doesn't fetch bytes; it fetches **64-byte lines**. Touch one byte and you pay for — and receive — 64. Two consequences:

- **Spatial locality**: data used together should live together. If you read `price`, the adjacent `qty` is now free.
- **Temporal locality**: data used recently is cheap to use again. Reuse what's hot before it's evicted.

Every layout decision below is just engineering these two properties.

## AoS vs SoA: a market-data example

Suppose you scan the day's ticks computing a VWAP. The natural OOP layout is an **array of structs (AoS)**:

```cpp
struct Tick {              // AoS: 40 bytes each
    int64_t  ts_ns;
    double   price;
    int32_t  qty;
    uint32_t venue;
    char     flags[12];
};
std::vector<Tick> ticks;   // scan touches price+qty: 12 useful bytes of 40
```

Scanning `price` and `qty` drags `ts_ns`, `venue`, and `flags` through the cache too — ~70% of your memory bandwidth is wasted. The **struct of arrays (SoA)** layout packs each field densely:

```cpp
struct TickBook {          // SoA
    std::vector<int64_t> ts_ns;
    std::vector<double>  price;
    std::vector<int32_t> qty;
    std::vector<uint32_t> venue;
};

double vwap(const TickBook& b) {
    double pv = 0; int64_t v = 0;
    for (size_t i = 0; i < b.price.size(); ++i) {  // 8 prices per line,
        pv += b.price[i] * b.qty[i];               // 16 qtys per line
        v  += b.qty[i];
    }
    return pv / double(v);
}
```

Now every cache line is 100% useful data, and the compiler can auto-vectorize the loop with SIMD. Rule of thumb: AoS when you use the whole record together (order entry), SoA when you sweep one or two fields across many records (analytics, signals).

## The prefetcher rewards linear access

The hardware prefetcher watches your access pattern; if it sees sequential or constant-stride loads, it fetches the next lines *before* you ask. A linear scan over a vector effectively hides DRAM latency entirely. Pointer-chasing defeats it: the next address is unknown until the current load completes, so you eat the full ~80 ns serially, per node. This is why iterating a `std::vector` can be 10–20x faster than a `std::list` of the same elements despite identical O(n).

## False sharing: cores fighting over one line

Coherency (MESI) also works in 64-byte lines. If two threads write two *different* variables that happen to share a line, the line ping-pongs between cores in Modified state — each write invalidates the other core's copy. It's invisible in the source and can cost 10x on hot counters.

```cpp
struct Stats {                       // BROKEN: both counters in one line
    std::atomic<uint64_t> md_msgs;   // thread A hammers this
    std::atomic<uint64_t> orders;    // thread B hammers this
};

struct StatsFixed {                  // each counter owns a full line
    alignas(64) std::atomic<uint64_t> md_msgs;
    alignas(64) std::atomic<uint64_t> orders;
};
```

C++17 gives you `std::hardware_destructive_interference_size` for the constant. The same trick is why SPSC queue head/tail indices are padded apart. Watch for it whenever per-thread data is stored in one contiguous array.

## Why node-based containers are slow in practice

`std::map`, `std::list`, `std::unordered_map` allocate a node per element, scattered across the heap:

- Every traversal step is a dependent pointer load → likely miss, no prefetching.
- Nodes carry pointer overhead (a `map` node of an 8-byte key is mostly metadata).
- Allocation itself is slow and fragments memory further.

The production pattern: for small `n` (say, tracking the top levels of a book), a **sorted `std::vector` with linear or binary search beats `std::map`** decisively — a shift of a few contiguous elements is cheaper than one cache miss. Real order books use flat arrays of price levels or vectors indexed by price tick, not red-black trees. For hash maps, open-addressing tables (`absl::flat_hash_map`) beat `std::unordered_map`'s bucket-of-nodes design for the same reason.

## The data-oriented design mindset

Stop asking "what objects model this domain?" and start asking "**what data does the hot loop touch, and in what order?**" Then:

1. Lay out data in the order it's accessed — arrays over graphs of objects.
2. Separate hot fields from cold ones (split the struct; keep the scan tight).
3. Batch work so a warm dataset is fully processed before moving on.
4. Measure with `perf stat -e cache-misses,LLC-load-misses` — don't guess.

This is the mental model behind every fast feed handler and matching engine: the machine streams contiguous memory; design for the machine.

## Interview checkpoints

- Quote the hierarchy from memory: L1 ~1 ns, L2 ~4 ns, L3 ~15–40 ns, DRAM ~80–100 ns; one miss ≈ 100 L1 hits.
- Memory moves in 64-byte lines — explain how that produces spatial locality and why layout matters more than instruction count.
- AoS vs SoA: choose by access pattern; SoA gives full-line utilization and enables SIMD for field sweeps.
- Linear access is nearly free (prefetcher); pointer chasing serializes full-latency misses — hence vector over list/map in practice.
- Define false sharing and fix it on sight with `alignas(64)` / `hardware_destructive_interference_size`.
- Be ready to argue why a sorted vector beats `std::map` for an order book's price levels.
