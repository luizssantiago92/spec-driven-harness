"""Unit tests for the deterministic gate scripts.

Run from the repository root:

    python3 -m unittest discover -s test -p 'test_*.py'
"""

from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))

import check_commit  # noqa: E402
import validate_spec  # noqa: E402
import validate_state  # noqa: E402
import validate_tasks  # noqa: E402

VALID_SPEC = """# Spec: Authentication

## Goal
Let users sign in with email and password.

## Requirements

### REQ-001: Email login
- **Acceptance Criteria**: WHEN a user submits valid credentials THEN the system SHALL create a session
- WHEN a user submits invalid credentials THEN the system SHALL return 401 with code AUTH_INVALID

## Out of Scope
- Social login providers
"""

VALID_TASKS = """# Tasks: Authentication

### T1: Create session token module
- **Requirement**: REQ-001
- **Files**: src/auth/token.ts
- **Depends on**: —
- **Tests**: test/auth/token.test.ts
- **Gate**: npm test
- **Done when**: module signs and verifies tokens

### T2: Add login endpoint handler
- **Requirement**: REQ-001
- **Files**: src/routes/login.ts
- **Depends on**: T1
- **Tests**: test/routes/login.test.ts
- **Gate**: npm test
- **Done when**: endpoint returns 200 for valid credentials
"""

VALID_VALIDATION = """# Validation: Authentication

- Verifier: independent agent
- Verdict: PASS

## Coverage
- REQ-001 - test/routes/login.test.ts:24

## Discrimination Sensor
- Removed expiry check - test/auth/token.test.ts:41 killed the mutant
"""


class SpecGateTest(unittest.TestCase):
    def test_valid_spec_passes(self):
        report = validate_spec.build_report("spec.md", VALID_SPEC)
        self.assertTrue(report.passed, report.errors)

    def test_requirement_body_stops_at_next_section(self):
        report = validate_spec.build_report("spec.md", VALID_SPEC)
        self.assertEqual(
            [warning for warning in report.warnings if "Social login" in warning], []
        )

    def test_missing_out_of_scope_fails(self):
        spec = VALID_SPEC.replace("## Out of Scope\n- Social login providers\n", "")
        report = validate_spec.build_report("spec.md", spec)
        self.assertFalse(report.passed)
        self.assertTrue(any("Out of Scope" in error for error in report.errors))

    def test_requirement_without_criteria_fails(self):
        spec = VALID_SPEC.replace(
            "- **Acceptance Criteria**: WHEN a user submits valid credentials "
            "THEN the system SHALL create a session\n"
            "- WHEN a user submits invalid credentials THEN the system SHALL "
            "return 401 with code AUTH_INVALID\n",
            "",
        )
        report = validate_spec.build_report("spec.md", spec)
        self.assertFalse(report.passed)
        self.assertTrue(
            any("no acceptance criteria" in error for error in report.errors)
        )

    def test_metadata_bullets_are_not_acceptance_criteria(self):
        spec = VALID_SPEC.replace(
            "### REQ-001: Email login\n",
            "### REQ-001: Email login\n- **Owner**: platform team\n- **Priority**: P1\n",
        )
        report = validate_spec.build_report("spec.md", spec)
        self.assertTrue(report.passed, report.errors)
        self.assertEqual(
            [w for w in report.warnings if "Owner" in w or "Priority" in w], []
        )

    def test_generic_types_are_not_placeholders(self):
        spec = VALID_SPEC.replace(
            "THEN the system SHALL create a session",
            "THEN the system SHALL return Promise<void> for a List<User> payload",
        )
        report = validate_spec.build_report("spec.md", spec)
        self.assertTrue(report.passed, report.errors)

    def test_template_tokens_in_angle_brackets_still_fail(self):
        spec = VALID_SPEC.replace("- Social login providers", "- <fill me>")
        report = validate_spec.build_report("spec.md", spec)
        self.assertFalse(report.passed)
        self.assertTrue(any("placeholder" in error for error in report.errors))

    def test_placeholder_fails(self):
        spec = VALID_SPEC.replace("Social login providers", "TBD")
        report = validate_spec.build_report("spec.md", spec)
        self.assertFalse(report.passed)
        self.assertTrue(any("placeholder" in error for error in report.errors))

    def test_duplicate_requirement_id_fails(self):
        spec = VALID_SPEC + "\n### REQ-001: Duplicate\n- WHEN x THEN system SHALL y\n"
        report = validate_spec.build_report("spec.md", spec)
        self.assertFalse(report.passed)
        self.assertTrue(any("duplicate" in error for error in report.errors))


class TasksGateTest(unittest.TestCase):
    def test_valid_tasks_pass(self):
        report = validate_tasks.build_report("tasks.md", VALID_TASKS)
        self.assertTrue(report.passed, report.errors)

    def test_missing_required_field_fails(self):
        tasks = VALID_TASKS.replace("- **Gate**: npm test\n", "", 1)
        report = validate_tasks.build_report("tasks.md", tasks)
        self.assertFalse(report.passed)
        self.assertTrue(any("Gate" in error for error in report.errors))

    def test_forward_dependency_fails(self):
        tasks = VALID_TASKS.replace("- **Depends on**: —", "- **Depends on**: T2", 1)
        report = validate_tasks.build_report("tasks.md", tasks)
        self.assertFalse(report.passed)
        self.assertTrue(
            any("forward dependency" in error for error in report.errors)
        )

    def test_unknown_dependency_fails(self):
        tasks = VALID_TASKS.replace("- **Depends on**: T1", "- **Depends on**: T9", 1)
        report = validate_tasks.build_report("tasks.md", tasks)
        self.assertFalse(report.passed)
        self.assertTrue(any("unknown task" in error for error in report.errors))

    def test_requirement_without_spec_id_fails(self):
        tasks = VALID_TASKS.replace("- **Requirement**: REQ-001", "- **Requirement**: auth", 1)
        report = validate_tasks.build_report("tasks.md", tasks)
        self.assertFalse(report.passed)
        self.assertTrue(
            any("does not reference a spec ID" in error for error in report.errors)
        )

    def test_no_tasks_fails(self):
        report = validate_tasks.build_report("tasks.md", "# Tasks\n\nnothing here\n")
        self.assertFalse(report.passed)

    def test_checked_task_boxes_are_not_placeholders(self):
        report = validate_tasks.build_report(
            "tasks.md", VALID_TASKS + "- [x] complete\n- [ ] pending\n"
        )
        self.assertEqual(
            [error for error in report.errors if "placeholder" in error], []
        )

    def test_cycle_is_detected(self):
        tasks = "# Tasks\n\n" + "".join(
            f"### T{i}: Do the thing {i}\n"
            f"- **Requirement**: REQ-001\n"
            f"- **Depends on**: T{3 if i == 1 else i - 1}\n"
            f"- **Tests**: t.ts\n"
            f"- **Gate**: npm test\n\n"
            for i in (1, 2, 3)
        )
        report = validate_tasks.build_report("tasks.md", tasks)
        self.assertTrue(any("cycle" in error for error in report.errors))

    def test_task_ids_beyond_t999_are_parsed(self):
        tasks = (
            "# Tasks\n\n### T1000: Add the last module\n"
            "- **Requirement**: REQ-001\n- **Depends on**: —\n"
            "- **Tests**: t.ts\n- **Gate**: npm test\n"
        )
        report = validate_tasks.build_report("tasks.md", tasks)
        self.assertTrue(any("1 task(s)" in check for check in report.checks))

    def test_long_dependency_chain_does_not_exhaust_the_stack(self):
        tasks = "# Tasks\n\n" + "".join(
            f"### T{i}: Add module number {i}\n"
            f"- **Requirement**: REQ-001\n"
            f"- **Depends on**: {'—' if i == 1 else f'T{i - 1}'}\n"
            f"- **Tests**: t.ts\n"
            f"- **Gate**: npm test\n\n"
            for i in range(1, 3001)
        )
        report = validate_tasks.build_report("tasks.md", tasks)
        self.assertTrue(report.passed, report.errors[:3])


class StateGateTest(unittest.TestCase):
    def _feature_dir(self, validation: str | None = VALID_VALIDATION, tasks: str | None = None):
        temp_dir = Path(tempfile.mkdtemp())
        (temp_dir / "spec.md").write_text(VALID_SPEC, encoding="utf-8")
        if validation is not None:
            (temp_dir / "validation.md").write_text(validation, encoding="utf-8")
        if tasks is not None:
            (temp_dir / "tasks.md").write_text(tasks, encoding="utf-8")
        return temp_dir

    def test_complete_feature_passes(self):
        report = validate_state.build_report(self._feature_dir())
        self.assertTrue(report.passed, report.errors)

    def test_missing_validation_fails(self):
        report = validate_state.build_report(self._feature_dir(validation=None))
        self.assertFalse(report.passed)
        self.assertTrue(any("validation.md missing" in e for e in report.errors))

    def test_fail_verdict_blocks(self):
        report = validate_state.build_report(
            self._feature_dir(VALID_VALIDATION.replace("PASS", "FAIL"))
        )
        self.assertFalse(report.passed)

    def test_missing_evidence_fails(self):
        without_evidence = VALID_VALIDATION.replace(
            "- REQ-001 - test/routes/login.test.ts:24", "- REQ-001 - covered"
        ).replace(
            "- Removed expiry check - test/auth/token.test.ts:41 killed the mutant",
            "- Removed expiry check killed the mutant",
        )
        report = validate_state.build_report(self._feature_dir(without_evidence))
        self.assertFalse(report.passed)
        self.assertTrue(any("evidence" in e for e in report.errors))

    def test_url_with_port_is_not_evidence(self):
        report = validate_state.build_report(
            self._feature_dir(
                "# V\n- Verdict: PASS\n## Coverage\n"
                "- REQ-001 - see https://ci.example.com:8080 for the run\n"
                "## Discrimination Sensor\n- mutant killed\n"
            )
        )
        self.assertFalse(report.passed)
        self.assertTrue(any("evidence" in e for e in report.errors))

    def test_real_evidence_still_counts_next_to_a_url(self):
        report = validate_state.build_report(
            self._feature_dir(
                "# V\n- Verdict: PASS\n## Coverage\n"
                "- REQ-001 - test/routes/login.test.ts:24 (https://ci.example.com:8080)\n"
                "## Discrimination Sensor\n- mutant killed\n"
            )
        )
        self.assertTrue(report.passed, report.errors)

    def test_verdict_written_as_a_heading_is_accepted(self):
        report = validate_state.build_report(
            self._feature_dir(
                "# V\n\n## Verdict\nPASS\n\n## Coverage\n"
                "- REQ-001 - test/routes/login.test.ts:24\n"
                "## Discrimination Sensor\n- mutant killed\n"
            )
        )
        self.assertTrue(report.passed, report.errors)

    def test_open_task_blocks_completion(self):
        report = validate_state.build_report(
            self._feature_dir(tasks="### T1: Do thing\n- [ ] complete\n")
        )
        self.assertFalse(report.passed)
        self.assertTrue(any("open task" in e for e in report.errors))


class CommitGateTest(unittest.TestCase):
    def test_conventional_message_passes(self):
        report = check_commit.build_report("feat(auth): add token refresh")
        self.assertTrue(report.passed, report.errors)

    def test_missing_type_fails(self):
        report = check_commit.build_report("added token refresh")
        self.assertFalse(report.passed)

    def test_unknown_type_fails(self):
        report = check_commit.build_report("feature(auth): add token refresh")
        self.assertFalse(report.passed)

    def test_trailing_period_fails(self):
        report = check_commit.build_report("fix(api): handle null response.")
        self.assertFalse(report.passed)

    def test_long_header_fails(self):
        subject = "x" * 80
        report = check_commit.build_report(f"feat(auth): {subject}")
        self.assertFalse(report.passed)

    def test_body_needs_blank_line(self):
        report = check_commit.build_report("feat(auth): add refresh\nbody line")
        self.assertFalse(report.passed)

    def test_merge_commit_is_skipped(self):
        report = check_commit.build_report("Merge pull request #12 from branch")
        self.assertTrue(report.passed)


if __name__ == "__main__":
    unittest.main()
