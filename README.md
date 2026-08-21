# Spec-Driven Harness

[![npm version](https://img.shields.io/npm/v/@luizsantiago/agentic-harness.svg)](https://www.npmjs.com/package/@luizsantiago/agentic-harness)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**A seatbelt for AI coding agents** — agree on the goal in writing, break work into provable steps, run automatic checks before calling anything “done”, and verify with a fresh context that did not write the code.

## Install

```bash
npx @luizsantiago/agentic-harness install
```

**That is the whole setup.** Skills, gates, and `.specs/` land in your project. Open the agent and describe what you want to build.

After install, read **`.specs/GETTING_STARTED.md`** in your repo — it explains what to do without memorizing commands.

| Need | Command |
| --- | --- |
| First time / upgrade | `install` |
| Repo already has code | `project-init` (optional) |
| Something looks wrong | `doctor` |
| Full command list | `--help` |

**Requirements:** Node.js 18+. Python 3.10+ for automatic gates (without Python the agent still follows the same checklists).

npm: [`@luizsantiago/agentic-harness`](https://www.npmjs.com/package/@luizsantiago/agentic-harness) **1.2.x**

---

## How you actually use it (no CLI cramming)

You **do not** run a dozen terminal commands. The **agent** does, at the right phase.

1. **Install** (once) — command above.
2. **Open Cursor or Claude Code** and say what you want, for example:

   > Specify a feature: add CSV export to reports. Keep PDF out of scope.

3. The agent follows the hub (`agent-architecture.md`): writes specs under `.specs/`, runs gates, implements task by task, verifies with a fresh context.

**You** step in to approve specs/tasks and answer product questions. **Gates** (`validate-spec`, `validate-tasks`, …) are the agent’s brakes — you can run them manually to audit paperwork, but that is optional.

Plain-language tour: [docs/guide/Home.md](docs/guide/Home.md) · [Quick start](docs/guide/Quick-start.md)

---

## `/specify` — start every real feature here

**`/specify`** is the first mandatory phase for anything bigger than a quick fix. It is **not** a terminal command — you ask the **agent** to specify, and it loads `references/specify.md`.

### Purpose

Before any production code, you and the agent **agree in writing** on:

- **What** must be built (requirements with IDs like `REQ-001`)
- **What** is assumed or explicitly out of scope
- **How** success is tested (acceptance criteria with `SHALL` / `MUST`)

That agreement lives in `.specs/features/NNN-slug/spec.md`. Nothing gets implemented until you approve this document (and the spec gate passes).

### How to invoke it (chat)

In Cursor or Claude Code, after `install`:

```
/specify

Add CSV export to the reports page. Users pick a date range.
Out of scope: PDF export and scheduled emails.
```

Plain language works too — the agent should recognize the Specify phase:

```
Specify a feature: users can export reports as CSV for a date range.
Keep PDF out of scope.
```

**What the agent does:**

1. Runs `feature-init` (creates folder, branch, `STATE.md`) — Medium+ work
2. Drafts `spec.md` with requirements and testable criteria
3. Runs `validate-spec` and fixes until the gate passes
4. **Stops and asks you to approve** before Tasks or Execute

### CLI tied to Specify (optional for you)

You rarely run these yourself — the agent does. Useful to know what is happening:

| Command | Role in Specify |
| --- | --- |
| `feature-init "description"` | Creates `.specs/features/001-slug/`, updates `STATE.md`, branch `feat/001-slug` |
| `validate-spec [feature]` | Gate: spec is complete and testable — **must pass before you approve** |
| `phase-context specify` | Prints project rules from `.specs/config.yaml` for this phase |

Example if you start from the terminal:

```bash
npx @luizsantiago/agentic-harness feature-init "add CSV export to reports"
# Agent or you draft .specs/features/001-add-csv-export-to-reports/spec.md
npx @luizsantiago/agentic-harness validate-spec 001-add-csv-export-to-reports
```

### When to skip Specify

**Quick tier only** — ≤3 files, no design decisions, no new dependencies. Use `/quick` instead. Everything else starts with `/specify`.

---

## What this package is (and is not)

| This package | Not this package |
| --- | --- |
| Skills + Python gates + `.specs/` memory | A desktop agent or chat runtime |
| Spec → tasks → verify workflow | Harness.io CI/CD ([different product](https://github.com/harness/harness-skills)) |
| One phase loaded at a time (saves tokens) | Pasting every prompt into every message |

---

## How work flows

### Feature pipeline (phases)

```
EXPLORE? → SPECIFY → DISCUSS? → DESIGN? → TASKS? → ANALYZE → EXECUTE → VERIFY → ARCHIVE
```

| Tier | When | Path |
| --- | --- | --- |
| **Quick** | ≤3 files | Describe → implement → verify → commit |
| **Simple** | Small change | Specify → Execute → Verify |
| **Medium** | New feature | Specify → Tasks → Execute → Verify |
| **Complex** | Architecture / APIs | + Discuss, Design, optional AppSec/QA |

### The Execute loop (`/loop`)

Inside the agent (not a CLI command): pick **one task** → test first → implement → gate → **one commit** → repeat. Then **Verify** in a **fresh context**.

### Operational loops

Repo maintenance (triage, CI, deps) — see [loop patterns](docs/guide/loop-patterns.md). Separate from feature work.

---

## Skills (what install copies)

The agent loads **one working set per turn**, not the full library.

### Hub

| Skill | Role |
| --- | --- |
| `agent-architecture.md` | Contract, phase map, when to run gates |

### Sister skills

| Skill | When |
| --- | --- |
| `engineering-standards.md` | Execute — quality, secrets, commits |
| `task-graph-engineering.md` | 3+ tasks or parallel work |
| `security-review.md` | Verify — OWASP checklist |
| `git-handoff.md` | Session end — commit `.specs/` |
| `appsec.md` / `qa-strategy.md` / `code-simplify.md` / `ship-ready.md` | **Conditional** — one at a time |

### Phase references (`references/`)

| Reference | Phase |
| --- | --- |
| `specify.md` | Written requirements |
| `tasks.md` | Job breakdown |
| `implement.md` | **`/loop`** — one task at a time |
| `validate.md` | Independent verify |
| `explore.md`, `discuss.md`, `design.md`, `analyze.md`, `archive.md`, … | Other phases |

Always-on: `.cursor/rules/engineering-baseline.mdc`

---

## Gates (automatic brakes)

Scripts in `.specs/harness/scripts/`. Exit ≠ 0 → stop and fix.

| Gate | Blocks |
| --- | --- |
| `validate-spec` | Incomplete spec |
| `validate-tasks` | Bad tasks, missing `task-graph.md` when 3+ tasks |
| `analyze-artifacts` | Spec ↔ tasks drift |
| `check-commit` | Bad commit message |
| `validate-state` | Fake “done” (no PASS + test evidence) |
| `lessons` | Ungrounded lessons |

Details: [Gates and guarantees](docs/guide/Gates-and-guarantees.md) · [`prd/gate-stability.md`](prd/gate-stability.md)

---

## Token cost (measured)

| Profile | Est. tokens | When |
| ---: | ---: | --- |
| Full dump (don’t) | ~31k | — |
| Specify turn | ~9k | Planning |
| Execute `/loop` | ~4k | One task |
| Verify | ~6k | Review |

~71% / ~86% savings vs full dump (CI: `test_token_cost.test.js`). [Token efficiency](docs/guide/Token-efficiency.md)

---

## CLI reference (when you need it)

Most users only touch **`install`**, optionally **`project-init`** or **`doctor`**. Everything else is for the agent or power users.

<details>
<summary><strong>All commands</strong> (click to expand)</summary>

### Setup

| Command | Purpose |
| --- | --- |
| `install [--preset node-ts]` | Copy harness into project |
| `init-config --preset <name>` | Config only |
| `preset list` / `preset show` | Inspect presets |
| `project-init [--dry-run]` | Brownfield scan |
| `doctor [--json]` | Readiness audit |
| `phase-context <phase>` | Print phase rules from config |

### Per feature (usually agent-driven)

| Command | Purpose |
| --- | --- |
| `feature-init "description"` | New feature folder + branch |
| `validate-spec` | Gate spec |
| `analyze-artifacts` + `validate-tasks` | Gate tasks |
| `check-commit --message "..."` | Gate commit message |
| `validate-state` | Gate completion |
| `archive-feature` | Fold into domain memory |

</details>

---

## What install writes

| Path | Role |
| --- | --- |
| `.specs/GETTING_STARTED.md` | **Start here** after install |
| `.cursor/skills/` | Hub + references |
| `.specs/harness/scripts/` | Gates |
| `.specs/STATE.md` | Handoff between sessions |

Re-run `install` to refresh skills; `STATE.md` and your edits are kept.

---

## Learn more

[Quick start](docs/guide/Quick-start.md) · [How it works](docs/guide/How-it-works.md) · [FAQ](docs/guide/FAQ.md) · [Credits](docs/guide/credits.md)

---

## Upgrading

```bash
npx @luizsantiago/agentic-harness install
```

| Version | Highlights |
| --- | --- |
| **1.1.x** | `project-init` brownfield |
| **1.0.x** | Config presets, `init-config` |
| **0.9.x** | `archive-feature`, delta merge |
| **0.8.x** | `feature-init`, git tiers |

[Releases](https://github.com/luizssantiago92/spec-driven-harness/releases)

---

## Development

```bash
git clone https://github.com/luizssantiago92/spec-driven-harness.git
cd spec-driven-harness && npm test
npm run harness -- install
```

---

## Credits

[docs/guide/credits.md](docs/guide/credits.md) — tlc-spec-driven, addyosmani/agent-skills, graph-engineering, loop-engineering, awesome-harness-engineering.

## License

MIT
