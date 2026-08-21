# Getting started

You installed the **Spec-Driven Harness**. You do **not** need to memorize CLI commands.

## What to do now

1. Open **Cursor** or **Claude Code** in this project.
2. Start with **Specify** — the written agreement before any code:

   ```
   /specify

   Add CSV export to the reports page. Users pick a date range.
   Out of scope: PDF export.
   ```

   Or in plain language:

   > Specify a feature: users can export reports as CSV. Keep PDF out of scope.

3. Review the draft in `.specs/features/…/spec.md`. Approve only when you agree with every requirement.

The agent loads **one phase at a time**, writes plans under `.specs/`, and runs automatic checks before calling work “done”.

## What you rarely run yourself

| Command | Only when |
| --- | --- |
| `npx @luizsantiago/agentic-harness install` | First time, or after upgrading the package |
| `feature-init "…"` | Optional — `/specify` usually runs this for you |
| `validate-spec [feature]` | Optional — double-check the spec gate yourself |
| `doctor` | Something looks broken after install |

**Gates** (`validate-spec`, `validate-tasks`, …) are usually run **by the agent** at the right phase. You can run them manually to double-check paperwork.

## Existing codebase (brownfield)?

Optional, once:

```bash
npx @luizsantiago/agentic-harness project-init
```

That generates `PROJECT.md` and domain stubs so the agent understands the repo.

## Where things live

| Path | Purpose |
| --- | --- |
| `.cursor/skills/agent-architecture.md` | Hub — start here |
| `.specs/STATE.md` | Where the project left off |
| `.specs/features/` | One folder per feature |
| `.specs/harness/scripts/` | Automatic checks (gates) |

More detail: repository README and `docs/guide/` (if you cloned the harness repo).
