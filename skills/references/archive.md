# Archive

Fold a verified feature back into long-lived project memory after Verify PASS.

## When to Use

- `validate_state.py` passed with verdict PASS/PASSED
- Owner confirms the feature is complete
- Brownfield: delta specs need merging into domain truth

## When NOT to Use

- Verify still failing or open Gaps
- Quick-tier work (optional — update ROADMAP only)

## Inputs

- `.specs/features/[feature]/validation.md` (PASS)
- Feature artifacts: `spec.md`, optional `design.md`
- `.specs/project/ROADMAP.md` when present
- Domain specs under `.specs/domains/` when the project uses them

## Output

- ROADMAP entry updated
- Optional domain spec merge (brownfield)
- STATE.md cleared for next feature
- Feature folder kept (historical record)

## Procedure

1. **Confirm PASS** — `validate_state.py [feature]` exit 0.
2. **Update ROADMAP** — mark feature done with date and link to validation.md.
3. **Merge domain truth (brownfield):**
   - Full spec → copy stable requirements to `.specs/domains/[domain]/spec.md`
   - Delta spec → apply ADDED/MODIFIED/REMOVED sections into the domain spec
   - Record merge in ROADMAP: `Merged 003-chat-system → domains/chat/spec.md`
4. **Reset STATE** for the next feature:
   ```markdown
   ## Active Feature
   - Feature: —
   - Phase: —
   - Branch: —
   ```
5. **Commit** archive updates (Tier 0):
   ```bash
   git commit -m "docs(spec): archive 003-chat-system"
   ```
6. **Tier 1 optional** — owner may push branch / open PR separately.

## Delta merge rules

| Section | Action |
| --- | --- |
| ADDED | Append new REQ blocks to domain spec |
| MODIFIED | Replace matching REQ blocks by ID |
| REMOVED | Delete REQ blocks listed by ID; note in ROADMAP |

Never merge without owner approval of the domain spec diff.

## Next

- New work → `feature-init` then `specify.md`
- Push for review → owner go-ahead (Tier 1)
- Back → `validate.md`
