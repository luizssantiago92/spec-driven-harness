# Spec-Driven Harness

[![npm version](https://img.shields.io/npm/v/@luizsantiago/agentic-harness.svg)](https://www.npmjs.com/package/@luizsantiago/agentic-harness)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A spec-driven harness for AI coding agents: adaptive phases from Specify to Verify, per-phase procedures, cross-cutting skills, persistent `.specs/` memory, and structural gates enforced by code.

The gates are what separate this from a prompt. An incomplete spec, a task without a success criterion, or a feature without test evidence exit non-zero — and the agent stops instead of declaring success.

## Requirements

| Runtime | Used for | Required |
| --- | --- | --- |
| Node.js 18+ | `npx` install and CLI | Yes |
| Python 3.10+ | Structural gates | Recommended |

Without Python the harness runs in degraded mode: the skills still apply and the agent performs the same checks by reading the artifact against the reference checklist. The standard does not drop — only who runs the check.

## Install

```bash
npx @luizsantiago/agentic-harness install
```

Re-running refreshes skills, references and gate scripts, and upgrades the harness block in `.cursorrules`. It never overwrites `STATE.md`, `LESSONS.md`, or a project rule you have edited.

| Artifact | Purpose |
| --- | --- |
| `.cursor/skills/agent-architecture.md` | Hub — execution contract, phase map, complexity router |
| `.cursor/skills/references/*.md` | Per-phase procedures (8 files) |
| `.cursor/skills/task-graph-engineering.md` | Task DAG, parallelism, diamond verify, sub-agent batches |
| `.cursor/skills/engineering-standards.md` | Secure coding, code quality, one writer per file |
| `.cursor/skills/security-review.md` | OWASP checklist for `/verify` |
| `.cursor/skills/git-handoff.md` | Git sync, reconcile, session handoff |
| `.claude/skills/**` | The same skills and references for Claude |
| `.cursor/rules/engineering-baseline.mdc` | Always-applied Cursor project rule |
| `.specs/harness/scripts/*.py` | Gate scripts |
| `.specs/STATE.md` · `.specs/LESSONS.md` | Decision log, handoff snapshot, distilled lessons |
| `.cursorrules` | Execution contract (progressive disclosure) |

### Asset provenance

The npm package ships only the CLI. Skills, references and gate scripts are downloaded at install time from the git tag matching the installed CLI version, so upgrading the package is what changes the harness — a later push to the default branch cannot alter an install that already happened. If a freshly published tag is not visible yet, the installer warns and falls back to the default branch for that run.

Because gate scripts are written to disk and marked executable, the source is treated as a trust boundary: HTTPS only (plain HTTP is accepted against `localhost` for the test suite), a 30s request timeout, and a 2 MB cap per asset. Setting `HARNESS_REPO_URL` overrides the source and is announced before anything is written.

## Gates

| Stage | Command |
| --- | --- |
| Before confirming a spec | `validate_spec.py .specs/features/X/spec.md` |
| Before approving tasks | `validate_tasks.py .specs/features/X/tasks.md` |
| On each commit | `check_commit.py --message "feat: ..."` |
| Before closing a feature | `validate_state.py .specs/features/X` |

Scripts live in `.specs/harness/scripts/`. Run them with `python3`, or through the CLI to skip the paths:

```bash
npx @luizsantiago/agentic-harness validate-spec .specs/features/auth/spec.md
npx @luizsantiago/agentic-harness check-commit --message "feat(auth): add token refresh"
```

A non-zero exit means stop, fix the artifact, and re-run.

| Gate | Rejects |
| --- | --- |
| `validate_spec` | Missing sections, malformed IDs, a requirement without acceptance criteria, unfilled template placeholders |
| `validate_tasks` | Missing required field, unknown or forward dependency, dependency cycle, non-atomic title |
| `check_commit` | Non-Conventional header, unknown type, header over 72 characters, trailing period |
| `validate_state` | Missing `validation.md`, verdict other than PASS, no `file:line` evidence, open task |

To enforce the commit format without involving the agent:

```bash
# .git/hooks/commit-msg
#!/bin/sh
python3 .specs/harness/scripts/check_commit.py --file "$1"
```

Gate scripts are committed with `.specs/`, so the team and CI run what the agent runs. Ignore only the bytecode:

```gitignore
.specs/harness/scripts/__pycache__/
```

## Workflow

```
SPECIFY → DISCUSS (conditional) → DESIGN (optional) → TASKS (optional) → EXECUTE (loop) → VERIFY
```

| Phase | Command | Procedure | Cross-cutting skill | Gate |
| --- | --- | --- | --- | --- |
| Specify | `/specify` | `references/specify.md` | — | `validate_spec.py` |
| Discuss | `/discuss` | `references/discuss.md` | — | — |
| Design | `/plan` | `references/design.md` | — | — |
| Tasks | `/tasks` | `references/tasks.md` | `task-graph-engineering` | `validate_tasks.py` |
| Execute | `/loop` | `references/implement.md` | `engineering-standards` | `check_commit.py` |
| Verify | `/verify` | `references/validate.md` | `security-review` | `validate_state.py` |
| Handoff | `/handoff` | `references/memory.md` | `git-handoff` | — |
| Quick | `/quick` | `references/quick-mode.md` | — | `check_commit.py` |

`/task-graph` draws the job DAG before `/loop`; `/sync-spec` commits the current feature's artifacts without a full handoff.

### Complexity router

Depth follows the work, not a fixed pipeline.

| Tier | Scope | Path |
| --- | --- | --- |
| Quick | ≤3 files, no design decision | Describe, implement, verify, commit |
| Simple | 2–5 files | Specify → Execute → Verify |
| Medium | New feature, under 10 tasks | Specify → Tasks → Execute → Verify |
| Complex | Architecture, API surface, infrastructure | Specify → Discuss → Design → Tasks → Execute → Verify |
| Parallel | Splittable work, multiple agents | Any of the above plus `/task-graph` |

Even when Tasks is skipped, Execute opens by listing the atomic steps. More than five steps, or a real dependency between them, means the Tasks phase was skipped in error — the agent stops and writes `tasks.md`.

## Execution contract

1. **Test-first** — tests derive from acceptance criteria and assert the spec's outcome, never the implementation.
2. **Gate before done** — the test runner decides, not self-assessment.
3. **One atomic commit per task** — code, tests, and the task checkbox land together.
4. **Author ≠ verifier** — after the last task, `/verify` runs in a clean context. Mandatory, never prompted.
5. **Blast radius** — approving a spec or tasks authorizes local implementation and commits. `git push`, deploy, and destructive operations require an explicit go-ahead.

## Verification

- **Spec-anchored check** — every criterion has a test asserting the outcome the spec defines
- **Discrimination sensor** — mutants injected into an isolated scratch copy, never `git stash`; a surviving mutant becomes a fix task
- **Security review** — OWASP checklist, with a documented lightweight path for changes with no auth or API surface
- **Evidence-or-zero** — a requirement is done only with a `file:line` reference to a passing assertive test
- **Bounded loop** — fix and re-verify at most three times, then escalate

## Memory

| Path | Purpose |
| --- | --- |
| `STATE.md` | Active feature, next step, blockers, deferred ideas, `AD-NNN` decisions |
| `LESSONS.md` | Lessons distilled from grounded failures — a clean pass records nothing |
| `project/PROJECT.md` · `project/ROADMAP.md` | Vision, stack, milestones |
| `features/[feature]/spec.md` | Requirements and acceptance criteria |
| `features/[feature]/context.md` | Owner decisions for gray areas |
| `features/[feature]/design.md` | Architecture, on the Complex tier |
| `features/[feature]/tasks.md` · `task-graph.md` | Atomic breakdown, job DAG and parallel groups |
| `features/[feature]/validation.md` | Independent verifier report |
| `quick/NNN-slug/` | Quick-tier tasks |

Artifacts are created lazily. An empty `design.md` claims a phase ran when it did not; absence is the correct state for a skipped phase.

`STATE.md` can go stale, so a session starts by reconciling it against git — branch, `status --porcelain`, and recent commits. Evidence wins over the snapshot.

## Skills

| Skill | Layer | Responsibility |
| --- | --- | --- |
| `agent-architecture.md` | Process | What to do and when: contract, phases, router |
| `task-graph-engineering.md` | Topology | How jobs connect: DAG, stop rule, diamond verify, sub-agent batches |
| `engineering-standards.md` | Quality | How code and commits are written |
| `security-review.md` | Verification | Security during `/verify` |
| `git-handoff.md` | Persistence | How memory reaches git |

Each skill links to the others, and `.cursorrules` points at the hub, so the agent loads the set when planning or executing.

## Knowledge verification chain

Followed in order for any technical decision:

1. **Codebase** — conventions and patterns already in use
2. **Project docs** — README, `docs/`, `.specs/STATE.md`
3. **MCP / context tools** — current library documentation
4. **Web search** — official sources and community patterns
5. **Uncertainty** — say "I don't know" and flag it; never invent an API

Model tiers: high reasoning for planning, fast models for the execution loop, mid-to-high for the verifier, which does adversarial reasoning and designs mutants.

## Upgrading

Run `npx @luizsantiago/agentic-harness install` again. Existing memory and edited rules are preserved, which means two changes need a manual step:

| Coming from | Manual step |
| --- | --- |
| A version with `locale-and-standards.mdc` | Delete that file; it was replaced by `engineering-baseline.mdc` and still carries a chat-language rule |
| A version before `0.2.0` | `STATE.md` keeps its old shape — copy the sections from `references/memory.md` if you want the decision log and handoff template |

Everything else — the hub, references, gate scripts, and the `.cursorrules` block — is refreshed automatically.

## Repository layout

```
spec-driven-harness/
├── index.js                        # CLI: install and gates
├── lib/                            # Installer and Python bridge
├── skills/
│   ├── agent-architecture.md       # Hub
│   ├── references/                 # 8 phase procedures
│   ├── task-graph-engineering.md
│   ├── engineering-standards.md
│   ├── security-review.md
│   └── git-handoff.md
├── rules/engineering-baseline.mdc
├── scripts/                        # Gate scripts (Python)
├── test/
│   ├── install.test.js             # Installer and CLI (Node)
│   └── test_gates.py               # Gates (Python)
└── .github/workflows/
```

npm package: [@luizsantiago/agentic-harness](https://www.npmjs.com/package/@luizsantiago/agentic-harness)

## Development

```bash
git clone https://github.com/luizssantiago92/spec-driven-harness.git
cd spec-driven-harness
npm test              # installer and gates
npm run test:node
npm run test:gates
node index.js install
```

Publishing is automated: **Actions → Publish to npm → Run workflow**, choosing `patch`, `minor` or `major`. The workflow bumps the version, runs both suites, publishes, and pushes the tag the installer pins to.

## Credits

Task-graph patterns adapted from [graph-engineering](https://github.com/codejunkie99/graph-engineering) (MIT).

## License

MIT
