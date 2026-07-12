Turn the *Limit Order Book Dynamics* lesson into your first **signal pipeline**: from a stream of top-of-book updates, compute the two most-used microstructure quantities.

For best bid $(P_b, V_b)$ and best ask $(P_a, V_a)$:

$$\text{imbalance} = \frac{V_b - V_a}{V_b + V_a} \qquad\qquad \text{microprice} = \frac{V_a P_b + V_b P_a}{V_a + V_b}$$

Note the deliberate cross-weighting in the microprice: the side with **more** resting size pulls the fair price *away* from itself (a heavy bid queue means the ask is the price about to give way).

Additionally, count **signal events**: updates where the imbalance crosses from below $+\theta$ to $\ge +\theta$ (a buy signal firing), where $\theta$ is a given threshold.

## Input

- Line 1: $N$ $\theta$ ($1 \le N \le 5 \cdot 10^5$; $\theta$ a decimal in $[0.1, 0.9]$)
- Next $N$ lines: `Pb Vb Pa Va` — integer price in cents and integer size for each side ($1 \le V \le 10^6$, $1 \le P_b < P_a \le 10^7$)

## Output

- For each update, one line: `imbalance microprice`, both computed **exactly as written above in doubles** and printed to 6 decimal places.
- Final line: `SIGNALS k` — the number of upward $\theta$-crossings (the imbalance of update 1 counts as a crossing if it is already $\ge \theta$).
