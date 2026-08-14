# Spec-Driven Harness

A **spec-driven harness** for AI coding agents: adaptive phases (Specify → Verify), progressive skill loading, `.specs/` memory, and **Python gates** that stop incomplete work.

Fit for **full-stack features** (API + UI + auth): the agent goes as deep as the risk needs — Quick stays light; Complex can add a short AppSec look, a QA focus, and a human walkthrough, **one guide at a time**.

This is not "another prompt pack". Incomplete specs, tasks without done criteria, or Verify without test evidence **exit non-zero** — the agent must fix the artifact before claiming success.

## Install

    npx @luizsantiago/agentic-harness install

Works with Cursor and Claude Code. Re-run to refresh skills and gates; project memory (`.specs/STATE.md`, lessons) is preserved.

## Why it exists

Agents are good at generating code and bad at knowing when to stop. The harness adds:

1. **Phases on demand** — only as deep as the work needs (Quick → Complex)
2. **Structural gates** — form checks enforced by code, not vibes
3. **Progressive disclosure** — load the current phase, not the whole skill kit (~70% fewer skill tokens per plan turn vs a full dump; ~80% less on a typical Medium feature vs naive full reloads)
4. **Author ≠ verifier** — Verify runs in a clean context with test-path evidence
5. **Risk-sized Verify** — OWASP checklist always; AppSec / QA / walkthrough only when the feature warrants it
6. **Clearer specs and jobs** — EARS-shaped criteria, a REQ↔test table on Tasks, a short “may I commit?” check on Execute (guides — not extra Python brakes)

## Start here

| Page | Read when |
| --- | --- |
| [[How-it-works]] | You want the Specify → Verify flow |
| [[Gates-and-guarantees]] | You want what gates block (and what they don't) |
| [[Token-efficiency]] | You care about context cost |
| [[Quick-start]] | You want a 10-minute first run |
| [[FAQ]] | You have a concrete question |

## Links

- [README](https://github.com/luizssantiago92/spec-driven-harness#readme)
- [npm `@luizsantiago/agentic-harness`](https://www.npmjs.com/package/@luizsantiago/agentic-harness)
- Gate contract: [`prd/gate-stability.md`](https://github.com/luizssantiago92/spec-driven-harness/blob/main/prd/gate-stability.md)
