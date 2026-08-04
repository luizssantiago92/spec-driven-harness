# Agent Architecture Skill

Spec-Driven Development (SDD) harness for AI-assisted software engineering.
Replaces "Vibe Coding" with a structured 5-phase workflow backed by persistent memory and operational sensors.

## When to Use This Skill

Activate this skill when:

- Starting a new feature or significant change in an existing codebase
- Planning architecture, specs, or multi-step implementations
- Handing off work between agent sessions
- Validating that AI-generated code meets acceptance criteria with evidence

## 5-Phase Workflow

```
SPECIFY → DESIGN (optional) → TASKS (optional) → EXECUTE (loop) → VERIFY
```

| Phase | Required | Purpose |
| --- | --- | --- |
| **Specify** | Yes | Map requirements to unique spec IDs; define out-of-scope |
| **Design** | No | Architecture, reuse, risks — skip for simple changes |
| **Tasks** | No | Atomic breakdown with binary success criteria and parallelism |
| **Execute** | Yes | Test-guided implementation in loops with atomic commits |
| **Verify** | Yes | Independent validation by a specialized sub-agent |

### Phase Details

#### 1. Specify (`/specify`)

Create `.specs/features/[feature]/spec.md` with:

- Unique requirement IDs (e.g. `REQ-001`)
- Acceptance criteria per requirement (testable, binary pass/fail)
- Explicit out-of-scope items
- User/business goals

Do not write implementation code until spec and derived tests are approved.

#### 2. Design (`/plan`) — optional

Create `.specs/features/[feature]/design.md` with:

- Architecture decisions and trade-offs
- Reuse of existing components
- Risk assessment and mitigations

Skip for trivial changes (bug fixes, copy updates, single-file edits).

#### 3. Tasks (`/tasks`) — optional

Create `.specs/features/[feature]/tasks.md` with:

- Atomic tasks with binary done criteria
- Dependencies and parallelization hints
- Links back to spec requirement IDs

#### 4. Execute (`/loop`)

Implementation rules:

- **Test-First Imperative**: Write tests derived from acceptance criteria before production code
- **Engineering Standards**: Apply `.cursor/skills/engineering-standards.md` (locale, security, code quality)
- Work in loops: implement → run harness (tests, linter, compiler) → fix → repeat
- Atomic commits per logical unit of work
- Maximum 3 correction loops before escalating to a human

#### 5. Verify (`/verify`)

Independent verification rules:

- **Author ≠ Verificador**: The verifier must have a clean context and never be the code author
- **Security Review**: Run checklist in `.cursor/skills/security-review.md`
- **Discrimination Sensor**: Inject deliberate failures (mutants) to confirm tests detect errors
- **Evidence-or-Zero**: A requirement is "done" only with evidence (file + line) of an assertive test passing
- Write results to `.specs/features/[feature]/validation.md`

## Execution Contract (Critical Rules)

1. **Test-First Imperative** — No production code before spec and acceptance-derived tests are approved.
2. **Author ≠ Verificador** — Independent verifier with clean context after the last task.
3. **Discrimination Sensor** — Verifier injects mutants to validate test sensitivity.
4. **Evidence-or-Zero** — Requirements need test evidence, not AI self-declaration.

## Persistent Memory (`.specs/`)

Combat session amnesia with these artifacts:

| File | Purpose |
| --- | --- |
| `.specs/STATE.md` | Technical decisions and progress snapshot for handoff |
| `.specs/LESSONS.md` | Continuous learning playbook — verification failures become local lessons |
| `.specs/features/[feature]/spec.md` | Requirements and acceptance criteria |
| `.specs/features/[feature]/design.md` | Architecture (when applicable) |
| `.specs/features/[feature]/tasks.md` | Atomic task breakdown |
| `.specs/features/[feature]/validation.md` | Independent verification report |

Always read `STATE.md` at session start. Update it at session end with decisions and progress. Run `/handoff` per `git-handoff.md` to commit `.specs/` to git.

## Loop Engineering & Harness

Unlike isolated prompts, this skill operates in autonomous loops:

- **Correction Loop**: If the harness (test runner, linter, compiler) fails, fix and retest up to 3 times before calling a human.
- **Operational Harness**: Quality is enforced by external tools (test runners, linters, compilers), not by AI self-declaration.

## Knowledge Verification Chain

When making any technical decision, follow this order strictly:

1. **Codebase** — Check conventions and patterns already in use
2. **Docs** — Read README and `.specs/STATE.md`
3. **MCP/Context** — Consult up-to-date documentation via external tools
4. **Web Search** — Community patterns and official sources
5. **Uncertainty** — If not found, say "I don't know". Never invent APIs or behaviors.

## Model Selection

- **Planning phases** (Specify, Design, Tasks): High-reasoning models (Opus, GPT-4o)
- **Execution loop**: Fast/cost-effective models (Sonnet, Composer)

## Related Skills

| Skill | Purpose |
| --- | --- |
| `engineering-standards.md` | Locale policy (pt-BR chat, English artifacts), secure coding, git hygiene |
| `security-review.md` | OWASP-oriented checklist for `/verify` |
| `git-handoff.md` | Git sync at phase boundaries and session handoff |

Project rules: `.cursor/rules/locale-and-standards.mdc` (always applied in Cursor).

## Available Commands

| Command | Action |
| --- | --- |
| `/specify` | Define requirements and spec IDs |
| `/plan` | Create technical design and architecture |
| `/tasks` | Atomic task breakdown |
| `/loop` | Start autonomous implementation loop |
| `/verify` | Trigger independent technical validation |
| `/handoff` | Update STATE, commit `.specs/` to git (no push) |
