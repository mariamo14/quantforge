---
title: Clients, Servers & Networks
minutes: 11
---

So far we've stayed inside one machine. But real systems — and every interview question — involve programs on *different* machines talking to each other. Let's build that picture from zero.

## What a server actually is

Forget the racks of blinking hardware. A **server** is just a program that runs on an always-on machine and *listens* — sitting quietly, waiting for other programs to ask it things. A **client** is any program that does the asking. The same machine can run both; the words describe roles, not hardware.

The classic analogy is a restaurant. You (the client) don't walk into the kitchen; you give the waiter a **request** ("one price for AAPL, please") and receive a **response** (the quote). The kitchen (the server) handles many tables at once, and each table neither knows nor cares about the others. This request/response pattern is the atom of almost every distributed system.

## Addresses: IPs and ports

To send a request, you need an address. Every machine on a network has an **IP address** — a number like `10.4.2.17`, playing the role of a street address. But one machine runs many listening programs, so each one claims a **port** — a number from 1 to 65535 that acts like an apartment number. "Connect to `10.4.2.17`, port `8080`" means: that machine, that specific program. That's the whole addressing scheme.

## What happens when a message travels

Your message doesn't travel as one blob. The network chops it into **packets** — small chunks, typically ~1,500 bytes each, every one stamped with the destination address. Think postal system: a long manuscript mailed as many envelopes. Each packet then **hops** across the network: your machine hands it to a **switch** (a local sorting office connecting nearby machines), which may hand it to a **router** (a sorting hub that decides which direction to forward mail between networks), and so on until it arrives. Within a datacenter, that's 1–5 hops; across the internet, often 10–20. Crucially, packets can arrive out of order, arrive twice, or not arrive at all — the postal system makes no promises. Something has to clean up that mess.

## TCP vs. UDP: registered mail vs. postcards

Two standard protocols sit on top of packets, making different promises:

**TCP (Transmission Control Protocol)** is registered mail. It numbers every packet, the receiver acknowledges each one, missing packets are re-sent, and everything is delivered to your program **in order, exactly once**. Wonderful — but when a packet is lost, TCP *stops and waits* for the re-send, so under bad conditions it gets slow, exactly when networks are stressed.

**UDP (User Datagram Protocol)** is a postcard. Fire and forget: no acknowledgments, no ordering, no retransmission, no waiting. Some postcards get lost. In exchange, it's as fast as the network allows and one lost packet never delays the next one.

When does each fit? TCP for anything where correctness beats speed: sending an order to an exchange, transferring a file, a web page. UDP when the next message supersedes the last anyway — if you missed one price update, the *next* update matters more than the missing one. This is why **exchanges broadcast market data over UDP** (with sequence numbers so listeners can detect gaps and request recovery). We'll go deep on that in the market data lesson.

## Connections vs. one-off requests

A TCP conversation starts with a **handshake** — a round trip or two to say hello — which costs real time (recall: ~500 µs even inside a datacenter). Casual software opens a connection, makes one request, and hangs up, paying that toll every time. Trading systems instead hold **persistent connections**: open once at startup — to the exchange, to the risk system — and keep them alive all day, sending periodic heartbeats. When a trade opportunity appears, the wire is already warm; no handshake sits on the critical path.

## APIs: the agreed language

Machinery alone isn't enough — both programs must agree on what the bytes *mean*. An **API (Application Programming Interface)** is that agreement: what requests exist, what fields they carry, what responses look like. "Send `GET /quote?symbol=AAPL`, receive `{"bid": 189.02, "ask": 189.04}`" is an API. In trading, the famous one is **FIX**, a standardized message format that virtually every exchange and broker speaks.

## A worked trace

A strategy program asks a price server (same datacenter) for a quote:

| Step | Rough cost |
|---|---|
| Strategy formats the request | ~1 µs |
| OS + network card put packets on the wire | ~5–20 µs |
| Packets hop through 1–2 switches to the server | ~50–250 µs |
| Server's OS delivers it; server reads it | ~5–20 µs |
| Server looks up the quote in RAM | ~1 µs |
| Response makes the same trip back | ~50–250 µs |

Total: roughly **200–500 µs round trip**. Notice where the time went: the lookup itself was ~1 µs — **99% of the cost was the trip**. Two servers chatting back and forth four times spend ~2 ms doing what one co-located program does in microseconds.

That's the takeaway: **hop count is destiny.**

| Distance between programs | Round trip |
|---|---|
| Same process (function call) | ~10 ns |
| Same machine, different process | ~10–50 µs |
| Same datacenter | ~500 µs |
| Cross-country | ~30 ms |
| Transatlantic | ~70 ms |

Every hop you remove buys orders of magnitude. This is why trading firms pay to place their machines *inside the exchange's own datacenter* — co-location is just aggressively minimizing the last row down to the second.

## Interview checkpoints

- Can you explain what a server is (a listening program) and describe client-server with the restaurant analogy?
- Can you say what an IP address and a port are, using the street-address/apartment analogy?
- Can you contrast TCP and UDP in one sentence each, and explain why market data uses UDP but order entry uses TCP?
- Can you explain why trading systems keep persistent connections open instead of reconnecting per request?
- Can you walk through a request's journey and point out that the network trip, not the work, dominates the time?
