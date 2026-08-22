# Analyze

Cross-artifact consistency check before implementation.

## When to Use

- After Tasks are drafted, before owner approves them
- After a large spec or tasks edit mid-feature
- When something "feels off" between spec, design, and tasks

## When NOT to Use

- Before a spec exists
- Quick tier (no tasks.md)

## Inputs

- `.specs/features/[feature]/spec.md`
- `.specs/features/[feature]/tasks.md` when present
- `.specs/features/[feature]/design.md` when present
- `.specs/STATE.md`

## Output

Fix list in chat; update artifacts until the gate passes.

## Procedure

1. **Run the gate:**
   ```bash
   python3 .specs/guardrails/scripts/analyze_artifacts.py [feature]
   npx @luizsantiago/spec-guardrails analyze-artifacts [feature]
   ```
2. **Fix every blocking error** — missing REQ coverage, orphan task Requirement IDs.
3. **Resolve warnings** before owner approval:
   - Open `[NEEDS CLARIFICATION]` markers
   - STATE branch ≠ current git branch → reconcile per `memory.md`
   - Empty `design.md` on Complex work → write design or drop the file
4. **Re-run until PASS** (use `--strict` before final approval if warnings remain).

## What the gate checks

| Check | Blocks? |
| --- | --- |
| Spec REQ without task coverage | Yes |
| Task Requirement references unknown REQ | Yes |
| Open `[NEEDS CLARIFICATION]` | Warn (`--strict` blocks) |
| STATE branch ≠ git branch | Warn |
| design.md nearly empty with tasks present | Warn |

## Next

- PASS → present tasks to owner for approval, then `implement.md`
- Spec gaps → `specify.md`
- Architecture gaps → `design.md`
- Back → `tasks.md`
