# Companion: Full Stack Floor Map

Optional **floor map** for the same agent loop. Spec Guardrails owns the process brakes (spec, tasks, gates, Verify). [`@luizsantiago/fullstack-floor-map`](https://www.npmjs.com/package/@luizsantiago/fullstack-floor-map) (**Full Stack Floor Map**) adds **which Lane** a task lives on — frontend, backend, data, analytics, data science — loads **one** Execute layer manual per turn, and optionally **one** specialist from its catalog.

They are **two packages**. Do not merge them. Re-installing Spec Guardrails does **not** delete Floor Map skills, the specialist catalog, `.specs/desks/` (when present), or `validate_layer_routing.py`.

> **Rename:** the package was previously published as `@luizsantiago/agentic-fullstack`. Prefer `fullstack-floor-map`; the legacy CLI bin `agentic-fullstack` still points at the same entry for a transition period.

> **Desks (planned 0.5.0):** Floor Map v3 adds **Desk** memory under `.specs/desks/` — work rooms with specialist continuity, not typed frontend/backend desks. Desks are **not shipped on npm yet** (0.4.x is Lane + catalog only). This guide documents the agreed pairing so both packages work as one system when Desks land. Do not scaffold `.specs/desks/` until Floor Map publishes 0.5.0.

## Install order

In the **product** repo (the company app):

```bash
npx @luizsantiago/spec-guardrails install
npx @luizsantiago/fullstack-floor-map install
npx @luizsantiago/fullstack-floor-map doctor
```

Guardrails first (spec, gates, hub skills), then Floor Map (Lane manuals, layer rule, catalog, and — when shipped — Desk tooling).

## Ownership (harmony)

| Piece | Owner | Notes |
| --- | --- | --- |
| Spec, tasks, gates, loop-plan, Verify | **Spec Guardrails** | `.specs/features/`, `.specs/guardrails/scripts/` |
| **Lane** + `validate-layers` | **Floor Map** | One Lane manual (`*-engineering.md`) per task `Files`; filesystem safety — do not mix `apps/web` and `apps/api` in one task |
| **Desk** + INDEX + handoff | **Floor Map** (planned 0.5.0) | `.specs/desks/<id>/DESK.md`, `.specs/desks/INDEX.md` — companion-owned memory |
| Specialist catalog | **Floor Map** | At most **one** `SKILL.md` per Execute turn; `references/` = deep craft for the **current** skill, not a router to other specialists |
| Verify sisters (security, AppSec, QA) | **Guardrails only** | No Lane manuals, no catalog skills, no desk staffing on `/verify` |

**Lane** is today's path-layer concept (globs + `*-engineering.md` + layer gate). In Floor Map 0.5.0 narrative it replaces the word "Floor"; behavior is unchanged.

**Desk** (planned) is a work room with memory — unlimited desks, up to **three** specialists registered per desk, one **preferred** for continuity, and a **handoff** section when preferred switches. Still **one** specialist loaded per turn (never multi-specialist load).

## Harmony loop (both packages)

When both packages are installed, one feature flows like this:

1. **Specify / Tasks (Guardrails)** — Write `spec.md` and `tasks.md`. Each task's `Files` list stays on **one Lane** (split UI vs API into T1/T2 with `Depends on` when needed).
2. **Layer gate (Floor Map)** — After tasks exist:
   ```bash
   npx @luizsantiago/fullstack-floor-map validate-layers your-feature
   ```
3. **Execute (Guardrails + Floor Map)** — Load Guardrails implement set (`engineering-standards.md`, `references/implement.md`, task context) plus **one** Lane `*-engineering.md`. When Desks exist (0.5.0+): consult `.specs/desks/INDEX.md` → open the desk's `DESK.md` → use the **preferred** specialist if registered; load at most **one** catalog `SKILL.md` and ≤2 craft `references/` for that skill only.
4. **After Execute commit** — Drop the Lane manual and specialist from the working set. Floor Map may append desk log, handoff notes, and INDEX updates under `.specs/desks/` (companion-owned; Guardrails does not write these).
5. **`/verify` (Guardrails only)** — Fresh context: `references/validate.md`, `security-review.md`, and conditional AppSec/QA sisters. **No** Lane manuals, **no** catalog skills, **no** desk staffing skills.

Authority order when both packages are present: Guardrails (spec / Gate / evidence) → Lane manual → specialist craft. Specialists never override `Gate` or `PROJECT.md` test commands.

## Pairing contract (vertical slice vs Lane)

Spec Guardrails prefers **vertical slices**. Floor Map requires **one Lane per task `Files`**. Together:

| Phrase | Meaning when both are installed |
| --- | --- |
| Vertical **feature** | One user path (login, checkout) — not "all schema, then all APIs, then all UI" as *phases* |
| Horizontal **tasks** | T1 UI, T2 API (or data / analytics / ML), with `Depends on` when needed |
| One Lane per task | Do **not** put `apps/web` and `apps/api` in the same `Files` list |

A "vertical slice" here is a thin **feature**, not one commit that mixes lanes. Mixed `Files` fail Floor Map's layer gate (`validate-layers`).

Example (login): T1 `apps/web/.../LoginForm.tsx`, T2 `apps/api/.../login.ts`.

## Layer gate (Floor Map–owned)

Spec Guardrails CLI does **not** absorb the layer check. After tasks exist:

```bash
npx @luizsantiago/fullstack-floor-map validate-layers your-feature
```

Same as `python3 .specs/guardrails/scripts/validate_layer_routing.py your-feature`. The script sits next to guardrails gates but is **owned by Floor Map** — guardrails re-install must not delete it.

## Execute and Verify

| Phase | Load |
| --- | --- |
| **Execute** | Guardrails `engineering-standards.md` + `references/implement.md` + **one** Lane `*-engineering.md` + (when Desks exist) desk lookup via INDEX → DESK → preferred specialist + at most **one** catalog `SKILL.md` (≤2 craft `references/`) |
| After commit | Drop the Lane manual and specialist; Floor Map may update `.specs/desks/` |
| **Verify** | **No** Floor Map content. Spec Guardrails Verify stack only (`validate.md`, `security-review.md`, conditional AppSec/QA) |

## Coexistence on re-install

Spec Guardrails `install` overwrites **its** skills, references, and gate scripts under `.specs/guardrails/scripts/`. It must **not** remove companion-owned paths:

| Path / asset | Owner | Re-install behavior |
| --- | --- | --- |
| `.cursor/skills/` Floor Map skills & catalog | Floor Map | Preserved (Guardrails only writes its own skill files) |
| `.specs/desks/` (planned 0.5.0) | Floor Map | **Must not be deleted** by Guardrails re-install |
| `validate_layer_routing.py` in `.specs/guardrails/scripts/` | Floor Map | Must not be deleted by Guardrails re-install |

Guardrails does **not** implement Desk runtime, INDEX writers, or catalog install — docs and non-destructive coexistence only.

## Rejected on the Floor Map side (do not expect from Guardrails)

- Multi-specialist load in one turn
- Catalog or Lane manuals on Verify
- Auto-evict of specialists from a desk
- Typed frontend/backend desks
- Floor Map–owned sub-agent runtime

Full playbook: [fullstack-floor-map repository](https://github.com/luizssantiago92/fullstack-floor-map).
