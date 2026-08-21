# FAQ

## What is this package, in plain language?

A **seatbelt for AI coding agents**. It makes them write down the plan, build against that plan, and prove the work before calling it done—so you get fewer half-finished “looks good” moments.

## Is this a framework or a product I run in production?

It’s a **process kit** for agents (skills + docs + a completion gate). Your app is still your app. Spec Seatbelt shapes *how the agent works*, not your runtime stack.

## Do I need to change how my team codes?

You need agents (or humans driving agents) to follow **Specify → … → Verify** and keep plans under `.specs/`. Day-to-day languages and frameworks stay yours.

## What’s the difference between always-on skills and on-demand sisters?

| | Always-on (every install) | Sisters (load on demand) |
|--|---------------------|---------------------|
| Role | Plan → build → prove done | Extra passes: security, QA, simplify, ship |
| When | Hub + core sisters ship with every install | Load only when you ask—and **one at a time** |

## Will this stop every bad AI change?

No. It stops many **incomplete** finishes and empty stubs. Judgment, product taste, and review still matter. Sisters help when you want a deeper look.

## Why not load security and QA every time?

Cost and focus. Most turns don’t need a full audit. When you do, say so and load **one** sister.

## How is this different from Test-Led Coding or Addy’s agent-skills?

| | Spec Seatbelt | TLC | Addy-style catalogs |
|--|--------------|-----|---------------------|
| Focus | Spec → prove done | Tests as the spine | Broad SDLC skill set |
| Gate | Stronger on “really finished?” | Different emphasis | Usually lighter formal gate |
| Stance | Standalone seatbelt | Inspired / credited | Inspired / credited |

See the README **Credits** section for licenses and links.

## Can I use only part of the kit?

You can emphasize phases, but the **install ships the hub and sister skill files** together. On-demand sisters stay optional to *load*. Loosening the freeze (e.g. dropping Specify) is a major-version decision—not a casual tweak.

## Where do I put my feature plans?

Under **`.specs/`** in the repo (see skill templates after install). That’s the shared memory across chats and teammates.

## Does the gate replace code review?

No. It checks **structure and evidence**. Humans (and sisters) still review quality, security nuance, and product fit.

## What do `validate-spec`, `check-commit`, and `lessons list` do?

| Command | In one line |
| --- | --- |
| `npx @luizsantiago/spec-seatbelt validate-spec auth` | Checks that the **auth** feature’s written goal is complete enough to build from |
| `… check-commit --message "feat(auth): …"` | Checks the commit title style before you land a change |
| `… lessons list --status confirmed` | Lists project rules learned from past failures (confirmed only) |

You need Python 3 for these. Without a real `.specs/features/auth` folder, `validate-spec auth` will fail with “no such feature” — that’s expected until you specify one.

## I’m not technical—can I still use this?

Yes at a high level: ask your agent to **install Spec Seatbelt**, then to **specify before building** and **verify before done**. Engineers maintain the repo and the gate; you can still insist on the process in plain language.

## Where should I start reading?

1. [Home](Home.md)  
2. [Quick start](Quick-start.md)  
3. [How it works](How-it-works.md)  

Then [Gates and guarantees](Gates-and-guarantees.md) / [Token efficiency](Token-efficiency.md) when you care about guarantees or cost.

## How do I use this with frontend or backend skills?

Spec Seatbelt is stack-agnostic. Optional floor maps live in [`@luizsantiago/fullstack-floor-map`](https://www.npmjs.com/package/@luizsantiago/fullstack-floor-map): one Execute manual per **Lane**, one Lane per task, optional specialist depth (Desks for continuity planned in 0.5.0). Pairing contract: [Companion: Full Stack Floor Map](Companion-fullstack-floor-map.md).

## Something looks wrong after install?

Run `npx @luizsantiago/spec-seatbelt doctor` — it scores the install (skills, gates, config, STATE) and suggests the next CLI step (`loop-plan`, `init-config`, …).

## Something broken or unclear?

Open an issue on [GitHub](https://github.com/luizssantiago92/spec-seatbelt/issues). For contributing rules (especially the frozen gate), see [CONTRIBUTING](../../CONTRIBUTING.md).
