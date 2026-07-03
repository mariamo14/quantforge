---
title: What Is a Market?
minutes: 10
---

## Start at the farmers' market

Picture a Saturday farmers' market. A farmer shows up with crates of apples. Shoppers show up with money. The farmer wants the highest price she can get; the shoppers want the lowest price they can pay. After a bit of haggling, apples change hands at some price — say $2 a pound.

That price wasn't set by a committee. It emerged from the meeting of people who want to sell and people who want to buy. If a frost wiped out half the apple crop, apples would be scarce, shoppers would compete for them, and the price would rise. If every farmer had a bumper harvest, the price would fall.

A financial market is exactly this — except instead of apples, people trade **claims**: pieces of paper (now just database entries) that entitle you to something in the future.

## What gets traded

Two claims cover most of finance:

- A **share** (or "stock") is a slice of ownership in a company. If a company is cut into 1,000,000 shares and you own 10,000 of them, you own 1% of the company — 1% of its profits belong to you.
- A **bond** is an IOU. You lend money to a company or a government today, and they promise to pay you back later, plus interest (a fee for the loan).

When you "buy Apple stock," you're buying a tiny slice of Apple from someone who currently owns it and wants to sell.

## Why prices exist — and why they move

Just like apples, a share's price is simply the level where a willing buyer and a willing seller agree. Nothing more mysterious than that.

So why do prices move all day long? Two reasons:

1. **New information.** Suppose a company announces its profits doubled. Owning a slice of it just became more attractive, so buyers will pay more and sellers demand more. The price jumps.
2. **Changed willingness to trade.** A pension fund might need cash and sell a large holding — not because anything happened to the company, but because *it* needs money. That selling pressure alone can push the price down.

A price is a living summary of everything everyone knows and wants, updated every second.

## The exchange: the meeting place

At the farmers' market, everyone gathers in one square. In finance, the meeting place is an **exchange** — the New York Stock Exchange, Nasdaq, and others. Historically these were literal buildings full of shouting people. Today they are data centers: enormous, extremely fast computer systems that collect everyone's buy and sell requests and match them.

## Who shows up

- **Individuals** — people buying a few shares for retirement savings.
- **Funds** — professionals pooling many people's money (pension funds, mutual funds, hedge funds) and trading in large size.
- **Market makers** — firms that are *always ready to buy or sell*, earning the small gap between the two prices they quote. They're like the used-car dealer of markets: you can always sell to them or buy from them instantly, and their profit is the difference between what they pay and what they charge.

## The bid and the ask

At any moment, a stock doesn't have one price — it has two:

- The **bid**: the highest price anyone is currently willing to *pay*.
- The **ask**: the lowest price anyone is currently willing to *sell for*.

Worked example. Suppose for one stock, right now:

- Best bid: $99.98 (someone will pay up to this)
- Best ask: $100.02 (someone will sell for as little as this)

If you want to buy *immediately*, you pay the ask: $100.02. If you want to sell *immediately*, you receive the bid: $99.98. The $0.04 gap is called the **spread**. Buy and instantly sell, and you lose $0.04 per share — that spread is exactly what the market maker earns for standing ready on both sides.

A trade happens the moment someone accepts the other side's price — a buyer pays the ask, or a seller hits the bid. Then the quotes refresh, and the dance continues.

## Why quant developers exist

Here's the punchline for this course. Over the last thirty years, markets stopped being crowds of people and became **software**. Prices update millions of times per day. Orders arrive in microseconds (millionths of a second). Deciding what to quote, when to trade, and how to manage risk is done by programs, not shouted across a floor.

Someone has to build those programs: the systems that read market data, the models that decide prices, the code that must be both mathematically correct and blisteringly fast. That someone is a **quantitative developer** — a software engineer who understands what the numbers mean. This course teaches you the "what the numbers mean" part, from zero.

## Interview checkpoints

- A market is just a meeting place where buyers and sellers agree on prices; a stock exchange is the modern (electronic) version of the town square.
- A share is a slice of company ownership; a bond is an IOU with interest.
- Prices move because of new information or because someone's willingness to buy or sell changed.
- The bid is the highest price a buyer will pay; the ask is the lowest price a seller will accept; the gap is the spread.
- Market makers quote both sides all day and earn the spread; modern markets are software, which is why firms hire developers.
