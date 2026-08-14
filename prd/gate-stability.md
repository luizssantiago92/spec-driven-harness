# PRD: Gate Stability Baseline (0.7.0)

## Problem

From 0.5 through 0.6.8, free-form gate audits kept finding “new” false passes. Most were the next encoding of the same surface (path noise, fences, skill text stricter than code). Without a frozen contract and an adversarial matrix in CI, every probe invents another PR.

## Goals

1. Document what structural gates **guarantee** and what they **do not**.
2. Share one normalization path for markdown visibility and file paths.
3. Lock closed false-pass families into a CI adversarial suite.
4. Align skill PASS/STOP language with what the gates actually enforce.
5. Freeze free-form audits: new findings need a failing matrix case first.

## Non-goals

- Markdown AST parser migration
- Continuous random fuzzing
- Semantic gates (whether a cited test truly asserts the criterion)
- TLC / interactive UAT parity, ChatPRD sync, brownfield init

## Guarantees (structural)

Gates **do** enforce artifact form:

- Spec sections, requirement IDs under `## Requirements`, `SHALL`/`MUST` criteria
- Task fields, dependency direction/cycles/phases, Files overlap after normalization
- Exact `PASS`/`PASSED` verdict scope, test-path `file:line` evidence (fences/comments ignored)
- Medium+ sensor outcomes; PASS blocked by survived mutants, open Gaps, Security `Result: fail`
- Conventional commit headers; grounded lessons store rules

## Non-guarantees (verifier judgment)

Gates **do not** decide:

- Whether the cited test asserts the criterion’s outcome
- Real security posture beyond a recorded Security Review result line
- Interactive UAT / walkthrough success
- Whether `Done when` text is philosophically binary

## Audit policy (after 0.7.0)

1. Add a failing case to `test/test_adversarial_gates.py` (or extend an existing family).
2. Confirm `npm test` fails on that case alone.
3. Fix the gate or docs; keep the case green thereafter.
4. Free-form “hunt for errors” without a matrix fixture does not open a gate PR.

## Technical context

- Shared helpers: `scripts/_common.py` (`visible_markdown`, `normalize_file_path`, `section_body`)
- Adversarial suite: `test/test_adversarial_gates.py`
- Skills: `skills/references/validate.md`, `skills/references/tasks.md`
- Prior power-ups: `prd/harness-power-ups.md` (delivered through 0.6.x)

## Acceptance criteria

- WHEN `npm test` runs THEN the adversarial matrix SHALL cover verdict, evidence, sensor, Files, PASS-align, and Spec/Tasks families closed in 0.5–0.6.8
- WHEN gates normalize paths or strip fences/comments THEN they SHALL call shared `_common` helpers (no local copies)
- WHEN a skill states a PASS requirement the gate does not enforce THEN the skill SHALL label it as verifier judgment
