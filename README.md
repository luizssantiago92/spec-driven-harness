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
| `.cursor/skills/references/*.md` | Per-phase procedures (11 files) |
| `.cursor/skills/task-graph-engineering.md` | Task DAG, parallelism, diamond verify, sub-agent batches |
| `.cursor/skills/engineering-standards.md` | Secure coding, code quality, one writer per file |
| `.cursor/skills/security-review.md` | OWASP checklist for `/verify` |
| `.cursor/skills/git-handoff.md` | Git sync, reconcile, session handoff |
| `.claude/skills/**` | The same skills and references for Claude |
| `.cursor/rules/engineering-baseline.mdc` | Always-applied Cursor project rule |
| `.specs/harness/scripts/*.py` | Gate scripts |
| `.specs/STATE.md` · `.specs/LESSONS.md` · `.specs/lessons.json` | Decision log, generated lessons playbook, canonical store |
| `.cursorrules` | Execution contract (progressive disclosure) |

### Asset provenance

The npm package ships the CLI, skills, references, project rules and gate scripts. Install copies them from the package, so a later push to the default branch cannot change an install that already happened — upgrading the package is what changes the harness.

Setting `HARNESS_REPO_URL` overrides the source (a fork, or the test suite) and is announced before anything is written. Remote fetches stay a trust boundary: HTTPS only (plain HTTP is accepted against `localhost` for the test suite), a 30s request timeout, and a 2 MB cap per asset.

## Gates

| Stage | Command |
| --- | --- |
| Before confirming a spec | `validate_spec.py [feature]` |
| Before approving tasks | `validate_tasks.py [feature]` |
| On each commit | `check_commit.py --message "feat: ..."` |
| Before closing a feature | `validate_state.py [feature]` |
| After a FAIL verdict | `lessons.py add --source .specs/features/[feature]/validation.md` |

Scripts live in `.specs/harness/scripts/`. Pass a feature name, a feature directory, or a path to the artifact. With no argument the gate auto-detects when the project has exactly one feature.

```bash
npx @luizsantiago/agentic-harness validate-spec auth
npx @luizsantiago/agentic-harness check-commit --message "feat(auth): add token refresh"
npx @luizsantiago/agentic-harness lessons list --status confirmed
```

A non-zero exit means stop, fix the artifact, and re-run.

| Gate | Rejects |
| --- | --- |
| `validate_spec` | Missing `Requirements` / `Assumptions` / `Out of Scope`, a criterion without `SHALL` or `MUST`, malformed IDs, a requirement without acceptance criteria, unfilled template placeholders outside fenced samples |
| `validate_tasks` | Missing required field (`Requirement`, `Files`, `Depends on`, `Tests`, `Gate`, `Done when`), `Tests`/`Done when` set to none/—, unknown or forward dependency, dependency on a later phase, dependency cycle, a title on the vague-phrase list, uncovered spec requirement IDs, independent tasks sharing a `Files` path |
| `check_commit` | Non-Conventional header, unknown type, header over 72 characters, trailing period |
| `validate_state` | Missing `validation.md`, verdict other than exact `PASS`/`PASSED` (`PASS WITH GAPS` fails), verdict only under a non-Verdict section, no **test** `file:line` evidence, a spec requirement without same-line test evidence, open task, Medium+ feature without a sensor **outcome** (`killed`/`survived`/`injected`) |
| `lessons` | Add without `--source`, source other than `validation.md`, source outside `.specs/`, corrupt `lessons.json` (missing `title`/`rule`) |

Fenced code samples and markdown tables are documentation, not criteria or tasks. `Depends on: REQ-T100` is a requirement id, not task `T100`. Evidence-or-zero accepts paths such as `test/auth/token.test.ts:41`, not `config.yaml:12`.

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
| Context | — | `references/context-limits.md` | — | — |
| Sub-agents | — | `references/sub-agents.md` | `task-graph-engineering` | — |
| Lessons | `/lessons` | `references/lessons.md` | — | `lessons.py` |

Context is a load rule, Sub-agents is the Execute scaling protocol, and Lessons is a FAIL-path step — none is a sequential pipeline phase.

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
- **Evidence-or-zero** — a requirement is done only with a `file:line` reference to a passing assertive **test** on the same coverage line as the requirement ID (`test/auth/token.test.ts:41`). A config path is not evidence. The verdict must be exactly `PASS` or `PASSED`.
- **Discrimination sensor** — mutants injected into an isolated scratch copy, never `git stash`; a surviving mutant becomes a fix task. On Medium+ features the completion gate **blocks** if the sensor result is missing.
- **Security review** — OWASP checklist, with a documented lightweight path for changes with no auth or API surface
- **Bounded loop** — fix and re-verify at most three times, then escalate

## Memory

| Path | Purpose |
| --- | --- |
| `STATE.md` | Active feature, next step, blockers, deferred ideas, `AD-NNN` decisions |
| `LESSONS.md` | Generated playbook of confirmed lessons — read, never write |
| `lessons.json` | Canonical store owned by `lessons.py` |
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
| A version before `0.6.3` | `Files` is required on every task. `Tests: none` fails. Verdict must sit in the preamble or under `## Verdict` — not under Discrimination Sensor |
| A version before `0.6.2` | Medium+ Verify needs an outcome word (`killed` / `survived` / `injected`), not only a Discrimination Sensor heading. `Done when: —` fails. `./path` and `path` count as the same file for overlap |
| A version before `0.6.0` | Tasks need `Done when`. Re-run `validate_tasks` against the sibling `spec.md` (every REQ needs a task). Independent tasks cannot share `Files`. Closing a Medium+ feature requires a discrimination-sensor result and same-line REQ ↔ test evidence in `validation.md` |
| A version before `0.5.4` | Re-run the gates. `PASS WITH GAPS` is no longer a pass; evidence must cite a test path; fenced samples and markdown tables are not criteria. `lessons.py --source` must live under `.specs/` |
| A version before `0.5.0` | Default install no longer downloads from GitHub. Forks keep using `HARNESS_REPO_URL`. No artifact migration |
| A version before `0.4.0` | `LESSONS.md` is now generated. Do not hand-edit it. Existing entries are not imported — re-record grounded ones with `lessons.py add --source` pointing at the original `validation.md` |
| A version before `0.3.0` | Specs must include `## Assumptions` (use `- none` when nothing was inferred) and every acceptance criterion must use `SHALL` or `MUST`. Re-run `validate_spec` after upgrading — this is a breaking gate change |
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
│   ├── references/                 # 11 phase / load procedures
│   ├── task-graph-engineering.md
│   ├── engineering-standards.md
│   ├── security-review.md
│   └── git-handoff.md
├── rules/engineering-baseline.mdc
├── scripts/                        # Gate scripts (Python; npm ships *.py only)
├── prd/                            # Product specs for harness changes
├── test/
│   ├── install.test.js             # Installer and CLI (Node)
│   ├── test_gates.py               # Gates (Python)
│   └── test_lessons.py             # Lessons engine (Python)
├── .npmignore                      # Keep bytecode out of the published pack
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

Publishing is automated: **Actions → Publish to npm → Run workflow**, choosing `patch`, `minor` or `major`. The workflow bumps the version, runs both suites, and publishes the package (skills, rules and gates included).

## Credits

Task-graph patterns adapted from [graph-engineering](https://github.com/codejunkie99/graph-engineering) (MIT).

## License

MIT
