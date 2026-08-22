# Constitution

Establish project governing principles that guide every phase.

## When to Use

- First guardrails session on a new project
- Owner asks to define or refresh engineering principles
- Before the first Medium+ feature when `.specs/project/CONSTITUTION.md` is missing

## When NOT to Use

- Per-feature decisions — use `context.md` or `design.md`
- Quick fixes with no principle impact

## Inputs

- Owner's values (quality, testing, UX, performance, security posture)
- Existing README, ADRs, team standards
- `.specs/project/PROJECT.md` when present

## Output

`.specs/project/CONSTITUTION.md`

## Procedure

1. **Interview lightly.** Ask what must never regress (tests, accessibility, latency, security).
2. **Draft principles** as numbered, testable statements — not slogans.
3. **Link to enforcement** — which gate or skill checks each principle (when applicable).
4. **Get approval** before treating the constitution as binding.
5. **Commit** with `docs(spec): add project constitution` (Tier 0).

## Template

```markdown
# Project Constitution

## Principles

### C-001: Test-first delivery
- Every feature change MUST include tests derived from acceptance criteria before merge.

### C-002: Security baseline
- Auth and PII surfaces MUST pass OWASP review in `/verify`.

### C-003: User-facing quality
- UI changes MUST remain accessible and consistent with existing patterns.

## Non-Negotiables
- No secrets in git
- No skipping structural gates

## Amendment
- Supersede with a new C-NNN entry and reference the old one — never edit history in place.
```

## Gate

No Python gate. Constitution compliance is checked by judgment in Specify, Design, Execute, and Verify.

## Next

- First feature → `feature-init` then `specify.md`
- Principles constrain architecture → reference C-NNN in `design.md`
- Back → `agent-architecture.md`
