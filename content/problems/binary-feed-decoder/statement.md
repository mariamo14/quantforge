Exchanges don't send text — they send **fixed-layout binary**. Decode a stream of messages from the (fictional) QFP market-data protocol, delivered here as hex strings, and flag sequence gaps like a real feed handler.

## The QFP protocol

Every message begins with a 1-byte type, then a big-endian `u32` sequence number. All integers are **big-endian** (network byte order).

| Type byte | Message | Layout after the seq field |
|---|---|---|
| `0x41` (`A`) | ADD | `u64` orderId, `u8` side (`B`/`S`), 6 bytes symbol (ASCII, space-padded right), `u32` price (ticks of $0.01), `u32` qty |
| `0x45` (`E`) | EXEC | `u64` orderId, `u32` executed qty |
| `0x58` (`X`) | CANCEL | `u64` orderId |

## Gap detection

The first message's sequence number is the session start. Every subsequent message must have `seq = prev + 1`. If not, print `GAP expected got` (the expected and received sequence numbers) on its own line **before** that message's decoded line, then continue with the received number as the new position.

## Input

The first line contains $M$ ($1 \le M \le 10^5$). Each of the next $M$ lines is one message as a lowercase hex string (2 hex chars per byte, no separators).

## Output

Per message, one decoded line (after any GAP line):

- ADD: `ADD seq orderId side symbol price qty` — symbol with padding spaces stripped, price as dollars with exactly 2 decimals (e.g. `18950` ticks → `189.50`)
- EXEC: `EXEC seq orderId qty`
- CANCEL: `CANCEL seq orderId`

## Notes

Parse bytes at fixed offsets — no scanning, no splitting. This is deliberately the shape of an ITCH-style decoder: in the real thing you'd cast a struct view over the buffer; here you assemble integers from hex pairs.
