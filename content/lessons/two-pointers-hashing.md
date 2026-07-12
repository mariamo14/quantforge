---
title: Two Pointers & Hash Maps
minutes: 12
---

**Builds on:** *STL Containers: Complexity & Memory Layout*, *Sliding Windows & Streaming Statistics*

Screening rounds — the 45-minute phone screen before you meet the desk — lean on two patterns above all others: hash maps for $O(1)$ membership and counting, and two pointers for linear passes over sorted or windowed data. Between them they solve the majority of "easy/medium" problems. Knowing both, and knowing *when to pick which*, is table stakes.

## Hash-map patterns

**Seen-set.** Detect a duplicate order id in a stream:

```cpp
std::unordered_set<OrderId> seen;
for (const auto& ord : orders)
    if (!seen.insert(ord.id).second)
        reject(ord);   // insert returns {iterator, false} on duplicate
```

$O(n)$ time, $O(n)$ space. Note the idiom: `insert` *is* the membership test — checking `contains` then inserting does two hash lookups where one suffices.

**Value → index (two-sum).** Find two fills whose quantities sum to a target block size:

```cpp
std::optional<std::pair<int,int>> two_sum(const std::vector<Fill>& fills, long target) {
    std::unordered_map<long, int> qty_to_idx;
    for (int i = 0; i < (int)fills.size(); ++i) {
        if (auto it = qty_to_idx.find(target - fills[i].qty); it != qty_to_idx.end())
            return std::pair{it->second, i};
        qty_to_idx[fills[i].qty] = i;   // insert AFTER checking: handles qty == target/2
    }
    return std::nullopt;
}
```

The one-pass insight: as you visit fill $i$, ask "have I already seen its complement?" Every earlier element is in the map, so each element is processed exactly once with $O(1)$ expected lookup — $O(n)$ overall versus the naive $O(n^2)$ pair scan. Inserting *after* the lookup avoids matching an element with itself.

**Counting map.** Most-active symbol of the day:

```cpp
std::unordered_map<Symbol, long> vol;
for (const auto& t : trades) vol[t.symbol] += t.qty;
auto busiest = std::ranges::max_element(vol, {}, &std::pair<const Symbol, long>::second);
```

`operator[]` default-constructs the count to zero on first touch — that's the whole pattern.

**When the worst case matters.** `unordered_map` is $O(1)$ *expected*, $O(n)$ per operation under adversarial collisions, and every insert can rehash. In a screening answer, "expected O(1)" is fine; in a latency-critical path you'd note the unbounded tail (rehash pauses, collision chains, pointer-chasing per bucket) and mention alternatives: reserve up front, open-addressing maps, or a plain sorted `vector` when the key set is fixed. Flagging this unprompted reads as production experience.

## Two-pointer patterns

**Sorted two-sum (converging pointers).** If the fills are sorted by quantity, drop the map:

```cpp
int lo = 0, hi = (int)v.size() - 1;
while (lo < hi) {
    long s = v[lo] + v[hi];
    if (s == target) return std::pair{lo, hi};
    (s < target) ? ++lo : --hi;
}
```

Why sortedness enables it: when the sum is too small, *no* pair involving `v[lo]` can work (even the largest partner failed), so `lo` is safely discarded — and symmetrically for `hi`. Each step permanently eliminates one element: $O(n)$ time, $O(1)$ extra space.

**Grow/shrink window.** Longest run of consecutive orders whose total notional stays within a risk limit — the sliding window from *Sliding Windows & Streaming Statistics*, seen as two pointers:

```cpp
long sum = 0; int best = 0;
for (int l = 0, r = 0; r < (int)notional.size(); ++r) {
    sum += notional[r];                      // grow
    while (sum > risk_limit) sum -= notional[l++];  // shrink
    best = std::max(best, r - l + 1);
}
```

`r` advances $n$ times, `l` advances at most $n$ times total — amortized $O(n)$, even though there's a nested loop. (This shape needs nonnegative values; with mixed signs the window loses monotonicity and you need a different tool.)

**Merging two sorted feeds.** Interleave two exchanges' trade streams into one time-ordered tape — the merge step everyone writes at some point:

```cpp
while (a != a_end && b != b_end)
    out.push_back(b->ts < a->ts ? *b++ : *a++);   // < not <=: A wins ties → stable
out.insert(out.end(), a, a_end);
out.insert(out.end(), b, b_end);
```

$O(m + n)$; the tie-break direction decides which feed has priority on equal timestamps — say so out loud. (For more than a few feeds, this generalizes to the k-way merge with a heap from *Heaps, Priority Queues & Top-of-Book*.)

## Choosing between them

- **Unsorted data, one-shot query** → hash map: $O(n)$ time, $O(n)$ space, done.
- **Already sorted, or you can afford one sort** → two pointers: $O(n)$ after sorting, **no extra memory**, cache-friendly linear scans, no hashing tail risk.
- Sorting costs $O(n \log n)$, so for a single query on unsorted data the hash wins; if you'll query repeatedly or need order anyway, sort once and use pointers.

## The interview meta

Name the pattern out loud — "this is one-pass two-sum with a value-to-index map" — and state time and space complexity *before* writing code. It shows structured thinking and lets the interviewer redirect you cheaply if they wanted the other variant. Common bugs to preempt: off-by-one when shrinking the window (`while (sum > limit)` vs `>=` — match the spec's "within"), computing window length as `r - l` instead of `r - l + 1` for inclusive bounds, self-matching in two-sum (insert after lookup), and erasing from a container while range-iterating it — use the `erase(it++)` pattern or C++20 `std::erase_if(map, pred)` instead.

## Interview checkpoints

- Walk the one-pass two-sum with a hash map; explain why inserting after the lookup prevents self-matching.
- Prove the converging-pointers two-sum is correct: what does each pointer move safely eliminate, and why does it require sorted input?
- Explain why grow/shrink windows are $O(n)$ amortized despite the nested loop — and when the pattern breaks (negative values).
- State the hash vs two-pointers decision rule: unsorted one-shot → hash; sorted or can-sort → pointers with $O(1)$ extra space.
- Name two classic bugs: window-shrink off-by-one, and mutating an `unordered_map` while iterating it.
