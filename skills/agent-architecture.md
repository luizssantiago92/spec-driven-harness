---
name: agent-architecture
description: Spec-Driven Development hub for AI-assisted engineering. Five adaptive phases (Specify, Design, Tasks, Execute, Verify) with deterministic Python gates, independent verifier, discrimination sensor, evidence-or-zero, and persistent .specs/ memory. Triggers on "specify feature", "design", "break into tasks", "implement", "verify", "quick fix", "resume work", "handoff".
---

# Agent Architecture (Hub)

Spec-Driven Development (SDD) harness for AI-assisted software engineering.
Replaces "Vibe Coding" with adaptive phases backed by persistent memory, sister skills, and gates enforced by code.

This file is the contract and the map. Phase procedures live in `references/`; cross-cutting concerns live in sister skills.

## Critical Rules (read before acting)

**Reference files.** Phase procedures live in `references/` next to this file (`.cursor/skills/references/`, `.claude/skills/references/`). Read a reference **completely** before acting on it. Never act on a partial read.

**Gate scripts.** Structural gates live in `.specs/harness/scripts/` at the project root. Run them with `python3`; never assume a project-local `scripts/` directory belongs to this harness.

**Execution contract — non-negotiable, holds even if no reference file is open:**

1. **Test-First Imperative** — Tests derive from the spec's acceptance criteria and assert spec-defined outcomes. They never mirror the implementation. No production code before spec and derived tests are approved.
2. **Gate before done** — A task is complete only when the project harness (tests, linter, compiler) passes. The runner decides, never self-assessment.
3. **One atomic commit per task** — Mark the task complete in `tasks.md` and include that update in the same commit. Never batch tasks; never weaken, skip, or delete tests to make them pass.
4. **Author ≠ Verificador** — After the last task, `/verify` runs with a fresh, clean context that never wrote the code. It is mandatory, not prompted.
5. **Blast radius** — Approving a spec or tasks authorizes local implementation and local commits only. `git push`, force-push, deploy, production data changes, and other externally visible or destructive operations require an explicit go-ahead for that specific action.

## Deterministic Gates

Structural gates run **before** owner review, so they cannot drift when the model forgets a step.

| When | Command |
| --- | --- |
| Before confirming a spec | `python3 .specs/harness/scripts/validate_spec.py .specs/features/[feature]/spec.md` |
| Before presenting tasks for approval | `python3 .specs/harness/scripts/validate_tasks.py .specs/features/[feature]/tasks.md` |
| On each commit | `python3 .specs/harness/scripts/check_commit.py --message "<message>"` |
| Before declaring a feature done | `python3 .specs/harness/scripts/validate_state.py .specs/features/[feature]` |

A **non-zero exit means STOP** — fix the artifact, then re-run the gate. Never continue past a failing gate.

**Degraded mode.** If Python 3 or shell execution is unavailable, say so once, then perform the same checks by reading the artifact against the reference checklist. Degraded mode never lowers the standard; it only changes who runs the check.

## Phase Map

```
SPECIFY → DESIGN (optional) → TASKS (optional) → EXECUTE (loop) → VERIFY
```

| Phase | Required | Reference | Sister skill | Gate |
| --- | --- | --- | --- | --- |
| **Specify** | Yes | `references/specify.md` | — | `validate_spec.py` |
| **Discuss** | Conditional | `references/discuss.md` | — | — |
| **Design** | No | `references/design.md` | — | — |
| **Tasks** | No | `references/tasks.md` | `task-graph-engineering.md` | `validate_tasks.py` |
| **Execute** | Yes | `references/implement.md` | `engineering-standards.md` | `check_commit.py` |
| **Verify** | Yes | `references/validate.md` | `security-review.md` | `validate_state.py` |
| **Handoff** | Yes | `references/memory.md` | `git-handoff.md` | — |
| **Quick** | Alternative | `references/quick-mode.md` | — | `check_commit.py` |

## Complexity Router

Complexity determines depth. Do not run every phase on every change.

| Tier | Scope | Path |
| --- | --- | --- |
| **Quick** | ≤3 files, no design decisions, no new dependencies | `references/quick-mode.md` — describe, implement, verify, commit |
| **Simple** | 2–5 files, localized change | Specify → Execute → Verify |
| **Medium** | New feature, <10 tasks | Specify → Tasks → Execute → Verify |
| **Complex** | New architecture, API surface, infra | Specify → Discuss → Design → Tasks → Execute → Verify |
| **Parallel** | Splittable work, multiple agents | Above + `/task-graph` per `task-graph-engineering.md` |

**Rules**

- **Specify and Verify are always required** — you must know WHAT was asked and prove it was delivered.
- **Design is skipped** when there are no architectural decisions and no new patterns.
- **Tasks is skipped** when there are ≤3 obvious steps.
- **Discuss is triggered inside Specify** when the feature touches persistence, external calls, auth, payments, concurrency, or state transitions, or when the owner's intent is ambiguous.
- **Safety valve** — Even when Tasks is skipped, Execute starts by listing atomic steps inline. If that listing reveals more than 5 steps or real dependencies, STOP and create a formal `tasks.md`; the Tasks phase was skipped in error.

When in doubt, start at **Medium** and drop phases only with owner approval.

## Persistent Memory (`.specs/`)

| Path | Purpose |
| --- | --- |
| `.specs/STATE.md` | Decision log (`AD-NNN`) and handoff snapshot |
| `.specs/LESSONS.md` | Lessons playbook — verification failures become local rules |
| `.specs/project/PROJECT.md` | Vision, stack, constraints (when the project defines them) |
| `.specs/project/ROADMAP.md` | Milestones and feature status |
| `.specs/quick/NNN-slug/` | Quick-mode tasks and summaries |
| `.specs/features/[feature]/spec.md` | Requirements and acceptance criteria |
| `.specs/features/[feature]/context.md` | Owner decisions for gray areas (only when Discuss ran) |
| `.specs/features/[feature]/design.md` | Architecture (Complex tier) |
| `.specs/features/[feature]/tasks.md` | Atomic task breakdown |
| `.specs/features/[feature]/task-graph.md` | Job DAG and parallel groups (when applicable) |
| `.specs/features/[feature]/validation.md` | Independent verification report |
| `.specs/harness/scripts/` | Deterministic gate scripts |

**Create artifacts lazily.** Write a file only when its phase actually produces content. Never scaffold an empty `design.md`, `tasks.md`, or `context.md` — an empty file claims a phase ran when it did not. Absence is the correct state for a skipped phase.

Read `STATE.md` at session start; update it at session end. See `references/memory.md` and `git-handoff.md`.

## Loop Engineering & Harness

- **Correction Loop** — If the harness fails, fix and retest up to 3 times before escalating to the owner.
- **Operational Harness** — Quality is enforced by test runners, linters, and compilers, never by AI self-declaration.
- **Fix → re-verify** — Gaps found in Verify become fix tasks; the loop is bounded to 3 iterations before escalating.

## Knowledge Verification Chain

Follow in strict order when making any technical decision:

1. **Codebase** — Conventions and patterns already in use
2. **Project docs** — README, `docs/`, `.specs/STATE.md` decisions
3. **MCP / Context** — Up-to-date library documentation via tools
4. **Web search** — Official docs and community patterns
5. **Uncertainty** — Say "I don't know" and flag it. Never invent APIs or behaviors.

Never skip to step 5 while steps 1–4 are available. Fabrication cascades through design, tasks, and implementation.

## Output Behavior

- **Do the work; do not narrate the machinery.** Produce the artifact instead of announcing the phase.
- **Match effort to the work.** Heavy reasoning for design and ambiguity; fast execution for mechanical tasks.
- **Write artifacts in a plain, decided voice.** Lead with the verdict; cut filler and hedging.
- **Locale** — Chat with the owner in pt-BR; all project artifacts in English (see `engineering-standards.md`).

## Model Selection

- **Planning** (Specify, Discuss, Design, Tasks): high-reasoning models
- **Execution loop**: fast, cost-effective models
- **Verifier**: mid-to-high tier — it performs adversarial reasoning and designs mutants

## Sister Skills

| Skill | Layer |
| --- | --- |
| `task-graph-engineering.md` | Topology — task DAG, parallelism, diamond verify |
| `engineering-standards.md` | Quality — locale, secure coding, one writer per file |
| `security-review.md` | Verification — OWASP checklist for `/verify` |
| `git-handoff.md` | Persistence — git sync, STATE template, session handoff |

Project rules: `.cursor/rules/locale-and-standards.mdc` (always applied in Cursor).

## Commands

| Command | Reference | Action |
| --- | --- | --- |
| `/specify` | `references/specify.md` | Define requirements and spec IDs |
| `/discuss` | `references/discuss.md` | Resolve gray areas into `context.md` |
| `/plan` | `references/design.md` | Create technical design |
| `/tasks` | `references/tasks.md` | Atomic task breakdown |
| `/task-graph` | `task-graph-engineering.md` | Draw or revise the job DAG |
| `/loop` | `references/implement.md` | Autonomous implementation loop |
| `/verify` | `references/validate.md` | Independent technical validation |
| `/quick` | `references/quick-mode.md` | Express lane for ≤3-file changes |
| `/handoff` | `references/memory.md` | Update STATE, commit `.specs/`, no push |
| `/sync-spec` | `git-handoff.md` | Commit current feature artifacts only |
