# Validate

Independent verification of the delivered feature. Always required, never prompted.

## When to Use

- After the last task of a feature is committed
- After any fix round that follows a FAIL verdict

## Who Runs It

A **fresh verifier context that never wrote the code**. Author ≠ Verificador is non-negotiable. The verifier re-derives coverage from the spec instead of inheriting the author's mental model.

When sub-agents are available, dispatch the verifier as a separate agent (see `task-graph-engineering.md`). Without sub-agents, start a clean context and run this file as a fresh-eyes pass.

## Inputs

- `spec.md` acceptance criteria, `context.md` when it exists
- The diff range for the feature
- `security-review.md` for the security checklist

## Output

`.specs/features/[feature]/validation.md`

## Procedure

### 1. Spec-anchored outcome check

For each acceptance criterion, confirm that a test asserts the **spec-defined outcome** — not merely that the code runs. Flag criteria where the test asserts an implementation detail, and flag spec text too imprecise to test.

### 2. Discrimination sensor

Confirm the tests can actually fail:

1. Inject behavior-level faults one at a time in an **isolated scratch copy** — a temp worktree or file copies. Never use `git stash` and never mutate the working tree.
2. Confirm the relevant test fails for each mutant.
3. Discard the scratch and verify the real tree is unchanged (`git status --porcelain` matches the pre-sensor baseline).
4. Any mutant that survives becomes a fix task — the tests do not discriminate.

Typical mutants: remove a validation branch, invert a boundary condition, return the wrong status code, bypass an auth check.

### 3. Security review

Run the checklist in `security-review.md`. Features with no auth, API, input, payment, or infrastructure surface may take the documented lightweight path — with the justification written into the report.

### 4. Evidence-or-zero

A requirement is satisfied only with a `file:line` reference to an assertive test that passes. No reference means not done, regardless of how the code looks.

### 5. Verdict

Write `validation.md`, then run the completion gate.

## Gate

```bash
python3 .specs/harness/scripts/validate_state.py .specs/features/[feature]
```

Checks that the report exists, the verdict is filled to PASS, evidence cites `file:line`, the sensor ran, and no task remains open. Non-zero exit means the feature is not done.

## Template

```markdown
# Validation: [Feature]

- Verifier: independent agent (clean context)
- Date: [ISO date]
- Diff range: [base..head]
- Verdict: PASS

## Coverage

| Requirement | Test evidence | Result |
| --- | --- | --- |
| REQ-001 | test/routes/login.test.ts:24 | pass |
| REQ-002 | test/auth/token.test.ts:41 | pass |

## Discrimination Sensor

| Mutant | Expected killer | Result |
| --- | --- | --- |
| Removed expiry check | test/auth/token.test.ts:41 | killed |

## Security Review
[Full checklist result, or the justified lightweight path.]

## Gaps
[Ranked list, or "none".]
```

## Failure Handling

- FAIL verdict → gaps become fix tasks; return to `implement.md`.
- The fix → re-verify loop is bounded to **3 iterations**, then escalate to the owner with the blocking gap.
- Every grounded failure — surviving mutant, imprecise spec, failed criterion — is recorded in `.specs/LESSONS.md`. A clean PASS records nothing.

## Interactive UAT

For user-facing features on the Complex tier, add a scripted walkthrough after the automated verdict: list the exact steps the owner should perform and the outcome to expect at each one. Automated PASS with a failed walkthrough is still a FAIL.

## Next

`memory.md` and `git-handoff.md` — record decisions, commit `.specs/`, hand off.
