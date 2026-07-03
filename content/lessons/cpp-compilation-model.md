---
title: How C++ Builds: The Compilation Model
minutes: 12
---

If you come from Java or Python, you're used to a runtime that stands between your code and the machine: a JVM interpreting bytecode, or CPython walking your source. C++ has no VM and no interpreter. Your source code is translated, ahead of time, into native machine instructions that the OS runs directly. That's where the speed comes from — and where a whole family of unfamiliar errors comes from too. Understanding the build pipeline demystifies at least half of all beginner C++ errors, so let's walk through it.

## The pipeline: four stages

A C++ build has four conceptual stages:

1. **Preprocessor** — a text-manipulation pass. `#include "pricer.h"` literally pastes the entire contents of `pricer.h` into your file, as if you'd typed it there. `#define` does textual substitution. No C++ semantics yet — just text. *What goes wrong:* include the same header twice and you paste the same declarations twice; include a huge header and every file that includes it gets bigger and slower to compile.

2. **Compiler** — each preprocessed source file (now called a **translation unit**) is compiled *independently* into an **object file** (`.o`): machine code plus a table of names it defines and names it uses but doesn't have. The compiler never sees your other files. *What goes wrong:* if you call `price_option(...)` and the compiler hasn't seen a **declaration** telling it the function's name and signature, you get a compile error. This is *why headers exist* — they carry declarations so every translation unit knows what's available elsewhere.

3. **Linker** — stitches all the object files (and libraries) into one native binary, resolving each "I use this name" against exactly one "I define this name." *What goes wrong:* two classic errors, covered below.

4. **The binary** — a self-contained native executable. No VM warms up; it just runs.

## The two linker errors you will absolutely see

**`undefined reference`** — you declared something (the compiler was satisfied) but never *defined* it anywhere, or forgot to pass the object file that defines it to the linker. Declaration says "this exists"; definition is the actual body.

**`multiple definition`** — you put a function *definition* (with a body) in a header, and two source files included that header. Text-pasting means the function now exists in two object files, and the linker refuses to pick. Fixes: define it in exactly one `.cpp` file, or mark it `inline` in the header (which, in modern C++, mostly means "duplicates across translation units are allowed and merged").

## Headers vs. sources: the discipline

Headers (`.h`) hold **declarations** — the interface. Sources (`.cpp`) hold **definitions** — the implementation. A minimal two-file example:

```cpp
// pricer.h
#pragma once

double mid_price(double bid, double ask);  // declaration only
```

```cpp
// pricer.cpp
#include "pricer.h"

double mid_price(double bid, double ask) {  // the one definition
    return (bid + ask) / 2.0;
}
```

```cpp
// main.cpp
#include <iostream>
#include "pricer.h"

int main() {
    std::cout << mid_price(99.5, 100.5) << '\n';
}
```

Build it:

```cpp
// Compile each translation unit to an object file:
//   clang++ -std=c++20 -c pricer.cpp -o pricer.o
//   clang++ -std=c++20 -c main.cpp   -o main.o
// Link them into a binary:
//   clang++ pricer.o main.o -o pricer_app
// Or, for small projects, one shot:
//   clang++ -std=c++20 pricer.cpp main.cpp -o pricer_app
```

`#pragma once` at the top of every header tells the preprocessor "if this file gets included twice in one translation unit, only paste it once." It's the modern replacement for old-style include guards; use it reflexively.

## The One Definition Rule, honestly

The ODR says: every entity must have exactly one definition across the whole program (with an exception for `inline` and templates, where multiple *identical* copies are permitted and merged). If you break it and the linker catches it, you get an error. If you break it in a way the linker *can't* catch — say, two different definitions of the same class in different translation units — the program is simply invalid and can misbehave without any diagnostic. That's the honest part: the ODR is a rule you must uphold, not one the toolchain fully enforces. Header/source discipline plus `#pragma once` keeps you safe in practice.

## Why builds are slow, and what that means daily

Because `#include` is textual pasting, a single popular header can be recompiled thousands of times across a codebase. Big C++ projects take minutes to hours to build from scratch. Day-to-day this means: keep headers lean, include only what you use, prefer forward declarations where possible, and rely on incremental builds (only recompiling changed translation units). C++20 **modules** are the long-term fix — real importable interfaces instead of text pasting — but adoption is still ramping up.

## Optimization levels

`-O0` (default) compiles fast and keeps machine code close to your source — every variable exists, every line maps cleanly — ideal for debugging. `-O2` lets the compiler inline, vectorize, reorder, and delete code aggressively; it's often several times faster but confusing under a debugger. Standing advice: **debug at `-O0` (with `-g`), ship and benchmark at `-O2`.** Never benchmark `-O0` — the numbers are meaningless.

## Why trading firms care

Latency-sensitive shops live in C++, and build hygiene questions genuinely get asked: "what does the linker do?", "why did you get a multiple-definition error?", "what does `inline` really mean?" Answering crisply signals you've actually shipped C++, not just solved puzzles in an online editor.

## Interview checkpoints

- Trace the pipeline: preprocessor (text pasting) → translation units → compiler (object files) → linker (native binary). No VM anywhere.
- `undefined reference` = declared but never defined (or object file not linked); `multiple definition` = defined in a header without `inline`.
- Headers carry declarations, sources carry definitions; `#pragma once` prevents double-pasting within a translation unit.
- ODR: exactly one definition per entity program-wide; `inline`/templates allow identical duplicates; some violations produce no diagnostic at all.
- Debug at `-O0 -g`; ship and benchmark at `-O2` — never benchmark unoptimized builds.
