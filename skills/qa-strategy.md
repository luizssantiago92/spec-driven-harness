# QA Strategy

Lean product-QA pass for **Complex** work, multi-step user-facing flows, or explicit regression asks. Complements `/verify` evidence-or-zero and lean Interactive UAT — it does **not** rewrite those procedures.

**Judgment only.** `validate_state.py` does not require an `## QA` section. A skip with reason is valid. This skill does not prove product quality by itself; it focuses smoke, regression, and where bugs go.

## When to Use

Load during `/verify` when **any** of:

- Hub tier is **Complex**
- User-facing flow with multiple observable steps (not a single static screen)
- Owner asked for regression / QA focus on this feature

If `appsec.md` also triggered: run AppSec **first**, drop it from context, **then** load this skill. Never hold AppSec and QA in the same working set.

## When NOT to Use

Do **not** load on Quick, Simple one-file fixes, or Verify already covered by evidence-or-zero alone with no multi-step UI. Record:

`QA: skipped — no Complex tier, no multi-step UI, no explicit regression ask`

## Relationship to Verify

| Concern | Where |
| --- | --- |
| Spec-anchored tests, sensor, evidence-or-zero, verdict | `references/validate.md` |
| OWASP checklist | `security-review.md` |
| Lean walkthrough script | `references/validate.md` § Interactive UAT |
| Smoke / regression focus / pyramid reminder | **This skill** (conditional) |

Do not duplicate the mutant catalog or UAT protocol here — link and apply.

## Procedure

### 1. Risk → cases

From `spec.md` REQs and the critical user path, list:

- **Smoke** — few checks that the feature’s happy path still works
- **Regression focus** — adjacent areas most likely broken by this diff
- **Edge** — only boundaries the spec actually constrains (no invented matrix)

Keep the list short. A TLC-style full coverage matrix is out of scope for this skill.

### 2. Pyramid reminder

- **Unit** — domain rules and pure logic named by acceptance criteria  
- **Integration** — API / DB / auth boundaries this feature touches  
- **E2E** — at most the one critical happy path; do not E2E every REQ  

Weak tests (`toBeDefined()`, empty 2xx) stay a Verify gap — see `validate.md`.

### 3. Bug vs Gaps

| Finding | Treat as |
| --- | --- |
| Product behavior wrong vs spec / UAT | **Bug** → fix task under Execute |
| Missing `file:line`, weak assertion, sensor, open Gaps | **Verify Gap** → catalog in `validate.md` |
| Security checklist / AppSec fail | Security / AppSec path — not a QA label |

### 4. UAT

If Complex + user-facing, follow **Interactive UAT** in `validate.md` after this QA pass (or as the last Verify step). Do not redefine severity tables here.

## Output shape

```markdown
## QA
- Applied: yes | skipped — [reason]
- Smoke: [short list]
- Regression focus: [short list]
- Result: pass | fail | skipped
```

`fail` → Gaps or fix tasks; do not leave `Verdict: PASS` while QA Result is fail (verifier judgment; not a structural gate).

## Related

- `references/validate.md` — Verify + lean UAT; sequential AppSec → QA load rule
- `appsec.md` — conditional AppSec (run before this skill when both apply)
- `references/context-limits.md` — at most one conditional sister in context
- [Gate stability](https://github.com/luizssantiago92/spec-guardrails/blob/main/prd/gate-stability.md) — QA / UAT are non-guarantees
