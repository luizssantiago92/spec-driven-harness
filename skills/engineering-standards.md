# Engineering Standards

Cross-cutting engineering policies for all implementation and verification work.
Apply during **Execute** and **Verify** phases, and whenever writing or reviewing code.

## When to Use

- Implementing features (`/loop`)
- Reviewing code (`/verify`)
- Fixing bugs, refactors, or dependency updates
- Any task that touches source code, tests, or infrastructure

## Locale Policy

| Context | Language |
| --- | --- |
| Chat with project owner | Brazilian Portuguese (pt-BR) |
| Source code | English |
| Tests | English |
| Comments & docstrings | English |
| Commit messages | English (Conventional Commits) |
| PR titles & descriptions | English |
| `.specs/` documents | English |
| Variable, function, class names | English |

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

## Git & PR Hygiene

```
feat(scope): add user authentication
fix(api): handle null response from payment gateway
docs(readme): update install instructions
test(auth): add session expiry edge case
```

- One concern per PR when possible.
- Link to spec requirement IDs (e.g. `REQ-003`) in PR description.
- Never force-push shared branches without coordination.

## Logging & Observability

- Structured logs where the project supports them.
- Include correlation/request IDs in server-side logs.
- No secrets, tokens, or full PII in logs.
- Metrics and traces for critical paths when infrastructure allows.

## Related Skills

- `agent-architecture.md` — SDD workflow (Specify → Verify)
- `security-review.md` — deep checklist for `/verify` phase
- `git-handoff.md` — git sync and session handoff for `.specs/`
