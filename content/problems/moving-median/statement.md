The median is the robust cousin of the mean — one fat-fingered print can't drag it — which is why **rolling medians** filter outliers in real market-data pipelines. It is also the classic escalation of the sliding-window family: max was a deque, mean was two sums, the median makes you work.

## Task

Given $N$ prices and an **odd** window size $K$, print the median of the last $\min(i, K)$ prices after each price $i$ **once the window is full** (i.e. for $i = K, K+1, \dots, N$).

Because $K$ is odd and prices are integers, every median is an element of the window — an exact integer. Print it as such.

## Input

- Line 1: $N$ $K$ ($1 \le K \le N \le 2 \cdot 10^5$, $K$ odd, $K \le 10^4$)
- Line 2: $N$ prices in integer cents ($1 \le p_i \le 10^9$)

## Output

$N - K + 1$ lines: the rolling median after each full window.

## Constraints

$O(N \log K)$ required — an $O(NK)$ re-sort of every window will exceed the time limit. The two standard structures both pass:

- **Two multisets** (or heaps with lazy deletion): a low half and a high half, rebalanced so the low half holds exactly one extra element — its maximum is the median.
- **One `std::multiset`** with a maintained iterator to the median, stepped left/right on insert/erase depending on which side changes.

The two-heaps version generalizes to streaming percentiles and is the one interviewers usually want.
