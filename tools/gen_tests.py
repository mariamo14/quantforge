#!/usr/bin/env python3
"""Generate tests.yaml for every problem by running the reference solution.

For each problem this script holds a list of (input, sample) cases — some
literal, some generated with a seeded RNG. It compiles content/problems/
<slug>/solution.cpp with clang++, runs each input through it, and writes
tests.yaml as JSON (JSON is valid YAML, and trivially safe to emit).

Usage: python3 tools/gen_tests.py [slug ...]   (no args = all problems)
"""

import json
import random
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROBLEMS = ROOT / "content" / "problems"


def fixed_point_price():
    yield "3\n100.5 2\n0.0001 10000\n19345.5 1\n", True
    yield "1\n99999.9999 10000\n", True
    # doubles lose exactness at this scale: ~2000 large-notional trades
    rng = random.Random(42)
    lines = []
    n = 2000
    for _ in range(n):
        whole = rng.randint(90000, 99999)
        frac = rng.randint(0, 9999)
        qty = rng.randint(9000, 10000)
        lines.append(f"{whole}.{frac:04d} {qty}")
    yield f"{n}\n" + "\n".join(lines) + "\n", False
    # prices with heterogeneous decimal widths
    yield "5\n7 3\n7.1 3\n7.25 3\n7.125 3\n7.0625 3\n", False
    rng = random.Random(7)
    n = 3000
    lines = [f"{rng.randint(0, 99)}.{rng.randint(0, 9999):04d} {rng.randint(1, 100)}" for _ in range(n)]
    yield f"{n}\n" + "\n".join(lines) + "\n", False


def ring_buffer():
    yield "2 8\nPUSH 1\nPUSH 2\nPUSH 3\nSIZE\nPOP\nPUSH 4\nPOP\nPOP\n", True
    yield "1 5\nPOP\nPUSH -5\nPUSH 6\nPOP\nPOP\n", True
    rng = random.Random(42)
    ops = ["100000 200000"]
    for _ in range(199999):
        r = rng.random()
        if r < 0.5:
            ops.append(f"PUSH {rng.randint(-10**9, 10**9)}")
        elif r < 0.9:
            ops.append("POP")
        else:
            ops.append("SIZE")
    yield "\n".join(ops) + "\n", False
    # tiny capacity, heavy wraparound
    rng = random.Random(3)
    ops = ["3 5000"]
    for _ in range(4999):
        ops.append(f"PUSH {rng.randint(0, 99)}" if rng.random() < 0.6 else "POP")
    yield "\n".join(ops) + "\n", False


def order_book():
    yield ("12\nA 1 B 100 5\nA 2 S 102 3\nQ BEST\nA 3 B 100 2\nQ VOL B 100\n"
           "X 1 5\nQ BEST\nC 3\nQ BEST\nQ VOL B 100\nA 4 S 101 1\nQ BEST\n"), True
    yield "3\nQ BEST\nA 1 S 5 1\nQ BEST\n", True
    rng = random.Random(42)
    lines = []
    active = []
    next_id = 1
    n_ops = 150000
    lines.append(str(n_ops))
    for _ in range(n_ops):
        r = rng.random()
        if r < 0.55 or not active:
            side = rng.choice("BS")
            price = rng.randint(1, 2000)
            qty = rng.randint(1, 1000)
            lines.append(f"A {next_id} {side} {price} {qty}")
            active.append([next_id, qty])
            next_id += 1
        elif r < 0.70:
            idx = rng.randrange(len(active))
            oid, _ = active.pop(idx)
            lines.append(f"C {oid}")
        elif r < 0.85:
            idx = rng.randrange(len(active))
            entry = active[idx]
            fill = rng.randint(1, entry[1])
            lines.append(f"X {entry[0]} {fill}")
            entry[1] -= fill
            if entry[1] == 0:
                active.pop(idx)
        elif r < 0.95:
            lines.append("Q BEST")
        else:
            lines.append(f"Q VOL {rng.choice('BS')} {rng.randint(1, 2000)}")
    yield "\n".join(lines) + "\n", False


def rolling_vwap():
    yield "5 3\n10000 2\n10100 1\n10200 3\n9900 4\n10050 2\n", True
    yield "2 2\n33 1\n34 1\n", True  # rounding: 33.5 -> half-up 34 cents = 0.34
    rng = random.Random(42)
    n, k = 200000, 500
    lines = [f"{n} {k}"] + [f"{rng.randint(9*10**6, 10**7)} {rng.randint(9000, 10000)}" for _ in range(n)]
    yield "\n".join(lines) + "\n", False
    rng = random.Random(9)
    n, k = 5000, 1
    lines = [f"{n} {k}"] + [f"{rng.randint(1, 100)} {rng.randint(1, 3)}" for _ in range(n)]
    yield "\n".join(lines) + "\n", False


def prefix_pnl():
    yield "6\n5 -3 -4 10 -2 -9\n", True
    yield "3\n1 2 3\n", True
    rng = random.Random(42)
    n = 200000
    vals = [str(rng.randint(-10**9, 10**9)) for _ in range(n)]
    yield f"{n}\n" + " ".join(vals) + "\n", False
    yield "4\n-1000000000 -1000000000 -1000000000 -1000000000\n", False
    # tie: two equal troughs, earliest wins
    yield "6\n-5 5 -5 0 0 -5\n", False


def sliding_window_max():
    yield "8 3\n1 3 2 5 4 4 1 2\n", True
    rng = random.Random(42)
    n, k = 200000, 5000
    vals = [str(rng.randint(1, 10**9)) for _ in range(n)]
    yield f"{n} {k}\n" + " ".join(vals) + "\n", False
    # monotone decreasing (worst case for naive deque misuse)
    n, k = 100000, 1000
    vals = [str(n - i) for i in range(n)]
    yield f"{n} {k}\n" + " ".join(vals) + "\n", False
    yield "5 5\n2 2 2 2 2\n", False


def top_of_book():
    yield "9\nA 1 B 100\nA 2 S 105\nQ\nA 3 B 102\nQ\nC 3\nQ\nC 1\nQ\n", True
    yield "3\nQ\nA 9 S 7\nQ\n", True
    rng = random.Random(42)
    lines = []
    active = []
    next_id = 1
    n_ops = 200000
    lines.append(str(n_ops))
    for _ in range(n_ops):
        r = rng.random()
        if r < 0.5 or not active:
            side = rng.choice("BS")
            price = rng.randint(1, 10**6)
            lines.append(f"A {next_id} {side} {price}")
            active.append(next_id)
            next_id += 1
        elif r < 0.85:
            idx = rng.randrange(len(active))
            lines.append(f"C {active.pop(idx)}")
        else:
            lines.append("Q")
    yield "\n".join(lines) + "\n", False


def order_matching():
    yield "6\n1 B 100 5\n2 S 101 5\n3 S 100 3\n4 B 101 4\n5 S 99 10\n6 B 95 2\n", True
    yield "2\n1 B 50 1\n2 S 50 1\n", True
    rng = random.Random(42)
    n = 100000
    lines = [str(n)]
    for i in range(1, n + 1):
        side = rng.choice("BS")
        price = rng.randint(900, 1100)
        qty = rng.randint(1, 500)
        lines.append(f"{i} {side} {price} {qty}")
    yield "\n".join(lines) + "\n", False
    # partial fills chaining across levels
    yield "5\n1 S 10 3\n2 S 11 3\n3 S 12 3\n4 B 12 7\n5 B 12 5\n", False


def black_scholes_pricer():
    yield "3\n100 100 0.05 0.2 1\n100 110 0.05 0.2 0.5\n50 45 0.02 0.35 2\n", True
    rng = random.Random(42)
    q = 500
    lines = [str(q)]
    for _ in range(q):
        s = round(rng.uniform(1, 500), 2)
        k = round(rng.uniform(1, 500), 2)
        r = round(rng.uniform(0, 0.2), 4)
        sig = round(rng.uniform(0.05, 1.5), 4)
        t = round(rng.uniform(0.01, 30), 4)
        lines.append(f"{s} {k} {r} {sig} {t}")
    yield "\n".join(lines) + "\n", False
    yield "2\n100 100 0 0.05 0.01\n0.01 100000 0.2 2 30\n", False


def monte_carlo_option():
    rng = random.Random(42)
    draws = [f"{rng.gauss(0, 1):.6f}" for _ in range(1000)]
    yield "100 100 0.05 0.2 1\n1000\n" + " ".join(draws) + "\n", True
    rng = random.Random(7)
    draws = [f"{rng.gauss(0, 1):.6f}" for _ in range(100000)]
    yield "250 260 0.03 0.4 0.5\n100000\n" + " ".join(draws) + "\n", False
    yield "100 200 0.01 0.05 0.1\n2\n0.5 -0.5\n", False  # all payoffs zero


def portfolio_var():
    yield ("2 10 0.90\n0.6 0.4\n"
           "0.01 -0.02\n-0.03 0.01\n0.002 0.003\n-0.015 -0.01\n0.02 0.025\n"
           "-0.005 0.004\n0.011 -0.006\n-0.02 -0.03\n0.007 0.001\n0.001 0.002\n"), True
    rng = random.Random(42)
    a, t = 25, 2500
    weights = [rng.uniform(0.5, 2.0) for _ in range(a)]
    total = sum(weights)
    weights = [w / total for w in weights]
    lines = [f"{a} {t} 0.95", " ".join(f"{w:.6f}" for w in weights)]
    for _ in range(t):
        lines.append(" ".join(f"{rng.gauss(0.0003, 0.015):.6f}" for _ in range(a)))
    yield "\n".join(lines) + "\n", False
    rng = random.Random(11)
    a, t = 3, 100
    lines = [f"{a} {t} 0.99", "0.5 0.3 0.2"]
    for _ in range(t):
        lines.append(" ".join(f"{rng.gauss(0, 0.02):.6f}" for _ in range(a)))
    yield "\n".join(lines) + "\n", False


def _fix_msg(body_fields, seq=None):
    """Build a valid message: 8, 9(correct), body, 10(correct)."""
    body = "".join(f + "|" for f in body_fields)
    head = "8=FIX.4.2|"
    lenfield = f"9={len(body)}|"
    prefix = head + lenfield + body
    total = sum(1 if ch == "|" else ord(ch) for ch in prefix)
    return prefix + f"10={total % 256:03d}|"


def fix_checksum():
    good = _fix_msg(["35=D", "49=QF", "56=EXCH", "55=AAPL", "54=1", "38=100", "44=189.5"])
    # corrupt the checksum
    bad_sum = good[:-4] + f"{(int(good[-4:-1]) + 1) % 1000:03d}|"
    # corrupt the length: bump 9= value by 1
    p = good.index("9=") + 2
    q = good.index("|", p)
    bad_len = good[:p] + str(int(good[p:q]) + 1) + good[q:]
    yield f"3\n{good}\n{bad_sum}\n{bad_len}\n", True
    rng = random.Random(42)
    msgs = []
    for _ in range(500):
        fields = [f"35={rng.choice(['D', '8', 'F'])}", f"49=FIRM{rng.randint(1, 99)}",
                  f"56=EX{rng.randint(1, 9)}", f"55=SYM{rng.randint(1, 999)}",
                  f"54={rng.randint(1, 2)}", f"38={rng.randint(1, 10**6)}",
                  f"44={rng.randint(1, 10**5)}.{rng.randint(0, 99):02d}"]
        msg = _fix_msg(fields)
        roll = rng.random()
        if roll < 0.3:
            msg = msg[:-4] + f"{(int(msg[-4:-1]) + rng.randint(1, 254)) % 1000 % 256:03d}|"
        elif roll < 0.5:
            p = msg.index("9=") + 2
            q = msg.index("|", p)
            msg = msg[:p] + str(int(msg[p:q]) + rng.randint(1, 5)) + msg[q:]
        msgs.append(msg)
    yield f"{len(msgs)}\n" + "\n".join(msgs) + "\n", False


def _bs_call(S, K, r, sigma, T):
    import math
    vol_sqrt_t = sigma * math.sqrt(T)
    d1 = (math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / vol_sqrt_t
    d2 = d1 - vol_sqrt_t
    N = lambda x: 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))
    return S * N(d1) - K * math.exp(-r * T) * N(d2)


def implied_volatility():
    # prices generated FROM known vols, so recovery is exact and unambiguous
    sample = [(100, 100, 0.05, 0.20, 1.0), (100, 120, 0.02, 0.45, 0.5), (50, 40, 0.03, 0.80, 2.0)]
    lines = [str(len(sample))]
    for S, K, r, sigma, T in sample:
        lines.append(f"{_bs_call(S, K, r, sigma, T):.10f} {S} {K} {r} {T}")
    yield "\n".join(lines) + "\n", True

    rng = random.Random(42)
    q = 500
    lines = [str(q)]
    for _ in range(q):
        S = round(rng.uniform(5, 500), 2)
        K = round(S * rng.uniform(0.5, 1.8), 2)
        r = round(rng.uniform(0, 0.15), 4)
        sigma = round(rng.uniform(0.02, 3.5), 4)
        T = round(rng.uniform(0.05, 10), 4)
        lines.append(f"{_bs_call(S, K, r, sigma, T):.10f} {S} {K} {r} {T}")
    yield "\n".join(lines) + "\n", False
    # near the bracket edges
    edges = [(100, 100, 0.01, 0.011, 1.0), (100, 100, 0.0, 3.9, 0.25)]
    lines = [str(len(edges))]
    for S, K, r, sigma, T in edges:
        lines.append(f"{_bs_call(S, K, r, sigma, T):.10f} {S} {K} {r} {T}")
    yield "\n".join(lines) + "\n", False


def bond_pricer():
    yield "3\n1000 0.05 0.05 10 2\n1000 0.06 0.04 5 1\n100 0 0.07 30 2\n", True
    rng = random.Random(42)
    q = 500
    lines = [str(q)]
    for _ in range(q):
        F = rng.choice([100, 1000, 10000, 1000000])
        c = round(rng.uniform(0, 0.15), 4)
        y = round(rng.uniform(0.001, 0.20), 4)
        n = rng.randint(1, 30)
        m = rng.choice([1, 2])
        lines.append(f"{F} {c} {y} {n} {m}")
    yield "\n".join(lines) + "\n", False


def currency_arbitrage():
    # sample 1: classic triangle with product 1.02 -> ARBITRAGE
    yield "3 3\n1 2 0.8\n2 3 1.5\n3 1 0.85\n", True  # 0.8*1.5*0.85 = 1.02
    # sample 2: same triangle scaled down -> OK (product 0.96)
    yield "3 3\n1 2 0.8\n2 3 1.5\n3 1 0.8\n", True  # 0.96
    rng = random.Random(42)

    def build(n, m, arb):
        potentials = [rng.uniform(0.1, 10) for _ in range(n)]
        edges = set()
        lines = []
        while len(lines) < m - (4 if arb else 0):
            u, v = rng.randrange(n), rng.randrange(n)
            if u == v or (u, v) in edges:
                continue
            edges.add((u, v))
            rate = potentials[u] / potentials[v] * rng.uniform(0.90, 0.99)
            lines.append(f"{u + 1} {v + 1} {rate:.6f}")
        if arb:
            cycle = rng.sample(range(n), 4)
            gain = 1.05 ** 0.25
            for a, b in zip(cycle, cycle[1:] + cycle[:1]):
                rate = potentials[a] / potentials[b] * gain
                lines.append(f"{a + 1} {b + 1} {rate:.6f}")
        return f"{n} {len(lines)}\n" + "\n".join(lines) + "\n"

    yield build(100, 5000, arb=False), False
    yield build(100, 5000, arb=True), False
    yield build(50, 600, arb=True), False
    # disconnected component holding the arbitrage
    yield "6 5\n1 2 0.5\n2 1 1.9\n4 5 1.1\n5 6 1.1\n6 4 0.9\n", False  # 4-5-6 cycle: 1.089
    yield build(80, 2000, arb=False), False


def ewma_volatility():
    yield "0.94 5\n0.01 -0.02 0.015 -0.03 0.005\n", True
    rng = random.Random(42)
    n = 200000
    returns = " ".join(f"{rng.gauss(0.0002, 0.012):.6f}" for _ in range(n))
    yield f"0.94 {n}\n{returns}\n", False
    rng = random.Random(7)
    n = 50000
    returns = " ".join(f"{rng.gauss(0, 0.03):.6f}" for _ in range(n))
    yield f"0.999 {n}\n{returns}\n", False


def _qfp_add(seq, oid, side, symbol, price, qty):
    body = b"A" + seq.to_bytes(4, "big") + oid.to_bytes(8, "big") + side.encode()
    body += symbol.ljust(6).encode() + price.to_bytes(4, "big") + qty.to_bytes(4, "big")
    return body.hex()


def _qfp_exec(seq, oid, qty):
    return (b"E" + seq.to_bytes(4, "big") + oid.to_bytes(8, "big") + qty.to_bytes(4, "big")).hex()


def _qfp_cancel(seq, oid):
    return (b"X" + seq.to_bytes(4, "big") + oid.to_bytes(8, "big")).hex()


def binary_feed_decoder():
    sample = [
        _qfp_add(1000, 900001, "B", "AAPL", 18950, 100),
        _qfp_exec(1001, 900001, 40),
        _qfp_cancel(1003, 900001),  # gap: expected 1002
        _qfp_add(1004, 900002, "S", "MSFT", 41275, 250),
    ]
    yield f"{len(sample)}\n" + "\n".join(sample) + "\n", True

    rng = random.Random(42)
    msgs = []
    seq = 1
    for _ in range(50000):
        if rng.random() < 0.01:
            seq += rng.randint(2, 100)  # gap
        kind = rng.random()
        oid = rng.randint(1, 2**63)
        if kind < 0.5:
            msgs.append(_qfp_add(seq, oid, rng.choice("BS"),
                                 rng.choice(["AAPL", "MSFT", "GOOG", "ES", "ZN", "SPY"]),
                                 rng.randint(1, 10**6), rng.randint(1, 10**6)))
        elif kind < 0.8:
            msgs.append(_qfp_exec(seq, oid, rng.randint(1, 10**6)))
        else:
            msgs.append(_qfp_cancel(seq, oid))
        seq += 1
    yield f"{len(msgs)}\n" + "\n".join(msgs) + "\n", False


def single_trade_max_profit():
    yield "6\n7 1 5 3 6 4\n", True
    yield "5\n9 7 6 4 3\n", True  # no profitable trade
    rng = random.Random(42)
    n = 200000
    vals = [str(rng.randint(1, 10**9)) for _ in range(n)]
    yield f"{n}\n" + " ".join(vals) + "\n", False
    # tie-breaking: two trades with equal profit; earliest sell must win
    yield "8\n5 1 6 1 6 1 6 2\n", False
    # equal minima: earliest buy day must be reported
    yield "6\n3 3 3 8 3 8\n", False
    n = 100000
    vals = [str(i + 1) for i in range(n)]  # strictly increasing
    yield f"{n}\n" + " ".join(vals) + "\n", False


def lru_cache():
    yield ("2 9\nPUT 1 10\nPUT 2 20\nGET 1\nPUT 3 30\nGET 2\nGET 1\nGET 3\nPUT 4 40\nGET 1\n"), True
    yield "1 5\nPUT 5 50\nGET 5\nPUT 6 60\nGET 5\nGET 6\n", True
    rng = random.Random(42)
    ops = ["100 400000"]
    for _ in range(399999):
        if rng.random() < 0.55:
            ops.append(f"PUT {rng.randint(0, 300)} {rng.randint(0, 10**9)}")
        else:
            ops.append(f"GET {rng.randint(0, 300)}")
    yield "\n".join(ops) + "\n", False
    rng = random.Random(9)
    ops = ["1 20000"]
    for _ in range(19999):
        if rng.random() < 0.6:
            ops.append(f"PUT {rng.randint(0, 5)} {rng.randint(0, 99)}")
        else:
            ops.append(f"GET {rng.randint(0, 5)}")
    yield "\n".join(ops) + "\n", False


def time_value_calculator():
    yield "4\nFV 100 0.10 2\nPV 121 0.10 2\nFV 100 0.05 3\nPV 1000000 0.03 30\n", True
    rng = random.Random(42)
    q = 1000
    lines = [str(q)]
    for _ in range(q):
        op = rng.choice(["FV", "PV"])
        amount = round(rng.uniform(1, 10**7), 2)
        r = round(rng.uniform(0, 0.5), 4)
        n = rng.randint(0, 50)
        lines.append(f"{op} {amount} {r} {n}")
    yield "\n".join(lines) + "\n", False
    yield "3\nFV 100 0 10\nPV 100 0 10\nFV 0.01 0.5 50\n", False


def option_payoff():
    # straddle at $100 (strikes in cents)
    yield "2 3\n1 C 10000\n1 P 10000\n8000 10000 12000\n", True
    # covered call: long stock, short call at $50
    yield "2 4\n1 S\n-1 C 5000\n3000 5000 7000 20000\n", True
    rng = random.Random(42)
    n, m = 100, 1000
    lines = [f"{n} {m}"]
    for _ in range(n):
        qty = rng.randint(-1000, 1000) or 1
        kind = rng.choice(["C", "P", "S"])
        if kind == "S":
            lines.append(f"{qty} S")
        else:
            lines.append(f"{qty} {kind} {rng.randint(1, 10**7)}")
    lines.append(" ".join(str(rng.randint(1, 10**7)) for _ in range(m)))
    yield "\n".join(lines) + "\n", False
    # parity: long call short put == forward payoff (includes negatives)
    yield "2 5\n1 C 10000\n-1 P 10000\n5000 9999 10000 10001 15000\n", False


def token_bucket():
    # C=2, R=1 token/sec: burst of 3 -> third rejected; 1s later one token back
    yield ("2 1 6\nORDER 0\nORDER 0\nORDER 0\nORDER 500\nORDER 1000\nORDER 3000\n"), True
    rng = random.Random(42)
    c, r, m = 100, 50, 200000
    t = 0
    lines = [f"{c} {r} {m}"]
    for _ in range(m):
        t += rng.choice([0, 0, 1, 2, 5, 20, 100])
        lines.append(f"ORDER {t}")
    yield "\n".join(lines) + "\n", False
    # int64 stress: huge timestamps, max rate
    yield ("1000000 1000000 4\nORDER 0\nORDER 999999999999\nORDER 999999999999\nORDER 1000000000000\n"), False
    # capacity 1, sub-token refills accumulate across events
    rng = random.Random(9)
    t = 0
    lines = ["1 3 20000"]
    for _ in range(20000):
        t += rng.choice([100, 200, 300, 333, 334])
        lines.append(f"ORDER {t}")
    yield "\n".join(lines) + "\n", False


def binomial_american_put():
    yield "3\n100 100 0.05 0.2 1 100\n100 120 0.05 0.3 2 500\n50 45 0 0.4 1 50\n", True
    rng = random.Random(42)
    q = 100
    lines = [str(q)]
    for _ in range(q):
        S = round(rng.uniform(10, 5000), 2)
        K = round(S * rng.uniform(0.6, 1.5), 2)
        r = round(rng.uniform(0, 0.15), 4)
        sigma = round(rng.uniform(0.05, 1.5), 4)
        T = round(rng.uniform(0.05, 5), 3)
        n = rng.randint(10, 2000)
        lines.append(f"{S} {K} {r} {sigma} {T} {n}")
    yield "\n".join(lines) + "\n", False


def _bond_price_py(F, c, y, n, m):
    periods = n * m
    coupon = c * F / m
    total = 0.0
    for t in range(1, periods + 1):
        cf = coupon + (F if t == periods else 0.0)
        total += cf / (1.0 + y / m) ** t
    return total


def ytm_solver():
    # prices generated FROM known yields -> exact recovery; includes a par bond
    sample = [(1000, 0.05, 0.05, 10, 2), (1000, 0.06, 0.0437, 5, 1), (100, 0.0, 0.071, 30, 2)]
    lines = [str(len(sample))]
    for F, c, y, n, m in sample:
        lines.append(f"{_bond_price_py(F, c, y, n, m):.8f} {F} {c} {n} {m}")
    yield "\n".join(lines) + "\n", True
    rng = random.Random(42)
    q = 500
    lines = [str(q)]
    for _ in range(q):
        F = rng.choice([100, 1000, 10000])
        c = round(rng.uniform(0, 0.15), 4)
        y = round(rng.uniform(0.0005, 0.5), 6)
        n = rng.randint(1, 30)
        m = rng.choice([1, 2])
        lines.append(f"{_bond_price_py(F, c, y, n, m):.8f} {F} {c} {n} {m}")
    yield "\n".join(lines) + "\n", False


def garch_forecast():
    yield "0.00001 0.08 0.90 6 21\n0.01 -0.02 0.015 -0.03 0.005 0.012\n", True
    rng = random.Random(42)
    n = 500000
    returns = " ".join(f"{rng.gauss(0.0002, 0.013):.6f}" for _ in range(n))
    yield f"0.000002 0.05 0.94 {n} 252\n{returns}\n", False
    rng = random.Random(7)
    n = 1000
    returns = " ".join(f"{rng.gauss(0, 0.04):.6f}" for _ in range(n))
    yield f"0.0000899 0.15 0.80 {n} 1\n{returns}\n", False


def markowitz_two_asset():
    yield "3\n0.08 0.2 0.04 0.1 0.3\n0.1 0.25 0.1 0.25 -0.5\n0.05 0.15 0.12 0.3 -1.0\n", True
    rng = random.Random(42)
    q = 1000
    lines = [str(q)]
    for _ in range(q):
        mu1 = round(rng.uniform(-0.2, 0.4), 4)
        mu2 = round(rng.uniform(-0.2, 0.4), 4)
        s1 = round(rng.uniform(0.01, 1), 4)
        s2 = round(rng.uniform(0.01, 1), 4)
        rho = round(rng.uniform(-0.95, 0.95), 4)
        lines.append(f"{mu1} {s1} {mu2} {s2} {rho}")
    yield "\n".join(lines) + "\n", False


def welford_stats():
    yield "5\n100.5 101.5 99.5 100.0 102.5\n", True
    # the killer: huge offset, tiny variation — naive sum-of-squares dies
    rng = random.Random(42)
    n = 200000
    vals = " ".join(f"{100000000 + rng.gauss(0, 1):.4f}" for _ in range(n))
    yield f"{n}\n{vals}\n", False
    rng = random.Random(7)
    n = 50000
    vals = " ".join(f"{rng.uniform(1, 1000):.4f}" for _ in range(n))
    yield f"{n}\n{vals}\n", False


def moving_median():
    yield "8 3\n5 2 8 1 9 3 7 4\n", True
    rng = random.Random(42)
    n, k = 200000, 9999
    vals = " ".join(str(rng.randint(1, 10**9)) for _ in range(n))
    yield f"{n} {k}\n{vals}\n", False
    # heavy duplicates — stresses erase-one-occurrence
    rng = random.Random(9)
    n, k = 100000, 101
    vals = " ".join(str(rng.randint(1, 5)) for _ in range(n))
    yield f"{n} {k}\n{vals}\n", False
    yield "3 1\n7 3 9\n", False


def two_sum_spread():
    yield "6 100\n30 90 10 40 70 60\n", True
    yield "4 5\n1 1 8 9\n", True  # NONE
    rng = random.Random(42)
    n = 200000
    vals = [rng.randint(0, 10**9) for _ in range(n)]
    # plant a pair late so brute force suffers before finding it
    vals[n - 2] = 10**9
    vals[n - 1] = 10**9
    lines = f"{n} {2 * 10**9}\n" + " ".join(map(str, vals)) + "\n"
    yield lines, False
    # duplicates: earliest completion, then earliest i
    yield "6 8\n4 4 4 4 4 4\n", False  # expect 1 2
    yield "5 6\n3 5 1 3 3\n", False    # pairs (1,4),(1,5): expect 1 4
    rng = random.Random(3)
    n = 150000
    vals = " ".join(str(rng.randint(0, 100)) for _ in range(n))
    yield f"{n} 201\n{vals}\n", False  # NONE (max sum 200)


def max_profit_two_trades():
    yield "8\n3 3 5 0 0 3 1 4\n", True   # expected 6: (5-3) + (4-0)
    yield "5\n9 7 6 4 3\n", True         # 0
    rng = random.Random(42)
    n = 300000
    vals = " ".join(str(rng.randint(1, 10**9)) for _ in range(n))
    yield f"{n}\n{vals}\n", False
    yield "6\n1 2 3 4 5 6\n", False      # one trade optimal: 5
    yield "6\n1 5 1 5 1 5\n", False      # two trades: 8
    yield "2\n5 10\n", False             # 5


def merge_halts():
    yield "4\n5 9\n1 5\n20 30\n25 40\n", True
    yield "1\n0 1000000000000\n", True
    rng = random.Random(42)
    n = 200000
    lines = [str(n)]
    for _ in range(n):
        s = rng.randint(0, 10**12 - 10**6)
        e = s + rng.randint(1, 10**6)
        lines.append(f"{s} {e}")
    yield "\n".join(lines) + "\n", False
    # nested + touching chains
    yield "5\n1 10\n2 3\n10 12\n12 13\n50 60\n", False


def book_imbalance():
    yield "4 0.5\n10000 300 10002 100\n10000 300 10002 300\n10000 900 10002 100\n10000 100 10002 900\n", True
    rng = random.Random(42)
    n = 150000
    lines = [f"{n} 0.33"]
    for _ in range(n):
        pb = rng.randint(100, 10**7 - 10)
        pa = pb + rng.randint(1, 10)
        lines.append(f"{pb} {rng.randint(1, 10**6)} {pa} {rng.randint(1, 10**6)}")
    yield "\n".join(lines) + "\n", False


def bs_greeks():
    yield "3\n100 100 0.05 0.2 1\n100 120 0.05 0.2 0.5\n50 45 0.02 0.35 2\n", True
    rng = random.Random(42)
    q = 500
    lines = [str(q)]
    for _ in range(q):
        s = round(rng.uniform(1, 500), 2)
        k = round(rng.uniform(1, 500), 2)
        r = round(rng.uniform(0, 0.2), 4)
        sig = round(rng.uniform(0.05, 1.5), 4)
        t = round(rng.uniform(0.01, 30), 4)
        lines.append(f"{s} {k} {r} {sig} {t}")
    yield "\n".join(lines) + "\n", False


def _gbm_path(rng, s0, mu, sigma_real, T, n):
    import math
    dt = T / n
    path = []
    s = s0
    for _ in range(n):
        s *= math.exp((mu - 0.5 * sigma_real**2) * dt + sigma_real * math.sqrt(dt) * rng.gauss(0, 1))
        path.append(f"{s:.6f}")
    return path


def delta_hedge_pnl():
    rng = random.Random(42)
    # calm path: realized 10% vs implied 30% -> hedged PnL clearly positive
    path = _gbm_path(rng, 100, 0.05, 0.10, 1.0, 252)
    yield "100 100 0.05 0.30 1.0 252\n" + " ".join(path) + "\n", True
    # wild path: realized 60% vs implied 20% -> hedged PnL negative
    rng = random.Random(7)
    path = _gbm_path(rng, 100, 0.0, 0.60, 0.5, 126)
    yield "100 105 0.03 0.20 0.5 126\n" + " ".join(path) + "\n", False
    # fine discretization, realized == implied -> small residual
    rng = random.Random(11)
    path = _gbm_path(rng, 200, 0.02, 0.25, 1.0, 100000)
    yield "200 210 0.02 0.25 1.0 100000\n" + " ".join(path) + "\n", False


def ols_regression():
    yield ("6\n0.01 -0.02 0.015 -0.005 0.02 -0.01\n0.014 -0.025 0.02 -0.004 0.024 -0.015\n"), True
    rng = random.Random(42)
    n = 300000
    xs, ys = [], []
    for _ in range(n):
        x = rng.gauss(0.0002, 0.012)
        xs.append(f"{x:.6f}")
        ys.append(f"{1.3 * x + rng.gauss(0, 0.008):.6f}")
    yield f"{n}\n{' '.join(xs)}\n{' '.join(ys)}\n", False
    # the cancellation killer: big common level, tiny variation (prices, not returns)
    rng = random.Random(9)
    n = 100000
    xs, ys = [], []
    for _ in range(n):
        x = 50000.0 + rng.gauss(0, 1)
        xs.append(f"{x:.6f}")
        ys.append(f"{0.8 * x + 10000 + rng.gauss(0, 0.5):.6f}")
    yield f"{n}\n{' '.join(xs)}\n{' '.join(ys)}\n", False


def memory_pool():
    yield ("3 9\nALLOC\nALLOC\nFREE 0\nALLOC\nALLOC\nALLOC\nFREE 1\nFREE 1\nALLOC\n"), True
    rng = random.Random(42)
    n, m = 1000000, 400000
    lines = [f"{n} {m}"]
    held = []
    for _ in range(m):
        if rng.random() < 0.6 or not held:
            lines.append("ALLOC")
            held.append(len(held))  # placeholder; actual indices tracked by solution
        else:
            lines.append(f"FREE {rng.randint(0, min(len(held) * 2, n - 1))}")
    yield "\n".join(lines) + "\n", False
    # tiny pool, heavy churn and double-frees
    rng = random.Random(3)
    lines = ["2 50000"]
    for _ in range(50000):
        lines.append("ALLOC" if rng.random() < 0.5 else f"FREE {rng.randint(0, 1)}")
    yield "\n".join(lines) + "\n", False


GENERATORS = {
    "bs-greeks": bs_greeks,
    "delta-hedge-pnl": delta_hedge_pnl,
    "ols-regression": ols_regression,
    "memory-pool": memory_pool,
    "binomial-american-put": binomial_american_put,
    "ytm-solver": ytm_solver,
    "garch-forecast": garch_forecast,
    "markowitz-two-asset": markowitz_two_asset,
    "welford-stats": welford_stats,
    "moving-median": moving_median,
    "two-sum-spread": two_sum_spread,
    "max-profit-two-trades": max_profit_two_trades,
    "merge-halts": merge_halts,
    "book-imbalance": book_imbalance,
    "token-bucket": token_bucket,
    "time-value-calculator": time_value_calculator,
    "option-payoff": option_payoff,
    "implied-volatility": implied_volatility,
    "bond-pricer": bond_pricer,
    "currency-arbitrage": currency_arbitrage,
    "ewma-volatility": ewma_volatility,
    "binary-feed-decoder": binary_feed_decoder,
    "single-trade-max-profit": single_trade_max_profit,
    "lru-cache": lru_cache,
    "fixed-point-price": fixed_point_price,
    "ring-buffer": ring_buffer,
    "order-book": order_book,
    "rolling-vwap": rolling_vwap,
    "prefix-pnl": prefix_pnl,
    "sliding-window-max": sliding_window_max,
    "top-of-book": top_of_book,
    "order-matching": order_matching,
    "black-scholes-pricer": black_scholes_pricer,
    "monte-carlo-option": monte_carlo_option,
    "portfolio-var": portfolio_var,
    "fix-checksum": fix_checksum,
}


def build(slug):
    problem_dir = PROBLEMS / slug
    solution = problem_dir / "solution.cpp"
    with tempfile.TemporaryDirectory() as tmp:
        binary = Path(tmp) / "sol"
        subprocess.run(
            ["clang++", "-std=c++20", "-O2", "-o", str(binary), str(solution)],
            check=True,
        )
        cases = []
        for input_text, sample in GENERATORS[slug]():
            run = subprocess.run(
                [str(binary)], input=input_text, capture_output=True, text=True, timeout=30
            )
            if run.returncode != 0:
                raise RuntimeError(f"{slug}: solution exited {run.returncode}\n{run.stderr}")
            cases.append({"input": input_text, "output": run.stdout, "sample": sample})
    (problem_dir / "tests.yaml").write_text(json.dumps(cases, indent=1))
    sizes = [len(c["input"]) for c in cases]
    print(f"{slug}: {len(cases)} tests written (max input {max(sizes)} bytes)")


def main():
    slugs = sys.argv[1:] or sorted(GENERATORS)
    for slug in slugs:
        build(slug)


if __name__ == "__main__":
    main()
