# AppSec

Lean application-security pass for **Complex** work or features with a real attack surface. Complements `security-review.md` (OWASP checklist on `/verify`) — it does **not** replace that checklist.

**Judgment only.** `validate_state.py` does not require an `## AppSec` section. A skip with reason is valid. This skill does not make the product “secure”; it structures a short threat look and when to escalate to a human.

## When to Use

Load during `/verify` **after** the base Verify steps (`validate.md` + `security-review.md`) when **any** of:

- Hub tier is **Complex**
- Feature touches auth, sessions, tokens, payments, PII, secrets, file upload, SSRF/URL fetch, or a network trust boundary

## When NOT to Use

Do **not** load on Quick, Simple without the surfaces above, copy/docs, or pure styling. Record:

`AppSec: skipped — no Complex tier and no auth/PII/payment/network surface`

Never load this skill in the same working set as `qa-strategy.md`. If both triggers fire: finish AppSec, **drop** this file from context, then load QA.

## Relationship to security-review

| Concern | Where |
| --- | --- |
| OWASP checklist / lightweight path | `security-review.md` (always on Verify) |
| Threat sketch, boundaries, escalate | **This skill** (conditional) |

Do not paste the OWASP list here. Reuse the Security Review result; deepen only the boundary and abuse cases.

## Procedure (about 15 minutes)

### 1. Threat sketch

Write briefly (in `validation.md` under `## AppSec`, or in `design.md` if Design already captured it):

- **Assets** — what must stay confidential or integral (tokens, PII, money, admin actions)
- **Actors** — anonymous, authenticated user, admin, external service
- **Trust boundaries** — browser ↔ API, API ↔ DB, API ↔ third party
- **Top 3 abuse cases** — concrete misuse (IDOR on resource X, token reuse, inject into field Y)

### 2. Focus list (pass / fail / N/A + one-line note)

Check only what the diff touches:

| Focus | Ask |
| --- | --- |
| AuthZ / IDOR | Can user A reach user B’s resource by changing an id? |
| Secrets | Credentials or keys only in env / secret store — not source, logs, or client storage? |
| Injection / XSS | User input parameterized or escaped on the paths this feature added? |
| Critical deps | New or bumped deps with known critical/high issues addressed or documented? |
| PII in logs | New log/response paths avoid raw PII? |

For checklist depth, return to `security-review.md`.

### 3. Escalate (stop and ask the owner)

Escalate instead of `Result: pass` when the feature introduces or materially changes:

- Payment capture or money movement
- Homegrown cryptography
- New multi-tenant isolation
- “We are not sure” on a trust boundary the owner must accept

## Output shape

```markdown
## AppSec
- Applied: yes | skipped — [reason]
- Boundaries: [browser↔API / …]
- Top risks: [1], [2], [3]
- Focus: authZ … | secrets … | injection … | deps … | PII logs …
- Result: pass | fail | escalate
```

`fail` or `escalate` → Gaps bullet + fix or owner decision before `Verdict: PASS` (verifier judgment; not a structural gate).

## Related

- `security-review.md` — OWASP Verify checklist
- `references/validate.md` — Verify procedure; load AppSec then drop before QA
- `references/context-limits.md` — at most one conditional sister in context
- [Gate stability](https://github.com/luizssantiago92/spec-guardrails/blob/main/prd/gate-stability.md) — AppSec is non-guarantee / judgment
