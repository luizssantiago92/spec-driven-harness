# Spec Seatbelt

[![npm version](https://img.shields.io/npm/v/@luizsantiago/spec-seatbelt.svg)](https://www.npmjs.com/package/@luizsantiago/spec-seatbelt)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**A seatbelt for AI coding agents** — agree on the goal in writing, break work into provable steps, run automatic checks before calling anything “done”, and verify with a fresh context that did not write the code.

## Install

```bash
npx @luizsantiago/spec-seatbelt install
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

npm: [`@luizsantiago/spec-seatbelt`](https://www.npmjs.com/package/@luizsantiago/spec-seatbelt) **2.0.x**

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
npx @luizsantiago/spec-seatbelt feature-init "add CSV export to reports"
# Agent or you draft .specs/features/001-add-csv-export-to-reports/spec.md
npx @luizsantiago/spec-seatbelt validate-spec 001-add-csv-export-to-reports
```

### When to skip Specify

**Quick tier only** — ≤3 files, no design decisions, no new dependencies. Use `/quick` instead. Everything else starts with `/specify`.

---

## Other agent commands (same idea as `/specify`)

Every command below is **for the agent in chat**, not something you memorize in the terminal. Each loads one reference file from `.cursor/skills/references/`. The agent runs gates and CLI helpers for you.

**Typical order:**

```
/explore? → /specify → /discuss? → /plan? → /tasks? → /analyze → /loop → /verify → /archive
```

---

### `/quick` — tiny changes only (≤3 files)

**Purpose:** Bug fix, copy tweak, or config change — no full spec ceremony.

**Chat:**

```
/quick

Fix the typo on the settings page title. One file only.
```

**Agent:** Implements → runs tests → `check-commit` → done. No `feature-init`, no `spec.md`.

**CLI:** `check-commit --message "..."` only (agent runs it).

**Skip when:** More than 3 files, new dependencies, auth/payments/data — use `/specify` instead.

---

### `/explore` — think before you commit to a feature (optional)

**Purpose:** Research ideas, compare approaches, or spike — **no production code**.

**Chat:**

```
/explore

Should we use WebSockets or SSE for live report updates? Compare trade-offs.
```

**Agent:** Writes notes; may update `STATE.md`. Does not open a feature folder unless you proceed to `/specify`.

**CLI:** None required.

**Skip when:** You already know what to build — go straight to `/specify`.

---

### `/discuss` — resolve gray areas (conditional)

**Purpose:** Lock product decisions before the spec is final — auth rules, data model, edge cases.

**Chat:**

```
/discuss

For CSV export: max rows? Empty date range behavior? Who can export — any user or admins only?
```

**Agent:** Produces `.specs/features/…/context.md` with your answers. Runs inside or right after Specify when triggers fire (auth, payments, persistence, ambiguity).

**CLI:** None required.

**Skip when:** Requirements are already unambiguous.

---

### `/plan` — technical design (optional, Complex tier)

**Purpose:** Document architecture, APIs, and patterns **before** tasks — when there are real design decisions.

**Chat:**

```
/plan

Design the CSV export API: endpoint shape, streaming vs buffer, error codes.
```

**Agent:** Writes `.specs/features/…/design.md`. You approve before `/tasks`.

**CLI:** None required.

**Skip when:** Simple, localized change with no new patterns.

---

### `/tasks` — break work into provable jobs (Medium+)

**Purpose:** Turn the approved spec into atomic tasks — each with files, tests, gate, and binary “done when”.

**Chat:**

```
/tasks

Break the CSV export feature into implementable tasks.
```

**Agent:**

1. Writes `tasks.md` (and `task-graph.md` if 3+ tasks)
2. Runs `analyze-artifacts` + `validate-tasks`
3. **Stops for your approval** before `/loop`

**CLI (optional):**

| Command | Role |
| --- | --- |
| `analyze-artifacts [feature]` | Spec ↔ tasks consistency |
| `validate-tasks [feature]` | Task shape, REQ coverage, file overlap |

**Skip when:** ≤3 obvious steps — Execute lists them inline (if >5 steps appear, come back and run `/tasks`).

---

### `/task-graph` — parallel work topology (3+ tasks)

**Purpose:** Draw which jobs can run in parallel and which need a separate verifier — not a separate product phase, but a planning step inside Tasks.

**Chat:**

```
/task-graph

Show the DAG for the CSV export tasks and mark parallel groups.
```

**Agent:** Writes or updates `.specs/features/…/task-graph.md` per `task-graph-engineering.md`.

**CLI:** Enforced by `validate-tasks` when there are 3+ tasks (file must exist).

---

### `/analyze` — cross-check before you approve tasks

**Purpose:** Catch drift between spec, design, and tasks **before** implementation starts.

**Chat:**

```
/analyze

Check spec and tasks are consistent before I approve.
```

**Agent:** Runs `analyze-artifacts`; reports gaps; fixes or escalates.

**CLI:** `analyze-artifacts [feature]` (agent runs it).

**Skip when:** Tasks phase was skipped (Simple tier).

---

### `/loop` — orchestrate Execute (parallel when safe)

**Purpose:** Implement approved tasks — the agent **reads `task-graph.md`**, runs **`loop-plan`** each round, and dispatches **sub-agents for parallel groups** (disjoint files) or works **inline** one task at a time when not.

**Chat:**

```
/loop

Run loop-plan, then implement the next wave for the CSV export feature.
Use sub-agents for any parallel group.
```

**Agent each round:**

1. `loop-plan [feature]` — next wave + parallel groups
2. **Parallel group (2+ tasks):** dispatch sub-agents (owner confirms) per `sub-agents.md`
3. **Single task:** test first → implement → gate → `check-commit` → mark `[x]` in `tasks.md`
4. Merge after parallel rounds; repeat until done → `/verify`

**CLI (agent runs):**

| Command | Role |
| --- | --- |
| `loop-plan [feature] [--json]` | Next runnable wave; flags parallel groups |
| `check-commit --message "feat(scope): …"` | Conventional Commits gate |

**Skip when:** Nothing to implement yet — finish `/specify` and `/tasks` first.

---

### `/verify` — independent proof (always required)

**Purpose:** Someone who **did not write the code** checks the spec was met — with test `file:line` evidence, not “trust me”.

**Chat:**

```
/verify

Verify the CSV export feature against spec.md. Fresh context — you did not implement this.
```

**Agent:**

1. New / clean context (author ≠ verifier)
2. Writes `.specs/features/…/validation.md` with verdict **PASS** or gaps
3. Runs `validate-state`
4. On FAIL → fix tasks → bounded re-verify (max 3 rounds)

**CLI (optional):**

| Command | Role |
| --- | --- |
| `validate-state [feature]` | Gate: PASS + evidence shape |

**Never skip** (except Quick tier uses a lighter path inside `quick-mode.md`).

---

### `/archive` — fold finished work into project memory

**Purpose:** After Verify **PASS**, merge the feature spec into long-lived domain truth and update the roadmap.

**Chat:**

```
/archive

Archive the CSV export feature into the reports domain.
```

**Agent:**

1. Runs `archive-feature` (or you run it once)
2. Updates `.specs/domains/…/spec.md`, `ROADMAP.md`, resets `STATE.md`

**CLI:**

```bash
npx @luizsantiago/spec-seatbelt archive-feature 001-add-csv-export-to-reports
```

**Skip when:** Verify has not passed.

---

### `/converge` — spec and code drifted (recovery)

**Purpose:** Re-sync when implementation discovered the spec or tasks are wrong.

**Chat:**

```
/converge

The API shape changed during implementation. Reconcile spec, tasks, and what was built.
```

**Agent:** Runs `analyze-artifacts`; proposes spec/task updates; **you approve** before more `/loop`.

**CLI:** `analyze-artifacts [feature]`

---

### `/handoff` — end of session

**Purpose:** Persist decisions and next step so the **next** chat can continue without guessing.

**Chat:**

```
/handoff

Update STATE.md — next step is task T3, blocked on API review.
```

**Agent:** Updates `.specs/STATE.md`; commits `.specs/` locally (Tier 0 — no push without your OK).

**CLI:** None required.

---

### `/project-init` — brownfield: map an existing repo (once)

**Purpose:** Existing codebase — generate `PROJECT.md`, optional domain stubs, `ROADMAP`, config.

**Chat:**

```
/project-init

Scan this repo and scaffold .specs/ project memory.
```

**Agent:** Runs brownfield procedure in `references/project-init.md`.

**CLI:**

```bash
npx @luizsantiago/spec-seatbelt project-init
# preview: project-init --dry-run
```

**When:** Once per repo, before the first `/specify` on legacy code.

---

### `/constitution` — project principles (once)

**Purpose:** Governing rules (quality bar, stack choices, non-negotiables) referenced by every later spec.

**Chat:**

```
/constitution

Draft principles: English artifacts, test-first, no secrets in repo.
```

**Agent:** Writes `.specs/project/CONSTITUTION.md`.

**When:** New greenfield project or team onboarding.

---

### `/lessons` — learn from verify failures

**Purpose:** Record grounded lessons when Verify fails — so the next feature does not repeat the mistake.

**Chat:**

```
/lessons

Add a lesson from the validation gaps in this feature.
```

**Agent:** Uses `lessons.py`; confirmed lessons appear in `LESSONS.md`.

**CLI:** `lessons add` / `lessons list` (agent runs them).

---

## What this package is (and is not)

| This package | Not this package |
| --- | --- |
| Skills + Python gates + `.specs/` memory | A desktop agent or chat runtime |
| Spec → tasks → verify workflow | Harness.io CI/CD ([different product](https://github.com/harness/harness-skills)) |
| One phase loaded at a time (saves tokens) | Pasting every prompt into every message |

---

## How work flows (summary)

| Tier | Path |
| --- | --- |
| **Quick** | `/quick` → verify → commit |
| **Simple** | `/specify` → `/loop` → `/verify` |
| **Medium** | `/specify` → `/tasks` → `/loop` → `/verify` → `/archive` |
| **Complex** | + `/discuss`, `/plan`, optional AppSec/QA on verify |

Operational loops (CI, triage): [loop patterns](docs/guide/loop-patterns.md).

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
| `implement.md` | **`/loop`** — orchestrate waves; parallel sub-agents when safe |
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
| Execute `/loop` | ~4k | One task or one parallel wave |
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
npx @luizsantiago/spec-seatbelt install
```

**Renamed from `@luizsantiago/agentic-harness`.** Same repository and `.specs/` layout; CLI is now `spec-seatbelt`. Run `install` once after switching packages to refresh skills and references.

| Version | Highlights |
| --- | --- |
| **2.0.x** (`spec-seatbelt`) | Package rename from `agentic-harness`; CLI is `spec-seatbelt` |
| **1.0.x** (`spec-seatbelt`) | First rename commit (superseded by 2.0.0 — use 2.0.x) |
| **1.3.x** (`agentic-harness`) | Last release under the old name — use `spec-seatbelt` going forward |
| **1.1.x** | `project-init` brownfield |
| **1.0.x** (`agentic-harness`) | Config presets, `init-config` |
| **0.9.x** | `archive-feature`, delta merge |
| **0.8.x** | `feature-init`, git tiers |

[Releases](https://github.com/luizssantiago92/spec-driven-harness/releases)

---

## Development

```bash
git clone https://github.com/luizssantiago92/spec-driven-harness.git
cd spec-driven-harness && npm test
npm run seatbelt -- install
```

---

## Credits

[docs/guide/credits.md](docs/guide/credits.md) — tlc-spec-driven, addyosmani/agent-skills, graph-engineering, loop-engineering, awesome-harness-engineering.

## License

MIT
