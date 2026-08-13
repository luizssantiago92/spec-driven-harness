# Implement

Execute one task at a time: test first, gate, commit, repeat. Always required.

## When to Use

- Every feature after Specify (and Tasks, when it ran)

## Inputs

- Approved `spec.md`, plus `design.md`, `tasks.md`, `task-graph.md` when they exist
- `engineering-standards.md` for code quality and locale
- `.specs/LESSONS.md` — apply what previous verifications taught

## Outputs

- Production code and tests
- One atomic commit per task
- Updated `tasks.md` checkboxes

## Before Starting

1. Read this file completely.
2. Run `python3 .specs/harness/scripts/validate_tasks.py` when a formal `tasks.md` exists.
3. If Tasks was skipped, list the atomic steps inline now. More than 5 steps or real dependencies means the Tasks phase was skipped in error — stop and create `tasks.md`.
4. If the breakdown exceeds roughly 8 tasks, offer sub-agent delegation per `task-graph-engineering.md`. Offer and wait; never auto-spawn.

## Per-Task Cycle

```
Plan → Test → Implement → Gate → Commit → Next
```

1. **Plan** — Restate the task's `Done when` criterion and the files you will touch. Nothing else gets touched.
2. **Test first** — Write the test derived from the acceptance criteria. It must fail for the right reason before you write production code.
3. **Implement** — The smallest change that makes the test pass, following the conventions already in the codebase.
4. **Gate** — Run the task's `Gate` command. The runner decides, not your judgment. On failure, fix and retry up to 3 times, then escalate to the owner.
5. **Mark complete** — Check the task box in `tasks.md` in the same change set.
6. **Commit** — One atomic commit including the code, the tests, and the `tasks.md` update.

```bash
python3 .specs/harness/scripts/check_commit.py --message "feat(auth): add token refresh"
git add [files] .specs/features/[feature]/tasks.md
git commit -m "feat(auth): add token refresh"
```

## Rules

- **Surgical changes** — Touch only what the task requires. No drive-by refactors.
- **No scope creep** — Good ideas that are not in the task go to `STATE.md` under Deferred Ideas, not into the diff.
- **One writer per file** — Two parallel tasks never mutate the same file in the same round.
- **Never weaken tests** — Do not skip, delete, or loosen a test to make a gate pass. A failing gate is information.
- **Blast radius** — Local commits are authorized by task approval. `git push`, deploy, and destructive operations need an explicit go-ahead.
- **Spec deviation** — If implementation proves the spec wrong, stop the loop, update `spec.md`, record the change in `STATE.md`, re-derive affected tests, and resume only after the owner approves the delta.

## Commit Format

Conventional Commits, English, one concern per commit:

```
feat(auth): add token refresh
fix(cart): prevent negative quantity on decrement
test(auth): cover session expiry edge case
docs(spec): record validation report for auth
```

## Closing Execute

When the last task is complete:

1. Run the full project harness once more (tests, linter, build).
2. Trigger `/verify` with a fresh context — mandatory, never prompted. See `validate.md`.
3. Do not declare the feature done until `validate_state.py` passes.

## Next

`validate.md` — independent verification.
