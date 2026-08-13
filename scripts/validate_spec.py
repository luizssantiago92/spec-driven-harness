#!/usr/bin/env python3
"""Closure gate for `.specs/features/[feature]/spec.md`.

Run before confirming a spec with the project owner:

    python3 validate_spec.py .specs/features/auth/spec.md

The feature can be named instead of pathed:

    python3 validate_spec.py auth
    python3 validate_spec.py            # when the project has a single feature

Checks:
  * required sections are present (Requirements, Assumptions, Out of Scope)
  * at least one well-formed requirement ID (REQ-001 style)
  * every requirement carries at least one acceptance criterion
  * every criterion states a required outcome (SHALL or MUST)
  * no unresolved placeholders (TBD, TODO, <fill me>)
  * EARS shape (WHEN ... THEN ...) is reported as a warning

Exit codes: 0 pass, 1 blocking issues, 2 usage error.
"""

from __future__ import annotations

import argparse
import re
import sys

from _common import Report, find_placeholders, has_section, resolve_artifact

GATE = "validate-spec"

REQUIREMENT_HEADING = re.compile(
    r"^(?P<level>#{2,6})\s*(?P<id>[A-Z][A-Z0-9]{1,9}-\d{2,4})\s*[:\-–]?\s*(?P<title>.*)$",
    re.MULTILINE,
)
ANY_HEADING = re.compile(r"^(?P<level>#{1,6})\s+\S", re.MULTILINE)
MALFORMED_ID = re.compile(r"^#{2,6}\s*(REQ|req)[\s_]*(\d{1,4})\b", re.MULTILINE)
ACCEPTANCE_LABEL = re.compile(r"(acceptance criteri|\bAC\b)", re.IGNORECASE)
METADATA_KEY = re.compile(
    r"^\*{0,2}(owner|priority|status|estimate|risk|risks|files|file|notes|note|"
    r"tags|links|link|related|depends on|reuses|source|epic|milestone)\*{0,2}\s*:",
    re.IGNORECASE,
)
# A criterion without a normative verb states an intention, not an outcome a test
# can assert, so it blocks. The EARS lead keyword sharpens it further and is
# reported as a warning.
NORMATIVE_VERB = re.compile(r"\b(SHALL|MUST)\b", re.IGNORECASE)
EARS_LEAD = re.compile(
    r"\b(WHEN|IF|WHILE|WHERE)\b.*\bTHEN\b", re.IGNORECASE | re.DOTALL
)
REQUIRED_SECTIONS = ("Requirements", "Assumptions", "Out of Scope")


def split_requirements(text: str) -> list[tuple[str, str, str]]:
    """Return (id, title, body) for each requirement heading in document order.

    A requirement body ends at the next heading of the same or higher level, so a
    trailing section such as `## Out of Scope` is never absorbed into the last
    requirement.
    """

    requirements: list[tuple[str, str, str]] = []

    for match in REQUIREMENT_HEADING.finditer(text):
        level = len(match.group("level"))
        start = match.end()
        end = len(text)

        for heading in ANY_HEADING.finditer(text, start):
            if len(heading.group("level")) <= level:
                end = heading.start()
                break

        requirements.append(
            (match.group("id"), match.group("title").strip(), text[start:end])
        )

    return requirements


def acceptance_lines(body: str) -> list[str]:
    """Collect candidate acceptance-criteria lines from a requirement body."""

    lines: list[str] = []
    in_labeled_block = False

    for raw_line in body.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        if ACCEPTANCE_LABEL.search(line):
            in_labeled_block = True
            remainder = re.split(r"[:\-–]", line, maxsplit=1)
            if len(remainder) == 2 and remainder[1].strip():
                lines.append(remainder[1].strip())
            continue

        if line.startswith(("-", "*", "|")) or re.match(r"^\d+\.", line):
            cleaned = line.lstrip("-*| ").strip()
            if cleaned and not cleaned.startswith("---"):
                if METADATA_KEY.match(cleaned):
                    continue
                lines.append(cleaned)
                continue

        if in_labeled_block and not line.startswith("#"):
            lines.append(line)

    return lines


def build_report(target: str, text: str) -> Report:
    report = Report(gate=GATE, target=target)

    for section in REQUIRED_SECTIONS:
        if has_section(text, section):
            report.ok(f"section present: {section}")
        else:
            report.error(f"missing required section: ## {section}")

    requirements = split_requirements(text)

    if not requirements:
        report.error(
            "no requirement headings found - use '### REQ-001: Title' (prefix-NNN)"
        )
    else:
        report.ok(f"{len(requirements)} requirement(s) with well-formed IDs")

    seen: set[str] = set()
    for requirement_id, title, body in requirements:
        if requirement_id in seen:
            report.error(f"duplicate requirement ID: {requirement_id}")
        seen.add(requirement_id)

        if not title:
            report.error(f"{requirement_id}: heading has no title")

        criteria = acceptance_lines(body)
        if not criteria:
            report.error(f"{requirement_id}: no acceptance criteria found")
            continue

        for item in criteria:
            excerpt = item if len(item) <= 70 else f"{item[:67]}..."

            if not NORMATIVE_VERB.search(item):
                report.error(
                    f"{requirement_id}: criterion is not testable, it states no "
                    f"required outcome (add SHALL or MUST): '{excerpt}'"
                )
                continue

            if not EARS_LEAD.search(item):
                report.warn(
                    f"{requirement_id}: criterion has SHALL/MUST but no trigger "
                    f"(WHEN/IF ... THEN ...): '{excerpt}'"
                )

            if len(item.split()) < 4:
                report.warn(f"{requirement_id}: criterion looks too vague: '{excerpt}'")

    for malformed in MALFORMED_ID.finditer(text):
        raw = malformed.group(0).lstrip("# ").strip()
        if not REQUIREMENT_HEADING.match(f"### {raw}"):
            report.error(f"malformed requirement ID: '{raw}' - expected REQ-001 style")

    placeholders = find_placeholders(text)
    if placeholders:
        for item in placeholders[:10]:
            report.error(f"unresolved placeholder at {item}")
    else:
        report.ok("no unresolved placeholders")

    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate a feature spec.md")
    parser.add_argument(
        "spec",
        nargs="?",
        help="feature name, feature directory, or path to spec.md",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="treat warnings as blocking failures",
    )
    args = parser.parse_args(argv)

    path, text = resolve_artifact(args.spec, "spec.md", GATE)
    report = build_report(str(path), text)
    return report.emit(strict=args.strict)


if __name__ == "__main__":
    sys.exit(main())
