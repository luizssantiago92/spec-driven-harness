# Getting started

You installed the **Spec-Driven Harness**. You do **not** need to memorize CLI commands.

## What to do now

1. Open **Cursor** or **Claude Code** in this project.
2. Describe what you want in plain language, for example:

   > Specify a feature: add CSV export to the reports page. Keep PDF out of scope.

3. Ask the agent to follow the installed harness (`agent-architecture.md` / Spec-Driven hub).

The agent loads **one phase at a time**, writes plans under `.specs/`, and runs automatic checks before calling work “done”.

## What you rarely run yourself

| Command | Only when |
| --- | --- |
| `npx @luizsantiago/agentic-harness install` | First time, or after upgrading the package |
| `npx @luizsantiago/agentic-harness feature-init "…"` | You want to start a feature from the terminal (optional — the agent can do this on `/specify`) |
| `npx @luizsantiago/agentic-harness doctor` | Something looks broken after install |

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
