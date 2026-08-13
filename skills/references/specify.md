# Specify

Capture WHAT to build as testable, traceable requirements. Always required.

## When to Use

- Any change beyond the Quick tier (see `quick-mode.md`)
- Before writing production code or tests

## When NOT to Use

- Quick-tier changes (≤3 files, no design decisions) — use `quick-mode.md`

## Inputs

- Owner's request, in their own words
- `.specs/STATE.md` decisions (`AD-NNN`) relevant to this area
- `.specs/LESSONS.md` entries that apply
- Existing codebase conventions

## Output

`.specs/features/[feature]/spec.md`

## Procedure

1. **Act as a thinking partner, not an interviewer.** Challenge vagueness; restate the goal in one sentence and confirm it.
2. **Detect gray areas.** If the feature touches persistence, external calls, auth, payments, concurrency, or state transitions — or if intent is ambiguous — run `discuss.md` before finalizing.
3. **Write requirements with stable IDs.** `REQ-001`, `AUTH-002` — prefix plus a zero-padded number. IDs never change once approved; retire them instead.
4. **Write binary acceptance criteria.** Every criterion is objectively pass or fail. EARS shape is recommended and reported by the gate:
   `WHEN <trigger> THEN the system SHALL <observable outcome>`
5. **State out of scope explicitly.** This is what prevents scope creep during Execute.
6. **Record assumptions.** Anything you inferred rather than confirmed goes in writing.
7. **Run the gate.** Fix every blocking issue before showing the spec to the owner.
8. **Get approval.** Do not write implementation code until the spec and derived tests are approved.

## Gate

```bash
python3 .specs/harness/scripts/validate_spec.py .specs/features/[feature]/spec.md
```

Checks required sections, well-formed IDs, acceptance criteria per requirement, and unresolved placeholders. Non-zero exit means STOP.

## Template

```markdown
# Spec: [Feature]

## Goal
[One sentence: what the owner gets when this ships.]

## Requirements

### REQ-001: [Short title]
- **Acceptance Criteria**: WHEN [trigger] THEN the system SHALL [observable outcome]
- WHEN [error trigger] THEN the system SHALL [error outcome]

### REQ-002: [Short title]
- **Acceptance Criteria**: WHEN [trigger] THEN the system SHALL [observable outcome]

## Assumptions
- [Anything inferred rather than confirmed]

## Out of Scope
- [Explicitly excluded work]
```

## Anti-Patterns

| Avoid | Prefer |
| --- | --- |
| "Login should work well" | "WHEN valid credentials are submitted THEN the system SHALL create a session" |
| "Handle errors" | "WHEN the token is expired THEN the system SHALL return 401 with code `TOKEN_EXPIRED`" |
| Renaming `REQ-001` mid-flight | Retire the ID and add a new one |
| Implementation detail in the spec | Keep HOW in `design.md` |

## Next

- Gray areas remain → `discuss.md`
- Architectural decisions needed → `design.md`
- ≤3 obvious steps → `implement.md`
- Otherwise → `tasks.md`
