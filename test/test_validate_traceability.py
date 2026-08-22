"""Adversarial cases for validate-traceability (REQ → tasks → coverage)."""

from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))

import validate_traceability  # noqa: E402

SPEC = """# Spec: Authentication

## Goal
Let users sign in with email and password.

## Requirements

### REQ-001: Email login
- **Acceptance Criteria**: WHEN a user submits valid credentials THEN the system SHALL create a session

### REQ-002: Logout
- **Acceptance Criteria**: WHEN a user signs out THEN the system SHALL end the session

## Assumptions
- none

## Out of Scope
- Social login
"""

TASKS_FULL = """# Tasks

### T1: Create session token module
- **Requirement**: REQ-001
- **Files**: src/auth/token.ts
- **Depends on**: —
- **Tests**: test/auth/token.test.ts
- **Gate**: npm test
- **Done when**: module signs and verifies tokens

### T2: Logout endpoint
- **Requirement**: REQ-002
- **Files**: src/routes/logout.ts
- **Depends on**: T1
- **Tests**: test/routes/logout.test.ts
- **Gate**: npm test
- **Done when**: endpoint clears the session
"""

TASKS_PARTIAL = """# Tasks

### T1: Create session token module
- **Requirement**: REQ-001
- **Files**: src/auth/token.ts
- **Depends on**: —
- **Tests**: test/auth/token.test.ts
- **Gate**: npm test
- **Done when**: module signs and verifies tokens
"""

TASKS_ORPHAN = """# Tasks

### T1: Create session token module
- **Requirement**: REQ-001, REQ-099
- **Files**: src/auth/token.ts
- **Depends on**: —
- **Tests**: test/auth/token.test.ts
- **Gate**: npm test
- **Done when**: module signs and verifies tokens

### T2: Logout endpoint
- **Requirement**: REQ-002
- **Files**: src/routes/logout.ts
- **Depends on**: T1
- **Tests**: test/routes/logout.test.ts
- **Gate**: npm test
- **Done when**: endpoint clears the session
"""

VALIDATION_OK = """# Validation

- Verifier: independent agent
- Verdict: PASS

## Coverage
- REQ-001 - test/auth/token.test.ts:24
- REQ-002 - test/routes/logout.test.ts:18
"""

VALIDATION_SPLIT = """# Validation

## Coverage
- REQ-001
- test/auth/token.test.ts:24
- REQ-002 - test/routes/logout.test.ts:18
"""

VALIDATION_URL = """# Validation

## Coverage
- REQ-001 - https://ci.example.com/job/42
- REQ-002 - test/routes/logout.test.ts:18
"""

VALIDATION_MISSING = """# Validation

## Coverage
- REQ-001 - test/auth/token.test.ts:24
"""


def _feature(
    *,
    tasks: str | None = TASKS_FULL,
    validation: str | None = None,
    spec: str = SPEC,
) -> Path:
    temp = Path(tempfile.mkdtemp())
    (temp / "spec.md").write_text(spec, encoding="utf-8")
    if tasks is not None:
        (temp / "tasks.md").write_text(tasks, encoding="utf-8")
    if validation is not None:
        (temp / "validation.md").write_text(validation, encoding="utf-8")
    return temp


class TraceabilityPassTest(unittest.TestCase):
    def test_tasks_only_passes_with_warning(self):
        feature = _feature()
        report = validate_traceability.build_report(feature)
        self.assertTrue(report.passed, report.errors)
        self.assertTrue(any("validation.md missing" in w for w in report.warnings))

    def test_full_chain_passes(self):
        feature = _feature(validation=VALIDATION_OK)
        report = validate_traceability.build_report(feature)
        self.assertTrue(report.passed, report.errors)


class TraceabilityFailTest(unittest.TestCase):
    def test_missing_task_coverage_fails(self):
        feature = _feature(tasks=TASKS_PARTIAL)
        report = validate_traceability.build_report(feature)
        self.assertFalse(report.passed)
        self.assertTrue(
            any("without task coverage" in err and "REQ-002" in err for err in report.errors)
        )

    def test_orphan_task_requirement_fails(self):
        feature = _feature(tasks=TASKS_ORPHAN)
        report = validate_traceability.build_report(feature)
        self.assertFalse(report.passed)
        self.assertTrue(
            any("unknown requirement" in err and "REQ-099" in err for err in report.errors)
        )

    def test_split_evidence_line_fails(self):
        feature = _feature(validation=VALIDATION_SPLIT)
        report = validate_traceability.build_report(feature)
        self.assertFalse(report.passed)
        self.assertTrue(
            any("REQ-001" in err and "same coverage line" in err for err in report.errors)
        )

    def test_url_is_not_evidence(self):
        feature = _feature(validation=VALIDATION_URL)
        report = validate_traceability.build_report(feature)
        self.assertFalse(report.passed)
        self.assertTrue(
            any("REQ-001" in err and "same coverage line" in err for err in report.errors)
        )

    def test_incomplete_validation_coverage_fails(self):
        feature = _feature(validation=VALIDATION_MISSING)
        report = validate_traceability.build_report(feature)
        self.assertFalse(report.passed)
        self.assertTrue(
            any("REQ-002" in err and "same coverage line" in err for err in report.errors)
        )

    def test_missing_tasks_fails(self):
        feature = _feature(tasks=None)
        report = validate_traceability.build_report(feature)
        self.assertFalse(report.passed)
        self.assertTrue(any("tasks.md missing" in err for err in report.errors))


if __name__ == "__main__":
    unittest.main()
