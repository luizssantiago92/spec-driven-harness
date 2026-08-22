# Quick Mode

Express lane for small, low-risk changes. Full pipeline ceremony would cost more than the change itself.

## When to Use

All of these must hold:

- 3 files or fewer
- No architectural decision
- No new dependency
- No change to auth, payments, or data migrations
- The fix is describable in one sentence

Typical: a bug fix, a copy change, a config tweak, a version bump.

## When NOT to Use

If any guardrail is exceeded, stop and route to `specify.md`. Explicitly:

| Signal | Route to |
| --- | --- |
| More than 3 files | `specify.md` → Simple tier |
| A design decision appears | `design.md` |
| More than 5 steps emerge | `tasks.md` |
| Auth, payments, or data safety touched | Full pipeline + `security-review.md` |

Announce the switch — do not silently expand a quick task into a feature.

## Output

`.specs/quick/NNN-slug/`

| File | Content |
| --- | --- |
| `TASK.md` | What, where, approach, verification |
| `SUMMARY.md` | What changed, commit hash, evidence |

`NNN` is sequential across the project (`001`, `002`, …).

## Procedure

1. **Restate the change in one sentence**, name the files, and state how you will verify it.
2. **Write `TASK.md`** before touching code. Two minutes of writing prevents the wrong fix.
3. **Write or extend a test** that fails for the current defect. A quick fix with no test is only allowed for changes with no behavior — copy, formatting, comments.
4. **Implement the smallest change.**
5. **Run the project harness** — tests and linter.
6. **Commit atomically**, Conventional Commits format:
   ```bash
   python3 .specs/guardrails/scripts/check_commit.py --message "fix(theme): persist dark mode preference"
   ```
7. **Write `SUMMARY.md`** with the commit hash and the evidence line.
8. **Record a lesson** with `lessons.py add --source` if the defect revealed a gap that will recur and a `validation.md` exists. Quick-mode copy fixes usually record nothing.

## Verification Standard

Quick mode compresses ceremony, not carelessness — but it is **not** the full Verify gate:

- Prove the change with a test or an explicit, documented manual check.
- Record evidence in `SUMMARY.md` (`file:line` or the exact manual steps). Run the Quick structural gate:
  ```bash
  npx @luizsantiago/spec-guardrails validate-quick 001-theme-persist
  ```
  `validate_state.py` does **not** run on Quick artifacts — that gate is for full-pipeline features.
- Blast radius still applies — local commit only; `git push` and deploy need an explicit go-ahead.
- If any Quick guardrail is exceeded, stop and route to `specify.md` (see When NOT to Use).

## Templates

```markdown
# Quick Task: [one-line title]

- **Files**: src/hooks/useTheme.ts
- **Approach**: persist the preference to localStorage on toggle
- **Verify**: toggle dark mode, reload, preference persists
```

```markdown
# Summary

- **Changed**: persisted theme preference on toggle
- **Commit**: fix(theme): persist dark mode preference (a1b2c3d)
- **Evidence**: test/hooks/useTheme.test.ts:18
```

## Next

Back to normal work. If the same class of defect appears again, promote it to a real feature with `specify.md`.
