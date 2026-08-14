# Discuss

Resolve gray areas with the owner before they become guesses in code. Runs inside Specify, never as a standalone phase.

## When to Use

Trigger automatically when the feature has any of these dimensions and the spec does not already answer them:

| Dimension | Typical gray area |
| --- | --- |
| Persistence / state | What survives a refresh, a restart, a logout? |
| External calls | Timeout, retry, and failure behavior |
| Auth | Who can see or do this; what happens when denied |
| Payments | Partial failure, refunds, idempotency |
| Concurrency | Two users or tabs acting at once |
| State transitions | Which transitions are legal; what is irreversible |
| User-facing behavior | Empty, loading, and error states |

Also trigger when the owner's request has more than one reasonable interpretation.

## When NOT to Use

- The answer is already in `spec.md`, `STATE.md`, or established codebase convention
- The decision is purely technical with no owner-visible consequence — that belongs in `design.md`

## Inputs

- Draft `spec.md`
- `.specs/STATE.md` decisions

## Output

`.specs/features/[feature]/context.md` — created only when Discuss actually runs.

## Procedure

1. **List the gray areas** you found, grouped by dimension. Keep it short — no more than five at a time.
2. **Ask one gray area at a time** (unless the owner asks for a batch).
3. **Offer concrete options**, not open questions. "Should the session expire after 24h, 7d, or on browser close?" beats "How should sessions work?"
4. **State your recommendation and why.** The owner should be able to answer "yes" and move on.
5. **Wait for an explicit yes** or option letter before writing `context.md` — soft “sounds fine” is not enough.
6. **Record the decision verbatim** in `context.md`, with the rationale and the date.
7. **Fold consequences back into `spec.md`** as acceptance criteria — `context.md` records the decision; the spec records the testable outcome.
8. **Escalate irreversible choices.** Anything expensive to undo gets an explicit confirmation (see the human gate in `task-graph-engineering.md`).

## Template

```markdown
# Context: [Feature]

## D-001: [Question in one line]
- **Options considered**: A) ... B) ... C) ...
- **Decision**: [what the owner chose]
- **Rationale**: [why]
- **Consequences**: [which REQ IDs this affects]
- **Date**: [ISO date]
```

## Rules

- Write `context.md` in **English**, whatever language the conversation happens in (see `engineering-standards.md`).
- Never invent an answer to keep momentum. An unanswered gray area is a blocker, not a detail.
- If the owner defers a decision, record it as an open question in `STATE.md` under Blockers.
- Project-wide decisions graduate to `STATE.md` as `AD-NNN` (see `memory.md`).

## Next

Return to `specify.md`, update the spec, and re-run the spec gate.
