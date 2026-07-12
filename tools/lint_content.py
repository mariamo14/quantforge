#!/usr/bin/env python3
"""Content linter: catches the KaTeX currency bug and structural regressions.

The renderer treats $...$ as inline math (remark-math). A bare currency amount
like "$200 and earn 5%... $10" pairs two literal dollars into one math span and
shreds the prose. Currency must be written \\$200; math spans must contain
math, not sentences.

Checks:
  1. suspicious math spans — a $...$ whose content reads like prose
  2. unescaped currency — $ immediately followed by a digit, outside math
  3. lesson structure — frontmatter, '## Interview checkpoints'
  4. quiz YAML — parseable, 2+ choices, answer index in range

Exit code 1 if any check fails. Usage: python3 tools/lint_content.py
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"

failures = []


def spans_of_inline_math(text):
    """Yield (start, content) for each $...$ span, honoring \\$ escapes and $$ blocks."""
    # remove display math first so it can't confuse the scan
    text = re.sub(r"\$\$.*?\$\$", lambda m: " " * len(m.group(0)), text, flags=re.S)
    i = 0
    while i < len(text):
        if text[i] == "$" and (i == 0 or text[i - 1] != "\\"):
            j = i + 1
            while j < len(text):
                if text[j] == "$" and text[j - 1] != "\\":
                    break
                j += 1
            if j < len(text):
                yield i, text[i + 1 : j]
                i = j + 1
                continue
            else:
                yield i, None  # unpaired
                return
        i += 1


PROSE_HINTS = re.compile(r"[a-zA-Z]{3,} [a-zA-Z]{3,} [a-zA-Z]{3,}")  # 3+ real words
MATH_CHARS = re.compile(r"[\\^_{}=<>]|\\frac|\\sum|\\sqrt|\\sigma|\\mu|\\Delta")


def check_markdown(path):
    text = path.read_text()
    rel = path.relative_to(ROOT)

    for start, content in spans_of_inline_math(text):
        line = text.count("\n", 0, start) + 1
        if content is None:
            failures.append(f"{rel}:{line}: unpaired $ — escape currency as \\$")
            break
        # a span that reads like a sentence and contains no math syntax is the bug
        if PROSE_HINTS.search(content) and not MATH_CHARS.search(content):
            failures.append(f"{rel}:{line}: math span looks like prose: ${content[:60]}...$")
        # currency captured into math: $200 and ... (digits right after opening $)
        if re.match(r"\d[\d,]*(\.\d+)?\s+[a-zA-Z]{2,}\s", content or ""):
            failures.append(f"{rel}:{line}: currency swallowed by math span: ${content[:60]}$")


def check_lesson(path):
    text = path.read_text()
    rel = path.relative_to(ROOT)
    if not text.startswith("---"):
        failures.append(f"{rel}: missing frontmatter")
    if "## Interview checkpoints" not in text:
        failures.append(f"{rel}: missing '## Interview checkpoints'")
    check_markdown(path)


def check_quiz(path):
    import json
    rel = path.relative_to(ROOT)
    try:
        import yaml  # type: ignore
        data = yaml.safe_load(path.read_text())
    except ImportError:
        data = None  # PyYAML absent: structural YAML check happens in the Java seeder/tests
    except Exception as e:
        failures.append(f"{rel}: YAML parse error: {e}")
        return
    if data is not None:
        for i, q in enumerate(data.get("questions", [])):
            choices = q.get("choices", [])
            if len(choices) < 2:
                failures.append(f"{rel}: question {i} has <2 choices")
            if not (0 <= q.get("answer", -1) < len(choices)):
                failures.append(f"{rel}: question {i} answer index out of range")
    # the $ bug applies to quiz prompts/explanations too
    check_markdown(path)


def main():
    for lesson in sorted((CONTENT / "lessons").glob("*.md")):
        check_lesson(lesson)
    for md in sorted((CONTENT / "problems").glob("*/*.md")):
        check_markdown(md)
    for quiz in sorted((CONTENT / "quizzes").glob("*.yaml")):
        check_quiz(quiz)

    if failures:
        print(f"{len(failures)} content problems:")
        for f in failures:
            print(" ", f)
        sys.exit(1)
    print("content lint: clean")


if __name__ == "__main__":
    main()
