# PRD: Harness Power-Ups (0.6.0)

## Problem

The 0.5.x harness stops incomplete *form* (missing sections, soft PASS, non-test evidence). Agents can still ship features where a requirement has no task, a task has no binary done criterion, parallel workers collide on a file, Verify skips the discrimination sensor, or multi-agent Execute has no operational protocol.

## Goals

1. Structural gates refuse REQ ↔ task ↔ evidence gaps.
2. Medium+ features cannot close without a recorded discrimination-sensor result.
3. Sub-agent Execute has a concrete payload, summary, and merge protocol.

## Non-goals

- Brownfield mapping / project init (later)
- Interactive UAT parity with TLC
- ChatPRD sync (MCP unauthenticated in this environment)
- Softening English-only artifact rule

## Requirements

### REQ-001: Spec requirements are covered by tasks
- **Acceptance Criteria**: WHEN a feature has both `spec.md` and `tasks.md` THEN `validate_tasks.py` SHALL fail if any requirement ID in the spec is absent from every task `Requirement` field
- WHEN `spec.md` is missing THEN the gate SHALL skip coverage (tasks-only validation still runs)

### REQ-002: Tasks declare binary done criteria
- **Acceptance Criteria**: WHEN a task omits `Done when` THEN `validate_tasks.py` SHALL exit non-zero

### REQ-003: Parallel tasks do not share files
- **Acceptance Criteria**: WHEN two tasks have no dependency path between them AND their `Files` fields name the same path THEN `validate_tasks.py` SHALL exit non-zero

### REQ-004: Every requirement has test evidence at close
- **Acceptance Criteria**: WHEN `validate_state.py` runs on a feature with a non-empty `spec.md` THEN it SHALL fail unless every requirement ID appears in `validation.md` on a line that also cites test `file:line` evidence

### REQ-005: Discrimination sensor is mandatory on Medium+
- **Acceptance Criteria**: WHEN the feature is Medium+ (`design.md` exists, or `tasks.md` has 4+ tasks, or 2+ `Phase` groups) AND `validation.md` lacks a discrimination-sensor / mutant result THEN `validate_state.py` SHALL fail (not warn)
- WHEN the feature is below Medium+ THEN a missing sensor SHALL remain a warning

### REQ-006: Sub-agent protocol is documented and linked
- **Acceptance Criteria**: WHEN an agent opens the hub or task-graph skill THEN it SHALL find an operational sub-agent protocol covering worker payload, compact summary, batch packing, failure handling, and merge ownership

## Assumptions

- Breaking gate changes are acceptable in 0.6.0; upgrading projects re-run gates on open features.
- Coverage uses requirement heading IDs (`### REQ-001`), not free-text mentions only.

## Out of Scope

- Auto-spawning sub-agents
- Enforcing model tiers in code
- lessons.py signal taxonomy (follow-up)

## Technical context

- Gates: `scripts/validate_tasks.py`, `scripts/validate_state.py`, shared helpers in `scripts/_common.py`
- Tests: `test/test_gates.py`
- Docs: `skills/task-graph-engineering.md`, new `skills/references/sub-agents.md`, hub phase map, README Gates table
- Installer catalog: `lib/constants.js` `REFERENCE_ASSETS`

## Edge cases

- Spec with REQ-001 and REQ-002; tasks only cover REQ-001 → fail
- Task `Files: src/a.ts, src/b.ts` overlapping another independent task's `src/a.ts` → fail
- Requirement cited in validation without test evidence on the same line → fail
- Quick-tier feature (no tasks.md, no design.md) → sensor stays warning
