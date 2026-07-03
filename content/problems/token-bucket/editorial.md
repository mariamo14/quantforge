# Editorial

Three integers of state — `capacity`, `millitokens`, `prev` — implement a policy that risk desks trust with real money. The elegance of the token bucket is that **burst tolerance and sustained rate are independent knobs**: $C$ says "how many at once," $R$ says "how many per second forever."

## Why lazy refill

Nothing ticks in the background: the bucket refills *only when an event arrives*, by crediting the elapsed time since the last event. This is the standard implementation everywhere (Linux traffic control, API gateways, order throttles) because it's O(1) per event and needs no timers. The subtle points:

- **Cap before consume.** Refill is bounded by the bucket size — idle hours don't bank unlimited burst. Cap first, then try to spend.
- **Equal timestamps refill nothing.** Two orders in the same millisecond share whatever was there — which is precisely the burst behavior the bucket exists to control.
- **Integer millitokens** make the arithmetic exact. Floating-point token counts drift after millions of events, and a risk check that drifts is a risk. (Overflow check: $10^{12}$ ms × $10^6$ tokens/s = $10^{18}$ millitokens — inside int64's $9.2 \times 10^{18}$, but only just. Constraints like these are why you always do this multiplication in your head before coding.)

## The design conversation this problem feeds

In the order-gateway case study, the throttle sits on the **hot path** — so it must be in-process (no network call to a "rate limit service"), lock-free for readers, and O(1). The token bucket is all three. Variants worth knowing when interviewers push:

- **Leaky bucket**: constant outflow, smooths rather than bursts — used for pacing, not gating.
- **Sliding-window counters**: exact "N per rolling minute" semantics, more state.
- **Hierarchical buckets**: per-strategy, per-symbol, per-firm — real risk systems layer them, and an order must pass *all* of them.

And the classic follow-up — "what should REJECT do?" — has a trading-specific answer: alert loudly. A strategy hitting its throttle is either buggy or seeing something weird; both need humans.

## Complexity

O(1) per event, O(1) memory.
