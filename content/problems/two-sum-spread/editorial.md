# Editorial

The one-pass hash map: before recording $a_j$, ask whether its **complement** $T - a_j$ has been seen. The first hit is automatically the pair with the smallest $j$ — you're scanning $j$ in order — and mapping each value to its *earliest* index (via `emplace`, which never overwrites) makes $i$ minimal among those. The tie-breaking in the statement isn't an extra burden; it is precisely what the natural solution produces. Recognizing that alignment — instead of bolting on comparison logic — is what separates a clean solve from a fussy one.

## Details that get probed

- **`emplace` vs `operator[]`:** `operator[]=j` would overwrite an earlier index with a later one and break the earliest-$i$ rule for duplicate values. One character of difference, one hidden test.
- **Self-pairing:** checking the complement *before* inserting the current value means $a_j$ can never match itself — handles $T = 2a_j$ correctly without a special case (a duplicate elsewhere still matches, as it should).
- **Ranges:** $a_i + a_j$ reaches $2 \times 10^9$ — overflows `int32`, fine in `int64_t`. Saying "I'll use 64-bit because the sum exceeds int range" out loud is a free point.

## The family tree

- **Sorted input?** Two converging pointers, $O(N)$ time and $O(1)$ memory — but sorting destroys the original indices, so this variant (report indices, earliest completion) genuinely wants the hash.
- **Three-sum:** sort + fix one element + two pointers, $O(N^2)$ — the standard escalation.
- **Closest pair to $T$**, **count pairs**, **pairs within a window** — each is a small twist on the same skeleton, and interviewers chain them.

## Complexity

$O(N)$ expected, $O(N)$ memory. The `reserve` avoids rehash stalls — a small habit that reads as production experience.
