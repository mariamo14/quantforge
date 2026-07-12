Maintain the running **mean and sample standard deviation** of a price stream — with arithmetic that survives real market data. This is Welford's algorithm from the *Sliding Windows* and *Floating Point for Quants* lessons, and the hidden tests are built to destroy the naive formula.

## Welford's update (use this)

For each new value $x_n$ ($n = 1, 2, \dots$):

$$\delta = x_n - m_{n-1}, \qquad m_n = m_{n-1} + \frac{\delta}{n}, \qquad M_n = M_{n-1} + \delta\,(x_n - m_n)$$

with $m_0 = M_0 = 0$. Then mean $= m_n$ and sample variance $= M_n/(n-1)$ for $n \ge 2$.

The textbook one-pass alternative — accumulate $\sum x$ and $\sum x^2$, then $\frac{1}{n-1}\big(\sum x^2 - n\bar{x}^2\big)$ — subtracts two enormous, nearly equal numbers when prices are large and moves are small. It prints garbage on the hidden tests. That is the lesson.

## Input

- Line 1: $N$ ($2 \le N \le 10^6$)
- Line 2: $N$ prices as decimals (values up to $10^8$, with variation possibly tiny relative to the level)

## Output

After **every** price from the 2nd onward, print one line: `mean std`, both rounded to 6 decimal places (sample std, i.e. divide $M_n$ by $n-1$).

## Constraints

One pass, $O(1)$ state. Two-pass solutions also fail — the stream is too long to store under the memory conditions implied (and defeats the point: live systems never see data twice).
