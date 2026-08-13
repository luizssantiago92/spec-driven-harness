#!/usr/bin/env python3
"""Completion gate for a feature directory under `.specs/features/`.

Run before declaring a feature done:

    python3 validate_state.py .specs/features/auth
    python3 validate_state.py auth
    python3 validate_state.py            # when the project has a single feature

Checks:
  * spec.md exists
  * validation.md exists and was written by the independent verifier
  * the verdict is filled and reads PASS
  * the report cites file:line evidence (evidence-or-zero)
  * the discrimination sensor result is recorded
  * open task checkboxes in tasks.md block completion

Exit codes: 0 pass, 1 blocking issues, 2 usage error.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from _common import EXIT_FAILED, Report, find_placeholders, resolve_feature_dir

GATE = "validate-state"

VERDICT = re.compile(
    r"^\s*[-*]?\s*\*{0,2}(?:verdict|result|status)\*{0,2}\s*:\s*\*{0,2}(?P<value>[A-Za-z ]+)",
    re.IGNORECASE | re.MULTILINE,
)
VERDICT_HEADING = re.compile(
    r"^#{1,6}\s*(?:verdict|result|status)\s*$\s*\n+\s*\*{0,2}(?P<value>[A-Za-z ]+)",
    re.IGNORECASE | re.MULTILINE,
)
EVIDENCE = re.compile(r"[\w./\\-]+\.[A-Za-z][A-Za-z0-9]{0,9}:\d{1,6}\b")
URL = re.compile(r"\b[a-z][a-z0-9+.-]*://\S+", re.IGNORECASE)
SENSOR = re.compile(r"(discrimination sensor|mutant)", re.IGNORECASE)
OPEN_TASK = re.compile(r"^\s*[-*]\s*\[ \]\s+(?P<label>.+)$", re.MULTILINE)


def find_evidence(text: str) -> list[str]:
    """Return file:line references, ignoring URLs that merely carry a port."""

    return EVIDENCE.findall(URL.sub(" ", text))


def build_report(feature_dir: Path) -> Report:
    report = Report(gate=GATE, target=str(feature_dir))

    spec_path = feature_dir / "spec.md"
    if spec_path.exists() and spec_path.read_text(encoding="utf-8").strip():
        report.ok("spec.md present")
    else:
        report.error("spec.md missing or empty - a feature cannot close without a spec")

    validation_path = feature_dir / "validation.md"
    if not validation_path.exists():
        report.error(
            "validation.md missing - run /verify with an independent verifier "
            "before closing the feature"
        )
        return report

    validation = validation_path.read_text(encoding="utf-8")
    if not validation.strip():
        report.error("validation.md is empty")
        return report

    verdict_match = VERDICT.search(validation) or VERDICT_HEADING.search(validation)
    if not verdict_match:
        report.error(
            "validation.md has no verdict - add 'Verdict: PASS' or 'Verdict: FAIL'"
        )
    else:
        verdict = verdict_match.group("value").strip().upper()
        if verdict.startswith("PASS"):
            report.ok("verifier verdict is PASS")
        elif verdict.startswith("FAIL"):
            report.error("verifier verdict is FAIL - resolve gaps and re-verify")
        else:
            report.error(f"verifier verdict is not filled: '{verdict}'")

    evidence = find_evidence(validation)
    if evidence:
        report.ok(f"{len(evidence)} file:line evidence reference(s)")
    else:
        report.error(
            "no file:line evidence found - evidence-or-zero requires test references "
            "such as test/auth/token.test.ts:41 (a URL is not evidence)"
        )

    if SENSOR.search(validation):
        report.ok("discrimination sensor result recorded")
    else:
        report.warn(
            "no discrimination sensor section found - confirm mutants were injected"
        )

    tasks_path = feature_dir / "tasks.md"
    if tasks_path.exists():
        open_tasks = OPEN_TASK.findall(tasks_path.read_text(encoding="utf-8"))
        if open_tasks:
            for label in open_tasks[:10]:
                report.error(f"open task remains: {label.strip()}")
        else:
            report.ok("all tasks are checked off")

    placeholders = find_placeholders(validation)
    if placeholders:
        for item in placeholders[:10]:
            report.error(f"unresolved placeholder in validation.md at {item}")

    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Validate that a feature is ready to be declared done"
    )
    parser.add_argument(
        "feature",
        nargs="?",
        help="feature name or path to .specs/features/[feature]",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="treat warnings as blocking failures",
    )
    args = parser.parse_args(argv)

    feature_dir = resolve_feature_dir(args.feature, GATE)
    report = build_report(feature_dir)
    result = report.emit(strict=args.strict)
    return result if result == 0 else EXIT_FAILED


if __name__ == "__main__":
    sys.exit(main())
