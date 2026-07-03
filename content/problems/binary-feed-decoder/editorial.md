# Editorial

Fixed offsets, big-endian integers, no delimiters — this is what "parsing" means at the bottom of the trading stack, and why binary protocols decode an order of magnitude faster than FIX: every field's location is known *before* you look at the bytes.

## The mechanics

Two tiny helpers do all the work: `byteAt` (two hex nibbles → a byte) and big-endian accumulation `value = value << 8 | byte`. Big-endian is network byte order — the most significant byte arrives first, so left-shift-and-or in arrival order is the whole conversion. In production you'd `memcpy` into a `uint32_t` and `ntohl` it (or use `std::byteswap` on a little-endian host); the hex representation here just makes the exercise self-contained.

Things that bite:

- **Symbol padding:** fixed 6-byte fields are space-padded; strip on decode, or `AAPL  ` and `AAPL` become different symbols downstream.
- **Price as integer ticks** — decode to formatted dollars only at the display edge; internally, ticks stay integers (see *Fixed-Point Notional*).
- **`u64` order ids** don't fit in 32 bits on real feeds; truncating ids is a classic silent-corruption bug.

## Gap detection is the actual feed-handler lesson

Sequence numbers are the *only* integrity mechanism a UDP feed gives you. The discipline: remember the expected next sequence, flag anything else, then **resynchronize to what you received** and keep decoding — a real handler would simultaneously request a retransmission or snapshot, but it never stops consuming the live stream (see the *Design a Feed Handler* lesson for the full recovery dance). Note the direction of the protocol here: gaps are *detected and reported*, not silently healed — downstream consumers must know their book state is suspect.

## Interview relevance

"Write an ITCH decoder" and "how do you handle a gap on the A feed" are bread-and-butter systems questions at HFT firms. The strong-candidate extras: struct-view zero-copy decoding (`reinterpret_cast` + `static_assert` on layout, or `std::bit_cast`), branch-on-type via a jump table for a dozen message types, and decode latency measured in single-digit nanoseconds per message.
