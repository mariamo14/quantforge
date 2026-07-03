---
title: Networking for Trading Systems
minutes: 14
---

# Networking for Trading Systems

Every quant dev interview loop has at least one round that starts with some version of: "A trade print happens at the exchange. Walk me through how your strategy finds out." If you can narrate that path precisely — and explain the TCP/UDP split that trading infrastructure is built around — you clear a bar most candidates miss.

## The life of a market-data packet

Start at the matching engine. An aggressive order crosses the spread, a trade occurs, and the exchange's feed handler publishes a message describing it. From there:

1. **Exchange publication.** The message is serialized into the exchange's wire format (e.g., NASDAQ ITCH, CME MDP3) and handed to the exchange's multicast publishers.
2. **Cross-connect.** If you're colocated, the packet travels over a physical fiber cross-connect from the exchange's cage to yours — typically a few hundred meters. Light in fiber moves at roughly 5 ns per meter, so 200 m of fiber is ~1 µs of pure propagation delay you cannot optimize away.
3. **Your switch.** Each switch hop adds latency: a decent cut-through switch forwards in ~300–500 ns; a store-and-forward switch waits for the whole frame first and costs more. Serious shops count their hops.
4. **NIC.** The network card receives the frame, validates the Ethernet CRC, and DMAs the payload into a receive ring buffer in host memory.
5. **Kernel (the default path).** The NIC raises an interrupt. The kernel's driver runs, allocates an `sk_buff`, walks the packet up the IP/UDP stack, finds the matching socket, and copies the payload into the socket's receive buffer. Your application, blocked in `recvfrom()` or polling `epoll`, wakes up via a context switch and issues a syscall to copy the data into userspace.
6. **Application.** Your feed handler decodes the message and updates the order book.

Steps 5–6 are where most of the controllable latency lives — a stock kernel path costs single-digit microseconds; a tuned kernel-bypass path costs hundreds of nanoseconds. That gap is why kernel bypass exists (covered in its own lesson).

## TCP vs UDP: what you're actually buying

**TCP** gives you a connection-oriented, reliable, ordered byte stream: sequence numbers, acknowledgments, retransmission on loss, flow control, congestion control. The cost is **head-of-line blocking**: if segment N is dropped, the kernel will not deliver segments N+1, N+2, … to your application until N is retransmitted and arrives — even though those later bytes are sitting in the receive buffer. A retransmission timeout can stall your stream for milliseconds. In trading terms: one lost packet and your "real-time" feed is suddenly showing you the past.

**UDP** gives you datagrams: no connection, no ordering, no retransmission, no flow control. Packets arrive independently, or not at all. What sounds like a weakness is exactly what market data wants.

## Why market data is UDP multicast

Two reasons, and interviewers want both:

**Fan-out.** An exchange has thousands of subscribers. With multicast, the exchange sends **one packet** and switches replicate it to every subscriber that joined the group (via IGMP). With TCP it would need thousands of individual connections, each with its own send buffer and retransmission state — the slowest consumer would burden the publisher.

**No retransmission latency.** If a quote update is lost, the *last* thing you want is to wait 200 ms for a retransmit of data that's already stale. Better to detect the gap and move on.

Loss still has to be handled, just not by the transport:

- **Sequence numbers.** Every message carries one. Your feed handler tracks the expected next sequence; a jump means a gap.
- **Gap-fill / recovery.** Exchanges provide a TCP-based retransmission service and periodic snapshot channels. On a gap you either request the missing range or, if you've fallen too far behind, resubscribe to a snapshot and replay buffered deltas on top.
- **A/B feed arbitration.** Exchanges broadcast every message on two redundant multicast groups (feed A and feed B), often over physically separate paths. Your handler listens to both and takes whichever copy of each sequence number arrives **first** — this both masks single-feed loss and shaves latency, since the faster path wins per-packet. Duplicates are dropped by sequence number.

## Why order entry is TCP

Orders are the opposite trade-off. You are moving money: every message must arrive, exactly once, in order. If your `NewOrderSingle` silently vanishes you might think you have no position when you're long 10,000 shares. So order entry runs over TCP sessions — historically FIX, at fast venues compact **binary session protocols** (NASDAQ OUCH, CME iLink) layered on TCP with application-level sequence numbers and recovery on top, so both sides can prove exactly which orders were received. Reliability is worth the head-of-line blocking risk because order flow is low-volume compared to market data, and correctness beats speed on the order path.

## Latency budget intuition

Interviewers love "where do the nanoseconds go?" A rough tick-to-trade budget for a tuned software system:

| Component | Order of magnitude |
|---|---|
| Fiber propagation (per 100 m) | ~500 ns |
| Cut-through switch hop | ~300–500 ns |
| Wire time, 512-byte frame at 10 Gbps | ~410 ns |
| NIC + kernel-bypass userspace delivery | ~1 µs |
| Standard kernel network stack | ~3–10 µs |
| Decode + book update + strategy decision | ~200 ns–2 µs |

Note that wire (serialization) time scales with frame size and inversely with link speed: at 10 Gbps you push ~1.25 bytes/ns, so smaller messages and faster links directly cut latency. This is one honest reason binary protocols beat verbose ones on the wire, not just in parse time.

## What the kernel does per packet

Be ready to enumerate the costs of the default path: an **interrupt** (or NAPI polled batch) per packet arrival; driver code allocating and initializing an `sk_buff`; protocol processing (IP checksum, UDP demux, socket lookup); a **copy** from kernel buffer to userspace on `recvmsg`; a **syscall** (~hundreds of ns each after Spectre/Meltdown mitigations) per receive; and a **context switch** to wake your blocked thread, which also pollutes caches and the TLB. Multiply by a million packets per second during a busy open, and the motivation for bypassing all of it becomes obvious.

## Interview checkpoints

- Narrate the full packet path — matching engine → multicast publish → cross-connect → switch hops → NIC DMA → kernel stack → syscall → app — with rough latency for each stage.
- Explain head-of-line blocking in one sentence: TCP won't deliver byte N+1 until byte N arrives, so one drop stalls everything behind it.
- Market data is UDP multicast for fan-out (one packet, many subscribers) and to avoid retransmission latency; loss is handled by sequence numbers, gap-fill/snapshot recovery, and A/B feed arbitration.
- Order entry is TCP because orders must be reliable, ordered, exactly-once — and it's low-volume enough that TCP's costs don't matter.
- Know the arbitration trick: listen to both A and B feeds, take the first arrival per sequence number, drop duplicates.
- Quote rough numbers: ~5 ns/m fiber, ~400 ns per switch hop, ~1 µs bypass delivery vs ~5 µs kernel path.
