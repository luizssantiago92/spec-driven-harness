# Spec Guardrails

[![npm version](https://img.shields.io/npm/v/@luizsantiago/spec-guardrails.svg)](https://www.npmjs.com/package/@luizsantiago/spec-guardrails)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Guardrails for AI coding agents** — agree on the goal in writing, break work into provable steps, run automatic checks before calling anything “done”, and verify with a fresh context that did not write the code.

**Token-efficient by design:** the agent loads **one phase guide per turn** (~9k est. tokens on Specify) instead of dumping the full skill library (~31k). Measured savings: **~72%** on planning, **~86%** on Execute vs a naive full reload ([details below](#token-cost)).

npm: [`@luizsantiago/spec-guardrails`](https://www.npmjs.com/package/@luizsantiago/spec-guardrails) **3.1.x**

---

## Install

```bash
npx @luizsantiago/spec-guardrails install
```

### What you need

| Requirement | Role |
| --- | --- |
| **Node.js 18+** | Required — runs the CLI and `install` |
| **Python 3.10+** | Recommended — runs automatic **gates** (`validate-spec`, `validate-tasks`, …). Without Python the agent still follows the same checklists manually |

### What install does

| Lands in your project | Purpose |
| --- | --- |
| `.cursor/skills/` + `.claude/skills/` | Hub, phase references, sister skills |
| `.specs/guardrails/scripts/` | Python gate scripts |
| `.specs/STATE.md`, `.specs/features/`, … | Project memory |
| `.cursor/rules/engineering-baseline.mdc` | Always-on Cursor rule |

Re-run `install` anytime to refresh skills; your `.specs/` decisions and `STATE.md` are kept.

| Need | Command |
| --- | --- |
| First time / upgrade | `install` |
| Existing codebase | `project-init` (optional) |
| Something looks wrong | `doctor` |
| Full CLI list | `--help` |

---

## Token cost

Progressive loading is the main cost win: **one working set per turn**, not the entire playbook.

| Profile | Est. tokens | When |
| ---: | ---: | --- |
| Naive full dump (don’t) | ~31k | Loading every skill + reference every message |
| Specify turn | ~9k | `/specify` — hub + `specify.md` + standards |
| Tasks turn | ~10k | `/tasks` — hub + `tasks.md` + task-graph skill |
| Execute `/loop` (one wave) | ~4k | One implement wave (inline or parallel) |
| Verify turn | ~6k | Independent reviewer stack |

Savings vs full dump: **~72%** (Specify), **~86%** (Execute). Numbers from `lib/token-cost.js`; CI guardrails in `test/test_token_cost.test.js`. Order-of-magnitude only — not a billing API.

More: [Token efficiency](docs/guide/Token-efficiency.md)

---

## How the pieces fit together

Four ideas stack — full explanation: **[Concepts](docs/guide/concepts.md)**

| Idea | What it is | What it does |
| --- | --- | --- |
| **Spec-driven** | Written plan before code | `spec.md` + `tasks.md`; evidence before “done” |
| **Guardrails** | This package | Skills + Python gates that stop incomplete work |
| **Loop** | Execute in waves | `loop-plan` picks the next jobs; sub-agents when files don’t overlap |
| **Graph** | Parallel task map | `task-graph.md` — safe parallelism without file collisions |
| **Memory** | Repo-local state | `.specs/` — specs, decisions, and handoff survive across chats |

**You** approve specs and tasks. **The agent** runs gates and implements. **Gates** exit non-zero when paperwork or evidence is missing.

Plain-language tour: [Home](docs/guide/Home.md) · [How it works](docs/guide/How-it-works.md) · [Quick start](docs/guide/Quick-start.md)

---

## Complexity tiers (how work flows)

The hub **Complexity Router** picks how much ceremony a feature needs — Quick, Simple, Medium, Complex, or Parallel. It is **not** a separate product feature; it is how the agent decides which phases to run.

| Tier | Typical scope | Path |
| --- | --- | --- |
| **Quick** | ≤3 files, no new deps | `/quick` → verify → commit |
| **Simple** | Small localized change | `/specify` → `/loop` → `/verify` |
| **Medium** | New feature, &lt;10 tasks | `/specify` → `/tasks` → `/loop` → `/verify` → `/archive` |
| **Complex** | APIs, architecture, infra | + `/discuss`, `/plan`, optional security/QA on verify |
| **Parallel** | Splittable work | Above + `/task-graph` when 3+ tasks |

Rules and examples: [Concepts → Complexity tiers](docs/guide/concepts.md#complexity-tiers--how-the-agent-chooses-depth)

---

## Hub and skills (summary)

Install copies a **hub** (`agent-architecture.md`), **phase references** (`references/*.md`), and **sister skills** (security, task-graph, …). The agent loads **one phase file at a time**.

| Load order | Layer | Role | Examples |
| ---: | --- | --- | --- |
| 1 | **Hub** | Contract, complexity router, gate schedule | `agent-architecture.md` |
| 2 | **Reference** | One phase procedure per turn | `specify.md`, `implement.md`, `validate.md` |
| 3 | **Sister** (optional) | Cross-cutting depth, on demand | `engineering-standards.md`, `task-graph-engineering.md` |
| 4 | **Gate** | Automatic check at the boundary | `validate-spec`, `loop-plan`, `check-commit` |

Conditional sisters (`appsec.md`, `qa-strategy.md`, …) load **one at a time** on Verify when risk warrants it.

Full map: **[Skills and hub](docs/guide/skills-and-hub.md)**

---

## Gates (summary)

Scripts in `.specs/guardrails/scripts/`. **Exit ≠ 0 → stop and fix.**

| When | Gate | What it blocks |
| --- | --- | --- |
| Before approving spec | `validate-spec` | Incomplete or untestable spec |
| Before approving tasks | `analyze-artifacts` | Spec ↔ tasks drift |
| Before approving tasks | `validate-tasks` | Bad tasks; missing graph when 3+ tasks |
| After tasks / with validation | `validate-traceability` | REQ missing from tasks or coverage lines |
| End of `/quick` | `validate-quick` | Incomplete Quick TASK/SUMMARY; >3 files; sensitive paths |
| Each `/loop` wave | `loop-plan` | Blocked dependencies; shows parallel groups |
| Each commit | `check-commit` | Non-Conventional commit message |
| Before “done” | `validate-state` | Fake PASS without test evidence |
| After Verify FAIL | `lessons` | Ungrounded “lessons learned” |
| After Verify PASS | `archive-feature` | (CLI) folds feature into domain memory |

Full reference: **[Gates](docs/guide/gates.md)** · [Gates and guarantees](docs/guide/Gates-and-guarantees.md)

---

## Documentation

| Doc | For |
| --- | --- |
| [Agent commands](docs/guide/agent-commands.md) | Every `/specify`, `/loop`, `/verify`, … — purpose, when, examples |
| [Quick start](docs/guide/Quick-start.md) | First ten minutes |
| [Concepts](docs/guide/concepts.md) | Spec-driven + guardrails + loop + graph |
| [Skills and hub](docs/guide/skills-and-hub.md) | What each skill file does |
| [Gates](docs/guide/gates.md) | How each gate works |
| [Platform parity](docs/guide/Platform-parity.md) | Cursor vs Claude Code |
| [FAQ](docs/guide/FAQ.md) | Common questions |
| [Changelog](docs/CHANGELOG.md) | Full version history |

Start after install: [Quick start](docs/guide/Quick-start.md) · [Agent commands](docs/guide/agent-commands.md)

---

## Upgrading

```bash
npx @luizsantiago/spec-guardrails install
```

| Version | What you gain |
| --- | --- |
| **3.1.x** | Doctor STATE fix; `validate-traceability` / `validate-quick`; `classify-change` / `feature-status`; Claude `CLAUDE.md` |
| **3.0.x** | Final name Spec Guardrails; `.specs/guardrails/`; no dual-path ([Migration](docs/guide/Migration.md)) |
| **2.2.x** | Seatbelt-era paths & markers; `doctor` Execute hints; docs split from README |
| **2.1.x** | `loop-plan` + parallel `/loop` waves |
| **2.0.x** | Package rename → `@luizsantiago/spec-seatbelt` (superseded by 3.0) |
| **1.1.x** | `project-init` for brownfield repos |
| **0.9.x** | `archive-feature` + domain memory merge |

Full history: [CHANGELOG](docs/CHANGELOG.md) · [Releases](https://github.com/luizssantiago92/spec-guardrails/releases) · [Stability policy](docs/guide/Stability-policy.md)

Lineage: `agentic-harness` → `spec-seatbelt` → **`spec-guardrails` (final)**. Run `install` once after switching. See [Migration](docs/guide/Migration.md).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — tests, gate freeze policy, local `npm run guardrails -- install`.

---

## Credits

Spec Guardrails adapts open ideas; we did not invent spec-driven phases, loop design, or task-graph rules.

### Core lineage

| Source | License | How we use it |
| --- | --- | --- |
| [tlc-spec-driven](https://github.com/tech-leads-club/agent-skills/tree/main/packages/skills-catalog/skills/(development)/tlc-spec-driven) | CC-BY-4.0 | Phase model, `.specs/` memory, gate lineage |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | MIT | Discuss patterns, definition-of-done |
| [graph-engineering](https://github.com/codejunkie99/graph-engineering) | MIT | Task-graph topology, stop rules, parallel merge |

### Loop & ecosystem

| Source | License | How we use it |
| --- | --- | --- |
| [loop-engineering](https://github.com/cobusgreyling/loop-engineering) | MIT | Operational loop patterns; `doctor` score metaphor |
| [Addy Osmani — Loop engineering](https://addyosmani.com/blog/loop-engineering/) | — | Essay lineage |
| [awesome-harness-engineering](https://github.com/ai-boost/awesome-harness-engineering) | CC0 | Ecosystem taxonomy |

### Adjacent (not vendored)

[DeepCode](https://github.com/HKUDS/DeepCode) · [RepoGraph](https://github.com/ozyyshr/RepoGraph)

Extended attribution: [docs/guide/credits.md](docs/guide/credits.md)

## License

MIT
