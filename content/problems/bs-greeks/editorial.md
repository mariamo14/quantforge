# Editorial

The only new machinery is $\varphi$ — the density. Mixing up $\varphi$ and $N$ is the number-one bug in first Greek implementations, and it's why the statement shouts about it: delta uses the **CDF**, everything curvature- or vol-related uses the **density**.

## Reading each Greek like a trader

- **Delta** $= N(d_1)$: the hedge ratio, and (loosely) the moneyness probability adjusted for drift. The desk quotes positions in "delta dollars" $= \Delta \cdot S \cdot \text{contracts}$.
- **Gamma** $= \varphi(d_1)/(S\sigma\sqrt{T})$: how fast delta changes. The $\sqrt{T}$ in the denominator is why short-dated ATM options are gamma bombs — recall the options quiz.
- **Vega** $= S\varphi(d_1)\sqrt{T}$: same $\varphi(d_1)$ core as gamma — in fact $\text{vega} = \Gamma \cdot S^2 \sigma T$. Spotting that gamma and vega are joined at the hip (both are "convexity to something") is a strong interview aside.
- **Theta**: two terms with two meanings — the first is the gamma rent (what you pay to hold convexity), the second is interest on the strike. For a delta-hedged book, $\Theta + \tfrac12\sigma^2 S^2 \Gamma \approx rV$: theta and gamma are two sides of one trade. The *Delta-Hedge P&L* problem makes you watch this identity play out day by day.

## Verification tricks

Finite differences are the universal Greek check: bump $S$ by $\pm 0.01$, reprice, and $(C_+ - C_-)/0.02$ should match your delta to ~5 decimals (central difference, second-order accurate). Do the same in $\sigma$ for vega. Real pricing libraries run exactly these tests in CI — analytic vs bumped — and mentioning that is production-credibility in an interview.

## Complexity

$O(1)$ per query; the entire problem is care with formulas — which is the job, most days.
