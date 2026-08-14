# Spec-Driven Harness

A **spec-driven harness** for AI coding agents: adaptive phases (Specify → Verify), progressive skill loading, `.specs/` memory, and **Python gates** that stop incomplete work.

This is not "another prompt pack". Incomplete specs, tasks without done criteria, or Verify without test evidence **exit non-zero** — the agent must fix the artifact before claiming success.

## Install

    npx @luizsantiago/agentic-harness install

Works with Cursor and Claude Code. Re-run to refresh skills and gates; project memory (`.specs/STATE.md`, lessons) is preserved.

## Why it exists

Agents are good at generating code and bad at knowing when to stop. The harness adds:

1. **Phases on demand** — only as deep as the work needs (Quick → Complex)
2. **Structural gates** — form checks enforced by code, not vibes
3. **Progressive disclosure** — load the current phase, not the whole skill kit (~66% fewer skill tokens per plan turn; ~80% less on a typical Medium feature vs naive full dumps)
4. **Author ≠ verifier** — Verify runs in a clean context with test-path evidence

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
