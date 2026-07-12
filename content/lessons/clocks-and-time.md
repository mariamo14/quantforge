---
title: "Clocks, Timestamps & Ordering"
minutes: 13
---

**Builds on:** *Networking for Trading Systems*

A trading system is a distributed system where "what happened, and when?" is worth money. Yet the primitive everyone reaches for — the machine clock — is quietly unreliable. This lesson covers how clocks fail, how to fix them to the degree your problem requires, and when to stop trusting timestamps entirely.

## Why time is hard: every clock drifts

Your server keeps time with a quartz crystal oscillator, and no two crystals tick at exactly the same rate. Drift is quoted in **parts per million (ppm)**: a 10 ppm clock gains or loses 10 microseconds every second. Do the arithmetic interviewers expect on the spot:

$$10\,\text{ppm} \times 86{,}400\,\text{s/day} = 0.864\,\text{s/day}$$

A garden-variety 10 ppm oscillator wanders by nearly a **second per day** (1 ppm ≈ 86 ms/day). Worse, drift moves with temperature, so a server under load drifts differently than an idle one. Left undisciplined, two machines in the same rack disagree by milliseconds within hours — every cross-machine timestamp comparison is meaningless unless something actively steers the clocks.

## NTP vs PTP: pick your sync budget

**NTP** disciplines the clock over ordinary packets. It estimates offset by assuming the path to the time server is **symmetric** — request and reply take equal time. Any asymmetry (congested uplink, asymmetric routing) becomes error you cannot detect from inside the protocol. In practice NTP achieves **milliseconds** over the internet, maybe tens of microseconds on a quiet LAN. Fine for log correlation; not fine for microsecond measurements across machines.

**PTP** (Precision Time Protocol, IEEE 1588) reaches **sub-microsecond** by attacking what NTP can't: it timestamps packets **in hardware** at the NIC (eliminating software-stack jitter) and requires switches to participate as **boundary clocks** or transparent clocks (removing queuing delay from the error budget). The cost is infrastructure: PTP-capable NICs, PTP-aware switches, a GPS-disciplined grandmaster. Rule of thumb: NTP suffices when cross-machine tolerance is milliseconds; the microsecond regime needs PTP end to end.

## Hardware timestamps, and why software timestamps lie

Even with a perfectly synced clock, *where* you take the timestamp matters. A packet arrives at the wire; then it sits in a NIC ring, waits for a (possibly coalesced) interrupt, traverses the kernel, and finally your thread gets scheduled and calls `clock_gettime`. Between wire arrival and your code lie several microseconds — occasionally hundreds, when the scheduler has other plans. A software timestamp measures "when my code ran," not "when the packet arrived," and the gap is *jittery*, which is worse than a constant bias. NIC **hardware timestamping** stamps the packet as it crosses the wire — the number you actually want for latency measurement and event reconstruction.

Regulators agree: **MiFID II (RTS 25)** requires HFT firms' business clocks to be within 100 microseconds of UTC, with microsecond timestamp granularity — clock sync is a compliance requirement, not just engineering hygiene.

## Measuring tick-to-trade correctly

The golden rule: **deltas within one clock are trustworthy; deltas across clocks are only as good as your sync budget.**

- *Good:* timestamp the market-data packet and your outbound order on the **same host's** hardware clock (or capture both on one external wire tap). The difference is a clean tick-to-trade number.
- *Classic error:* subtract your local receive timestamp from the exchange's feed timestamp and call it "network latency." If the clocks are unsynced, that number contains the unknown clock offset — which can dwarf the latency, even making it **negative**. A latency dashboard showing negative values is this bug in the wild.

When you must measure across machines, state the sync budget alongside the number: "35 µs ± 1 µs PTP sync error" is a measurement; "35 µs" from two NTP-synced boxes is a rumor.

## Ordering: sequence numbers beat timestamps

For *correctness*, don't order events by timestamp at all. Exchange feeds carry **sequence numbers**, and those are ground truth: a gap means you missed a message (trigger recovery), and message N precedes message N+1, period — no sync budget required. Two events a microsecond apart can easily carry misordered timestamps across machines. The discipline: **timestamps for measurement, sequence numbers for logic.** The book-builder keys off sequence numbers; the latency dashboard keys off timestamps.

## Monotonic vs wall clocks in code

The OS gives you two clocks, and confusing them is a real production bug:

```cpp
// Durations: steady_clock. Never goes backward, unaffected by NTP.
auto t0 = std::chrono::steady_clock::now();
handle_message(msg);
auto elapsed = std::chrono::steady_clock::now() - t0;   // always >= 0

// Wall-clock stamps for humans/logs: system_clock.
auto stamp = std::chrono::system_clock::now();          // can jump!
```

`system_clock` is wall time: NTP can slew it or **step it backward** to correct a large offset. Code that subtracts two wall-clock reads will occasionally see negative elapsed time — timers that never fire, "latencies" of minus four milliseconds, timeout logic that misbehaves once a month. Use `steady_clock` for anything subtracted; use `system_clock` only for stamping events for the outside world.

## Leap seconds, honestly

UTC occasionally inserts a leap second to stay aligned with the Earth's rotation (most recently at the end of 2016), producing a 61-second minute that POSIX time cannot represent cleanly — so systems either repeat a second or **smear** it across many hours, as Google and AWS do. Smearing keeps software happy but means your clock deliberately disagrees with true UTC during the smear, which is awkward for regulatory timestamping. The CGPM has resolved to abandon leap seconds by 2035; until then, know what your time source does on leap-second day, because "my broker smears, my exchange doesn't" is a real reconciliation headache.

## A latency-measurement checklist

- Same-clock deltas wherever possible; hardware timestamps at the NIC, not userspace.
- Cross-machine numbers only with PTP, reporting sync error alongside the measurement.
- Negative deltas mean clock offset or wall-clock misuse, not time travel — investigate.
- Distributions, not averages; enough samples to see the tail.
- Sequence numbers for ordering and gap detection; timestamps never drive trading logic.

## Interview checkpoints

- Compute drift on the spot: 10 ppm ≈ 0.86 s/day; explain why undisciplined clocks make cross-machine timestamps meaningless.
- Contrast NTP (ms-level, path-asymmetry error) with PTP (hardware timestamps + boundary clocks, sub-µs) and say when each suffices.
- Explain why software timestamps lie (interrupt and scheduling jitter between wire and code) and what NIC hardware timestamping fixes.
- Spot the classic bug: subtracting timestamps from two unsynced clocks — negative "latency" is the tell.
- Articulate the discipline: sequence numbers for correctness, timestamps for measurement; `steady_clock` for durations, `system_clock` for stamps.
