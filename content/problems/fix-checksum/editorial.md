# Editorial

A byte-accounting exercise dressed as a protocol question — precisely what writing a FIX engine's ingest path feels like.

## Anchoring the fields

Work from **structure**, not from string search alone:

- `10=` is guaranteed to be the *final* field, so `rfind("|10=")` finds the delimiter before it unambiguously (searching forward could match a price like `44=10=` never occurs, but `55=X10` style false positives are the kind of thing rfind-from-the-end sidesteps).
- `9=` is always the second field, so `find("|9=")` after the first field is safe.
- BodyLength spans from the byte after `9=...|` through the delimiter before `10=` — inclusive of that last delimiter. Off-by-one on either end is the whole difficulty; write the boundary indices down before coding.

## The SOH subtlety

The checksum is defined over raw bytes, where the delimiter is SOH (0x01). Our `|` stand-in must therefore count as **1**, not ASCII 124 — the statement says so, and missing that line is the intended lesson: *protocol specs punish skimming*. Real FIX has the same trap in reverse — test data written with `|` gives wrong checksums if fed to a real engine verbatim.

## Why this matters beyond the puzzle

Sequence of checks in a real engine: length first (cheap, frames the message in the buffer), checksum second (validates integrity), then tag parsing. Getting framing right from a TCP byte stream — where messages arrive split across reads — is the natural interview follow-up: BodyLength is exactly what lets you know how many bytes to wait for.

## Complexity

$O(L)$ per message, one pass for the sum plus constant-time field location.
