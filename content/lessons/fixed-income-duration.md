---
title: "Fixed Income: Bonds, Duration, Convexity"
minutes: 14
---

Fixed income is where "time value of money" stops being a slogan and becomes an API. Bonds are the simplest derivatives of interest rates, and duration/convexity are their delta and gamma — the same first- and second-order risk language you saw with options. Interviewers use this material to check that you can move fluently between cash flows, prices, and sensitivities.

## Present value and discounting

A dollar tomorrow is worth less than a dollar today — you could invest today's dollar and have more tomorrow. Discounting makes that precise: a cash flow $C$ arriving at time $t$ is worth $C \cdot d(t)$ today, where $d(t)$ is the **discount factor**. With an annually compounded rate $y$, $d(t) = (1+y)^{-t}$; with continuous compounding, $d(t) = e^{-yt}$. Everything in fixed income is "project the cash flows, discount them, sum."

## Bond pricing and yield to maturity

A bond paying coupon $C$ per period and face value $F$ at maturity $T$ (periods) is priced

$$P = \sum_{t=1}^{T} \frac{C}{(1+y)^t} + \frac{F}{(1+y)^T}.$$

The **yield to maturity (YTM)** $y$ is the single rate that makes this equation hold given the market price — an internal rate of return, found numerically (Newton or bisection; a standard coding screen). Two immediate consequences:

- **Price and yield move inversely.** $P(y)$ is a sum of positive terms each decreasing in $y$, so $\partial P/\partial y < 0$. Intuition: fixed cash flows are worth less when the competing reinvestment rate rises.
- A bond trades at **par** ($P = F$) exactly when coupon rate = yield; above par when coupon > yield ("premium"), below when coupon < yield ("discount").

$P(y)$ is also **convex** — it curves upward. Hold that thought.

## Duration: the first-order sensitivity

How much does price move when yield moves? **Macaulay duration** is the present-value-weighted average time to receive cash flows:

$$D_{\text{Mac}} = \frac{1}{P}\sum_{t} t \cdot \frac{CF_t}{(1+y)^t}.$$

It answers "when, on average, do I get my money?" — measured in years. A zero-coupon bond's Macaulay duration is exactly its maturity; coupons pull duration below maturity.

**Modified duration** converts that into a price sensitivity:

$$D_{\text{mod}} = \frac{D_{\text{Mac}}}{1+y} = -\frac{1}{P}\frac{\partial P}{\partial y},$$

giving the workhorse first-order approximation

$$\Delta P \approx -D_{\text{mod}}\,P\,\Delta y.$$

A bond with modified duration 7 loses about 7% of value per 100bp rise in yield. Duration is the bond's **delta with respect to rates**. Portfolio duration is just the value-weighted average of component durations — which is why desks can "duration-match" or immunize a portfolio against small parallel rate moves.

**DV01** (dollar value of a basis point) is the same sensitivity in cash terms:

$$\text{DV01} = D_{\text{mod}} \cdot P \cdot 0.0001,$$

the dollars gained/lost per 1bp move. Traders hedge in DV01 because dollars, not percentages, hit the P&L: to hedge, match DV01s across instruments.

## Convexity: the second order

Duration is a tangent-line approximation; the price-yield curve bends. **Convexity** captures the curvature:

$$C_x = \frac{1}{P}\frac{\partial^2 P}{\partial y^2}, \qquad \frac{\Delta P}{P} \approx -D_{\text{mod}}\,\Delta y + \tfrac{1}{2}C_x\,(\Delta y)^2.$$

Since $C_x > 0$ for vanilla bonds, convexity is **good for the holder**: the bond falls less than duration predicts when yields rise, and gains more when yields fall. Exactly analogous to option gamma — and like gamma, you pay for it (higher-convexity bonds yield slightly less, other things equal). Longer maturity and lower coupons mean more convexity. (Callable bonds and mortgages can have *negative* convexity — a favorite follow-up.)

## Worked example

10-year bond, face $F = 100$, annual coupon 5% ($C=5$), yield $y = 5\%$: it prices at par, $P = 100$.

- **Macaulay duration:** $D_{\text{Mac}} = \frac{1}{100}\sum_{t=1}^{10} t \cdot \frac{CF_t}{1.05^t} \approx 8.11$ years (coupons pull it well below 10).
- **Modified duration:** $D_{\text{mod}} = 8.11 / 1.05 \approx 7.72$.
- **DV01:** $7.72 \times 100 \times 0.0001 \approx \$0.077$ per bp per 100 face.
- **Yield rises 100bp to 6%:** duration predicts $\Delta P \approx -7.72 \times 100 \times 0.01 = -7.72$, i.e. $P \approx 92.28$. Exact repricing gives $P = 92.64$. The ~0.36 gap is convexity working in your favor: with $C_x \approx 75$, the correction $\tfrac{1}{2} \times 75 \times (0.01)^2 \times 100 \approx +0.37$ nails it.

Being able to run this loop — price, differentiate, approximate, compare to exact — is precisely what a fixed-income quant dev does in code.

## Term structure basics

There is no single "interest rate": the **yield curve** maps maturity $t$ to the spot rate $y(t)$, i.e. the yield on a zero-coupon bond maturing at $t$. Coupon bonds should really be discounted cash flow by cash flow off this curve; YTM is a convenient one-number summary, not a fundamental object. Shapes: **upward-sloping** (normal — compensation for duration risk), **flat**, **inverted** (short rates above long — the classic recession signal). From spot rates you can extract **forward rates**, the market-implied future short rates: $(1+y_2)^2 = (1+y_1)(1+f_{1,2})$. Curve construction (bootstrapping discount factors from liquid instruments, then interpolating) is a bread-and-butter quant dev task.

## Interview checkpoints

- Why do price and yield move inversely? Be able to argue it from discounting, not just assert it.
- Macaulay vs modified duration: PV-weighted average time vs actual sensitivity; related by $1/(1+y)$; zero-coupon duration = maturity.
- Use $\Delta P \approx -D_{\text{mod}} P \Delta y$ fast: duration 7, +50bp → price drops ~3.5%.
- DV01 = $D_{\text{mod}} \cdot P \cdot 0.0001$; hedging means matching DV01s, because P&L is in dollars.
- Convexity is the bond's gamma: helps the holder in both directions; know that callables/MBS can be negatively convex.
- YTM is an IRR solved numerically; the real object is the discount curve, bootstrapped from market instruments.
