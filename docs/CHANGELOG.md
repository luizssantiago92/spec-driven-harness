# Changelog

Version history for `@luizsantiago/spec-seatbelt`. For upgrade steps, see the [README](../README.md#upgrading).

## 2.2.x — Internal seatbelt branding

- Gate scripts path: `.specs/seatbelt/scripts/` (legacy `.specs/harness/scripts/` still resolved on 2.x)
- Markers: `SPEC-SEATBELT` in `.cursorrules`; `seatbelt-managed` in project rules
- Config API renamed: `parseSeatbeltConfig`, `mergeSeatbeltConfigs`, …
- `doctor`: **Seatbelt Ready** score + Execute hint (`loop-plan` / `validate-state`)
- Docs: agent commands, skills/hub, gates reference moved out of README
- Companion guide renamed to [Full Stack Floor Map](guide/Companion-fullstack-floor-map.md) (`@luizsantiago/fullstack-floor-map`; was Agentic Fullstack)

## 2.1.x — Parallel Execute

- `loop-plan` CLI and `loop_plan.py` gate — next wave + parallel groups
- `/loop` orchestration with sub-agents when files are disjoint
- `task-graph-engineering.md` and `sub-agents.md` integration

## 2.0.x — Package rename

- npm: `@luizsantiago/spec-seatbelt` (was `@luizsantiago/agentic-harness`)
- CLI: `spec-seatbelt`
- Same install layout; breaking only the package name

## 1.3.x — Last `agentic-harness` release

- Final publish under old package name — migrate to `spec-seatbelt` for 2.x

## 1.1.x — Brownfield

- `project-init` — scan existing repos into `.specs/` project memory
- Domain stubs, `PROJECT.md`, stack detection

## 1.0.x — Config presets

- `init-config`, built-in presets (`default`, `node-ts`, `python`)
- `.specs/config.yaml` with phase rules and `extends`

## 0.9.x — Archive

- `archive-feature` — merge verified work into domain specs and `ROADMAP.md`
- Delta spec merge into long-lived domain truth

## 0.8.x — Feature lifecycle

- `feature-init` — numbered feature folders, `STATE.md`, local branches (Tier 0)
- Git blast-radius tiers in hub contract

## 0.7.x — Gate freeze line

- Structural Python gates frozen for stability (see ADR 0001)
- Hub + eight sister skills always install together
- Conditional sisters: one at a time

## Earlier 0.5.x–0.6.x — Power-ups

- Stronger task/spec cross-checks, adversarial gate test suite
- Lessons engine, discrimination sensor on verify
- See `prd/harness-power-ups.md` for product intent

---

### Migration notes

| From | Action |
| --- | --- |
| `agentic-harness` 1.x | `npx @luizsantiago/spec-seatbelt install` |
| Pre-2.2 paths | `install` migrates scripts dir and `.cursorrules` markers |
| **Planned 3.0** | Remove read-only legacy paths/markers after install migration |

[GitHub Releases](https://github.com/luizssantiago92/spec-seatbelt/releases)
