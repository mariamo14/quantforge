---
title: The FIX Protocol
minutes: 10
---

# The FIX Protocol

FIX (Financial Information eXchange) is the lingua franca of electronic trading: brokers, buy-side firms, and most exchanges speak it for order entry. Interviewers ask about it because it tests whether you've actually worked near real trading flow — and because it's a great vehicle for protocol-design questions.

## Two layers in one protocol

FIX bundles a **session layer** and an **application layer** into one message stream:

- **Session layer**: logon/logout, heartbeats, sequence numbers, resend requests, session-level rejects. Its job is to guarantee that two parties agree on exactly which messages were exchanged, in what order, across disconnects.
- **Application layer**: the business messages — `NewOrderSingle`, `OrderCancelRequest`, `ExecutionReport`, market data requests.

This coupling is a known design wart: a session reset for administrative reasons forces both sides to reconcile application state. Newer protocols (FIXP, binary venue protocols) separate the layers.

## The wire format: tag=value with SOH

A FIX message is a sequence of `tag=value` pairs separated by the SOH character (ASCII 0x01, printed here as `|`). Tags are integers with defined meanings. A real `NewOrderSingle` — buy 500 AAPL, limit 187.25:

```
8=FIX.4.2|9=178|35=D|49=QFTRADER|56=BROKERX|34=215|52=20260703-13:30:05.123|
11=ORD20260703-001|21=1|55=AAPL|54=1|60=20260703-13:30:05.120|38=500|40=2|
44=187.25|59=0|10=127|
```

The tags you should be able to gloss cold:

| Tag | Name | Meaning here |
|---|---|---|
| 8 | BeginString | Protocol version, always first |
| 9 | BodyLength | Byte count from after tag 9 to before tag 10 |
| 35 | MsgType | `D` = NewOrderSingle, `8` = ExecutionReport, `0` = Heartbeat |
| 49 / 56 | Sender/TargetCompID | Session identities |
| 34 | MsgSeqNum | Session sequence number |
| 11 | ClOrdID | Your unique order ID — the key you track fills against |
| 55 | Symbol | `AAPL` |
| 54 | Side | `1` = Buy, `2` = Sell |
| 38 | OrderQty | 500 |
| 40 | OrdType | `1` = Market, `2` = Limit |
| 44 | Price | 187.25 (required since 40=2) |
| 10 | CheckSum | Always last |

## The checksum (a favorite whiteboard question)

Tag 10 is computed as: **sum of every byte in the message up to and including the SOH before `10=`, modulo 256, rendered as exactly three ASCII digits** (zero-padded, so 7 becomes `007`).

```cpp
uint8_t fix_checksum(const char* buf, size_t len_before_tag10) {
    unsigned sum = 0;
    for (size_t i = 0; i < len_before_tag10; ++i)
        sum += static_cast<uint8_t>(buf[i]);
    return static_cast<uint8_t>(sum % 256);   // format with %03u
}
```

It's a byte sum, not a CRC — it detects single-byte corruption but not transpositions. Interviewers sometimes ask exactly that: "what corruption does this miss?"

## Sequence numbers, heartbeats, and recovery

Each side maintains an outbound `MsgSeqNum` (tag 34), incrementing by one per message, and tracks the expected inbound number.

- **Heartbeats (35=0)** flow at the negotiated interval (tag 108, e.g., 30 s). If nothing arrives for the interval, you send a **TestRequest (35=1)**; no response means the session is dead.
- **Gap detection**: receive seq 47 when expecting 45, and you know 45–46 are missing. You send a **ResendRequest (35=2)** for the range; the counterparty retransmits (with `PossDupFlag 43=Y`) or sends a **SequenceReset-GapFill (35=4)** to skip admin messages that shouldn't be replayed.
- After a disconnect, both sides reconcile sequence numbers at logon — this is how FIX guarantees you never silently lose an order or a fill.

The design lesson interviewers fish for: FIX builds reliable, exactly-once application messaging **on top of** TCP, because TCP only guarantees the byte stream within one connection — it does nothing for you across a reconnect.

## ExecutionReport lifecycle

Every order-state change comes back as an **ExecutionReport (35=8)**, keyed by your `ClOrdID` (11), carrying `OrdStatus` (39), cumulative quantity `CumQty` (14), `LeavesQty` (151), and `AvgPx` (6). The canonical happy path for our 500-share order:

1. `39=0` **New** — accepted by the venue, resting.
2. `39=1` **PartiallyFilled** — e.g., 200 shares execute: `LastQty 32=200`, `CumQty 14=200`, `LeavesQty 151=300`.
3. `39=1` again — another 100: `14=300`, `151=200`.
4. `39=2` **Filled** — final 200: `14=500`, `151=0`.

Other exits: `4` Canceled, `8` Rejected, `C` Expired. Your OMS must treat these as a state machine and handle out-of-order and duplicate (`43=Y`) reports idempotently — `CumQty` is authoritative, not the sum of `LastQty`s you happened to receive.

## Why HFT venues use binary protocols

Parsing `44=187.25|` means scanning for SOH, splitting on `=`, converting ASCII integers and decimal strings — branches, per-field variable lengths, no fixed offsets. That's hundreds of nanoseconds to microseconds per message, cache-unfriendly, and the message is bloated on the wire (more serialization time, see the networking lesson).

Binary protocols fix this with **fixed-layout structs**: NASDAQ **ITCH** (market data out) and **OUCH** (orders in) messages are fixed-offset binary — decoding is `reinterpret_cast` plus an endian swap. CME uses **SBE** (Simple Binary Encoding): schema-defined fixed offsets, little-endian native ints, designed so a decoder touches each byte once with zero allocation. Result: decode in tens of nanoseconds, messages 3–5× smaller.

**Where FIX still rules**: broker-to-client connectivity, buy-side order routing, less latency-sensitive asset classes (FX, fixed income), drop-copy feeds, and post-trade. It's human-readable in logs, universally supported, and endlessly extensible with custom tags — the right trade-off everywhere that microseconds don't pay.

## Interview checkpoints

- FIX = session layer (seq numbers, heartbeats, resend) + application layer (orders, executions) over TCP; know why the coupling is considered a design flaw.
- Recite a NewOrderSingle: 8, 9, 35=D, 49/56, 34, 11, 55, 54, 38, 40, 44, 10 — and that 8/9 lead and 10 trails.
- Checksum: sum of all bytes before tag 10, mod 256, three zero-padded digits; it misses transpositions.
- Gap handling: expected-vs-received seq number, ResendRequest, PossDupFlag, SequenceReset-GapFill; reconciliation at logon survives disconnects.
- ExecutionReport is a state machine on OrdStatus (New → PartiallyFilled → Filled); trust CumQty/LeavesQty, handle duplicates idempotently.
- Binary protocols (ITCH/OUCH, SBE) win via fixed offsets, no ASCII parsing, smaller wire size; FIX survives where compatibility beats nanoseconds.
