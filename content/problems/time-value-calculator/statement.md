Your first pricing engine — three lines of math that every valuation on Earth is built on.

From the *Time Value of Money* lesson: money grows forward by compounding and shrinks backward by discounting. With annual rate $r$ and $n$ years, annual compounding:

$$FV = PV \cdot (1 + r)^n \qquad\qquad PV = \frac{FV}{(1 + r)^n}$$

## Input

The first line contains $Q$ — the number of queries ($1 \le Q \le 1000$).

Each of the next $Q$ lines is one of:

- `FV pv r n` — grow `pv` dollars forward $n$ years (e.g. `FV 100 0.05 3` = "what is \$100 worth in 3 years at 5%?")
- `PV fv r n` — discount `fv` dollars back $n$ years

with $0 < \text{amount} \le 10^7$ (a decimal), $0 \le r \le 0.5$, $0 \le n \le 50$ (integer).

## Output

For each query: the resulting dollar amount rounded to 2 decimal places.

## Check yourself

`FV 100 0.10 2` should print `121.00` — \$100 grows to \$110 in year one, and year two's interest is earned on \$110, not \$100. That is compounding: interest on interest. If you got 120.00, you added instead of multiplying.
