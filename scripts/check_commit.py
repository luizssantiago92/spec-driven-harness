#!/usr/bin/env python3
"""Conventional Commits gate for guardrails commits.

Run before each atomic commit:

    python3 check_commit.py --message "feat(auth): add token refresh"
    python3 check_commit.py --file .git/COMMIT_EDITMSG

Wire it as a git hook to enforce the format without agent involvement:

    #!/bin/sh
    python3 .specs/guardrails/scripts/check_commit.py --file "$1"

Checks:
  * `type(scope): subject` shape with an allowed type
  * subject is present, lowercase-initial, without a trailing period
  * subject length within 72 characters
  * body separated from subject by a blank line

Exit codes: 0 pass, 1 blocking issues, 2 usage error.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from _common import EXIT_USAGE, Report

GATE = "check-commit"

ALLOWED_TYPES = (
    "feat",
    "fix",
    "docs",
    "style",
    "refactor",
    "perf",
    "test",
    "build",
    "ci",
    "chore",
    "revert",
)

HEADER = re.compile(
    r"^(?P<type>[a-z]+)(?:\((?P<scope>[^()]+)\))?(?P<breaking>!)?:\s(?P<subject>.+)$"
)
MAX_SUBJECT_LENGTH = 72


def build_report(message: str) -> Report:
    lines = message.rstrip().splitlines()
    header = lines[0].strip() if lines else ""
    report = Report(gate=GATE, target=header or "(empty message)")

    if not header:
        report.error("commit message is empty")
        return report

    if header.startswith(("Merge ", "Revert ", "fixup!", "squash!")):
        report.ok("merge/fixup commit - format check skipped")
        return report

    match = HEADER.match(header)
    if not match:
        report.error(
            "header does not follow Conventional Commits "
            "- expected 'type(scope): subject'"
        )
        return report

    commit_type = match.group("type")
    subject = match.group("subject").strip()

    if commit_type in ALLOWED_TYPES:
        report.ok(f"type '{commit_type}' is allowed")
    else:
        report.error(
            f"unknown type '{commit_type}' - allowed: {', '.join(ALLOWED_TYPES)}"
        )

    scope = match.group("scope")
    if scope is not None and not scope.strip():
        report.error("scope parentheses are empty")

    if not subject:
        report.error("subject is empty")
    else:
        if subject.endswith("."):
            report.error("subject must not end with a period")
        if subject[0].isupper() and not subject.split()[0].isupper():
            report.warn("subject starts with an uppercase letter - prefer lowercase")
        if len(header) > MAX_SUBJECT_LENGTH:
            report.error(
                f"header is {len(header)} characters - keep it within {MAX_SUBJECT_LENGTH}"
            )
        else:
            report.ok(f"header length {len(header)}/{MAX_SUBJECT_LENGTH}")

    if len(lines) > 1 and lines[1].strip():
        report.error("body must be separated from the subject by a blank line")

    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate a commit message")
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--message", help="commit message text")
    source.add_argument("--file", help="path to a file holding the commit message")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="treat warnings as blocking failures",
    )
    args = parser.parse_args(argv)

    if args.file:
        path = Path(args.file).expanduser()
        if not path.exists():
            print(f"[{GATE}] FAIL - {path}")
            print(f"  error   file not found: {path}")
            return EXIT_USAGE
        message = path.read_text(encoding="utf-8")
    else:
        message = args.message or ""

    comment_free = "\n".join(
        line for line in message.splitlines() if not line.startswith("#")
    )

    report = build_report(comment_free)
    return report.emit(strict=args.strict)


if __name__ == "__main__":
    sys.exit(main())
