#!/usr/bin/env python3
"""REQ → tasks → validation coverage chain (structural).

Run after Tasks, and again when validation.md exists:

    python3 validate_traceability.py auth
    python3 validate_traceability.py .specs/features/003-chat-system

Checks (markdown structure only — not that tests assert criteria):
  * every spec requirement ID appears in at least one task Requirement field
  * every task Requirement references a known spec requirement ID
  * when validation.md exists: every spec REQ has test file:line on the same
    coverage line (evidence pattern only)

Does not require Verdict PASS, discrimination sensor, or open-gap checks —
use validate-state for completion.

Exit codes: 0 pass, 1 blocking issues, 2 usage error.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from _common import (
    Report,
    requirement_ids,
    resolve_feature_dir,
    visible_markdown,
)

GATE = "validate-traceability"

TASK_FIELD = re.compile(
    r"^\s*[-*]?\s*\*{0,2}(?P<key>[A-Za-z][A-Za-z ]+?)\*{0,2}\s*:\s*(?P<value>.+?)\s*$",
    re.MULTILINE,
)
REQUIREMENT_REF = re.compile(r"\b[A-Z][A-Z0-9]{1,9}-\d{2,4}\b")
EVIDENCE = re.compile(r"[\w./\\-]+\.[A-Za-z][A-Za-z0-9]{0,9}:\d{1,6}\b")
URL = re.compile(r"\b[a-z][a-z0-9+.-]*://\S+", re.IGNORECASE)
TEST_EVIDENCE = re.compile(
    r"(?:^|/)(?:tests?|__tests__|spec)(?:/|$)|[._-](?:test|spec)\.|test_[^/]+\.",
    re.IGNORECASE,
)


def task_requirement_ids(tasks_text: str) -> set[str]:
    ids: set[str] = set()
    for match in TASK_FIELD.finditer(tasks_text):
        if match.group("key").strip().lower() != "requirement":
            continue
        ids.update(REQUIREMENT_REF.findall(match.group("value")))
    return ids


def find_test_evidence(text: str) -> list[str]:
    visible = visible_markdown(text)
    hits = EVIDENCE.findall(URL.sub(" ", visible))
    return [hit for hit in hits if TEST_EVIDENCE.search(hit.replace("\\", "/"))]


def requirement_evidence_gaps(spec_ids: list[str], validation: str) -> list[str]:
    missing: list[str] = []
    visible = visible_markdown(validation)
    for requirement_id in spec_ids:
        covered = False
        for line in visible.splitlines():
            if requirement_id not in line:
                continue
            if find_test_evidence(line):
                covered = True
                break
        if not covered:
            missing.append(requirement_id)
    return missing


def read_optional(feature_dir: Path, filename: str) -> str | None:
    path = feature_dir / filename
    if not path.is_file():
        return None
    text = path.read_text(encoding="utf-8")
    return text if text.strip() else None


def build_report(feature_dir: Path) -> Report:
    report = Report(gate=GATE, target=str(feature_dir))

    spec_text = read_optional(feature_dir, "spec.md")
    tasks_text = read_optional(feature_dir, "tasks.md")
    validation = read_optional(feature_dir, "validation.md")

    if not spec_text:
        report.error("spec.md missing or empty — cannot check REQ traceability")
        return report

    spec_ids = requirement_ids(spec_text)
    if not spec_ids:
        report.error(
            "no requirement headings found - use '### REQ-001: Title' (prefix-NNN)"
        )
        return report

    report.ok(f"{len(spec_ids)} requirement ID(s) in spec.md")

    if not tasks_text:
        report.error("tasks.md missing or empty — every REQ needs a task Requirement")
        return report

    covered = task_requirement_ids(tasks_text)
    report.ok(f"{len(covered)} requirement ID(s) referenced in tasks.md")

    missing_tasks = [req for req in spec_ids if req not in covered]
    if missing_tasks:
        report.error(
            "requirements without task coverage: " + ", ".join(missing_tasks)
        )
    else:
        report.ok("every spec requirement is referenced by a task")

    orphan_tasks = sorted(covered - set(spec_ids))
    if orphan_tasks:
        report.error(
            "tasks reference unknown requirement IDs: " + ", ".join(orphan_tasks)
        )
    else:
        report.ok("every task Requirement maps to a spec requirement")

    if validation is None:
        report.warn(
            "validation.md missing — coverage evidence check skipped "
            "(run again after /verify drafts validation.md)"
        )
        return report

    gaps = requirement_evidence_gaps(spec_ids, validation)
    if gaps:
        for requirement_id in gaps:
            report.error(
                f"{requirement_id} has no test file:line on the same coverage line"
            )
    else:
        report.ok("every spec requirement has test evidence on a coverage line")

    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Validate REQ → tasks → validation coverage chain"
    )
    parser.add_argument(
        "feature",
        nargs="?",
        help="feature name, feature directory, or path to spec.md",
    )
    args = parser.parse_args(argv)

    feature_dir = resolve_feature_dir(args.feature, GATE)
    return build_report(feature_dir).emit()


if __name__ == "__main__":
    sys.exit(main())
