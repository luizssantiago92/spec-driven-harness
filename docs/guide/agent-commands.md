# Agent commands (chat — not the terminal)

**Agent commands** are phrases you type in **Cursor or Claude Code** — not in your shell.
They tell the agent which **phase procedure** to load from `.cursor/skills/references/`.
The agent runs Python gates and CLI helpers (`validate-spec`, `loop-plan`, …) for you.

| Command | Purpose | When to use | How you invoke it |
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

Each section below uses: **Purpose · When · How · What the agent does · CLI · Skip when**.

---

## `/specify` — start every real feature here

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

**Skip when:** Quick tier only (≤3 files) — use `/quick` instead.

---

## `/quick` — tiny changes only (≤3 files)

| | |
| --- | --- |
| **Purpose** | Bug fix, copy tweak, or config change — no full spec ceremony |
| **When** | ≤3 files, no design decisions, no new dependencies, no auth/payments |
| **How** | `/quick` + short description of the change |

**What the agent does:** Implements → runs tests → `check-commit` → done. No `feature-init`, no `spec.md`.

**Skip when:** More than 3 files, new dependencies, auth/payments/data — use `/specify` instead.

---

## `/explore` — think before you commit (optional)

Research ideas, compare approaches, or spike — **no production code**. Does not open a feature folder unless you proceed to `/specify`.

---

## `/discuss` — resolve gray areas (conditional)

Lock product decisions before the spec is final — auth rules, data model, edge cases. Produces `.specs/features/…/context.md`.

---

## `/plan` — technical design (optional, Complex tier)

Document architecture, APIs, and patterns **before** tasks. Writes `design.md`. **Stops for your approval** before `/tasks`.

---

## `/tasks` — break work into provable jobs (Medium+)

Turn the approved spec into atomic tasks — files, tests, gate, binary “done when”. Runs `analyze-artifacts` + `validate-tasks`. **Stops for your approval** before `/loop`.

---

## `/task-graph` — parallel work topology (3+ tasks)

Draw which jobs can run in parallel. Writes or updates `task-graph.md` per `task-graph-engineering.md`.

---

## `/analyze` — cross-check before you approve tasks

Catch drift between spec, design, and tasks **before** implementation. Runs `analyze-artifacts`.

---

## `/loop` — orchestrate Execute (parallel when safe)

Implement approved tasks — test-first, one commit per task, gates between steps.

**What the agent does each round:**

1. `loop-plan [feature]` — next wave + parallel groups
2. **Parallel group (2+ tasks):** dispatch sub-agents (you confirm) per `sub-agents.md`
3. **Single task:** test first → implement → gate → `check-commit` → mark `[x]` in `tasks.md`
4. Merge after parallel rounds; repeat until done → `/verify`

---

## `/verify` — independent proof (always required)

Prove the spec was met — with test `file:line` evidence, not self-report. Verifier must **not** have written the code. Runs `validate-state`.

**Never skip** (except Quick tier uses a lighter path inside `quick-mode.md`).

---

## `/archive` — fold finished work into project memory

Only after `/verify` returns **PASS**. Runs `archive-feature`; updates domain spec, `ROADMAP.md`, resets `STATE.md`.

---

## `/converge` — spec and code drifted (recovery)

Re-sync when implementation proved the spec or tasks are wrong. Runs `analyze-artifacts`; **stops for your approval** before more `/loop`.

---

## `/handoff` — end of session

Persist decisions and next step in `.specs/STATE.md` so the **next** chat can continue.

---

## `/project-init` — brownfield: map an existing repo (once)

Scan existing codebase → `PROJECT.md`, domain stubs, `ROADMAP`, config. **Before** the first `/specify` on legacy code.

---

## `/constitution` — project principles (once)

Governing rules for every later spec. Writes `.specs/project/CONSTITUTION.md`.

---

## `/lessons` — learn from verify failures

Record grounded lessons when Verify fails. Uses `lessons.py`; confirmed lessons appear in `LESSONS.md`.

---

## Related

- [Concepts](concepts.md) — how spec-driven, loop, and graph fit together
- [Skills and hub](skills-and-hub.md) — what each skill file does
- [Gates reference](gates.md) — what the agent runs at each phase
- [Quick start](Quick-start.md) — first ten minutes
