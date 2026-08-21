# Getting started

You installed the **Spec Seatbelt**. You do **not** need to memorize CLI commands.

## What to do now

1. Open **Cursor** or **Claude Code** in this project.
2. Start with **Specify** (an **agent command** — chat, not terminal):

   ```
   /specify

   Add CSV export to the reports page. Users pick a date range.
   Out of scope: PDF export.
   ```

3. Review `.specs/features/…/spec.md` and **approve** before implementation.

---

## Agent commands (chat — not terminal)

> Type these in **Cursor or Claude Code**. They load phase procedures from `.cursor/skills/references/`.
> The agent runs gates and CLI helpers for you.

| Command | What it's for | When to use | How (chat) |
| --- | --- | --- | --- |
| `/quick` | Tiny fix without full spec | ≤3 files, no new deps | `/quick` + one-line fix |
| `/explore` | Research before committing | Idea unclear; no prod code | `/explore` + question |
| `/specify` | Written requirements | **Start here** for real features | `/specify` + goal + out of scope |
| `/discuss` | Gray product decisions | Auth, payments, ambiguity | `/discuss` + questions |
| `/plan` | Technical design | Complex — APIs, architecture | `/plan` + design scope |
| `/tasks` | Atomic job list | After approved spec | `/tasks` + “break into tasks” |
| `/task-graph` | Parallel work DAG | 3+ tasks or parallel work | `/task-graph` + “mark groups” |
| `/analyze` | Spec ↔ tasks check | Before approving tasks | `/analyze` + “check consistency” |
| `/loop` | Implement code | After approved tasks | `/loop` + “loop-plan, next wave” |
| `/verify` | Independent proof | **Always** after last task | `/verify` + fresh context |
| `/archive` | Domain memory | After Verify PASS | `/archive` + domain |
| `/converge` | Recover from drift | Spec/tasks ≠ code | `/converge` + what changed |
| `/handoff` | Session snapshot | End of chat | `/handoff` + next step |
| `/project-init` | Brownfield map | Once, existing repo | `/project-init` + “scan repo” |
| `/constitution` | Project principles | Once, greenfield | `/constitution` + principles |
| `/lessons` | Learn from failures | After Verify FAIL | `/lessons` + what failed |

**Typical order:** `/specify` → `/tasks` → `/analyze` → `/loop` → `/verify` → `/archive`

Full detail (Purpose · When · How · examples): repository **README** → [Agent commands](https://github.com/luizssantiago92/spec-seatbelt#agent-commands-chat--not-the-terminal).

---

## CLI you might run yourself (terminal)

These are **not** agent commands — you run them in your shell:

| Command | When |
| --- | --- |
| `install` | First time or upgrade |
| `project-init` | Brownfield repo (optional) |
| `doctor` | Install looks broken |
| `validate-spec` / `validate-state` | Double-check gates manually |

Everything else (`validate-tasks`, `loop-plan`, `check-commit`, …) is normally run **by the agent**.

---

## Where things live

| Path | Purpose |
| --- | --- |
| `.cursor/skills/agent-architecture.md` | Hub — phase map |
| `.specs/STATE.md` | Where you left off |
| `.specs/features/` | One folder per feature |
| `.specs/seatbelt/scripts/` | Automatic gates |
