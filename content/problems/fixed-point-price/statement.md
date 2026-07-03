Your risk system receives a stream of executed trades and must report the **total notional** — the sum of `price × quantity` over all trades — *exactly*.

Prices arrive as decimal strings with up to **4 decimal places**. Floating-point arithmetic is not acceptable in a risk system: with large books, `double` loses dollars. Parse prices into an integer number of *ticks* (1 tick = 0.0001) and do exact integer arithmetic.

## Input

The first line contains an integer $N$ — the number of trades ($1 \le N \le 5000$).

Each of the next $N$ lines contains a trade: a price and a quantity separated by a space.

- Price: a decimal string, e.g. `19345.5`, `0.0007`, `99999.9999`, with $0 < \text{price} < 100000$ and at most 4 digits after the optional decimal point.
- Quantity: an integer $1 \le q \le 10000$.

## Output

A single line: the total notional, printed with **exactly 4 decimal places** (no thousands separators).

## Notes

The total fits in a signed 64-bit integer count of ticks. A naive `double` accumulation produces the wrong answer on the hidden tests — that is the point of the exercise.
