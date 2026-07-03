# Editorial

The entire problem is a lesson in one sentence: **money is integers**.

## Why doubles fail

A `double` has a 53-bit mantissa — exact integers only up to $2^{53} \approx 9 \times 10^{15}$. Total notional here can reach $10^{18}$ ticks, so accumulation loses low-order digits, and `0.0001` itself has no exact binary representation: every trade contributes a tiny rounding error, and errors compound over thousands of trades. Real trading systems store prices as integer ticks (or use decimal types) for exactly this reason.

## The exact approach

1. **Parse to ticks.** Split the price string on `.`, right-pad the fractional part to 4 digits, and read the concatenated digits as an integer. `19345.5` → `193455000` ticks.
2. **Accumulate `ticks × qty` in `int64_t`.** The constraints guarantee the total fits ($< 9.2 \times 10^{18}$).
3. **Format on output.** `total / 10000` dollars, then the remainder zero-padded to 4 digits.

No floating point ever touches the data. Parsing digits manually also avoids locale surprises and is faster than `std::stod` — a habit worth having in feed handlers.

## Interview notes

- "How would you store prices in an order book?" — integer ticks, with the tick size a property of the instrument.
- Know the $2^{53}$ boundary cold; it is the standard probe for float-awareness.
- The same technique (scaled integers) applies to quantities with fractional lots and to P&L aggregation.
