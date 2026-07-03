A strategy only cares about the **best bid and best ask** — but the feed delivers adds *and cancels*, and `std::priority_queue` has no erase. The standard fix is **lazy deletion**: record cancellations in a side structure and discard stale heap tops on access.

## Input

The first line contains $M$ — the number of events ($1 \le M \le 2 \cdot 10^5$). Each of the next $M$ lines is one of:

- `A id side price` — add a one-share quote with unique integer `id`, side `B` or `S`, integer `price` ($1 \le \text{price} \le 10^9$)
- `C id` — cancel quote `id` (guaranteed active)
- `Q` — report the top of book

## Output

For each `Q`, print `bestBid bestAsk` — the highest active bid and lowest active ask — using `-` for a side with no active quotes.

## Constraints

Target amortized $O(\log M)$ per event. Using `std::map`/`std::multiset` is accepted here, but the *intended* solution pairs two `std::priority_queue`s with a cancelled-id set — write that version: it is the pattern interviewers ask you to explain, and it generalizes to timer wheels and k-way merges where tree maps don't.
