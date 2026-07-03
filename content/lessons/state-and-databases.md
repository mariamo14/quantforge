---
title: State, Storage & Databases
minutes: 12
---

Every interesting system remembers things. A trading system remembers its positions; a bank remembers your balance; a website remembers your login. What a system remembers is called its **state**, and deciding *where state lives* is half of system design. This lesson gives you the vocabulary.

## The volatility trade-off

Recall the two kinds of storage from lesson one. **RAM** is fast (~100 ns per access) but *volatile* — power loss or a crash erases it completely. **Disk** is slow (~100 µs per SSD access, a thousand times worse) but *durable* — it survives crashes and reboots.

So every piece of state forces a choice: keep it in RAM and risk losing it, or keep it on disk and pay a 1,000× tax on every access. There is no third option; there are only clever combinations. Every storage system you'll ever meet — every database, cache, and log — is one particular answer to this trade-off. Read the rest of this lesson as a tour of those answers.

## Files vs. databases

The simplest durable storage is a **file**: a named sequence of bytes on disk. Files are fine until you need to *find* things ("all orders for AAPL today?" — now you're scanning the whole file), *change* things safely (a crash mid-write leaves a half-updated mess), or let *several programs* write at once without trampling each other.

A **database** is simply a program that solves those three problems for you. It owns some files on disk, organizes them cleverly (with indexes — think a book's index, letting it jump straight to "AAPL" instead of reading every page), answers questions fast, lets many clients read and write concurrently, and guarantees that a crash never leaves the data half-updated. You talk to it like any server: send a request, get a response.

## SQL databases in four sentences

The classic kind is the **SQL database** (PostgreSQL, MySQL). Data lives in **tables** — spreadsheet-like grids where each **row** is one record (one order, one trade) and each column is a field. You ask **queries** in a language called SQL: `SELECT * FROM orders WHERE symbol = 'AAPL'` means "give me every order row for AAPL." And writes can be grouped into **transactions**: a set of changes that is *all-or-nothing* — the canonical example is a bank transfer, which must subtract $100 from account A *and* add $100 to account B; a transaction guarantees the world never sees (and a crash never produces) the halfway state where the money has left A but not arrived at B.

## Key-value stores: the simpler, faster cousin

Sometimes you don't need tables and queries — just "store this value under this name, give it back when I ask." That's a **key-value store** (Redis is the famous one): a giant durable dictionary. `SET position:AAPL 500`, `GET position:AAPL` → `500`. By promising less — no complex queries, no multi-row transactions — it can be far faster and simpler. A large share of real systems need nothing more.

## Durability: the write-ahead log

How does a database survive a crash in the middle of updating its files? With a beautifully simple trick: **write your intentions down before acting on them**. Before touching any table, the database appends one line to a special file — the **write-ahead log (WAL)**: "about to set balance of account A to $900." Appending to the end of a file is fast and, crucially, atomic enough to trust. Only then does it update the real data. After a crash, recovery is just re-reading the log: any intention that was logged but not applied gets re-applied; anything never logged never happened. It's the diligent colleague who writes every task in a notebook first — whatever happens, the notebook can reconstruct the truth.

## Replication: copies for safety

Disks die and machines catch fire, so serious systems keep **replicas** — live copies of the data on other machines. In the common setup, one machine (the *primary*) accepts all writes and continuously streams them to one or more *replicas*; if the primary dies, a replica takes over. Replicas also help with load: reads can be served from any copy. The cost is a new question — is a given replica fully caught up, or a few milliseconds behind? — which we'll revisit later in the track.

## Caching: hot answers in RAM

If some question is asked constantly ("current price of AAPL?"), don't pay the disk or network toll every time — keep the answer in RAM. That's a **cache**: RAM-speed reads for data whose true home is slower storage. The catch is **invalidation**: when the underlying truth changes, the cached copy is silently *wrong* until refreshed. Deciding when to refresh or discard cached data is famously one of the two hard problems in computer science — a cache trades a bit of correctness risk for a lot of speed, and you must decide consciously how stale is acceptable.

## What trading systems actually do

Now combine everything. Trading systems put **hot state in memory**: positions, working orders, risk limits — plain data structures in the process's RAM, accessible in nanoseconds, never a database call on the hot path. For durability they borrow the WAL idea: every event (order placed, fill received) is appended to an **append-only event log** on disk, off the critical path; after a crash, replaying the log from the start rebuilds the exact in-memory state. And for research, the firehose of historical market data goes to **columnar stores** (kdb+, Parquet-based systems) — databases that store each column together so that scanning one field across billions of rows is fast. That world — tick data, its volume, and why columns beat rows for it — gets its own lesson next.

## Interview checkpoints

- Can you state the volatility trade-off in one sentence (RAM is fast but forgets; disk is slow but remembers)?
- Can you explain what a database adds over plain files (queries, crash safety, concurrent access)?
- Can you define a transaction and illustrate all-or-nothing with the bank-transfer example?
- Can you explain the write-ahead log as "write intentions down before acting on them"?
- Can you describe the trading pattern: hot state in RAM, append-only log for recovery, columnar storage for analytics?
