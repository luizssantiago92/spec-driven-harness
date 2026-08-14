# Validate

Independent verification of the delivered feature. Always required, never prompted.

## When to Use

- After the last task of a feature is committed
- After any fix round that follows a FAIL verdict

## Who Runs It

A **fresh verifier context that never wrote the code**. Author ≠ verifier is non-negotiable. The verifier re-derives coverage from the spec instead of inheriting the author's mental model.

When sub-agents are available, dispatch the verifier as a separate agent (see `task-graph-engineering.md`). Without sub-agents, start a clean context and run this file as a fresh-eyes pass.

## Inputs

- `spec.md` acceptance criteria, `context.md` when it exists
- The diff range for the feature
- `security-review.md` for the security checklist
- `context-limits.md` — load the spec, the diff, and the tests the spec names; do not load the author's chat

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

### 3. Security review

Run the checklist in `security-review.md`. Features with no auth, API, input, payment, or infrastructure surface may take the documented lightweight path — with the justification written into the report.

### 4. Evidence-or-zero

A requirement is satisfied only with a `file:line` reference to an assertive test that passes. No reference means not done, regardless of how the code looks.

### 5. Verdict

Write `validation.md`, then run the completion gate.

## Mutant catalog

Pick mutants from the kind of code that landed, not from a generic list. One killed mutant per risky behavior is the minimum; surviving mutants are fix tasks.

| Code kind | Mutant | Expected killer |
| --- | --- | --- |
| Auth / session | Skip the expiry check; accept an empty token; invert role comparison | Test that names the denied case |
| HTTP handler | Return 200 on the error path; swap 401/403; drop the error code body | Status + code assertion |
| Validation | Remove an upper/lower bound; accept the empty string; skip a required field | Boundary test |
| Persistence | Skip the unique constraint; write without a transaction; ignore not-found | Duplicate / rollback / 404 test |
| Payments / money | Off-by-one on minor units; skip idempotency key; apply a refund twice | Amount and replay tests |
| Concurrency | Drop a lock or compare-and-swap; process the same event twice | Idempotency or conflict test |
| State machine | Allow a backward transition; skip the terminal-state guard | Illegal-transition test |

A mutant that the compiler or typechecker rejects before a test runs does not count. Change behavior, not syntax.

**Weak assertion tells.** Treat the test as weak when it asserts any of: `toBeDefined()`, a 2xx status with no body, "the function was called", or a snapshot of an entire module. The spec names an outcome; the test must name it too (status + error code, exact field, exact transition).

Do not inject mutants that the spec does not constrain. A surviving mutant of unspecified behavior is a spec gap, not a test gap — send it back to Specify.

## Gap catalog

Every FAIL names a gap type so the author knows which loop to re-enter.

| Gap | Meaning | Return to |
| --- | --- | --- |
| Missing evidence | No `file:line` for a criterion | Execute — add the assertion |
| Weak assertion | Test checks that code ran, not the spec outcome | Execute — rewrite the test |
| Surviving mutant | Discriminating test is absent | Execute — add the killer test, then the production fix if needed |
| Imprecise criterion | Spec cannot be tested as written | Specify — rewrite with `SHALL`/`MUST` and a trigger |
| Spec deviation | Implementation does something the spec forbids, or omits something it requires | Specify + Execute |
| Security finding | Checklist item failed | Execute — fix, then re-verify |
| Open task | `tasks.md` still has `- [ ]` | Execute — finish or drop the task with owner approval |
| Sensor skipped | No mutant section in the report | Verify — run the sensor; do not pass |

Rank gaps: security and spec deviation first, then surviving mutants, then missing evidence, then imprecise criteria. The author fixes in that order.

## Evidence format

The completion gate searches for `file:line` (for example `test/routes/login.test.ts:24`). A URL, a CI job name, or "covered by the suite" is not evidence.

- Cite the assertive test, not the production file
- One evidence line per criterion; reuse a test only when it truly asserts both outcomes
- After a fix round, cite the new line numbers — stale citations fail the reader even if they pass the regex

## Gate

```bash
python3 .specs/harness/scripts/validate_state.py .specs/features/[feature]
python3 .specs/harness/scripts/validate_state.py [feature]
python3 .specs/harness/scripts/validate_state.py          # single-feature projects
```

Checks that the report exists, the verdict is exactly PASS in the **preamble** (before the first `##` section) or under a dedicated `## Verdict` / `## Result` / `## Status` heading, every spec requirement ID shares a line with test `file:line` evidence, and no task remains open. A `- Verdict: PASS` buried under Discrimination Sensor or Coverage does not count. On Medium+ features (`design.md` with content, 4+ tasks, or 2+ phases) a discrimination-sensor **outcome** (`killed` / `survived` / `injected`) is **blocking** — the section heading alone is not enough. Below Medium+ a missing outcome is a warning (`--strict` still promotes warnings). Non-zero exit means the feature is not done.

The gate cannot judge whether a cited test actually asserts the criterion. That judgment is the verifier's; a green gate with a weak assertion is still a FAIL in the report.

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

Lightweight security path (only when the feature has no auth, API, input, payment, or infrastructure surface):

```markdown
## Security Review
- Path: lightweight
- Justification: copy change in docs/README.md, no input or trust boundary
- Result: not applicable
```

An unjustified lightweight path is a gap.

## Failure Handling

**PASS requirements.** Verdict is PASS only when every coverage row is pass, every mutant is killed, security is pass or a justified lightweight path, Gaps is `none`, and `validate_state.py` exits 0. Anything else is FAIL — do not write PASS and list gaps underneath.

- FAIL verdict → gaps become fix tasks; return to `implement.md`.
- The fix → re-verify loop is bounded to **3 iterations**, then escalate to the owner with the blocking gap.
- Every grounded failure — surviving mutant, imprecise spec, failed criterion — is recorded with `lessons.py add --source` pointing at this `validation.md`. A clean PASS records nothing. See `lessons.md`.

## Interactive UAT

For user-facing features on the Complex tier, add a scripted walkthrough after the automated verdict: list the exact steps the owner should perform and the outcome to expect at each one. Automated PASS with a failed walkthrough is still a FAIL.

## Next

`memory.md` and `git-handoff.md` — record decisions, commit `.specs/`, hand off.
