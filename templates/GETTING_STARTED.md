# Getting started

You installed the **Spec Guardrails**. You do **not** need to memorize CLI commands.

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

Type these in **Cursor or Claude Code**. They load phase procedures from `.cursor/skills/references/`. The agent runs gates for you.

| Command | When |
| --- | --- |
| `/specify` | **Start here** — written requirements |
| `/tasks` | Break into jobs after spec approval |
| `/loop` | Implement — agent runs `loop-plan` each wave |
| `/verify` | Fresh-context proof after last task |
| `/quick` | Tiny fix only (≤3 files) |

**Typical order:** `/specify` → `/tasks` → `/analyze` → `/loop` → `/verify` → `/archive`

**Full reference** (every command, examples, CLI): [Agent commands](https://github.com/luizssantiago92/spec-guardrails/blob/main/docs/guide/agent-commands.md)

---

## CLI you might run yourself (terminal)

| Command | When |
| --- | --- |
| `install` | First time or upgrade |
| `project-init` | Brownfield repo (optional) |
| `doctor` | Install looks broken |
| `validate-spec` / `validate-state` | Double-check gates manually |

Everything else (`loop-plan`, `validate-tasks`, `check-commit`, …) is normally run **by the agent**.

---

## Where things live

| Path | Purpose |
| --- | --- |
| `.cursor/skills/agent-architecture.md` | Hub — phase map |
| `.specs/STATE.md` | Where you left off |
| `.specs/features/` | One folder per feature |
| `.specs/guardrails/scripts/` | Automatic gates |

More guides: [docs/guide/Home.md](https://github.com/luizssantiago92/spec-guardrails/blob/main/docs/guide/Home.md)
