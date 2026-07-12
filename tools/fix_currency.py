#!/usr/bin/env python3
"""Repair the KaTeX currency bug across all content.

Walks each markdown/YAML file character by character. At every unescaped $,
it looks at the would-be inline-math span up to the next unescaped $:

  - if the content looks like LaTeX (math characters, short, no prose),
    the span is kept as math;
  - otherwise the opening $ is escaped to \\$ (it was a currency sign or a
    stray), and scanning resumes — the closing candidate gets evaluated as
    a fresh opener in turn.

Code fences, inline code, and $$display math$$ are left untouched.
Run tools/lint_content.py afterwards; residual flags need a human.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"

# characters that only appear in LaTeX, never in prose or YAML structure
STRONG_MATH = re.compile(r"[\\^_{}|]")
PROSE = re.compile(r"[a-zA-Z]{3,} [a-zA-Z]{3,} [a-zA-Z]{3,}")
TWO_WORDS = re.compile(r"[a-zA-Z]{2,}\s+[a-zA-Z]{2,}")
MATHY_CHARSET = re.compile(r"[0-9a-zA-Z\s+\-*/().,\[\]×≈~=<>!]*\Z")


def is_math(content):
    if content is None or "\n\n" in content or len(content) > 120:
        return False
    if PROSE.search(content):
        return False
    # LaTeX markers win: "$1 \le N \le 5000$" is math even though it starts with a digit
    if STRONG_MATH.search(content):
        return True
    # a leading number followed by a comparison or range is math: $0 < q < 1$, $0..N-1$
    if re.match(r"\d+(\.\d+)?\s*(\.\.|[<>=≤≥])", content):
        return True
    # currency-style: digits (possibly , or .) then end/space/punctuation —
    # "$200 and ...", "$3,000", "$60." mid-sentence
    if re.match(r"\d[\d,]*(\.\d+)?($|[\s.,;:!?)\"'])", content):
        return False
    # two adjacent words or an English stopword = prose fragment, not a formula
    if TWO_WORDS.search(content):
        return False
    if re.search(r"\b(and|or|the|of|to|is|not|a)\b", content):
        return False
    # short plain expressions like $t + s$, $c = y$, $C - P = S - K$, $(i, j)$
    return len(content) <= 40 and MATHY_CHARSET.match(content) is not None


def normalize(text):
    """Un-escape every \\$ back to $ (outside code fences) so repair() can
    re-decide each one with current rules — makes the whole tool idempotent
    and self-healing after rule changes."""
    out = []
    i = 0
    n = len(text)
    in_fence = False
    while i < n:
        if text.startswith("```", i):
            in_fence = not in_fence
            out.append("```")
            i += 3
            continue
        if not in_fence and text.startswith("\\$", i):
            out.append("$")
            i += 2
            continue
        out.append(text[i])
        i += 1
    return "".join(out)


def repair(text):
    text = normalize(text)
    out = []
    i = 0
    n = len(text)
    in_fence = False
    changed = 0
    while i < n:
        ch = text[i]
        # toggle code fences (``` at line start)
        if ch == "`" and text.startswith("```", i):
            in_fence = not in_fence
            out.append("```")
            i += 3
            continue
        if in_fence:
            out.append(ch)
            i += 1
            continue
        # skip inline code spans
        if ch == "`":
            j = text.find("`", i + 1)
            j = j if j != -1 else n - 1
            out.append(text[i : j + 1])
            i = j + 1
            continue
        # protect display math
        if ch == "$" and text.startswith("$$", i):
            j = text.find("$$", i + 2)
            j = j + 2 if j != -1 else n
            out.append(text[i:j])
            i = j
            continue
        if ch == "$" and (i == 0 or text[i - 1] != "\\"):
            # candidate span: up to next unescaped $ (not $$)
            j = i + 1
            content = None
            while j < n:
                if text[j] == "$" and text[j - 1] != "\\" and not text.startswith("$$", j):
                    content = text[i + 1 : j]
                    break
                j += 1
            if content is not None and is_math(content):
                out.append(text[i : j + 1])
                i = j + 1
            else:
                out.append("\\$")
                changed += 1
                i += 1
            continue
        out.append(ch)
        i += 1
    return "".join(out), changed


YAML_QUOTED_LINE = re.compile(r'^([^"\n]*)"(.*)"(\s*)$', re.M)


def yaml_quote_fix(text):
    """In double-quoted YAML scalars, \\$ is an invalid escape — it must be
    written \\\\$ so SnakeYAML decodes it back to a literal backslash-dollar.
    Applied after repair() to .yaml files only; block scalars are untouched
    because they never match the full-line quoted pattern."""

    def fix_line(m):
        body = re.sub(r"(?<!\\)\\\$", r"\\\\$", m.group(2))
        return f'{m.group(1)}"{body}"{m.group(3)}'

    return YAML_QUOTED_LINE.sub(fix_line, text)


def main():
    targets = list((CONTENT / "lessons").glob("*.md")) \
        + list((CONTENT / "problems").glob("*/*.md")) \
        + list((CONTENT / "quizzes").glob("*.yaml"))
    total = 0
    for path in sorted(targets):
        text = path.read_text()
        fixed, changed = repair(text)
        if path.suffix == ".yaml":
            fixed = yaml_quote_fix(fixed)
        if fixed != text:
            path.write_text(fixed)
            print(f"{path.relative_to(ROOT)}: rewritten ({changed} escapes in final form)")
            total += 1
    print(f"done: {total} files updated")


if __name__ == "__main__":
    main()
