#!/usr/bin/env python3
"""Tests for analyze_artifacts gate."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import analyze_artifacts  # noqa: E402
import validate_spec  # noqa: E402

VALID_SPEC = """# Spec: Authentication

## Goal
Sign in with email and password.

## Requirements

### REQ-001: Email login
- **Acceptance Criteria**: WHEN valid credentials are submitted THEN the system SHALL create a session

## Assumptions
- none

## Out of Scope
- social login
"""

VALID_TASKS = """# Tasks: Authentication

### T1: Session module
- **Requirement**: REQ-001
- **Files**: src/auth/token.ts
- **Depends on**: —
- **Tests**: test/auth/token.test.ts
- **Gate**: npm test
- **Done when**: tokens sign and verify
"""

DELTA_SPEC = """# Spec: 002-auth (delta)

## Goal
Tighten session expiry.

## ADDED Requirements

### AUTH-002: Idle timeout
- WHEN a session is idle for 30 minutes THEN the system SHALL invalidate the session

## MODIFIED Requirements

### REQ-001: Email login
- WHEN valid credentials are submitted THEN the system SHALL create a session with a 24h TTL

## REMOVED Requirements
- none

## Assumptions
- none

## Out of Scope
- SSO
"""


class AnalyzeArtifactsTest(unittest.TestCase):
    def test_analyze_module_imports(self):
        self.assertEqual(analyze_artifacts.GATE, "analyze-artifacts")


class DeltaSpecTest(unittest.TestCase):
    def test_delta_spec_passes(self):
        report = validate_spec.build_report("spec.md", DELTA_SPEC)
        self.assertTrue(report.passed, report.errors)

    def test_clarification_marker_warns(self):
        spec = VALID_SPEC + "\n- [NEEDS CLARIFICATION: SSO or email only?]\n"
        report = validate_spec.build_report("spec.md", spec)
        self.assertTrue(report.passed)
        self.assertTrue(any("NEEDS CLARIFICATION" in w for w in report.warnings))


class AnalyzeReportTest(unittest.TestCase):
    def setUp(self):
        self.root = Path(self._temp()) / "proj"
        self.feature = self.root / ".specs" / "features" / "001-auth"
        self.feature.mkdir(parents=True)
        (self.feature / "spec.md").write_text(VALID_SPEC, encoding="utf-8")
        (self.feature / "tasks.md").write_text(VALID_TASKS, encoding="utf-8")
        (self.root / ".specs").mkdir(parents=True, exist_ok=True)
        (self.root / ".specs" / "STATE.md").write_text(
            "## Active Feature\n- Feature: 001-auth\n- Branch: feat/001-auth\n",
            encoding="utf-8",
        )

    def _temp(self):
        import tempfile

        return tempfile.mkdtemp(prefix="analyze-test-")

    def test_coverage_passes(self):
        report = analyze_artifacts.build_report(self.feature, self.root)
        self.assertTrue(report.passed, report.errors)

    def test_missing_coverage_fails(self):
        tasks = VALID_TASKS.replace("REQ-001", "REQ-999")
        (self.feature / "tasks.md").write_text(tasks, encoding="utf-8")
        report = analyze_artifacts.build_report(self.feature, self.root)
        self.assertFalse(report.passed)


if __name__ == "__main__":
    unittest.main()
