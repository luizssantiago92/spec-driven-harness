# Credits and lineage

The Spec Seatbelt combines ideas from several open-source projects and essays.
We did not invent spec-driven phases, loop design, or task-graph topology — we adapted and gated them for installable agent skills.

## Core lineage

| Source | License | What we use |
| --- | --- | --- |
| [tlc-spec-driven](https://github.com/tech-leads-club/agent-skills/tree/main/packages/skills-catalog/skills/(development)/tlc-spec-driven) | CC-BY-4.0 | Phases, `.specs/` memory model, gate lineage |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | MIT | Discuss patterns, definition-of-done ideas |
| [graph-engineering](https://github.com/codejunkie99/graph-engineering) | MIT | Task-graph rules (stop rule, fake edges, diamond); KG half documented, not shipped |

## Loop and harness ecosystem

| Source | License | What we use |
| --- | --- | --- |
| [loop-engineering](https://github.com/cobusgreyling/loop-engineering) | MIT | Operational loop patterns; `doctor` score metaphor |
| [Addy Osmani — Loop engineering](https://addyosmani.com/blog/loop-engineering/) | — | Essay referenced in loop-patterns guide |
| [awesome-harness-engineering](https://github.com/ai-boost/awesome-harness-engineering) | CC0 | Taxonomy for ecosystem positioning |

## Research and adjacent tools (not vendored)

| Source | Notes |
| --- | --- |
| [DeepCode](https://github.com/HKUDS/DeepCode) | Reference for agent harness + loop runtime (separate product) |
| [RepoGraph](https://github.com/ozyyshr/RepoGraph) | Repo-level code graph; deferred as brownfield plugin |
| [harness/harness-skills](https://github.com/harness/harness-skills) | **Harness.io** CI/CD skills — unrelated product, similar name |
| Google DeepMind × MIT — [Scaling Agent Systems](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/) | Cited in graph-engineering for stop-rule research |

## Course material

| Source | Notes |
| --- | --- |
| [npubird/KnowledgeGraphCourse](https://github.com/npubird/KnowledgeGraphCourse) | SEU graduate KG course; graph-engineering English distillation |

## How to cite this package

If you publish work that builds on this harness, please credit the upstream projects above in addition to `@luizsantiago/spec-seatbelt`.

When adding new borrowed patterns, extend this file and the README Credits section in the same PR.
