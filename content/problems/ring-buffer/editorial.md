# Editorial

A ring buffer is three integers and an array — the exercise is getting the index discipline exactly right.

## The invariants

Keep `head` (next to pop), `tail` (next to push), and `count`. Then:

- **full** ⇔ `count == capacity`; **empty** ⇔ `count == 0`
- push: write `buffer[tail]`, advance `tail = (tail + 1) % capacity`, `count++`
- pop: read `buffer[head]`, advance the same way, `count--`

Tracking `count` explicitly sidesteps the classic ambiguity where `head == tail` means *either* empty or full. The lock-free alternative — monotonically increasing head/tail sequence numbers, where `size = tail - head` — is what real SPSC queues use, because each index is written by only one thread.

## Production notes

- Real implementations use a **power-of-two capacity** so the modulo becomes a bit-mask (`idx & (cap - 1)`); integer division is slow on the hot path.
- In a true SPSC queue the producer writes the payload, then publishes `tail` with a **release** store; the consumer loads it with **acquire**. That pairing is a standard interview question — see the memory-model lesson.
- The `DROP` policy (drop newest) is one of several: dropping oldest, blocking, or overwriting are all used depending on whether stale market data is worse than missing data.

## Complexity

$O(1)$ per operation, zero allocation after startup. Buffered output (`std::to_string` into one string) avoids `endl` flushes — worth mentioning aloud in an interview.
