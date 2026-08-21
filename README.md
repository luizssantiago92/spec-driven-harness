# Spec-Driven Harness

[![npm version](https://img.shields.io/npm/v/@luizsantiago/agentic-harness.svg)](https://www.npmjs.com/package/@luizsantiago/agentic-harness)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**A seatbelt for AI coding agents.** You agree on the goal in writing, break the work into small jobs, prove each job with a real check, then a fresh review asks for proof — not confidence. Automatic checks stop the agent from calling incomplete work “done”.

Install once (`npx @luizsantiago/agentic-harness install`) and the same playbook runs in **Cursor** and **Claude Code**. The agent loads **one step’s guide** at a time instead of dumping the whole manual into every chat — so you spend less context on process and more on the feature.

npm package: [`@luizsantiago/agentic-harness`](https://www.npmjs.com/package/@luizsantiago/agentic-harness) **0.8.x**. The badge above tracks the published patch.

For the engineering contract (gates, evidence rules, upgrade tables), keep reading below — or take the plain-language tour on the [project wiki](https://github.com/luizssantiago92/spec-driven-harness/wiki).

### What's in 0.8.x

| Area | What you get |
| --- | --- |
| **Feature identity (Tier 0)** | `feature-init` allocates `NNN-slug`, updates `STATE.md`, and `git checkout -b feat/NNN-slug` automatically on `/specify` |
| **Git blast radius tiers** | Tier 0 local (branch + commits) automatic on phase triggers; Tier 1 push/PR and Tier 2 merge/deploy need owner go-ahead |
| **Explore + Constitution** | Free `/explore` before Specify; project `CONSTITUTION.md` workflow |
| **Brownfield delta specs** | `ADDED` / `MODIFIED` / `REMOVED` requirement sections; `[NEEDS CLARIFICATION]` markers |
| **Cross-artifact analyze** | `analyze_artifacts.py` before task approval; `/converge` and `/archive` for drift and fold-back |
| **0.7 gate contract preserved** | Evidence-or-zero, discrimination sensor, adversarial CI matrix — see [`prd/gate-stability.md`](prd/gate-stability.md) |

### What's in 0.7.x (baseline)

| Area | What you get |
| --- | --- |
| **Progressive disclosure** | Load the current phase, not the archive — ~**70%** fewer skill tokens on a plan turn vs a full dump (~27k → ~7k); ~**80%** less across a typical Medium feature |
| **Python gates (form)** | Specs need `SHALL`/`MUST`; tasks need fields + REQ coverage + Files overlap; commits are Conventional; Verify needs exact `PASS`/`PASSED`, test-path evidence, Medium+ mutant sensor; open Gaps or Security `Result: fail` block PASS. Contract: [`prd/gate-stability.md`](prd/gate-stability.md) |
| **Authoring (judgment)** | EARS patterns on criteria (shape is a **warning**; missing `SHALL`/`MUST` still **blocks**); Tasks **Test Coverage Matrix** + **Gate Check Commands**; Execute adequacy **A–D** before each commit; standing Definition of Done — not extra Python brakes |
| **Verify depth** | OWASP checklist always; conditional **AppSec** then **QA** (one at a time); lean interactive UAT on Complex user-facing work — verifier judgment, not `validate_state.py` |
| **Conditional extras** | `code-simplify` (Medium+ / owner ask); `ship-ready` (owner ship/deploy ask — does not authorize push); at most **one** conditional sister in context |
| **Install surface** | Cursor + Claude Code; hub + 8 sisters, 16 phase refs, 7 gate scripts; re-run install refreshes kit and keeps `.specs/` memory |

**Stability baseline 0.7** freezes that gate contract and ships an adversarial CI matrix. Free-form “find more gate bugs” only becomes a PR when a failing case lands in `test/test_adversarial_gates.py` first.

## Learn more

Human-friendly tour on the [project wiki](https://github.com/luizssantiago92/spec-driven-harness/wiki) (less jargon than this README):

| Page | About |
| --- | --- |
| [Home](https://github.com/luizssantiago92/spec-driven-harness/wiki/Home) | What it is and why it exists |
| [How it works](https://github.com/luizssantiago92/spec-driven-harness/wiki/How-it-works) | Specify → Verify in plain language |
| [Gates and guarantees](https://github.com/luizssantiago92/spec-driven-harness/wiki/Gates-and-guarantees) | What the brakes catch — and what they don’t |
| [Token efficiency](https://github.com/luizssantiago92/spec-driven-harness/wiki/Token-efficiency) | Progressive loading and context cost |
| [Quick start](https://github.com/luizssantiago92/spec-driven-harness/wiki/Quick-start) | First ten minutes |
| [FAQ](https://github.com/luizssantiago92/spec-driven-harness/wiki/FAQ) | Common questions |
| [Companion: Agentic Fullstack](https://github.com/luizssantiago92/spec-driven-harness/wiki/Companion-agentic-fullstack) | Optional frontend / backend / data floor map |

Markdown sources for those pages also live in [`docs/wiki/`](docs/wiki/) so they can be reviewed in PRs.

## Token efficiency (progressive disclosure)

Dumping every skill and reference into every turn is the expensive default. This harness is built so the agent **loads a working set**, not the archive — hub rule in `agent-architecture.md`, budget in `references/context-limits.md`:

| Load pattern | What enters context | Relative size |
| --- | --- | --- |
| Naive full dump | Hub + all 16 phase refs + 8 sister skills + project rule | ~27k tokens |
| Progressive (plan turn) | Hub + current phase ref + mapped sister skill + `context-limits` + rule | ~7k tokens (~**70% less**) |
| Execute lean | Current phase ref + sister skill + `context-limits` | ~4k tokens |
| Execute + simplify | Execute lean + `code-simplify.md` (never with AppSec/QA/ship) | ~+0.9k vs Execute lean |
| Verify + one conditional | Base Verify set + `appsec.md` **or** `qa-strategy.md` (never both at once; never ship-ready here) | ~+1k vs base Verify |

On a typical Medium feature (plan → several execute loops → verify), progressive loading uses on the order of **~80% fewer** skill tokens than reloading the full kit every turn. Sub-agents receive only their task payload (`references/sub-agents.md`), and Verify starts with a **clean context** — Author ≠ verifier — so the author’s working set is not paid twice. Conditional sisters (AppSec, QA, simplify, ship-ready) join only on their triggers, and only **one at a time**.

These figures are measured from the shipped skill texts (chars÷4). Real sessions also save retries when gates catch incomplete artifacts early.

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
| `.cursor/skills/references/*.md` | Per-phase procedures (16 files), including `explore`, `analyze`, `archive` |
| `.cursor/skills/task-graph-engineering.md` | Task DAG, parallelism, diamond verify, sub-agent batches |
| `.cursor/skills/engineering-standards.md` | Secure coding, code quality, one writer per file |
| `.cursor/skills/security-review.md` | OWASP checklist for `/verify` |
| `.cursor/skills/appsec.md` | Conditional AppSec (Complex / attack surface); load alone, before QA |
| `.cursor/skills/qa-strategy.md` | Conditional QA strategy; never together with `appsec.md` |
| `.cursor/skills/code-simplify.md` | Conditional simplify (Medium+ after A–D or owner ask); never with other conditionals |
| `.cursor/skills/ship-ready.md` | Conditional ship checklist (owner ask); does not authorize push |
| `.cursor/skills/git-handoff.md` | Git sync, reconcile, session handoff |
| `.claude/skills/**` | The same skills and references for Claude |
| `.cursor/rules/engineering-baseline.mdc` | Always-applied Cursor project rule |
| `.specs/harness/scripts/*.py` | Gate scripts |
| `.specs/STATE.md` · `.specs/LESSONS.md` · `.specs/lessons.json` | Decision log, generated lessons playbook, canonical store |
| `.cursorrules` | Execution contract (progressive disclosure) |

### Asset provenance

The npm package ships the CLI, skills, references, project rules and gate scripts. Install copies them from the package, so a later push to the default branch cannot change an install that already happened — upgrading the package is what changes the harness.

Setting `HARNESS_REPO_URL` overrides the source (a fork, or the test suite) and is announced before anything is written. Remote fetches stay a trust boundary: HTTPS only (plain HTTP is accepted against `localhost` for the test suite), redirect hops stay on the same origin, a 30s request timeout, and a 2 MB cap per asset. Installer writes refuse to follow a destination symlink (skills, memory files, and `.cursorrules`).

## Gates

| Stage | Command |
| --- | --- |
| Before `/specify` (Medium+) | `feature-init "<description>"` (Tier 0 — folder + branch + STATE) |
| Before confirming a spec | `validate_spec.py [feature]` |
| Before approving tasks | `analyze_artifacts.py [feature]` then `validate_tasks.py [feature]` |
| On each commit | `check_commit.py --message "feat: ..."` |
| Before closing a feature | `validate_state.py [feature]` |
| After a FAIL verdict | `lessons.py add --source .specs/features/[feature]/validation.md` |

Scripts live in `.specs/harness/scripts/`. Pass a feature name, a feature directory, or a path to the artifact. With no argument the gate auto-detects when the project has exactly one feature.

```bash
npx @luizsantiago/agentic-harness feature-init "chat with presence"
npx @luizsantiago/agentic-harness validate-spec auth
npx @luizsantiago/agentic-harness analyze-artifacts auth
npx @luizsantiago/agentic-harness check-commit --message "feat(auth): add token refresh"
npx @luizsantiago/agentic-harness lessons list --status confirmed
```

A non-zero exit means stop, fix the artifact, and re-run.

| Gate | Rejects |
| --- | --- |
| `validate_spec` | Missing `Goal`, `Requirements` / `Assumptions` / `Out of Scope` (full spec), or delta sections (`ADDED`/`MODIFIED`/`REMOVED`), a criterion without `SHALL` or `MUST`, malformed IDs, a requirement without acceptance criteria, unfilled template placeholders outside fenced samples and HTML comments; open `[NEEDS CLARIFICATION]` warns (`--strict` blocks) |
| `analyze_artifacts` | Spec requirement without task coverage, task `Requirement` referencing unknown REQ ID; open `[NEEDS CLARIFICATION]` warns (`--strict` blocks) |
| `validate_tasks` | Missing required field (`Requirement`, `Files`, `Depends on`, `Tests`, `Gate`, `Done when`), `Files`/`Tests`/`Gate`/`Done when` set to none/—, unknown or forward dependency, dependency on a later phase, dependency cycle, a title on the vague-phrase list, uncovered spec requirement IDs (only headings under `## Requirements`; fences and HTML comments ignored), independent tasks sharing a `Files` path (`./path`, `/path`, `../path`, quotes, markdown links, case variants, and `path` count as one) |
| `check_commit` | Non-Conventional header, unknown type, header over 72 characters, trailing period |
| `validate_state` | Missing `validation.md`, verdict other than exact `PASS`/`PASSED` (`PASS WITH GAPS` fails), verdict only under a non-Verdict section, conflicting preamble vs `## Verdict`, no **test** `file:line` evidence (fences and HTML comments ignored), a spec requirement without same-line test evidence, open task, `PASS` with a surviving mutant (sensor/mutant lines only), Medium+ `PASS` without a **killed** mutant there, Medium+ feature without a sensor **outcome** (`killed`/`survived`/`injected`), `PASS` with open `Gaps` or Security Review `Result: fail` |
| `lessons` | Add without `--source`, source other than `validation.md`, source outside `.specs/`, corrupt `lessons.json` (missing `title`/`rule`) |

Fenced code samples and markdown tables are documentation, not criteria or tasks. `Depends on: REQ-T100` is a requirement id, not task `T100`. Evidence-or-zero accepts paths such as `test/auth/token.test.ts:41`, not `config.yaml:12`.

### Gate guarantees

Structural gates freeze **form**, not meaning. See [`prd/gate-stability.md`](prd/gate-stability.md).

| Guarantees | Does not guarantee |
| --- | --- |
| Required sections/fields, IDs, dependency shape, normalized Files overlap | That a cited test asserts the criterion |
| Exact `PASS`/`PASSED`, test-path evidence, Medium+ sensor outcomes (`design.md` with content, 4+ tasks, or 2+ phases — not the hub Complexity Router’s “Medium” label) | Real-world security beyond the recorded Security Review / AppSec result |
| PASS blocked by open Gaps or Security `Result: fail` | Interactive UAT / walkthrough success; optional `## AppSec` / `## QA` quality (verifier judgment, not gated) |
| Conventional commits; grounded lessons store rules | That `Done when` prose is philosophically binary; that EARS shape, the Tasks coverage-matrix headings, or Execute adequacy A–D ran (authoring / judgment) |

After **0.7.0**, free-form gate audits only become PRs when a new failing case lands in `test/test_adversarial_gates.py` first.

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
EXPLORE (optional) → SPECIFY → DISCUSS (conditional) → DESIGN (optional) → TASKS (optional) → ANALYZE → EXECUTE (loop) → VERIFY → ARCHIVE
```

| Phase | Command | Procedure | Cross-cutting skill | Gate |
| --- | --- | --- | --- | --- |
| Explore | `/explore` | `references/explore.md` | — | — |
| Constitution | `/constitution` | `references/constitution.md` | — | — |
| Specify | `/specify` | `references/specify.md` (feature-init + EARS; delta specs) | — | `validate_spec.py` |
| Discuss | `/discuss` | `references/discuss.md` | — | — |
| Design | `/plan` | `references/design.md` | — | — |
| Tasks | `/tasks` | `references/tasks.md` (coverage matrix + gate commands, authoring) | `task-graph-engineering` | `validate_tasks.py` |
| Analyze | `/analyze` | `references/analyze.md` | — | `analyze_artifacts.py` |
| Execute | `/loop` | `references/implement.md` (adequacy A–D before commit) | `engineering-standards` | `check_commit.py` |
| Verify | `/verify` | `references/validate.md` | `security-review` (+ conditional `appsec` then `qa-strategy`, one at a time) | `validate_state.py` |
| Archive | `/archive` | `references/archive.md` | `git-handoff` | — |
| Converge | `/converge` | `references/converge.md` | — | `analyze_artifacts.py` |
| Handoff | `/handoff` | `references/memory.md` | `git-handoff` | — |
| Quick | `/quick` | `references/quick-mode.md` | — | `check_commit.py` |
| Context | — | `references/context-limits.md` | — | — |
| Sub-agents | — | `references/sub-agents.md` | `task-graph-engineering` | — |
| Lessons | `/lessons` | `references/lessons.md` | — | `lessons.py` |

Context is a load rule, Sub-agents is the Execute scaling protocol, and Lessons is a FAIL-path step — none is a sequential pipeline phase.

Specify prefers **EARS** patterns (event, error, state, invariant); `validate_spec.py` still only **blocks** missing `SHALL`/`MUST` (EARS shape is a warning). Tasks authoring fills a **Test Coverage Matrix** and **Gate Check Commands** before approval — the gate already enforces REQ coverage and `Tests`/`Gate` fields, not those section headings. Execute runs adequacy **A–D** (outcome, scope, gate, spec) before each commit; that is judgment, not `validate_state.py`.

`/task-graph` draws the job DAG before `/loop`; `/sync-spec` commits the current feature's artifacts without a full handoff.

### Complexity router

Depth follows the work, not a fixed pipeline.

| Tier | Scope | Path |
| --- | --- | --- |
| Quick | ≤3 files, no design decision | Describe, implement, verify, commit |
| Simple | 2–5 files | Specify → Execute → Verify |
| Medium | New feature, under 10 tasks | Specify → Tasks → Execute → Verify |
| Complex | Architecture, API surface, infrastructure | Specify → Discuss → Design → Tasks → Execute → Verify (AppSec/QA/UAT when triggers fire) |
| Parallel | Splittable work, multiple agents | Any of the above plus `/task-graph` |

Even when Tasks is skipped, Execute opens by listing the atomic steps. More than five steps, or a real dependency between them, means the Tasks phase was skipped in error — the agent stops and writes `tasks.md`.

## Execution contract

1. **Test-first** — tests derive from acceptance criteria and assert the spec's outcome, never the implementation. Execute adequacy **A** is that check before each commit (judgment).
2. **Gate before done** — the test runner decides, not self-assessment. Adequacy **C** is the task `Gate` command.
3. **One atomic commit per task** — code, tests, and the task checkbox land together. Adequacy **B** is scope (`Files` vs the index); **D** is no silent spec deviation.
4. **Author ≠ verifier** — after the last task, `/verify` runs in a clean context. Mandatory, never prompted.
5. **Blast radius (git tiers)** — Tier 0 (feature-init, local branch, commits) runs on phase triggers. Tier 1 (`git push`, PR) and Tier 2 (merge, deploy, force-push) require explicit owner go-ahead.

## Verification

- **Spec-anchored check** — every criterion has a test asserting the outcome the spec defines
- **Evidence-or-zero** — a requirement is done only with a `file:line` reference to a passing assertive **test** on the same coverage line as the requirement ID (`test/auth/token.test.ts:41`). A config path is not evidence. The verdict must be exactly `PASS` or `PASSED`.
- **Discrimination sensor** — mutants injected into an isolated scratch copy, never `git stash`; a surviving mutant becomes a fix task. On gate Medium+ features (`design.md` with content, 4+ tasks, or 2+ phases) the completion gate **blocks** if the sensor result is missing.
- **Security review** — OWASP checklist, with a documented lightweight path for changes with no auth or API surface
- **Conditional AppSec / QA** — on Complex or risk surfaces, load `appsec.md` then `qa-strategy.md` one at a time (verifier judgment; not gated)
- **Lean Interactive UAT** — on Complex + user-facing work, a short walkthrough after automated checks (verifier judgment; `validate_state.py` does not run the walkthrough)
- **Standing Definition of Done** — project readiness bar in `engineering-standards.md` (judgment; not gated)
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
| `security-review.md` | Verification | OWASP checklist during `/verify` |
| `appsec.md` | Conditional AppSec | Threat sketch on Complex / attack surface (judgment; one-at-a-time) |
| `qa-strategy.md` | Conditional QA | Smoke/regression focus after AppSec if both apply (judgment) |
| `code-simplify.md` | Conditional simplify | Clarity pass after A–D / owner ask; no behavior change (judgment) |
| `ship-ready.md` | Conditional ship | Launch checklist on owner ask; does not authorize push (judgment) |
| `git-handoff.md` | Persistence | How memory reaches git |

Each skill links to the others, and `.cursorrules` points at the hub, so the agent loads the set when planning or executing. Prefer the **Token efficiency** working set above over loading every skill on every turn — that is the cost win.

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
| A version before `0.8.0` | Re-run install for Explore/Analyze/Archive refs, `feature-init`, delta specs, git tiers, and `analyze_artifacts.py`. Open features: run `feature-init` pattern manually or rename folders to `NNN-slug` |
| A version before `code-simplify` / `ship-ready` sisters | Re-run install. Both are optional judgment loaders; no artifact migration |
| A version before AppSec/QA sister skills | Re-run install to receive `appsec.md` and `qa-strategy.md`. Sections in `validation.md` stay optional (judgment); no artifact migration |
| A version before Specify EARS table / Tasks matrix template / Execute adequacy | Re-run install. Specs still need `SHALL`/`MUST` (gated). Coverage-matrix headings and A–D remain authoring/judgment — no artifact migration |
| A version before `0.7.2` | Gaps placeholders accept markdown emphasis (`- **none**`, `- *none*`) |
| A version before `0.7.0` | Stability baseline: shared path/markdown helpers, adversarial matrix in CI, skill PASS language aligned with gates. Free-form audits need a failing matrix case before a gate PR. Read `prd/gate-stability.md` |
| A version before `0.6.8` | Evidence inside fences or HTML comments does not count. `Files` overlap is case-insensitive and unwraps markdown links. `PASS` with open `Gaps` or Security Review `Result: fail` fails |
| A version before `0.6.7` | Requirement IDs only under `## Requirements`. Quoted/`../` `Files` paths normalize for overlap. `killed`/`survived` must sit in the sensor section or on a mutant line. Conflicting preamble vs `## Verdict` fails |
| A version before `0.6.5` | `PASS` with a surviving mutant fails. Medium+ `PASS` needs at least one `killed` (injected alone is not enough). `Files: none` and `Gate: none` fail. `/path` overlaps `path` |
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
│   ├── references/                 # 16 phase / load procedures
│   ├── task-graph-engineering.md
│   ├── engineering-standards.md
│   ├── security-review.md
│   ├── appsec.md                   # Conditional AppSec
│   ├── qa-strategy.md              # Conditional QA
│   ├── code-simplify.md            # Conditional simplify
│   ├── ship-ready.md               # Conditional ship checklist
│   └── git-handoff.md
├── rules/engineering-baseline.mdc
├── scripts/                        # Gate scripts (Python; npm ships *.py only)
├── prd/                            # Product specs for harness changes
│   ├── harness-power-ups.md
│   └── gate-stability.md           # What gates guarantee; audit freeze policy
├── docs/wiki/                      # Human tour (mirror of GitHub Wiki pages)
├── test/
│   ├── install.test.js             # Installer and CLI (Node)
│   ├── test_gates.py               # Gates (Python)
│   ├── test_adversarial_gates.py   # Closed false-pass families (Python)
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

- Spec-driven phases, `.specs/` memory, and structural gate ideas adapted from [tlc-spec-driven](https://github.com/tech-leads-club/agent-skills/tree/main/packages/skills-catalog/skills/(development)/tlc-spec-driven) (Tech Leads Club / [Felipe Rodrigues](https://github.com/felipfr), [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)). This package hardens that lineage independently (0.7 gate contract, adversarial matrix, progressive install).
- Lean discuss / Definition of Done / anti-rationalization / optional simplify–ship patterns inspired by [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (MIT). Not a fork; no second skill router.
- Task-graph patterns adapted from [graph-engineering](https://github.com/codejunkie99/graph-engineering) (MIT).

## License

MIT
