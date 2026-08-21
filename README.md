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

npm: [`@luizsantiago/spec-seatbelt`](https://www.npmjs.com/package/@luizsantiago/spec-seatbelt) **2.2.x**

---

## How you actually use it (no CLI cramming)

You **do not** run a dozen terminal commands. The **agent** does, at the right phase.

1. **Install** (once) — terminal command above.
2. **Open Cursor or Claude Code** and use **agent commands** (chat) — see [Agent commands](#agent-commands-chat--not-the-terminal) below.
3. The agent follows the hub (`agent-architecture.md`): writes specs under `.specs/`, runs gates, implements in waves, verifies with a fresh context.

**You** step in to approve specs/tasks and answer product questions. **Gates** (`validate-spec`, `validate-tasks`, …) are the agent’s brakes — you can run them manually to audit paperwork, but that is optional.

Plain-language tour: [docs/guide/Home.md](docs/guide/Home.md) · [Quick start](docs/guide/Quick-start.md)

---

## Agent commands (chat — not the terminal)

> **Agent commands** are phrases you type in **Cursor or Claude Code** — not in your shell.
> They tell the agent which **phase procedure** to load from `.cursor/skills/references/`.
> The agent runs Python gates and CLI helpers (`validate-spec`, `loop-plan`, …) for you.

| Command | Purpose (what it does) | When to use | How you invoke it |
| --- | --- | --- | --- |
| `/quick` | Tiny fix without full spec | ≤3 files, no new deps, no auth/payments | `/quick` + one-line description |
| `/explore` | Research and compare options | Idea is unclear; no production code yet | `/explore` + question or spike goal |
| `/specify` | Written requirements (`spec.md`) | **Start here** for any real feature | `/specify` + what to build + out of scope |
| `/discuss` | Lock gray product decisions | Auth, payments, ambiguity during Specify | `/discuss` + questions to settle |
| `/plan` | Technical design (`design.md`) | Complex tier — APIs, architecture, new patterns | `/plan` + design questions |
| `/tasks` | Atomic job list (`tasks.md`) | Medium+ after approved spec | `/tasks` + “break into tasks” |
| `/task-graph` | Parallel DAG (`task-graph.md`) | 3+ tasks or parallel work | `/task-graph` + “mark parallel groups” |
| `/analyze` | Spec ↔ tasks consistency | Before you approve `tasks.md` | `/analyze` + “check before I approve” |
| `/loop` | Implement (Execute) | After approved tasks; production code | `/loop` + “run loop-plan, next wave” |
| `/verify` | Independent proof | **Always** after last task (fresh context) | `/verify` + “you did not write this code” |
| `/archive` | Fold feature into domain memory | After Verify **PASS** | `/archive` + domain name |
| `/converge` | Recover from spec/code drift | Mid-build discovery invalidates spec/tasks | `/converge` + what drifted |
| `/handoff` | Session snapshot (`STATE.md`) | End of chat; resume later | `/handoff` + next step |
| `/project-init` | Brownfield repo map | Once, existing codebase | `/project-init` + “scan this repo” |
| `/constitution` | Project principles | Once, greenfield or team onboarding | `/constitution` + principles |
| `/lessons` | Record verify failures | After Verify FAIL — avoid repeat mistakes | `/lessons` + what failed |

**Typical pipeline** (optional steps marked with `?`):

```
/explore? → /specify → /discuss? → /plan? → /tasks? → /task-graph? → /analyze → /loop → /verify → /archive
```

Each command below uses the same layout: **Purpose · When · How · What the agent does · CLI · Skip when**.

---

### `/specify` — start every real feature here

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/specify.md` |
| **Purpose** | Agree in writing on **what** to build, assumptions, out of scope, and testable acceptance criteria (`REQ-001`, …) in `spec.md` |
| **When** | First step for any feature bigger than a quick fix; before Tasks or Execute |
| **How** | Paste in chat — slash form or plain language (see example) |

**Chat example:**

```
/specify

Add CSV export to the reports page. Users pick a date range.
Out of scope: PDF export and scheduled emails.
```

Plain language also works:

```
Specify a feature: users can export reports as CSV for a date range.
Keep PDF out of scope.
```

**What the agent does:**

1. Runs `feature-init` (creates folder, branch, `STATE.md`) — Medium+ work
2. Drafts `spec.md` with requirements and testable criteria
3. Runs `validate-spec` and fixes until the gate passes
4. **Stops and asks you to approve** before Tasks or Execute

**CLI (agent runs — optional for you):**

| Command | Role in Specify |
| --- | --- |
| `feature-init "description"` | Creates `.specs/features/001-slug/`, updates `STATE.md`, branch `feat/001-slug` |
| `validate-spec [feature]` | Gate: spec is complete and testable — **must pass before you approve** |
| `phase-context specify` | Prints project rules from `.specs/config.yaml` for this phase |

```bash
npx @luizsantiago/spec-seatbelt feature-init "add CSV export to reports"
npx @luizsantiago/spec-seatbelt validate-spec 001-add-csv-export-to-reports
```

**Skip when:** Quick tier only (≤3 files) — use `/quick` instead.

---

### `/quick` — tiny changes only (≤3 files)

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/quick-mode.md` |
| **Purpose** | Bug fix, copy tweak, or config change — no full spec ceremony |
| **When** | ≤3 files, no design decisions, no new dependencies, no auth/payments |
| **How** | `/quick` + short description of the change |

**Chat example:**

```
/quick

Fix the typo on the settings page title. One file only.
```

**What the agent does:** Implements → runs tests → `check-commit` → done. No `feature-init`, no `spec.md`.

**CLI (agent runs):** `check-commit --message "..."` only.

**Skip when:** More than 3 files, new dependencies, auth/payments/data — use `/specify` instead.

---

### `/explore` — think before you commit to a feature (optional)

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/explore.md` |
| **Purpose** | Research ideas, compare approaches, or spike — **no production code** |
| **When** | The idea is unclear; you want options before committing to a feature |
| **How** | `/explore` + question, comparison, or spike goal |

**Chat example:**

```
/explore

Should we use WebSockets or SSE for live report updates? Compare trade-offs.
```

**What the agent does:** Writes notes; may update `STATE.md`. Does not open a feature folder unless you proceed to `/specify`.

**CLI (agent runs):** None required.

**Skip when:** You already know what to build — go straight to `/specify`.

---

### `/discuss` — resolve gray areas (conditional)

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/discuss.md` |
| **Purpose** | Lock product decisions before the spec is final — auth rules, data model, edge cases |
| **When** | During or right after Specify when triggers fire (auth, payments, persistence, ambiguity) |
| **How** | `/discuss` + the questions you need answered |

**Chat example:**

```
/discuss

For CSV export: max rows? Empty date range behavior? Who can export — any user or admins only?
```

**What the agent does:** Produces `.specs/features/…/context.md` with your answers.

**CLI (agent runs):** None required.

**Skip when:** Requirements are already unambiguous.

---

### `/plan` — technical design (optional, Complex tier)

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/design.md` |
| **Purpose** | Document architecture, APIs, and patterns **before** tasks |
| **When** | Complex tier — real design decisions, new APIs, new patterns |
| **How** | `/plan` + what to design (endpoints, data flow, error model, …) |

**Chat example:**

```
/plan

Design the CSV export API: endpoint shape, streaming vs buffer, error codes.
```

**What the agent does:** Writes `.specs/features/…/design.md`. **Stops for your approval** before `/tasks`.

**CLI (agent runs):** None required.

**Skip when:** Simple, localized change with no new patterns.

---

### `/tasks` — break work into provable jobs (Medium+)

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/tasks.md` |
| **Purpose** | Turn the approved spec into atomic tasks — files, tests, gate, binary “done when” |
| **When** | Medium+ features after you approved `spec.md` (and `design.md` when it exists) |
| **How** | `/tasks` + “break this feature into implementable tasks” |

**Chat example:**

```
/tasks

Break the CSV export feature into implementable tasks.
```

**What the agent does:**

1. Writes `tasks.md` (and `task-graph.md` if 3+ tasks)
2. Runs `analyze-artifacts` + `validate-tasks`
3. **Stops for your approval** before `/loop`

**CLI (agent runs — optional for you):**

| Command | Role |
| --- | --- |
| `analyze-artifacts [feature]` | Spec ↔ tasks consistency |
| `validate-tasks [feature]` | Task shape, REQ coverage, file overlap |

**Skip when:** ≤3 obvious steps — Execute lists them inline (if >5 steps appear, come back and run `/tasks`).

---

### `/task-graph` — parallel work topology (3+ tasks)

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `task-graph-engineering.md` |
| **Purpose** | Draw which jobs can run in parallel and which need a separate verifier |
| **When** | 3+ tasks or any parallel work; usually part of `/tasks` |
| **How** | `/task-graph` + “show the DAG and mark parallel groups” |

**Chat example:**

```
/task-graph

Show the DAG for the CSV export tasks and mark parallel groups.
```

**What the agent does:** Writes or updates `.specs/features/…/task-graph.md` per `task-graph-engineering.md`.

**CLI (agent runs):** `validate-tasks` enforces `task-graph.md` when there are 3+ tasks.

**Skip when:** ≤2 tasks with no parallel work.

### `/analyze` — cross-check before you approve tasks

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/analyze.md` |
| **Purpose** | Catch drift between spec, design, and tasks **before** implementation |
| **When** | After `/tasks`, before you say “approved — go implement” |
| **How** | `/analyze` + “check spec and tasks are consistent” |

**Chat example:**

```
/analyze

Check spec and tasks are consistent before I approve.
```

**What the agent does:** Runs `analyze-artifacts`; reports gaps; fixes or escalates.

**CLI (agent runs):** `analyze-artifacts [feature]`

**Skip when:** Tasks phase was skipped (Simple tier).

---

### `/loop` — orchestrate Execute (parallel when safe)

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/implement.md` |
| **Purpose** | Implement approved tasks — test-first, one commit per task, gates between steps |
| **When** | After you approved `tasks.md`; this is the **production code** phase |
| **How** | `/loop` + “run loop-plan, implement the next wave” (+ sub-agents if parallel) |

**Chat example:**

```
/loop

Run loop-plan, then implement the next wave for the CSV export feature.
Use sub-agents for any parallel group.
```

**What the agent does each round:**

1. `loop-plan [feature]` — next wave + parallel groups
2. **Parallel group (2+ tasks):** dispatch sub-agents (you confirm) per `sub-agents.md`
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

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/validate.md` |
| **Purpose** | Prove the spec was met — with test `file:line` evidence, not self-report |
| **When** | **Always** after the last task; verifier must **not** have written the code |
| **How** | `/verify` + feature name + “fresh context — you did not implement this” |

**Chat example:**

```
/verify

Verify the CSV export feature against spec.md. Fresh context — you did not implement this.
```

**What the agent does:**

1. New / clean context (author ≠ verifier)
2. Writes `.specs/features/…/validation.md` with verdict **PASS** or gaps
3. Runs `validate-state`
4. On FAIL → fix tasks → bounded re-verify (max 3 rounds)

**CLI (agent runs — optional for you):**

| Command | Role |
| --- | --- |
| `validate-state [feature]` | Gate: PASS + evidence shape |

**Never skip** (except Quick tier uses a lighter path inside `quick-mode.md`).

---

### `/archive` — fold finished work into project memory

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/archive.md` |
| **Purpose** | Merge verified feature into long-lived domain truth and update the roadmap |
| **When** | Only after `/verify` returns **PASS** |
| **How** | `/archive` + feature or domain name |

**Chat example:**

```
/archive

Archive the CSV export feature into the reports domain.
```

**What the agent does:**

1. Runs `archive-feature`
2. Updates `.specs/domains/…/spec.md`, `ROADMAP.md`, resets `STATE.md`

**CLI (agent runs — optional for you):**

```bash
npx @luizsantiago/spec-seatbelt archive-feature 001-add-csv-export-to-reports
```

**Skip when:** Verify has not passed.

---

### `/converge` — spec and code drifted (recovery)

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/converge.md` |
| **Purpose** | Re-sync when implementation proved the spec or tasks are wrong |
| **When** | Mid-build discovery; spec/tasks no longer match reality |
| **How** | `/converge` + describe what drifted |

**Chat example:**

```
/converge

The API shape changed during implementation. Reconcile spec, tasks, and what was built.
```

**What the agent does:** Runs `analyze-artifacts`; proposes spec/task updates; **stops for your approval** before more `/loop`.

**CLI (agent runs):** `analyze-artifacts [feature]`

---

### `/handoff` — end of session

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/memory.md` |
| **Purpose** | Persist decisions and next step so the **next** chat can continue |
| **When** | End of a session; before switching tasks or agents |
| **How** | `/handoff` + what you finished and what is next |

**Chat example:**

```
/handoff

Update STATE.md — next step is task T3, blocked on API review.
```

**What the agent does:** Updates `.specs/STATE.md`; commits `.specs/` locally (Tier 0 — no push without your OK).

**CLI (agent runs):** None required.

---

### `/project-init` — brownfield: map an existing repo (once)

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/project-init.md` |
| **Purpose** | Scan existing codebase → `PROJECT.md`, domain stubs, `ROADMAP`, config |
| **When** | Once per repo, **before** the first `/specify` on legacy code |
| **How** | `/project-init` + “scan this repo and scaffold .specs/” |

**Chat example:**

```
/project-init

Scan this repo and scaffold .specs/ project memory.
```

**What the agent does:** Runs brownfield procedure in `references/project-init.md`.

**CLI (you or agent):**

```bash
npx @luizsantiago/spec-seatbelt project-init
# preview: project-init --dry-run
```

**Skip when:** Greenfield repo with no code yet — go straight to `/specify`.

---

### `/constitution` — project principles (once)

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/constitution.md` |
| **Purpose** | Governing rules (quality bar, stack, non-negotiables) for every later spec |
| **When** | New greenfield project or team onboarding |
| **How** | `/constitution` + the principles you want enforced |

**Chat example:**

```
/constitution

Draft principles: English artifacts, test-first, no secrets in repo.
```

**What the agent does:** Writes `.specs/project/CONSTITUTION.md`.

**CLI (agent runs):** None required.

**Skip when:** Principles already exist and are current.

---

### `/lessons` — learn from verify failures

| | |
| --- | --- |
| **Type** | Agent command (chat) — loads `references/lessons.md` |
| **Purpose** | Record grounded lessons when Verify fails — avoid repeating mistakes |
| **When** | After `/verify` FAIL or PASS WITH GAPS |
| **How** | `/lessons` + what failed and what to do differently next time |

**Chat example:**

```
/lessons

Add a lesson from the validation gaps in this feature.
```

**What the agent does:** Uses `lessons.py`; confirmed lessons appear in `LESSONS.md`.

**CLI (agent runs):** `lessons add` / `lessons list`

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

Scripts in `.specs/seatbelt/scripts/`. Exit ≠ 0 → stop and fix.

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
| `install [--preset node-ts]` | Copy seatbelt into project |
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
| `.specs/seatbelt/scripts/` | Gates |
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

**Renamed from `@luizsantiago/agentic-harness`.** Same layout; CLI is `spec-seatbelt`. Run `install` once after switching — gates move to `.specs/seatbelt/scripts/` (legacy `.specs/harness/scripts/` still works until you reinstall).

| Version | Highlights |
| --- | --- |
| **2.2.x** (`spec-seatbelt`) | Internal rename: `.specs/seatbelt/scripts/`, `SPEC-SEATBELT` markers, repo `spec-seatbelt` |
| **2.1.x** (`spec-seatbelt`) | `loop-plan` — parallel waves + sub-agent orchestration in `/loop` |
| **2.0.x** (`spec-seatbelt`) | Package rename from `agentic-harness`; CLI is `spec-seatbelt` |
| **1.0.x** (`spec-seatbelt`) | First rename commit (superseded by 2.0.0 — use 2.0.x) |
| **1.3.x** (`agentic-harness`) | Last release under the old name — use `spec-seatbelt` going forward |
| **1.1.x** | `project-init` brownfield |
| **1.0.x** (`agentic-harness`) | Config presets, `init-config` |
| **0.9.x** | `archive-feature`, delta merge |
| **0.8.x** | `feature-init`, git tiers |

[Releases](https://github.com/luizssantiago92/spec-seatbelt/releases)

---

## Development

```bash
git clone https://github.com/luizssantiago92/spec-seatbelt.git
cd spec-seatbelt && npm test
npm run seatbelt -- install
```

---

## Credits

[docs/guide/credits.md](docs/guide/credits.md) — tlc-spec-driven, addyosmani/agent-skills, graph-engineering, loop-engineering, awesome-harness-engineering.

## License

MIT
