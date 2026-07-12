# Editorial

Two operations per update — one addition, one conditional subtraction — regardless of window size. That constant-time slide is the entire sliding-window family in miniature.

## The one boundary that matters

The window isn't full until step $K$; before that, nothing falls out. The clean formulation: always add $v_i$; subtract $v_{i-K}$ only when $i \ge K$ (0-indexed). Off-by-one here — subtracting a step early or late — is *the* bug of this pattern, and it's worth tracing by hand once with $K = 2$ and four values until the indexing feels inevitable.

## Where this pattern goes from here

Everything downstream is this loop with a richer payload:

- **Rolling VWAP** keeps *two* running sums (price×volume and volume) and divides.
- **Rolling mean/variance** keeps sums of $v$ and $v^2$ — until numerical stability forces Welford's smarter update.
- **Rolling max** can't be maintained by add/subtract at all (a max that leaves isn't recoverable from the sum) — which is exactly why the monotonic deque exists.

Recognizing *which* statistics slide cheaply (anything that's a sum) versus which need real machinery (order statistics) is a genuine interview discussion, and it starts with this problem.

## Complexity

$O(1)$ per update, $O(N)$ total; memory $O(N)$ as written (storing arrivals), reducible to $O(K)$ with a ring buffer — the structure you built in the C++ track.
