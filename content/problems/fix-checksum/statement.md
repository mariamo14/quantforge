Every FIX engine validates two things on ingest: **BodyLength (tag 9)** and **CheckSum (tag 10)**. Implement that validation.

In real FIX, fields are delimited by the SOH byte (0x01); here it is replaced by `|` for readability.

## The rules

For a message like:

```
8=FIX.4.2|9=65|35=D|49=QF|56=EXCH|55=AAPL|54=1|38=100|44=189.5|10=208|
```

- **BodyLength (9)** counts the bytes *after* the `9=...|` field's trailing delimiter, up to and including the delimiter *before* the `10=` tag. (In our representation each `|` counts as 1 byte, exactly like SOH.)
- **CheckSum (10)** is the sum of all bytes from the start of the message up to and including the delimiter before `10=`, modulo 256, printed as exactly 3 digits (zero-padded). Each `|` counts as SOH = 1 byte... **not** its ASCII value. All other characters count as their ASCII value.

## Input

The first line contains $M$ ($1 \le M \le 1000$). Each of the next $M$ lines is one FIX message (as above, `|`-delimited, always ending with a `10=XXX|` field; no spaces inside messages, length ≤ 2000).

## Output

For each message print one line:

- `OK` if both the body length and checksum fields match the computed values
- `BADLEN computedLen` if the body length is wrong (report the correct value)
- `BADSUM computedSum` if the length is right but the checksum is wrong (report the correct value as 3 digits, zero-padded)
