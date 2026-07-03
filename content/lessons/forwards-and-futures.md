---
title: Forwards & Futures
minutes: 12
---

**Builds on:** time value of money, expected value.

## A deal made today, settled later

A **forward contract** is the simplest derivative there is: two parties agree *today* on a price for a trade that will happen *later*. No money changes hands now. On the agreed date, one side delivers the asset, the other side pays the pre-agreed price. That's it.

The classic story: a farmer will harvest wheat in six months, and a baker will need wheat in six months. The farmer worries the price will fall by harvest time; the baker worries it will rise. So they shake hands today: in six months, the farmer delivers 1,000 bushels and the baker pays \$5 per bushel — no matter what the market price turns out to be.

Notice what just happened. Neither of them predicted the price. Both of them *removed uncertainty*. The farmer locked in revenue; the baker locked in cost. Derivatives were born as risk-transfer tools, not as bets.

## The payoff at expiry

Some vocabulary:

- $S_T$ — the **spot price** of the asset at time $T$ (the market price on the delivery date).
- $K$ — the **delivery price** agreed in the contract.
- **Long** the forward = you agreed to *buy* at $K$. **Short** = you agreed to *sell* at $K$.

At expiry, the long side's payoff is

$$\text{payoff}_{\text{long}} = S_T - K$$

Why? You are forced to pay $K$ for something worth $S_T$. If $S_T > K$, you bought below market — you gain the difference. If $S_T < K$, you overpaid — you lose.

**Worked both ways.** Say $K = 100$.

- Wheat-style win: $S_T = 112$. Long payoff $= 112 - 100 = +12$. You pay 100, immediately could sell at 112.
- Other direction: $S_T = 91$. Long payoff $= 91 - 100 = -9$. You must still pay 100 for something worth 91.

The short side is the mirror image: payoff $= K - S_T$ (so $-12$ and $+9$ in the examples above). Forwards are a **zero-sum** contract at expiry — every dollar the long makes, the short loses.

## The beautiful result: no forecasting required

Here is the question that launches all of quantitative pricing: what is the *fair* delivery price $F$ to write into the contract today?

Your instinct might be "whatever we expect the price to be" — the expected value of $S_T$. Surprisingly, that is wrong, and the correct answer needs **no prediction at all**.

The trick is called **cash-and-carry replication**. Instead of waiting and buying the asset at expiry, I can manufacture the same outcome today:

1. Borrow $S_0$ dollars (the asset's price today) at the risk-free rate $r$.
2. Buy the asset now and hold ("carry") it.
3. At time $T$, deliver the asset and repay the loan: $S_0(1+r)^T$.

I am now guaranteed to deliver the asset at $T$ at a total, known cost of $S_0(1+r)^T$ — this is just time value of money: the future value of the cash I spent today. So the fair forward price must be

$$F = S_0(1+r)^T$$

**Full numeric example.** A stock trades at $S_0 = 100$, the risk-free rate is $r = 5\%$, and the forward expires in $T = 1$ year.

$$F = 100 \times (1.05)^1 = 105$$

Now watch what happens if someone quotes anything else.

**Quoted at 110 (too high):** I *sell* the forward at 110, borrow 100, buy the stock. At expiry I deliver the stock, collect 110, repay $100 \times 1.05 = 105$. Profit: $110 - 105 = \$5$, **guaranteed**, in every possible future, with zero starting capital.

**Quoted at 100 (too low):** reverse everything. I *buy* the forward at 100, sell the stock short today for 100, and invest the proceeds at 5%. At expiry my cash has grown to 105; I pay 100 on the forward, take delivery of the stock, and return it to close my short. Profit: $105 - 100 = \$5$, again riskless.

A riskless profit from zero capital is called an **arbitrage**. The **no-arbitrage principle** says: in a functioning market, such free money cannot persist — traders will pile in until prices snap back. This is *the* pricing principle of quantitative finance. We didn't ask where the stock is going, what its expected return is, or how volatile it is. Replication plus no-arbitrage pinned the price down completely.

(Fine print: this assumes you can borrow and short at rate $r$ and the asset pays no income while you hold it. Dividends or storage costs adjust the formula, but the logic is identical.)

## Futures: forwards with the rough edges filed off

A **futures contract** is economically the same promise, but standardized and traded on an exchange. Contract size, quality, and delivery dates are fixed by the exchange; a clearinghouse stands between buyer and seller so you don't have to trust a stranger; and — the one real mechanical difference — futures are **marked to market daily**: your gain or loss is settled in cash every single day rather than in one lump at expiry. Daily settlement plus margin deposits is what kills counterparty risk, and it means futures and forward prices can differ slightly when interest rates are random (the daily cash flows earn or cost interest). For a first pass, treat $F = S_0(1+r)^T$ as the price of both.

## Why this lesson matters

Half of quant pricing is exactly the move you just saw: **find the replicating portfolio**. If you can build a payoff out of things with known prices, no-arbitrage tells you the payoff's price — no forecast, no model of the future needed. Options will need one extra ingredient, but the game is the same.

## Interview checkpoints

- Long forward payoff is $S_T - K$; short is $K - S_T$; zero-sum at expiry.
- Fair forward price: $F = S_0(1+r)^T$ — derived from cash-and-carry, not from any forecast of $S_T$.
- If the quote is above $F$: sell the forward, borrow, buy the asset, lock in the difference. Below $F$: reverse.
- Arbitrage = riskless profit from zero net investment; no-arbitrage is the core pricing principle.
- Futures = standardized exchange-traded forwards with daily mark-to-market and a clearinghouse.
