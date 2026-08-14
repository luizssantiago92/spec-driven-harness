# Code Simplify

Lean pass to reduce complexity **without changing behavior**. Complements Execute adequacy A–D and the standing Definition of Done in `engineering-standards.md`.

**Judgment only.** `validate_state.py` does not require a simplify step. Skip with a one-line reason when unused.

## When to Use

Load when **any** of:

- After adequacy **A–D** are green on a **Medium+** task and the diff looks denser than needed
- Owner asks to simplify, clean up, or refactor with **no behavior change**

## When NOT to Use

Quick one-liners, first RED/GREEN of a task, or when behavior must change (that is a new task / Spec Deviation). Never load in the same working set as `appsec.md`, `qa-strategy.md`, or `ship-ready.md`.

## Procedure

1. **Freeze behavior** — suite / task `Gate` already green; do not start from a red tree.
2. **Target only this task’s `Files`** — no drive-by modules.
3. **Simplify** — naming, extract obvious duplication, drop dead code/debug; prefer clarity over cleverness.
4. **Re-run the same `Gate`** — if anything fails, revert the simplify diff.
5. **Commit separately** when non-trivial (`refactor(scope): …`), still Conventional Commits.

## Anti-rationalizations

| Excuse | Response |
| --- | --- |
| "While I'm here, change the API" | Behavior change needs a task / spec — not this skill |
| "Tests will catch it later" | Re-run `Gate` before commit |
| "Bigger cleanup across the package" | Out of `Files` — Deferred Ideas in `STATE.md` |

## Output shape

```markdown
## Code simplify
- Applied: yes | skipped — [reason]
- Files: [paths]
- Gate: [command] → pass
- Notes: [optional one line]
```

## Related

- `references/implement.md` — per-task cycle; offer this skill after A–D on Medium+
- `engineering-standards.md` — Definition of Done
- `references/context-limits.md` — at most one conditional sister
- `ship-ready.md` — launch checklist (separate trigger; never together)
