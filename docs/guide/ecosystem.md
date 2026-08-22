# Ecosystem map

Where the Spec Guardrails sits among harness, loop, and graph engineering — and what we deliberately **do not** try to be.

## Layers

| Layer | Examples | Relationship to Spec Guardrails |
| --- | --- | --- |
| **Runtime** (sessions, tools, models, desktop) | DeepCode, harness-foundry | Adjacent — we do not ship a runtime |
| **Operational loops** (cadence, triage, CI, cost) | loop-engineering | Complementary — see [loop-patterns.md](loop-patterns.md) |
| **Spec + gates + memory** | **@luizsantiago/spec-guardrails** | **This package** — skills, `.specs/`, Python gates |
| **Floor map** (Lane Execute manuals + specialists; **Desks** planned 0.5.0) | [@luizsantiago/fullstack-floor-map](https://www.npmjs.com/package/@luizsantiago/fullstack-floor-map) | Optional companion — see [Companion-fullstack-floor-map.md](Companion-fullstack-floor-map.md) |
| **Code context** (repo graphs, search) | RepoGraph | Optional brownfield plugin — not bundled |

## This package

| Responsibility | Mechanism |
| --- | --- |
| Agree on goals in writing | `.specs/features/*/spec.md`, domains |
| Break work into provable steps | `tasks.md`, `task-graph.md` |
| Stop fake “done” | Python gates (`validate-*`, `check-commit`) |
| Fresh verify | `references/validate.md`, independent context |
| Brownfield onboarding | `project-init`, `PROJECT.md`, domain stubs |
| Readiness audit | `doctor` |

## Adjacent projects (curated)

| Project | Role | Relationship |
| --- | --- | --- |
| [tlc-spec-driven](https://github.com/tech-leads-club/agent-skills/tree/main/packages/skills-catalog/skills/(development)/tlc-spec-driven) | SDD phases, memory | Lineage (CC-BY-4.0) |
| [graph-engineering](https://github.com/codejunkie99/graph-engineering) | Task DAG + KG course | Task half adapted (MIT) |
| [loop-engineering](https://github.com/cobusgreyling/loop-engineering) | Operational loops | Complementary patterns |
| [awesome-harness-engineering](https://github.com/ai-boost/awesome-harness-engineering) | Curated index | Taxonomy reference |
| [DeepCode](https://github.com/HKUDS/DeepCode) | Full agent runtime | Adjacent product |
| [RepoGraph](https://github.com/ozyyshr/RepoGraph) | Repo-level code graph | Optional brownfield context (not bundled) |
| [fullstack-floor-map](https://github.com/luizssantiago92/fullstack-floor-map) | Lanes + specialist catalog (+ Desks planned 0.5.0) | Optional companion — one Lane per task |

## What we are not building

- A desktop agent or session runtime (see DeepCode, Cursor, Claude Code)
- Full knowledge-graph pipeline (see graph-engineering KG half)
- SWE-bench research integration (see RepoGraph)

## Further reading

- [loop-patterns.md](loop-patterns.md) — feature vs operational loops
- [Companion-fullstack-floor-map.md](Companion-fullstack-floor-map.md) — pairing with Full Stack Floor Map
- [brownfield-context.md](brownfield-context.md) — why KG / RepoGraph are deferred
- [credits.md](credits.md) — full attribution list
