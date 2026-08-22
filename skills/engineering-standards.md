# Engineering Standards

Cross-cutting engineering policies for all implementation and verification work.
Apply during **Execute** and **Verify** phases, and whenever writing or reviewing code.

## When to Use

- Implementing features (`/loop`)
- Reviewing code (`/verify`)
- Fixing bugs, refactors, or dependency updates
- Any task that touches source code, tests, or infrastructure

## Artifact Language

Every project artifact is written in **English**: source code, tests, comments and docstrings, commit messages, PR titles and descriptions, `.specs/` documents, and identifier names.

Chat language is a personal preference, not guardrails rule. Set it as a global rule in your agent settings if you want replies in another language.

## Secure Coding

- **Never commit secrets** — API keys, tokens, passwords, private keys belong in env vars or secret managers.
- **Validate all inputs** — sanitize user input; use parameterized queries; avoid string concatenation in SQL.
- **Fail closed** — auth/authz errors must deny access; never fall back to permissive defaults.
- **Least privilege** — minimal scopes for tokens, IAM roles, and database users.
- **Dependencies** — prefer well-maintained packages; run audit before adding; pin versions in lockfiles.
- **Error handling** — no silent swallow; log without PII or secrets.
- **HTTPS only** — no plaintext credentials or sensitive data over HTTP.

## Code Quality

- **Follow existing conventions** — read surrounding code before adding new patterns.
- **Surgical changes** — touch only the files the current task requires.
- **No scope creep** — good ideas outside the task go to `.specs/STATE.md` under Deferred Ideas, never into the diff.
- **Small, focused diffs** — one logical change per commit; avoid drive-by refactors.
- **DRY with judgment** — extract duplication when it improves clarity, not prematurely.
- **Explicit over clever** — readable code beats clever one-liners.
- **Types & lint** — respect TypeScript strict mode, ESLint, Prettier, or project equivalents.
- **Dead code** — remove unused imports, variables, and commented-out blocks.

## Testing Standards

- Tests derived from acceptance criteria (see `agent-architecture.md`).
- Cover happy path, edge cases, and failure modes.
- No flaky tests — isolate external dependencies with mocks/fakes.
- Assert behavior, not implementation details (unless testing internals is intentional).
- Test names describe scenario and expected outcome in English.
- **Never weaken a test to make a gate pass** — no skipping, deleting, or loosening assertions.

## Definition of Done (standing bar)

Project-wide readiness — **judgment**, not `validate_state.py`. Clear acceptance criteria **and**: tests for this change pass; diff stays in task `Files`; lint/types if the project has them; no secrets/PII in source or logs; no debug dumps or dead commented code; honest Gaps (never PASS with open gaps).

## Parallel Work Guardrails

- **One writer per file** — no two agents or jobs mutate the same file in the same round (see `task-graph-engineering.md`)
- **Disjoint ownership** — parallel tasks must touch different files or modules

## Git & PR Hygiene

```
feat(scope): add user authentication
fix(api): handle null response from payment gateway
docs(readme): update install instructions
test(auth): add session expiry edge case
```

Validate the message before committing:

```bash
python3 .specs/guardrails/scripts/check_commit.py --message "feat(auth): add token refresh"
```

Optionally wire it as a git `commit-msg` hook so the rule holds without agent involvement.

- One concern per PR when possible.
- Link to spec requirement IDs (e.g. `REQ-003`) in PR description.
- Include test evidence (file:line) for each REQ addressed — not just a summary.
- Never force-push shared branches without coordination (Tier 2).
- **Git blast radius (tiers)** — Tier 0 local work is authorized by spec/tasks approval. Tier 1 (`push`, PR) and Tier 2 (merge, deploy, force-push) require explicit owner go-ahead. See `git-handoff.md`.

## Logging & Observability

- Structured logs where the project supports them.
- Include correlation/request IDs in server-side logs.
- No secrets, tokens, or full PII in logs.
- Metrics and traces for critical paths when infrastructure allows.

## Related Skills

- `agent-architecture.md` — SDD hub, execution contract, gates
- `references/implement.md` — per-task execution cycle
- `security-review.md` — deep checklist for `/verify` phase
- `git-handoff.md` — git sync and session handoff for `.specs/`
- `task-graph-engineering.md` — task DAG and parallelism rules

## Related Rules

Project rules: `.cursor/rules/engineering-baseline.mdc` (always applied in Cursor).
