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
- `.specs/LESSONS.md` entries that apply — load them with `python3 .specs/harness/scripts/lessons.py list --status confirmed`
- Existing codebase conventions
- `context-limits.md` — this feature only; do not load sibling specs

## Output

`.specs/features/[feature]/spec.md`

## Procedure

1. **Act as a thinking partner, not an interviewer.** Challenge vagueness; restate the goal in one sentence and confirm it.
2. **Load confirmed lessons.** Run `python3 .specs/harness/scripts/lessons.py list --status confirmed` and apply every rule that matches this work. Candidates are not guidance.
3. **Detect gray areas.** If the feature touches persistence, external calls, auth, payments, concurrency, or state transitions — or if intent is ambiguous — run `discuss.md` before finalizing.
4. **Write requirements with stable IDs.** `REQ-001`, `AUTH-002` — prefix plus a zero-padded number. IDs never change once approved; retire them instead.
5. **Write binary acceptance criteria.** Every criterion is objectively pass or fail. The gate **blocks** a criterion that does not state a required outcome with `SHALL` or `MUST`. Soft verbs (`should`, `will`, `can`, `may`) are not testable — rewrite them before confirming.
   Prefer **EARS** (one pattern per criterion). The gate **warns** when a `SHALL`/`MUST` line has no `WHEN`/`IF` … `THEN` trigger; missing EARS is not a hard fail.

   | Pattern | Shape | Use when |
   | --- | --- | --- |
   | Ubiquitous | The system SHALL [invariant] | Always-on constraints |
   | Event-driven | WHEN [trigger] THEN the system SHALL [outcome] | A discrete action or event |
   | State-driven | WHILE [state] the system SHALL [outcome] | Behavior that holds during a state |
   | Optional-feature | WHERE [capability] the system SHALL [outcome] | Flag- or plan-gated behavior |
   | Unwanted-behavior | IF [undesired] THEN the system SHALL [outcome] | Errors, invalid input, timeouts |
   | Complex | WHILE [state], WHEN [trigger] the system SHALL [outcome] | Combined state + event |

   One criterion = one behavior. Use concrete values (status, code, bound), not “gracefully” or “quickly”.
6. **State out of scope explicitly.** This is what prevents scope creep during Execute.
7. **Record assumptions.** Anything inferred rather than confirmed goes under `## Assumptions`. The section is required; write `- none` only when nothing was inferred.
8. **Run the gate.** Fix every blocking issue before showing the spec to the owner.
9. **Get approval.** Do not write implementation code until the spec and derived tests are approved.

## Gate

```bash
python3 .specs/harness/scripts/validate_spec.py .specs/features/[feature]/spec.md
python3 .specs/harness/scripts/validate_spec.py [feature]
python3 .specs/harness/scripts/validate_spec.py          # single-feature projects
```

Checks required sections (`Requirements`, `Assumptions`, `Out of Scope`), well-formed IDs, a `SHALL`/`MUST` outcome per criterion, and unresolved placeholders. A criterion with `SHALL` but no `WHEN`/`IF` … `THEN` trigger is a warning. Non-zero exit means STOP.

## Template

```markdown
# Spec: [Feature]

## Goal
[One sentence: what the owner gets when this ships.]

## Requirements

### REQ-001: [Short title]
- **Acceptance Criteria**: WHEN [valid credentials are submitted] THEN the system SHALL [create a session]  <!-- event-driven -->
- IF [the token is expired] THEN the system SHALL [return 401 with code TOKEN_EXPIRED]  <!-- unwanted-behavior -->

### REQ-002: [Short title]
- **Acceptance Criteria**: WHILE [a session is active] the system SHALL [reject reuse of a rotated refresh token]  <!-- state-driven -->
- The system SHALL [store passwords only as argon2 hashes]  <!-- ubiquitous -->

## Assumptions
- [Anything inferred rather than confirmed]

## Out of Scope
- [Explicitly excluded work]
```

## Anti-Patterns

| Avoid | Prefer |
| --- | --- |
| "Login should work well" | "WHEN valid credentials are submitted THEN the system SHALL create a session" |
| "The system will return 401" | "WHEN the token is expired THEN the system SHALL return 401 with code `TOKEN_EXPIRED`" |
| Omitting `## Assumptions` | Record inferences, or write `- none` |
| Renaming `REQ-001` mid-flight | Retire the ID and add a new one |
| Implementation detail in the spec | Keep HOW in `design.md` |

## Next

- Gray areas remain → `discuss.md`
- Architectural decisions needed → `design.md`
- ≤3 obvious steps → `implement.md`
- Otherwise → `tasks.md`
