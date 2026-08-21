# Spec-Driven Harness

[![npm version](https://img.shields.io/npm/v/@luizsantiago/agentic-harness.svg)](https://www.npmjs.com/package/@luizsantiago/agentic-harness)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**A seatbelt for AI coding agents** — agree on the goal in writing, break work into provable steps, run automatic checks before calling anything “done”, and verify with a fresh context that did not write the code.

## Install

```bash
npx @luizsantiago/agentic-harness install
```

That is the whole setup. It copies skills, gate scripts, and an empty `.specs/` memory folder into **your** project (Cursor and Claude Code).

**Requirements:** Node.js 18+. Python 3.10+ for automatic gates (without Python the agent still follows the same checklists by hand).

**Brownfield repo?** After install, run `npx @luizsantiago/agentic-harness project-init` to generate `PROJECT.md` and domain stubs from existing code.

**Check the install:** `npx @luizsantiago/agentic-harness doctor`

Re-run `install` anytime to refresh skills and gates. It does **not** overwrite `STATE.md`, `LESSONS.md`, or rules you edited.

npm: [`@luizsantiago/agentic-harness`](https://www.npmjs.com/package/@luizsantiago/agentic-harness) **1.2.x**

---

## What this package is (and is not)

| This package | Not this package |
| --- | --- |
| Skills + Python gates + `.specs/` memory | A desktop agent or chat runtime |
| Spec → tasks → verify workflow | Harness.io CI/CD ([different product](https://github.com/harness/harness-skills)) |
| One phase loaded at a time (saves tokens) | Pasting every prompt into every message |

Plain-language tour: [docs/guide/Home.md](docs/guide/Home.md). This README is the engineering reference.

---

## Your first feature (walkthrough)

The commands below are **examples**. Replace the description with your real feature.

```bash
# 1) Install the harness into the current repo
npx @luizsantiago/agentic-harness install

# 2) Start a new feature (creates folder + branch + STATE.md)
npx @luizsantiago/agentic-harness feature-init "add CSV export to reports"

# 3) You (or the agent) write .specs/features/001-add-csv-export-to-reports/spec.md
#    with requirements and acceptance criteria (SHALL / MUST).

# 4) Gate: spec must be complete before you approve it
npx @luizsantiago/agentic-harness validate-spec 001-add-csv-export-to-reports

# 5) For Medium+ work: write tasks.md, then validate before approval
npx @luizsantiago/agentic-harness validate-tasks 001-add-csv-export-to-reports

# 6) Implement task by task (/loop in the agent — see below)

# 7) Before calling the feature done
npx @luizsantiago/agentic-harness validate-state 001-add-csv-export-to-reports

# 8) After independent Verify PASS — fold into domain memory
npx @luizsantiago/agentic-harness archive-feature 001-add-csv-export-to-reports
```

**Quick fixes (≤3 files)?** Skip `feature-init` and use the Quick tier — see [How work flows](#how-work-flows).

---

## How work flows

### Feature pipeline (phases)

The agent follows phases in order. Only the phases your **tier** needs run.

```
EXPLORE? → SPECIFY → DISCUSS? → DESIGN? → TASKS? → ANALYZE → EXECUTE → VERIFY → ARCHIVE
```

| Tier | When to use | Path |
| --- | --- | --- |
| **Quick** | ≤3 files, no design decisions | Describe → implement → verify → commit |
| **Simple** | Small localized change | Specify → Execute → Verify |
| **Medium** | New feature, &lt;10 tasks | Specify → Tasks → Execute → Verify |
| **Complex** | Architecture, APIs, infra | + Discuss, Design, optional AppSec/QA |

Phase procedures live in `.cursor/skills/references/` (loaded on demand). The hub `agent-architecture.md` is the map.

### The Execute loop (`/loop`)

**`/loop`** is not a CLI command — it is the **agent skill** for implementation (`references/implement.md`):

1. Pick **one task** from `tasks.md`
2. Write or run tests first
3. Implement the smallest change that passes
4. Run the task’s **Gate** command (usually your test runner)
5. **One atomic commit** per task
6. Repeat until all tasks are done → then **Verify** with a **fresh context**

If the harness fails, fix and retry up to **3 times**, then escalate. Verify failures become fix tasks (bounded loop).

### Operational loops (repo maintenance)

Separate from feature work: triage, CI babysitting, dependency sweeps. See [docs/guide/loop-patterns.md](docs/guide/loop-patterns.md).

---

## Skills (what gets installed)

After `install`, skills live in `.cursor/skills/` and `.claude/skills/`. The agent loads **one working set per turn**, not the full library.

### Hub

| Skill | Role |
| --- | --- |
| `agent-architecture.md` | **Start here** — contract, phase map, complexity router, gate table |

### Sister skills (cross-cutting)

| Skill | When the agent loads it |
| --- | --- |
| `engineering-standards.md` | During Execute — code quality, secrets, commit rules |
| `task-graph-engineering.md` | 3+ tasks or parallel work — DAG, fake edges, diamond verify |
| `security-review.md` | During Verify — OWASP-style checklist |
| `git-handoff.md` | Session end, phase boundaries — commit `.specs/`, STATE |
| `appsec.md` | **Conditional** — auth, payments, PII, uploads (Complex / attack surface) |
| `qa-strategy.md` | **Conditional** — multi-step UI flows, regression (after AppSec if both apply) |
| `code-simplify.md` | **Conditional** — polish without behavior change (Medium+ or owner ask) |
| `ship-ready.md` | **Conditional** — ship checklist when owner asks (does not authorize push) |

At most **one** conditional sister in context at a time.

### Phase references (loaded per phase)

| Reference | Phase | What it does |
| --- | --- | --- |
| `explore.md` | Explore | Think before Specify |
| `project-init.md` | Brownfield | Map existing repo → PROJECT + domains |
| `constitution.md` | Once | Project governing principles |
| `specify.md` | Specify | Requirements, EARS, `feature-init` |
| `discuss.md` | Discuss | Resolve gray areas → `context.md` |
| `design.md` | Design | Technical design (Complex) |
| `tasks.md` | Tasks | Atomic tasks + coverage matrix |
| `analyze.md` | Analyze | Spec ↔ tasks consistency |
| `implement.md` | Execute | **`/loop`** — test-first, one commit per task |
| `validate.md` | Verify | Independent verifier, evidence, mutants |
| `archive.md` | Archive | Fold feature into domain truth |
| `converge.md` | On drift | Re-sync spec and tasks |
| `memory.md` | Handoff | Update `STATE.md` |
| `quick-mode.md` | Quick | Express lane for tiny changes |
| `context-limits.md` | Always (budget) | What **not** to load — token discipline |
| `lessons.md` | On FAIL | Grounded lessons from verify gaps |
| `sub-agents.md` | Parallel Execute | Worker payloads when graph splits |

Always-on rule: `.cursor/rules/engineering-baseline.mdc` (skills map + gate reminders).

---

## Gates (automatic brakes)

Gates are Python scripts in `.specs/harness/scripts/`. **Exit code ≠ 0 means STOP** — fix the artifact, re-run.

| CLI / script | When you run it | What it blocks |
| --- | --- | --- |
| `validate-spec` | Spec draft ready | Weak requirements, bad IDs, missing `SHALL`/`MUST` |
| `analyze-artifacts` | Before approving tasks | Spec ↔ tasks drift |
| `validate-tasks` | Task list ready | Missing fields, uncovered REQs, parallel `Files` overlap, missing `task-graph.md` when 3+ tasks |
| `check-commit` | Each commit | Non-conventional commit messages |
| `validate-state` | Before “done” | Missing `validation.md`, non-PASS, missing test `file:line` evidence |
| `lessons` | After verify FAIL | Ungrounded lesson entries |

Gates check **form and evidence shape**, not whether the feature is morally correct. Details: [docs/guide/Gates-and-guarantees.md](docs/guide/Gates-and-guarantees.md), [`prd/gate-stability.md`](prd/gate-stability.md).

**Git tiers:** Tier 0 (branch, local commits, `.specs/` edits) runs after you approve spec/tasks. Push, PR, merge, and deploy need explicit owner go-ahead.

---

## Token cost (measured)

Loading **one phase at a time** keeps skill context small. Figures below are **estimates** (`chars ÷ 4`, English/code mix) from the packaged skills — run `npm test` → `test_token_cost.test.js` to reproduce.

| Load profile | Est. tokens | Files | Typical turn |
| --- | ---: | ---: | --- |
| Naive full dump (all skills + refs) | ~31k | 27 | ❌ Don’t do this every message |
| Specify turn | ~9k | 5 | Planning a feature |
| Tasks turn | ~10k | 5 | Breaking down work |
| Execute `/loop` | ~4k | 3 | One implementation task |
| Verify turn | ~6k | 4 | Independent review |

**Savings vs naive dump:** ~71% on Specify, ~86% on Execute (CI test enforces minimum savings).

More: [docs/guide/Token-efficiency.md](docs/guide/Token-efficiency.md).

---

## CLI reference

### Setup once (or occasionally)

| Command | What it does |
| --- | --- |
| `install` | Copy skills, 17 references, gates, `.cursorrules`, `.specs/` scaffold |
| `install --preset node-ts` | Install + seed `.specs/config.yaml` if missing |
| `init-config --preset python` | Create config only (no full reinstall) |
| `preset list` / `preset show <name>` | Inspect built-in presets |
| `project-init` | Brownfield: scan repo → `PROJECT.md`, domains, `ROADMAP` |
| `doctor` | Harness Ready score + top 3 fixes |
| `phase-context <phase>` | Print config context + rules for a phase |

### Per feature

| Command | What it does |
| --- | --- |
| `feature-init "description"` | New `.specs/features/NNN-slug/`, `STATE.md`, branch |
| `validate-spec [feature]` | Gate the spec |
| `analyze-artifacts` + `validate-tasks` | Gate tasks + consistency |
| `check-commit --message "..."` | Conventional Commits gate |
| `validate-state [feature]` | Gate completion |
| `archive-feature [feature]` | Merge into domain + `ROADMAP` |

---

## What install writes

| Path | Role |
| --- | --- |
| `.cursor/skills/` · `.claude/skills/` | Hub, sisters, `references/` |
| `.cursor/rules/engineering-baseline.mdc` | Always-on project rule |
| `.specs/harness/scripts/*.py` | Gates |
| `.specs/STATE.md` · `LESSONS.md` | Handoff and lessons (preserved on reinstall) |
| `.specs/features/` · `project/` · `domains/` | Created empty for you to fill |

Assets copy from the **npm package**, not live GitHub. Override with `HARNESS_REPO_URL` only for forks or tests.

---

## Learn more

| Guide | Topic |
| --- | --- |
| [Quick start](docs/guide/Quick-start.md) | First ten minutes |
| [How it works](docs/guide/How-it-works.md) | Phases in plain language |
| [Loop patterns](docs/guide/loop-patterns.md) | Feature vs operational loops |
| [Ecosystem map](docs/guide/ecosystem.md) | How this fits other harness tools |
| [FAQ](docs/guide/FAQ.md) | Common questions |
| [Credits](docs/guide/credits.md) | Full attribution |

---

## Upgrading

```bash
npx @luizsantiago/agentic-harness install
```

Memory and edited rules are kept. Skim [GitHub Releases](https://github.com/luizssantiago92/spec-driven-harness/releases) after major jumps.

| Version | Highlights |
| --- | --- |
| **1.1.x** | `project-init` for brownfield repos |
| **1.0.x** | Config presets, `extends` / `overrides`, `init-config` |
| **0.9.x** | `archive-feature`, `phase-context`, delta merge |
| **0.8.x** | `feature-init`, explore/analyze/archive, git tiers |

---

## Development

```bash
git clone https://github.com/luizssantiago92/spec-driven-harness.git
cd spec-driven-harness
npm test
npm run harness -- install
```

---

## Credits

We adapted patterns from the open-source community — see [docs/guide/credits.md](docs/guide/credits.md).

| Source | License | What we borrowed |
| --- | --- | --- |
| [tlc-spec-driven](https://github.com/tech-leads-club/agent-skills/tree/main/packages/skills-catalog/skills/(development)/tlc-spec-driven) | CC-BY-4.0 | Phases, `.specs/` memory, gate lineage |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | MIT | Discuss / definition-of-done |
| [graph-engineering](https://github.com/codejunkie99/graph-engineering) | MIT | Task-graph topology |
| [loop-engineering](https://github.com/cobusgreyling/loop-engineering) | MIT | Operational loop patterns; `doctor` metaphor |
| [awesome-harness-engineering](https://github.com/ai-boost/awesome-harness-engineering) | CC0 | Ecosystem taxonomy |

## License

MIT
