# Ship Ready

Lean pre-launch checklist when the owner asks to **ship, deploy, or go live**. Complements Verify — it does **not** replace `/verify` or authorize remote actions.

**Judgment only.** Not gated by `validate_state.py`. Blast radius still applies: `git push`, deploy, and destructive ops need an **explicit** go-ahead for that action.

## When to Use

Load only when the owner explicitly asks for ship / deploy / launch / go-live checklist **after** (or alongside a completed) Verify PASS for the feature in scope.

## When NOT to Use

- Normal Execute or Verify loops
- “Are we done coding?” — that is `/verify`, not this skill
- Never load with `appsec.md`, `qa-strategy.md`, or `code-simplify.md` in the same window

## Checklist

Confirm each item or record N/A with reason:

| Item | Ask |
| --- | --- |
| Verify | Feature `validation.md` is PASS; `validate_state.py` exits 0 |
| Tests / CI | Project suite or CI green for this change |
| Secrets | No secrets in the diff; env/config documented |
| Migrations | Backward-compatible or rollback noted |
| Observability | Critical path has log/metric/trace if the project expects it |
| Rollback | How to undo the release if it fails |
| Owner go-ahead | Explicit approval for push/deploy named in chat |

## Output shape

```markdown
## Ship ready
- Applied: yes | skipped — [reason]
- Verify: PASS | blocked — [why]
- CI/tests: pass | fail | n/a
- Secrets/migrations/obs/rollback: [ok or gap]
- Push/deploy: waiting for explicit go-ahead | approved — [quote]
- Result: ready | not ready
```

`not ready` → Gaps or blockers in `STATE.md`; do not push.

## Related

- `references/validate.md` — Verify first; do not auto-load this on Verify
- `git-handoff.md` — commit `.specs/`; push still needs go-ahead
- `agent-architecture.md` — blast radius
- `references/context-limits.md` — at most one conditional sister
