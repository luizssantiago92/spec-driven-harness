"""Shared helpers for the Spec-Driven Harness structural gates.

Gates are deterministic: they read an artifact, apply structural checks, and exit
non-zero when the artifact is not ready for the next phase. They never mutate
project files.

Exit codes:
    0 - gate passed (warnings may still be printed)
    1 - gate failed; fix the artifact before proceeding
    2 - usage error (missing file, bad arguments)

Inspired by the deterministic-gate approach of Tech Lead's Club Spec-Driven
(CC-BY-4.0, github.com/tech-leads-club/agent-skills). Implementation is original
and targets this harness's `.specs/` layout.
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

EXIT_OK = 0
EXIT_FAILED = 1
EXIT_USAGE = 2

PLACEHOLDER_PATTERNS = (
    re.compile(r"\bTBD\b", re.IGNORECASE),
    re.compile(r"\bTODO\b"),
    re.compile(r"\bFIXME\b"),
    re.compile(r"\bXXX\b"),
    re.compile(r"<[a-z][a-z0-9 _-]*>", re.IGNORECASE),
    re.compile(r"\[(?:feature|name|description|fill me|placeholder)\]", re.IGNORECASE),
)


@dataclass
class Report:
    """Collects gate findings and renders a deterministic summary."""

    gate: str
    target: str
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    checks: list[str] = field(default_factory=list)

    def error(self, message: str) -> None:
        self.errors.append(message)

    def warn(self, message: str) -> None:
        self.warnings.append(message)

    def ok(self, message: str) -> None:
        self.checks.append(message)

    @property
    def passed(self) -> bool:
        return not self.errors

    def emit(self, strict: bool = False) -> int:
        status = "PASS" if self.passed else "FAIL"
        print(f"[{self.gate}] {status} - {self.target}")

        for check in self.checks:
            print(f"  ok      {check}")
        for warning in self.warnings:
            print(f"  warn    {warning}")
        for error in self.errors:
            print(f"  error   {error}")

        if strict and self.warnings and self.passed:
            print("  error   strict mode: warnings are treated as failures")
            return EXIT_FAILED

        if not self.passed:
            print(
                f"\n{len(self.errors)} blocking issue(s). "
                "Fix the artifact and re-run this gate before proceeding."
            )
            return EXIT_FAILED

        return EXIT_OK


def read_artifact(raw_path: str, report_gate: str) -> tuple[Path, str]:
    """Resolve and read a required artifact, exiting with EXIT_USAGE on problems."""

    path = Path(raw_path).expanduser()

    if not path.exists():
        print(f"[{report_gate}] FAIL - {path}")
        print(f"  error   file not found: {path}")
        sys.exit(EXIT_USAGE)

    if path.is_dir():
        print(f"[{report_gate}] FAIL - {path}")
        print(f"  error   expected a file, got a directory: {path}")
        sys.exit(EXIT_USAGE)

    text = path.read_text(encoding="utf-8")

    if not text.strip():
        print(f"[{report_gate}] FAIL - {path}")
        print("  error   file is empty")
        sys.exit(EXIT_FAILED)

    return path, text


def find_placeholders(text: str) -> list[str]:
    """Return unresolved placeholder tokens found in the artifact."""

    found: list[str] = []

    for line_number, line in enumerate(text.splitlines(), start=1):
        stripped = line.strip()
        if stripped.startswith("<!--") or stripped.startswith("```"):
            continue
        for pattern in PLACEHOLDER_PATTERNS:
            match = pattern.search(line)
            if match:
                found.append(f"line {line_number}: {match.group(0)}")
                break

    return found


def has_section(text: str, heading: str) -> bool:
    """Case-insensitive check for a markdown heading anywhere in the document."""

    pattern = re.compile(rf"^#{{1,6}}\s+{re.escape(heading)}\s*$", re.IGNORECASE | re.MULTILINE)
    return bool(pattern.search(text))


def section_body(text: str, heading: str) -> str:
    """Return the raw body under a heading, up to the next heading of same/higher level."""

    lines = text.splitlines()
    start = None
    level = 0

    for index, line in enumerate(lines):
        match = re.match(rf"^(#{{1,6}})\s+{re.escape(heading)}\s*$", line.strip(), re.IGNORECASE)
        if match:
            start = index + 1
            level = len(match.group(1))
            break

    if start is None:
        return ""

    body: list[str] = []
    for line in lines[start:]:
        heading_match = re.match(r"^(#{1,6})\s+", line)
        if heading_match and len(heading_match.group(1)) <= level:
            break
        body.append(line)

    return "\n".join(body)
