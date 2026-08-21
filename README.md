# Spec-Driven Harness

[![npm version](https://img.shields.io/npm/v/@luizsantiago/agentic-harness.svg)](https://www.npmjs.com/package/@luizsantiago/agentic-harness)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**A seatbelt for AI coding agents.** Agree on the goal in writing, break work into provable steps, run automatic checks before calling anything “done”, and verify with a fresh context that did not write the code.

npm package: [`@luizsantiago/agentic-harness`](https://www.npmjs.com/package/@luizsantiago/agentic-harness) **1.2.x**. Works in **Cursor** and **Claude Code**. The agent loads **one phase at a time** (~70% fewer skill tokens than dumping the full kit every turn).

**New here?** Start with [docs/guide/Home.md](docs/guide/Home.md) (plain language). This README is the engineering reference.

## What you get

| Piece | Purpose |
| --- | --- |
| **Skills + hub** | Tells the agent *what to do when* (Specify, Tasks, Verify, …) |
| **Python gates** | Scripts that reject incomplete specs, tasks, or verify reports *before* you trust them |
| **`.specs/` memory** | Durable feature folders, decisions, and project context between sessions |
| **CLI** | Install, scaffold brownfield repos, start features, archive finished work |

## Quick start

```bash
npx @luizsantiago/agentic-harness install
npx @luizsantiago/agentic-harness feature-init "user can reset password"
# Draft .specs/features/001-.../spec.md, then:
npx @luizsantiago/agentic-harness validate-spec 001-user-can-reset-password
```

Re-run `install` to refresh skills and gate scripts. It does **not** overwrite `STATE.md`, `LESSONS.md`, or rules you edited.

**Requirements:** Node.js 18+. Python 3.10+ for gates (without Python the agent still follows the same checklist by hand).

## Common flows (CLI)

These are **optional steps** except where your feature tier needs them. Think of them as “setup once” vs “per feature”.

### One-time / occasional

| Command | When | What it does |
| --- | --- | --- |
| `install` | First time, or after upgrading the package | Copies skills, 17 phase references, gate scripts, `.cursorrules`, and empty `.specs/` scaffold into your project |
| `install --preset node-ts` | First install on a Node/TS repo | Same as install, and seeds `.specs/config.yaml` from a stack preset if missing |
| `init-config --preset python` | You want config without reinstalling | Creates `.specs/config.yaml` from `default`, `node-ts`, or `python` |
| `preset list` / `preset show <name>` | Choosing a stack preset | Lists or prints preset YAML (branch prefix, test command, phase rules) |
| `project-init` | **Brownfield** — repo already has code | Scans stack, writes `PROJECT.md`, optional domain stubs, `ROADMAP`, and config. Use `--dry-run` to preview |
| `phase-context specify` | Optional before a phase | Prints your `config.yaml` context + rules for that phase |
| `doctor` | After install or upgrade | Audits skills, gates, config, STATE; prints Harness Ready score + next actions |

### Per feature

| Command | When | What it does |
| --- | --- | --- |
| `feature-init "description"` | Starting Medium+ work | Creates `.specs/features/NNN-slug/`, updates `STATE.md`, checks out `feat/NNN-slug` (Tier 0) |
| `validate-spec [feature]` | Spec draft ready | Blocks weak requirements (missing `SHALL`/`MUST`, bad IDs, …) |
| `analyze-artifacts` + `validate-tasks` | Task list ready | Cross-checks spec ↔ tasks before you approve work |
| `check-commit --message "..."` | Each commit | Conventional Commits gate |
| `validate-state [feature]` | Before calling the feature done | Requires `validation.md` with PASS and test `file:line` evidence |
| `archive-feature [feature]` | After Verify PASS | Merges spec into domain truth, updates `ROADMAP`, resets `STATE` (Tier 0) |

**Git tiers:** Tier 0 (branch, local commits, `.specs/` edits) is automatic after you approve a spec/tasks. Push, PR, merge, and deploy need explicit owner go-ahead.

## How work flows

```
EXPLORE (optional) → SPECIFY → DISCUSS? → DESIGN? → TASKS? → ANALYZE → EXECUTE → VERIFY → ARCHIVE
```

| Tier | Typical path |
| --- | --- |
| **Quick** | ≤3 files — describe, implement, verify, commit |
| **Simple** | Specify → Execute → Verify |
| **Medium** | Specify → Tasks → Execute → Verify |
| **Complex** | + Discuss, Design, conditional AppSec/QA |

Phase procedures live in `.cursor/skills/references/` (loaded on demand). The hub `agent-architecture.md` maps each phase to skills and gates.

## Gates (summary)

Scripts live in `.specs/harness/scripts/`. Non-zero exit = stop and fix the artifact.

| Gate | Blocks |
| --- | --- |
| `validate-spec` | Incomplete spec shape, untestable criteria, bad requirement IDs |
| `validate-tasks` | Missing task fields, uncovered REQs, illegal parallel `Files` overlap |
| `analyze-artifacts` | Spec/task drift before approval |
| `check-commit` | Non-conventional commit messages |
| `validate-state` | Missing verify report, non-PASS verdict, missing test evidence |
| `lessons` | Ungrounded lesson entries |

Gates check **form**, not whether the feature is morally correct. Full tables and guarantees: [docs/guide/Gates-and-guarantees.md](docs/guide/Gates-and-guarantees.md) and [`prd/gate-stability.md`](prd/gate-stability.md).

## What install writes

| Path | Role |
| --- | --- |
| `.cursor/skills/` · `.claude/skills/` | Hub, sisters, `references/` |
| `.cursor/rules/engineering-baseline.mdc` | Always-on project rule |
| `.specs/harness/scripts/*.py` | Gates |
| `.specs/STATE.md` · `LESSONS.md` | Handoff and lessons (preserved on reinstall) |
| `.specs/features/` · `project/` · `domains/` | Created empty for you to fill |

Asset provenance: install copies from the **npm package**, not live GitHub. Override with `HARNESS_REPO_URL` only for forks or tests (HTTPS, same-origin redirects, size cap).

## Learn more

| Guide | Topic |
| --- | --- |
| [Quick start](docs/guide/Quick-start.md) | First ten minutes |
| [How it works](docs/guide/How-it-works.md) | Phases in plain language |
| [Token efficiency](docs/guide/Token-efficiency.md) | Why progressive loading matters |
| [FAQ](docs/guide/FAQ.md) | Everyday questions |
| [Loop patterns](docs/guide/loop-patterns.md) | Feature vs operational loops |
| [Ecosystem map](docs/guide/ecosystem.md) | How this fits harness / loop / graph tooling |
| [Brownfield context](docs/guide/brownfield-context.md) | Why KG / RepoGraph are deferred |
| [Credits](docs/guide/credits.md) | Full attribution list |

Full index: [`docs/guide/`](docs/guide/).

## Upgrading

```bash
npx @luizsantiago/agentic-harness install
```

Memory and edited rules are kept. After a major jump, skim [GitHub Releases](https://github.com/luizssantiago92/spec-driven-harness/releases) for CLI or gate changes. Notable recent lines:

| Version | Highlights |
| --- | --- |
| **1.1.x** | `project-init` for brownfield repos |
| **1.0.x** | Config presets, `extends` / `overrides`, `init-config` |
| **0.9.x** | `archive-feature`, `phase-context`, delta spec merge |
| **0.8.x** | `feature-init`, explore/analyze/archive refs, git tiers |

Older upgrade steps (0.3–0.7 gate contract) remain in release notes — only follow them if you are upgrading from those versions.

## Development

```bash
git clone https://github.com/luizssantiago92/spec-driven-harness.git
cd spec-driven-harness
npm test
npm run harness -- install   # local CLI; avoids npx name clash in this repo
```

Publish: GitHub Actions workflow on release tags (see `.github/workflows/publish.yml`).

## Credits

Lineage and borrowed patterns — see [docs/guide/credits.md](docs/guide/credits.md) for the full list.

| Source | License | Contribution |
| --- | --- | --- |
| [tlc-spec-driven](https://github.com/tech-leads-club/agent-skills/tree/main/packages/skills-catalog/skills/(development)/tlc-spec-driven) | CC-BY-4.0 | Phases, memory, gate lineage |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | MIT | Discuss / DoD patterns |
| [graph-engineering](https://github.com/codejunkie99/graph-engineering) | MIT | Task-graph topology (adapted in `task-graph-engineering.md`) |
| [loop-engineering](https://github.com/cobusgreyling/loop-engineering) | MIT | Operational loop patterns; `doctor` readiness metaphor |
| [awesome-harness-engineering](https://github.com/ai-boost/awesome-harness-engineering) | CC0 | Ecosystem taxonomy reference |

Research/adjacent (not vendored): [DeepCode](https://github.com/HKUDS/DeepCode), [RepoGraph](https://github.com/ozyyshr/RepoGraph). **Not** [harness/harness-skills](https://github.com/harness/harness-skills) (Harness.io CI/CD — different product).

## License

MIT
