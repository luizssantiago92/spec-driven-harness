# Companion: Agentic Fullstack

Optional **floor map** for the same agent loop. The Spec Seatbelt stays the seatbelt (spec, tasks, gates, Verify). [`@luizsantiago/agentic-fullstack`](https://www.npmjs.com/package/@luizsantiago/agentic-fullstack) adds **which floor** a task lives on — frontend, backend, data, analytics, data science — and loads **one** Execute manual per turn.

They are **two packages**. Do not merge them. Re-installing Spec Seatbelt does **not** delete Fullstack skills.

## Install order

In the **product** repo (the company app):

    npx @luizsantiago/spec-seatbelt install
    npx @luizsantiago/agentic-fullstack install
    npx @luizsantiago/agentic-fullstack doctor

## Pairing contract (this is the important bit)

Spec Seatbelt prefers **vertical slices**. Fullstack requires **one layer per task `Files`**. Together:

| Phrase | Meaning when both are installed |
| --- | --- |
| Vertical **feature** | One user path (login, checkout) — not “all schema, then all APIs, then all UI” as *phases* |
| Horizontal **tasks** | T1 UI, T2 API (or data / analytics / ML), with `Depends on` when needed |
| One layer per task | Do **not** put `apps/web` and `apps/api` in the same `Files` list |

A “vertical slice” here is a thin **feature**, not one commit that mixes floors. Mixed `Files` fail Fullstack’s layer gate (`validate-layers`).

Example (login): T1 `apps/web/.../LoginForm.tsx`, T2 `apps/api/.../login.ts`.

## Layer gate (Fullstack-owned)

Spec Seatbelt CLI does **not** absorb the layer check. After tasks exist:

    npx @luizsantiago/agentic-fullstack validate-layers your-feature

Same as `python3 .specs/seatbelt/scripts/validate_layer_routing.py your-feature`. The script sits next to seatbelt gates but is **owned by Fullstack** — seatbelt re-install must not delete it.

## Execute and Verify

- Execute: seatbelt `engineering-standards.md` + `references/implement.md` **and one** Fullstack `*-engineering.md` skill.
- After commit: drop the layer skill.
- Verify: **no** Fullstack skills. Use Spec Seatbelt’s Verify stack only.

Full playbook: [agentic-fullstack repository](https://github.com/luizssantiago92/agentic-fullstack).
