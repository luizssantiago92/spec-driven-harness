# Spec-Driven Harness (2026)

[![npm version](https://img.shields.io/npm/v/@luizsantiago/agentic-harness.svg)](https://www.npmjs.com/package/@luizsantiago/agentic-harness)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An agentic framework that combines **Spec-Driven Development**, **Loop** and **Harness Engineering**. An SDD hub plus **5 sister skills**, **per-phase references** and **deterministic Python gates**, backed by `.specs/` memory and a `.cursorrules` execution contract. **Specify→Verify** flow with an independent verifier, test-first implementation, `STATE.md` and `LESSONS.md`.

What sets it apart from a pile of instructions: the **gates run as code**. An incomplete spec, a task without a success criterion, or a feature without test evidence **do not pass** — the script exits non-zero and the agent stops.

## Requirements

| Runtime | Used for | Required |
| --- | --- | --- |
| Node.js 18+ | `npx` install and CLI | Yes |
| Python 3.10+ | Structural gates | Recommended |

Without Python the harness runs in **degraded mode**: the skills still work and the agent performs the same checks manually against the reference checklist. The standard does not drop — only who runs the check.

## Install

```bash
npx @luizsantiago/agentic-harness install
```

Re-running updates skills, references and scripts, and **upgrades** the harness block in `.cursorrules` without overwriting `STATE.md`, `LESSONS.md` or customized rules.

### What the installer creates

| Artifact | Purpose |
| --- | --- |
| `.cursor/skills/agent-architecture.md` | **Hub** — contract, phases, gates, complexity router |
| `.cursor/skills/references/*.md` | Per-phase procedures (8 files) |
| `.cursor/skills/task-graph-engineering.md` | Task DAG, parallelism, diamond verify, sub-agents |
| `.cursor/skills/engineering-standards.md` | Secure coding, code quality, one writer per file |
| `.cursor/skills/security-review.md` | OWASP checklist for `/verify` |
| `.cursor/skills/git-handoff.md` | Git sync, reconcile, session handoff |
| `.claude/skills/**` | The same skills and references for Claude |
| `.cursor/rules/engineering-baseline.mdc` | Always-applied Cursor project rule |
| `.specs/harness/scripts/*.py` | **Deterministic gates** |
| `.specs/STATE.md` | Decisions (`AD-NNN`) and handoff |
| `.specs/LESSONS.md` | Lessons distilled from verification failures |
| `.cursorrules` | Execution contract (progressive disclosure) |

## Deterministic gates

| When | Command |
| --- | --- |
| Before confirming a spec | `python3 .specs/harness/scripts/validate_spec.py .specs/features/X/spec.md` |
| Before approving tasks | `python3 .specs/harness/scripts/validate_tasks.py .specs/features/X/tasks.md` |
| On each commit | `python3 .specs/harness/scripts/check_commit.py --message "feat: ..."` |
| Before closing a feature | `python3 .specs/harness/scripts/validate_state.py .specs/features/X` |

Or through the CLI, without memorizing paths:

```bash
npx @luizsantiago/agentic-harness validate-spec .specs/features/auth/spec.md
npx @luizsantiago/agentic-harness validate-tasks .specs/features/auth/tasks.md
npx @luizsantiago/agentic-harness validate-state .specs/features/auth
npx @luizsantiago/agentic-harness check-commit --message "feat(auth): add token refresh"
```

What each gate blocks:

| Gate | Blocks |
| --- | --- |
| `validate_spec` | Missing sections, malformed IDs, requirement without acceptance criteria, placeholders (`TBD`, `TODO`) |
| `validate_tasks` | Missing required field, unknown dependency, forward dependency, cycle, vague task |
| `check_commit` | Not Conventional Commits, unknown type, header over 72 chars, trailing period |
| `validate_state` | Missing `validation.md`, verdict other than PASS, no `file:line` evidence, open task |

A non-zero exit means **STOP**: fix the artifact and run the gate again.

Optional — enforce the commit format without relying on the agent:

```bash
# .git/hooks/commit-msg
#!/bin/sh
python3 .specs/harness/scripts/check_commit.py --file "$1"
```

The scripts are committed alongside `.specs/`, so the team and CI run the same gates as the agent. Ignore only the bytecode:

```gitignore
.specs/harness/scripts/__pycache__/
```

## The Spec-Driven flow

```
SPECIFY → DISCUSS (conditional) → DESIGN (optional) → TASKS (optional) → EXECUTE (loop) → VERIFY
```

| Phase | Reference | Sister skill | Gate |
| --- | --- | --- | --- |
| **Specify** | `references/specify.md` | — | `validate_spec.py` |
| **Discuss** | `references/discuss.md` | — | — |
| **Design** | `references/design.md` | — | — |
| **Tasks** | `references/tasks.md` | `task-graph-engineering` | `validate_tasks.py` |
| **Execute** | `references/implement.md` | `engineering-standards` | `check_commit.py` |
| **Verify** | `references/validate.md` | `security-review` | `validate_state.py` |
| **Handoff** | `references/memory.md` | `git-handoff` | — |
| **Quick** | `references/quick-mode.md` | — | `check_commit.py` |

### Complexity router

| Tier | Scope | Path |
| --- | --- | --- |
| **Quick** | ≤3 files, no design decision | `quick-mode` — describe, implement, verify, commit |
| **Simple** | 2–5 files | Specify → Execute → Verify |
| **Medium** | New feature, <10 tasks | Specify → Tasks → Execute → Verify |
| **Complex** | Architecture, API, infrastructure | Specify → Discuss → Design → Tasks → Execute → Verify |
| **Parallel** | Splittable work, multiple agents | Any of the above + `/task-graph` |

**Safety valve** — even when Tasks is skipped, Execute starts by listing the atomic steps. If more than 5 steps or real dependencies show up, it stops and creates `tasks.md`.

## Execution contract

1. **Test-First Imperative** — Tests derive from acceptance criteria and assert the spec's outcome, never the implementation.
2. **Gate before done** — The test runner decides, not self-assessment.
3. **One atomic commit per task** — Code, tests and the task checkbox in `tasks.md` land together.
4. **Author ≠ Verifier** — After the last task, `/verify` runs with a clean context. Mandatory, never prompted.
5. **Blast radius** — Approving a spec or tasks authorizes **local** implementation and commits. `git push`, deploy and destructive operations need an explicit go-ahead.

## Persistent memory (`.specs/`)

| Path | Purpose |
| --- | --- |
| `STATE.md` | Active feature, next step, blockers, deferred ideas, `AD-NNN` decisions |
| `LESSONS.md` | Lessons from grounded failures (surviving mutant, imprecise criterion) |
| `project/PROJECT.md` · `project/ROADMAP.md` | Vision, stack, milestones |
| `quick/NNN-slug/` | Quick-mode tasks |
| `features/[feature]/spec.md` | Requirements and acceptance criteria |
| `features/[feature]/context.md` | Owner decisions for gray areas |
| `features/[feature]/design.md` | Architecture (Complex tier) |
| `features/[feature]/tasks.md` | Atomic breakdown |
| `features/[feature]/task-graph.md` | Job DAG and parallel groups |
| `features/[feature]/validation.md` | Independent verifier report |
| `harness/scripts/` | Deterministic gates |

**Lazy artifacts** — never create an empty `design.md`, `tasks.md` or `context.md`. An empty file claims a phase ran when it did not; absence is the correct state for a skipped phase.

### Session resume

`STATE.md` can be stale. At session start, reconcile it against git — **evidence wins**:

```bash
git branch --show-current
git status --porcelain
git log --oneline -10
```

## Independent verification

- **Spec-anchored check** — every criterion has a test asserting the outcome the spec defines
- **Discrimination sensor** — mutants injected into an isolated scratch copy (temp worktree), never `git stash`
- **Security review** — OWASP checklist, with a justified lightweight path for changes with no auth or API surface
- **Evidence-or-zero** — a requirement is done only with a `file:line` reference to a passing assertive test
- **Bounded loop** — fix → re-verify at most 3 times before escalating

## Commands

| Command | Reference | Action |
| --- | --- | --- |
| `/specify` | `specify.md` | Requirements and spec IDs |
| `/discuss` | `discuss.md` | Resolve gray areas into `context.md` |
| `/plan` | `design.md` | Technical design |
| `/tasks` | `tasks.md` | Atomic breakdown |
| `/task-graph` | `task-graph-engineering.md` | Draw the job DAG |
| `/loop` | `implement.md` | Autonomous implementation |
| `/verify` | `validate.md` | Independent validation |
| `/quick` | `quick-mode.md` | Express lane for ≤3 files |
| `/handoff` | `memory.md` | Update STATE, commit `.specs/`, no push |
| `/sync-spec` | `git-handoff.md` | Commit the current feature's artifacts |

## Sister skills (use them together)

| Skill | Layer | Role |
| --- | --- | --- |
| `agent-architecture.md` | **Process** | Hub — contract, phases, gates, router |
| `task-graph-engineering.md` | **Topology** | Task DAG, stop rule, diamond verify, sub-agent batches |
| `engineering-standards.md` | **Quality** | Secure coding, one writer per file, surgical changes |
| `security-review.md` | **Verification** | OWASP checklist for `/verify` |
| `git-handoff.md` | **Persistence** | Git sync, reconcile, STATE template |

```
agent-architecture       →  WHAT to do and WHEN (phases + contract)
task-graph-engineering →  HOW jobs connect (DAG, parallelism)
engineering-standards  →  HOW to write code and commits
security-review        →  security during verification
git-handoff            →  persist memory and specs in git
```

## Language

Every project artifact is written in **English**: code, tests, commit messages, PR descriptions and `.specs/` documents.

Chat language is a personal preference, not a harness rule. If you want replies in another language, set it as a global rule in **Cursor → Settings → Rules**, for example:

> Always reply to me in Brazilian Portuguese. Project artifacts remain in English.

## Knowledge verification chain

1. **Codebase** — conventions and patterns already in use
2. **Docs** — README, `docs/`, `.specs/STATE.md`
3. **MCP/Context** — library documentation through tools
4. **Web search** — official sources and community patterns
5. **Uncertainty** — if you cannot find it, say "I don't know". Never invent APIs.

> Planning: high-reasoning models. Execution: fast models. Verifier: mid-to-high tier (adversarial reasoning).

## Migration

### 0.2.x → English-only

| Change | Impact |
| --- | --- |
| `locale-and-standards.mdc` → `engineering-baseline.mdc` | Re-running install adds the new rule; **delete the old file manually** so the pt-BR chat rule stops applying |
| Locale policy removed from skills | Artifact language stays English; chat language moves to your personal agent settings |
| CLI output in English | Cosmetic only |

### 0.1.x → 0.2.0

| Change | Impact |
| --- | --- |
| Hub + `references/` | `agent-architecture.md` is now an index; procedures live in `references/` |
| Python gates | New `.specs/harness/scripts/` directory — commit it along with `.specs/` |
| New `STATE.md` template | **Does not overwrite** existing files; migrate manually if you want the new sections |
| New artifacts | `context.md`, `project/`, `quick/` — created on demand |
| Python | Optional; without it the harness runs in degraded mode |

Just run `npx @luizsantiago/agentic-harness install` again.

---

## Repository layout

```
spec-driven-harness/
├── index.js                        # CLI: install + gates
├── lib/                            # Installer and Python bridge
├── skills/
│   ├── agent-architecture.md       # Hub
│   ├── references/                 # 8 phase procedures
│   ├── task-graph-engineering.md
│   ├── engineering-standards.md
│   ├── security-review.md
│   └── git-handoff.md
├── rules/engineering-baseline.mdc
├── scripts/                        # Deterministic gates (Python)
├── test/
│   ├── install.test.js             # Installer tests (Node)
│   └── test_gates.py               # Gate tests (Python)
└── .github/workflows/
```

npm package: [@luizsantiago/agentic-harness](https://www.npmjs.com/package/@luizsantiago/agentic-harness)

## Development

```bash
git clone https://github.com/luizssantiago92/spec-driven-harness.git
cd spec-driven-harness
npm test              # installer + gates
npm run test:node
npm run test:gates
node index.js install
```

### Publishing to npm (maintainers)

1. Token at [npmjs.com/settings/luizsantiago/tokens](https://www.npmjs.com/settings/luizsantiago/tokens)
2. `NPM_TOKEN` secret on GitHub (Settings → Secrets → Actions)
3. **Actions → Publish to npm → Run workflow** → `patch`, `minor` or `major`

## Credits

Task-graph patterns adapted from [graph-engineering](https://github.com/codejunkie99/graph-engineering) (MIT).

## License

MIT
