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
  * every spec requirement ID has test evidence on the same coverage line
  * the discrimination sensor result is recorded (blocking on Medium+ features)
  * open task checkboxes in tasks.md block completion

Exit codes: 0 pass, 1 blocking issues, 2 usage error.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from _common import (
    Report,
    find_placeholders,
    mask_fenced_blocks,
    requirement_ids,
    resolve_feature_dir,
)

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
SENSOR_RESULT = re.compile(
    r"\b(killed|survived|injected|discrimination sensor)\b",
    re.IGNORECASE,
)
OPEN_TASK = re.compile(r"^\s*[-*]\s*\[ \]\s+(?P<label>.+)$", re.MULTILINE)
TASK_HEADING = re.compile(
    r"^#{2,6}\s*T\d{1,6}\b", re.MULTILINE | re.IGNORECASE
)
PHASE_HEADING = re.compile(
    r"^#{1,6}\s*Phase\s+\d+\b", re.MULTILINE | re.IGNORECASE
)
REQUIREMENT_REF = re.compile(r"\b[A-Z][A-Z0-9]{1,9}-\d{2,4}\b")
# evidence-or-zero requires a test path, not an arbitrary file:line such as config.yaml:12
TEST_EVIDENCE = re.compile(
    r"(?:^|/)(?:tests?|__tests__|spec)(?:/|$)|[._-](?:test|spec)\.|test_[^/]+\.",
    re.IGNORECASE,
)
PASS_VERDICTS = {"PASS", "PASSED"}
FAIL_VERDICTS = {"FAIL", "FAILED"}
MEDIUM_TASK_FLOOR = 4


def find_evidence(text: str) -> list[str]:
    """Return test file:line references, ignoring URLs that merely carry a port."""

    hits = EVIDENCE.findall(URL.sub(" ", text))
    return [hit for hit in hits if TEST_EVIDENCE.search(hit.replace("\\", "/"))]


def is_medium_plus(feature_dir: Path) -> bool:
    """Medium+ when design exists, tasks are substantial, or work is phased."""

    if (feature_dir / "design.md").is_file():
        return True

    tasks_path = feature_dir / "tasks.md"
    if not tasks_path.is_file():
        return False

    tasks = mask_fenced_blocks(tasks_path.read_text(encoding="utf-8"))
    task_count = len(TASK_HEADING.findall(tasks))
    phase_count = len(PHASE_HEADING.findall(tasks))
    return task_count >= MEDIUM_TASK_FLOOR or phase_count >= 2


def requirement_evidence_gaps(spec_text: str, validation: str) -> list[str]:
    """Return requirement IDs that lack a same-line test evidence citation."""

    missing: list[str] = []
    for requirement_id in requirement_ids(mask_fenced_blocks(spec_text)):
        covered = False
        for line in validation.splitlines():
            if requirement_id not in line:
                continue
            if find_evidence(line):
                covered = True
                break
        if not covered:
            missing.append(requirement_id)
    return missing


def build_report(feature_dir: Path) -> Report:
    report = Report(gate=GATE, target=str(feature_dir))

    spec_path = feature_dir / "spec.md"
    spec_text = ""
    if spec_path.exists() and spec_path.read_text(encoding="utf-8").strip():
        report.ok("spec.md present")
        spec_text = spec_path.read_text(encoding="utf-8")
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
        verdict = re.sub(r"\s+", " ", verdict_match.group("value").strip().upper())
        if verdict in PASS_VERDICTS:
            report.ok("verifier verdict is PASS")
        elif verdict in FAIL_VERDICTS:
            report.error("verifier verdict is FAIL - resolve gaps and re-verify")
        else:
            report.error(
                f"verifier verdict is not PASS: '{verdict}' - "
                "write PASS only with no remaining gaps"
            )

    evidence = find_evidence(validation)
    if evidence:
        report.ok(f"{len(evidence)} file:line evidence reference(s)")
    else:
        report.error(
            "no file:line evidence found - evidence-or-zero requires test references "
            "such as test/auth/token.test.ts:41 (a URL is not evidence)"
        )

    if spec_text.strip():
        gaps = requirement_evidence_gaps(spec_text, validation)
        if gaps:
            for requirement_id in gaps:
                report.error(
                    f"{requirement_id} has no test file:line on the same coverage line"
                )
        else:
            report.ok("every spec requirement has test evidence")

    medium_plus = is_medium_plus(feature_dir)
    if SENSOR.search(validation) and SENSOR_RESULT.search(validation):
        report.ok("discrimination sensor result recorded")
    elif medium_plus:
        report.error(
            "Medium+ feature requires a discrimination sensor result "
            "(mutant injected/killed/survived) before closing"
        )
    else:
        report.warn(
            "no discrimination sensor section found - confirm mutants were injected"
        )

    tasks_path = feature_dir / "tasks.md"
    if tasks_path.exists():
        open_tasks = OPEN_TASK.findall(
            mask_fenced_blocks(tasks_path.read_text(encoding="utf-8"))
        )
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
    return report.emit(strict=args.strict)


if __name__ == "__main__":
    sys.exit(main())
