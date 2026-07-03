---
title: How Programs Actually Run
minutes: 12
---

Before you can design a trading system — or answer a single system design interview question — you need a mental picture of what a computer actually is. Not the marketing version. The real one. It's simpler than you think.

## The three parts that matter

A computer is three things bolted together:

1. **The CPU (Central Processing Unit).** A chip that does arithmetic and comparisons, and nothing else — add two numbers, check if one is bigger than another, copy a value from one place to another. What makes it magical is speed: a modern CPU performs **billions of these tiny operations every second** (a 3 GHz CPU ticks 3 billion times per second).
2. **Memory, also called RAM (Random Access Memory).** The CPU's workbench. It holds the data the CPU is actively working on. RAM is very fast to read and write, but it is *volatile*: cut the power and everything in it vanishes instantly.
3. **The disk (SSD or hard drive).** The filing cabinet. Enormous capacity, and it *remembers* — power off, power on, your files are still there. The price: it is dramatically slower than RAM. Thousands of times slower.

Think of a chef in a kitchen. The CPU is the chef's hands. RAM is the countertop — ingredients within arm's reach. The disk is the pantry in the basement. A good chef stages everything on the countertop *before* cooking, because every trip to the basement wastes minutes.

## What a program is

A program on disk is just a file — a long list of instructions ("add these", "compare those", "jump to step 500 if true"). When you run it, the operating system copies those instructions into RAM, and the CPU starts executing them one after another, billions per second. That's it. "Running a program" means: instructions in memory, CPU walking through them.

## The operating system: the manager

Your machine runs dozens of programs at once — browser, editor, music player — but has only a handful of CPU cores. The **operating system (OS)** — Linux, macOS, Windows — is the manager that makes this work. It decides which program gets the CPU right now (switching between them so fast it looks simultaneous), hands out memory, and guards the hardware so no program can trample another. When your program wants to read a file or send a network message, it must ask the OS to do it — and that request itself takes time, which matters later.

## Processes vs. threads

Each running program lives in a **process**: its own private slice of memory, walled off from everyone else. Your browser crashing cannot corrupt your spreadsheet, because they can't see each other's memory.

Inside one process, you can have several **threads** — independent workers executing at the same time, all sharing that process's memory. Sharing is powerful: one thread can read market data and drop it into a structure that another thread instantly sees, with no copying and no messages. It is also dangerous: if two threads touch the same data at the same moment — one writing while another reads — you can get corrupted, half-updated values. These bugs (called *race conditions*) appear randomly, depend on exact timing, and are notoriously hard to reproduce. Multithreaded design is largely the art of getting the power without the danger.

## Why programs are fast or slow: where is the data?

Here's the secret interviewers want you to know: modern programs rarely wait on arithmetic. They wait on **data movement**. There's a ladder of storage, each rung bigger but slower:

| Where the data lives | Rough access time | Compared to registers |
|---|---|---|
| CPU registers (in the chip itself) | ~1 nanosecond | 1× |
| CPU cache (small fast memory on the chip) | ~1–10 ns | ~1–10× |
| RAM | ~100 ns | ~100× |
| SSD | ~100,000 ns (100 µs) | ~100,000× |
| Spinning disk | ~10,000,000 ns (10 ms) | ~10,000,000× |

(A nanosecond is a billionth of a second; a microsecond, µs, is a thousandth of a millisecond.)

## A worked example

Sum one million numbers that are already in RAM. The CPU streams through them, helped by cache: roughly 1 million additions at about a nanosecond each — **~1 millisecond, often less**.

Now read one million rows scattered across an SSD, at ~100 µs per read: 1,000,000 × 100 µs = 100 seconds — **nearly two minutes**. Same "million items", **100,000× slower**, purely because of where the data lived. (Reading them as one big sequential file is much better — but still thousands of times slower than RAM.)

## What this means for trading systems

Markets move in microseconds. A design that reads from disk while deciding whether to trade has already lost — the opportunity is gone before the read completes. So real trading systems keep **everything they need on the hot path in RAM**: order books, positions, risk limits, reference data — all loaded into memory at startup. Disks are used only *off* the critical path, for logging and recovery. The rest of this track builds on this one idea: know where your data lives, and count the cost of every trip down the ladder.

## Interview checkpoints

- Can you name the three main parts of a computer (CPU, RAM, disk) and the trade-off each makes between speed and permanence?
- Can you explain the difference between a process and a thread, and why threads sharing memory is both useful and risky?
- Can you sketch the memory ladder (registers → cache → RAM → disk) with rough relative speeds?
- Can you explain why summing a million numbers in RAM is ~100,000× faster than reading a million rows from disk?
- Can you say in one sentence why trading systems keep everything in memory on the hot path?
