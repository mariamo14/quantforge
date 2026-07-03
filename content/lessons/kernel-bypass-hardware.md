---
title: Kernel Bypass & Hardware Awareness
minutes: 12
---

# Kernel Bypass & Hardware Awareness

Low-latency interviews rarely ask you to configure DPDK from memory. They ask something sharper: *why* does each technique cut latency? "We use kernel bypass" is a buzzword; "we eliminate the interrupt, the syscall, and the copy, which together cost microseconds" is an answer. This lesson gives you the why for every standard trick.

## Why the kernel path is slow

Trace a UDP packet through stock Linux and tally the costs:

- **Interrupt handling.** The NIC raises an IRQ; the CPU stops what it's doing, saves state, runs the driver's handler (NAPI then polls in softirq context). Cost: ~1–2 µs of direct work, plus your strategy thread just lost its cache-warm CPU to a softirq.
- **Syscalls.** Your app calls `recvmsg()`/`epoll_wait()`. Each user↔kernel transition costs roughly 100–300 ns post-Spectre/Meltdown (KPTI and friends made this worse), and that's before the kernel does anything useful.
- **Copies.** The payload is DMA'd into a kernel `sk_buff`, then copied again into your userspace buffer. Memory bandwidth spent, and — worse — cache lines evicted.
- **Context switches.** If your thread was blocked, the scheduler must wake it: ~1–5 µs, and the real damage is indirect — a cold L1/L2 and flushed TLB entries afterward. A single L1 hit is ~1 ns; a main-memory miss is ~80–100 ns; a context switch can turn hundreds of subsequent accesses into misses.
- **Generality tax.** The kernel stack handles netfilter hooks, socket demux across all processes, QoS, memory accounting. You need none of it for one hot multicast group.

Total: ~3–10 µs from wire to app, with fat-tailed jitter — and jitter is often what actually kills you, because you're racing others per-packet.

## Kernel bypass: map the NIC into userspace

The fix is architectural: give the application direct access to the NIC's DMA rings, so packets go **NIC → userspace buffer** with the kernel uninvolved on the data path.

- **DPDK** (Data Plane Development Kit): unbinds the NIC from the kernel driver; a userspace poll-mode driver owns the RX/TX descriptor rings, which live in hugepage-backed memory your process maps. Full control, full responsibility — you now own the protocol stack (or use one built on it).
- **Onload** (Solarflare/AMD, and OpenOnload): an `LD_PRELOAD` sockets-API shim. Your unmodified `recvfrom()` call becomes a userspace operation against a hardware virtual interface (ef_vi under the hood). Popular in trading precisely because existing socket code just gets faster.
- **AF_XDP** is the in-kernel compromise: XDP redirects frames to a userspace ring, keeping kernel management but skipping the stack.

What got eliminated: no interrupt (see busy-polling next), no syscall per packet, no kernel/user copy, no context switch. Delivery latency drops to ~1 µs or below.

## Busy-polling instead of interrupts

Bypass frameworks don't wait for the NIC to signal — a dedicated core spins in a loop checking the RX descriptor ring for new entries:

```cpp
while (running) {
    const int n = rx_ring.poll(burst, MAX_BURST);   // just reads a descriptor flag
    for (int i = 0; i < n; ++i)
        handle_packet(burst[i]);                    // no wakeup, cache is hot
}
```

Why it's faster: zero wakeup latency (the check is a cached memory read), no interrupt entry/exit, and — critically — **deterministic** latency. The core burns at 100% CPU doing "nothing," which horrifies general-purpose systems people and is exactly the right trade when one microsecond of tail latency costs real money.

## Zero-copy

With the RX ring mapped into your address space, the buffer the NIC DMA'd into **is** the buffer you parse. Binary exchange formats with fixed layouts (ITCH, SBE) make this pay off fully: decoding is a cast and a few field reads straight out of the DMA buffer. No copy means no memory-bandwidth spend and, more importantly, no second set of cache lines pulled in per packet.

## Core pinning, isolcpus, NUMA

- **Core pinning** (`pthread_setaffinity_np` / `taskset`): pin the poller and strategy threads to dedicated cores so they never migrate. Migration = cold L1/L2/TLB on the new core.
- **isolcpus / nohz_full / rcu_nocbs**: kernel boot parameters that remove cores from the general scheduler, disable the periodic timer tick on them, and offload RCU callbacks — so nothing preempts your hot loop. This is how you get a genuinely quiet core.
- **NUMA locality**: on a two-socket box, memory attached to the remote socket costs ~1.5–2× a local access, and PCIe devices hang off a specific socket. Rule: NIC, the cores polling it, and the memory they touch all on the same NUMA node (`numactl`, and check `lstopo`). Getting this wrong silently adds ~100+ ns to every packet.

## Hugepages and the TLB

The TLB caches virtual→physical translations and has only a few thousand entries. With 4 KB pages, a few GB of hot data guarantees TLB misses, each costing a page-table walk (tens to ~100 ns). **2 MB or 1 GB hugepages** cover the same memory with 512–262,144× fewer entries, making TLB misses rare. DPDK requires hugepage-backed buffer pools for exactly this reason. Say "hugepages reduce TLB pressure; a miss is a multi-level page-table walk" and you've answered the why.

## FPGAs and SmartNICs

One line to have ready: the fastest shops put decode-and-react logic **on the NIC itself** — an FPGA parses the market-data feed and can fire a pre-armed order in ~30–100 ns wire-to-wire, with the CPU relegated to strategy and risk updates; software's floor is roughly a microsecond, hardware's is tens of nanoseconds.

## What interviews actually probe

Not tool trivia — causal chains. Good answers connect **technique → eliminated cost → mechanism**: "Busy-polling removes interrupt and wakeup latency and keeps the cache hot." "Pinning prevents migration, which prevents cold caches and TLB." "Hugepages cut TLB misses, which cut page-table walks." If you can also rank the costs (context switch > syscall > copy per packet, but copies dominate at high message rates), you sound like you've measured it — which is the impression that gets offers.

## Interview checkpoints

- Enumerate kernel-path costs with numbers: interrupt (~µs + cache damage), syscall (~100–300 ns), extra copy, context switch (~1–5 µs plus cold caches), fat-tailed jitter.
- Kernel bypass = NIC DMA rings mapped into userspace (DPDK poll-mode drivers, Onload's LD_PRELOAD sockets shim); removes interrupt, syscall, copy, and context switch in one move.
- Busy-polling trades a burned core for zero wakeup latency and determinism — know why the trade is right for trading.
- Pinning + isolcpus/nohz_full = no migration, no preemption, no timer tick → hot caches and stable tails.
- NUMA rule: NIC, polling cores, and buffers on the same node; remote access is ~1.5–2× slower. Hugepages exist to cut TLB misses (each miss = page-table walk).
- FPGA one-liner: parse-and-respond on the NIC in tens of ns; software floor is ~1 µs.
