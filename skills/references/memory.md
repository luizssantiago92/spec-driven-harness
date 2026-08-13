# Memory

Project memory that survives session amnesia: decisions, handoff, and resume.

## When to Use

- Session start (resume)
- Session end (pause / handoff)
- Any time a project-level decision is made
- Any time verification produces a grounded lesson

## Artifacts

| File | Owner | Purpose |
| --- | --- | --- |
| `.specs/STATE.md` | Agent + owner | Decision log (`AD-NNN`) and handoff snapshot |
| `.specs/LESSONS.md` | Agent | Lessons distilled from verification failures |
| `.specs/project/PROJECT.md` | Owner | Vision, stack, constraints |
| `.specs/project/ROADMAP.md` | Owner | Milestones and feature status |

## Resume Protocol

Run at every session start, before writing any code:

1. **Read `STATE.md`** — active feature, phase, next step, blockers.
2. **Reconcile against git.** The snapshot can be stale; evidence wins:
   ```bash
   git branch --show-current
   git status --porcelain
   git log --oneline -10
   ```
   Compare with `tasks.md` checkboxes. If commits exist for tasks that STATE says are pending, git is right — update STATE.
3. **Run the project harness** (tests, lint) before adding new code, so you know the starting baseline.
4. **Load only what this step needs** — the current feature's spec, plus `context.md` or `design.md` when relevant. Never load two feature specs at once.
5. **Propose the reconciled next step** and confirm it with the owner when it is ambiguous or stale.

## Pause / Handoff Protocol

Run at session end or at a phase milestone:

1. Refresh every section of `STATE.md` (template below).
2. Append to `LESSONS.md` if verification failed or a mistake was corrected.
3. Run the relevant gates and tests — never hand off a red tree silently.
4. Commit `.specs/` per `git-handoff.md`. **Never auto-push.**

## STATE.md Template

```markdown
# Project State & Decisions

## Active Feature
- Feature: [name]
- Phase: [Specify|Discuss|Design|Tasks|Execute|Verify]
- Branch: [branch-name]

## Next Step (single item)
- [ ] [one concrete action]

## Blockers
- [open questions or dependencies, or "none"]

## Deferred Ideas
- [good ideas found during Execute that were out of scope]

## Decisions

### AD-001: [Decision title]
- **Date**: [ISO date]
- **Context**: [why this came up]
- **Decision**: [what was decided]
- **Consequences**: [what this constrains going forward]
```

## Decision Log Rules

- `AD-NNN` numbers are sequential and never reused.
- Record a decision when it constrains **future work beyond this feature**. Feature-local choices belong in `context.md` or `design.md`.
- Superseding a decision adds a new `AD-NNN` that references the old one — never edit history in place.

## Lessons Rules

- A lesson is recorded only from a **grounded failure**: a surviving mutant, an imprecise acceptance criterion, a failed requirement, or a spec deviation.
- A clean PASS records nothing. Lessons are not a changelog.
- Each lesson states the trigger, the rule to apply next time, and the feature it came from.

```markdown
## L-003: Assert error codes, not just status
- **Trigger**: mutant returning 403 instead of 401 survived (auth, 2026-08)
- **Rule**: acceptance criteria must name the error code, and tests must assert it
```

## Rules

- Write every artifact in **English**.
- Lazy artifacts: never scaffold empty files to look organized.
- `STATE.md` has exactly one "Next Step" item. A list of five is not a handoff.

## Next

`git-handoff.md` — what to stage, how to word the commit, and why no auto-push.
