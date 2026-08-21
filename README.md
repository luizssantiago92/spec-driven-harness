# Spec Seatbelt

[![npm version](https://img.shields.io/npm/v/@luizsantiago/spec-seatbelt.svg)](https://www.npmjs.com/package/@luizsantiago/spec-seatbelt)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**A seatbelt for AI coding agents** — agree on the goal in writing, break work into provable steps, run automatic checks before calling anything “done”, and verify with a fresh context that did not write the code.

**Token-efficient by design:** the agent loads **one phase guide per turn** (~9k est. tokens on Specify) instead of dumping the full skill library (~31k). Measured savings: **~72%** on planning, **~86%** on Execute vs a naive full reload ([details below](#token-cost)).

npm: [`@luizsantiago/spec-seatbelt`](https://www.npmjs.com/package/@luizsantiago/spec-seatbelt) **2.2.x**

---

## Install

```bash
npx @luizsantiago/spec-seatbelt install
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
| `.specs/seatbelt/scripts/` | Python gate scripts |
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

| Idea | One line |
| --- | --- |
| **Spec-driven** | Write `spec.md` and `tasks.md` before code; prove done with evidence |
| **Seatbelt** | This package — skills + gates that stop incomplete work |
| **Loop** | Execute in waves via `loop-plan`; parallel sub-agents when files are disjoint |
| **Graph** | `task-graph.md` — which tasks can run in parallel without file collisions |
| **Memory** | `.specs/` in your repo — specs, state, and decisions survive across chats |

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

Diagram and rules: [Concepts → Complexity tiers](docs/guide/concepts.md#complexity-tiers--how-the-agent-chooses-depth)

---

## Hub and skills (summary)

Install copies a **hub** (`agent-architecture.md`), **phase references** (`references/*.md`), and **sister skills** (security, task-graph, …). The agent loads **one phase file at a time**.

```
┌─────────────────────────────────────────────────────────────┐
│  HUB · agent-architecture.md                                │
│  Contract · complexity router · when to run gates           │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
       ┌───────▼────────┐         ┌───────▼────────┐
       │ ONE REFERENCE  │         │ SISTER SKILLS  │
       │ (current phase)│         │ load on demand │
       │ specify.md …   │         │ security, graph│
       └───────┬────────┘         └────────────────┘
               │
       ┌───────▼────────┐
       │ GATES          │
       │ phase boundary │
       └────────────────┘
```

| Layer | Examples |
| --- | --- |
| Hub | Phase map, complexity router, gate schedule |
| References | `specify.md`, `implement.md`, `validate.md`, … |
| Sisters | `engineering-standards.md`, `task-graph-engineering.md`, `security-review.md`, … |
| Conditional | `appsec.md`, `qa-strategy.md` — **one at a time** |

Full map: **[Skills and hub](docs/guide/skills-and-hub.md)**

---

## Gates (summary)

Scripts in `.specs/seatbelt/scripts/`. **Exit ≠ 0 → stop and fix.**

```
PLANNING              BUILDING                 CLOSING
────────              ────────                 ───────
feature-init
     │
validate-spec ──► validate-tasks ──► loop-plan ◄────┐
     │                   │               │          │
analyze-artifacts        │          check-commit ──┘
                         │
                    validate-state ──► archive-feature
                         │
                      lessons (after FAIL)
```

| Gate | Blocks |
| --- | --- |
| `validate-spec` | Incomplete or untestable spec |
| `validate-tasks` | Bad tasks; missing graph when 3+ tasks |
| `analyze-artifacts` | Spec ↔ tasks drift |
| `loop-plan` | Nothing ready / blocked dependencies |
| `check-commit` | Non-Conventional commit message |
| `validate-state` | Fake “done” without test evidence |

Full reference: **[Gates](docs/guide/gates.md)** · [Gates and guarantees](docs/guide/Gates-and-guarantees.md)

---

## Documentation

| Doc | For |
| --- | --- |
| [Agent commands](docs/guide/agent-commands.md) | Every `/specify`, `/loop`, `/verify`, … — purpose, when, examples |
| [Quick start](docs/guide/Quick-start.md) | First ten minutes |
| [Concepts](docs/guide/concepts.md) | Spec-driven + seatbelt + loop + graph |
| [Skills and hub](docs/guide/skills-and-hub.md) | What each skill file does |
| [Gates](docs/guide/gates.md) | How each gate works |
| [FAQ](docs/guide/FAQ.md) | Common questions |
| [Changelog](docs/CHANGELOG.md) | Full version history |

Start after install: [Quick start](docs/guide/Quick-start.md) · [Agent commands](docs/guide/agent-commands.md)

---

## Upgrading

```bash
npx @luizsantiago/spec-seatbelt install
```

| Version | What you gain |
| --- | --- |
| **2.2.x** | Seatbelt paths & markers; `doctor` Execute hints; docs split from README |
| **2.1.x** | `loop-plan` + parallel `/loop` waves |
| **2.0.x** | Package rename → `@luizsantiago/spec-seatbelt` |
| **1.1.x** | `project-init` for brownfield repos |
| **0.9.x** | `archive-feature` + domain memory merge |

Full history: [CHANGELOG](docs/CHANGELOG.md) · [Releases](https://github.com/luizssantiago92/spec-seatbelt/releases)

Renamed from `@luizsantiago/agentic-harness`. Run `install` once after switching. Legacy `.specs/harness/scripts/` and `AGENTIC-HARNESS` markers still work on 2.x until `install` migrates them; planned removal in **3.0**.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — tests, gate freeze policy, local `npm run seatbelt -- install`.

---

## Credits

Spec Seatbelt adapts open ideas; we did not invent spec-driven phases, loop design, or task-graph rules.

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
