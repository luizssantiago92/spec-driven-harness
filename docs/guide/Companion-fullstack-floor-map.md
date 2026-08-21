# Companion: Full Stack Floor Map

Optional **floor map** for the same agent loop. Spec Seatbelt stays the seatbelt (spec, tasks, gates, Verify). [`@luizsantiago/fullstack-floor-map`](https://www.npmjs.com/package/@luizsantiago/fullstack-floor-map) adds **which Floor** a task lives on — frontend, backend, data, analytics, data science — loads **one** Execute layer manual per turn, and optionally **one** specialist from its catalog.

They are **two packages**. Do not merge them. Re-installing Spec Seatbelt does **not** delete Floors skills or the specialist catalog.

> **Rename:** the package was previously published as `@luizsantiago/agentic-fullstack`. Prefer `fullstack-floor-map`; the legacy CLI bin `agentic-fullstack` still points at the same entry for a transition period.

## Install order

In the **product** repo (the company app):

```bash
npx @luizsantiago/spec-seatbelt install
npx @luizsantiago/fullstack-floor-map install
npx @luizsantiago/fullstack-floor-map doctor
```

## Pairing contract (this is the important bit)

Spec Seatbelt prefers **vertical slices**. Floor Map requires **one Floor per task `Files`**. Together:

| Phrase | Meaning when both are installed |
| --- | --- |
| Vertical **feature** | One user path (login, checkout) — not “all schema, then all APIs, then all UI” as *phases* |
| Horizontal **tasks** | T1 UI, T2 API (or data / analytics / ML), with `Depends on` when needed |
| One Floor per task | Do **not** put `apps/web` and `apps/api` in the same `Files` list |

A “vertical slice” here is a thin **feature**, not one commit that mixes floors. Mixed `Files` fail Floor Map’s layer gate (`validate-layers`).

Example (login): T1 `apps/web/.../LoginForm.tsx`, T2 `apps/api/.../login.ts`.

## Layer gate (Floor Map–owned)

Spec Seatbelt CLI does **not** absorb the layer check. After tasks exist:

```bash
npx @luizsantiago/fullstack-floor-map validate-layers your-feature
```

Same as `python3 .specs/seatbelt/scripts/validate_layer_routing.py your-feature`. The script sits next to seatbelt gates but is **owned by Floor Map** — seatbelt re-install must not delete it.

## Execute and Verify

| Phase | Load |
| --- | --- |
| **Execute** | Seatbelt `engineering-standards.md` + `references/implement.md` + **one** Floors `*-engineering.md` + optionally **one** specialist `SKILL.md` (≤2 `references/`) |
| After commit | Drop the layer skill and specialist |
| **Verify** | **No** Floor Map skills. Spec Seatbelt’s Verify stack only |

Authority order when both packages are present: Seatbelt (spec / Gate / evidence) → Floors layer manual → specialist craft. Specialists never override `Gate` or `PROJECT.md` test commands.

Full playbook: [fullstack-floor-map repository](https://github.com/luizssantiago92/fullstack-floor-map).
