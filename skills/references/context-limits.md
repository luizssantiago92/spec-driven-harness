# Context Limits

How much to load, in what order, and when to stop. Cross-cutting: every phase reads this when the session is long or the feature is large.

The hub already says read a reference completely before acting on it. This file is the budget for everything else — specs, diffs, sister skills, and prior features.

## Budget

Treat context as a working set, not an archive. Prefer a complete read of a small set over a partial read of a large set.

| Slot | Load | Do not load |
| --- | --- | --- |
| Contract | Hub + the current phase reference + the sister skill that table names | The other phase references |
| Feature | This feature's `spec.md`; `context.md` / `design.md` / `tasks.md` only when that phase ran | Sibling feature specs |
| Memory | `STATE.md` Next Step, Blockers, and `AD-NNN` that constrain this area; `lessons.py list --status confirmed` | Candidates, quarantined entries, other features' `validation.md` |
| Code | Files named on the current task | The rest of the module "for orientation" |
| Verify | Spec + diff range + the tests the spec names; `security-review.md` | The author's session notes |
| Conditional sister | **At most one** of `appsec.md`, `qa-strategy.md`, `code-simplify.md`, or `ship-ready.md`, and only when that skill’s trigger says so | Two or more at once; AppSec/QA on Quick/Simple without a trigger; ship-ready during normal Verify |

If the working set no longer fits, drop code search leftovers first, then prior-phase artifacts you have already turned into the current artifact, then sister skills that are not in the phase map cell. Drop a finished conditional sister before loading the next (e.g. AppSec before QA; never hold simplify or ship with AppSec/QA).

## Load order

1. Reconcile `STATE.md` against git (`memory.md`).
2. Open the hub only if the phase or the router is in doubt.
3. Open the current phase reference completely.
4. Open the sister skill the phase map names, if any.
5. On Verify only: if an AppSec trigger fired, open `appsec.md`, act, then drop it before opening `qa-strategy.md` (never both). Skip both on Quick/Simple without triggers. Do **not** auto-load `ship-ready.md` here.
6. On Execute (Medium+ after A–D, or owner ask): optionally open **only** `code-simplify.md`, then drop it.
7. On explicit ship/deploy ask (after Verify PASS): open **only** `ship-ready.md`.
8. Open this feature's artifacts for the current phase — never two features at once.
9. Open source files the current task lists.

Skip a step when its output is already in the working set from earlier in the same session.

## Artifact size

Write artifacts so they can be loaded whole.

| Artifact | Soft limit | If it overflows |
| --- | --- | --- |
| `spec.md` | ~150 lines | Split a second feature; do not hide requirements in `context.md` |
| `design.md` | ~150 lines | Link to existing code instead of pasting it |
| `tasks.md` | ~200 lines | Group under `### Phase N`; keep fields to one line each |
| `validation.md` | ~150 lines | One row per criterion and per mutant; no log dumps |
| `STATE.md` | keep Next Step to one item | Archive resolved blockers; never let it become a diary |
| Phase reference | ~220 lines | Cut an example before cutting a rule |

These are authoring limits, not gate checks. The gates cannot count lines; you can.

## Session rules

- **One feature in focus.** Loading a second spec to "stay consistent" is how the wrong ID lands in `tasks.md`.
- **Do not reload a reference you already followed** in this session unless a gate failed and you need the checklist again.
- **Search is not loading.** A grep hit is a pointer; read the file only when the current task names it or the spec cites it.
- **Sub-agents get a subset.** A worker receives the task, the spec IDs it serves, and its `Files` list — not the whole hub and not sibling tasks.
- **Verify starts empty.** The verifier does not inherit the author's working set. That is the point of Author ≠ verifier.

## When the budget is already blown

1. Stop generating. Write what you know is missing into `STATE.md` Next Step.
2. Drop everything that is not the current task's files and the current phase reference.
3. Resume from the phase reference, not from memory of a previous plan.

A confused session produces a confused spec. Resetting context is cheaper than a wrong `REQ`.

## Related

- `agent-architecture.md` — phase map (which reference belongs to which phase); conditional AppSec / QA
- `appsec.md` / `qa-strategy.md` — conditional sisters (one at a time on Verify)
- `memory.md` — resume protocol (what to reconcile before loading)
- `task-graph-engineering.md` — what a sub-agent is allowed to receive
- `references/implement.md` — per-task cycle (load only the current task's files)
