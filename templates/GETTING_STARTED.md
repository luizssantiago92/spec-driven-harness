# Getting started

You installed the **Spec Seatbelt**. You do **not** need to memorize CLI commands.

## What to do now

1. Open **Cursor** or **Claude Code** in this project.
2. Start with **Specify**:

   ```
   /specify

   Add CSV export to the reports page. Users pick a date range.
   Out of scope: PDF export.
   ```

3. Review `.specs/features/…/spec.md` and **approve** before implementation.

## Agent commands (chat — not terminal)

| Command | Purpose |
| --- | --- |
| `/quick` | Tiny fix (≤3 files) — skip full spec |
| `/explore` | Research before committing to a feature |
| `/specify` | Written requirements — **start here** for real work |
| `/discuss` | Resolve gray product decisions |
| `/plan` | Technical design (Complex) |
| `/tasks` | Job list with tests and “done when” |
| `/task-graph` | Parallel work DAG (3+ tasks) |
| `/analyze` | Spec ↔ tasks check before approval |
| `/loop` | Implement **one task at a time** |
| `/verify` | Independent proof (fresh context) |
| `/archive` | Fold PASS feature into domain memory |
| `/converge` | Recover when spec and code drifted |
| `/handoff` | Update STATE.md end of session |
| `/project-init` | Map existing repo (brownfield, once) |
| `/constitution` | Project principles (once) |
| `/lessons` | Learn from verify failures |

Full detail for each command: repository **README** (Agent commands section).

## CLI you might run yourself

| Command | When |
| --- | --- |
| `install` | First time or upgrade |
| `project-init` | Brownfield repo (optional) |
| `doctor` | Install looks broken |
| `validate-spec` / `validate-state` | Double-check gates manually |

Everything else is normally run **by the agent**.

## Where things live

| Path | Purpose |
| --- | --- |
| `.cursor/skills/agent-architecture.md` | Hub — phase map |
| `.specs/STATE.md` | Where you left off |
| `.specs/features/` | One folder per feature |
| `.specs/harness/scripts/` | Automatic gates |
