# FAQ

## What is this package, in plain language?

A **seatbelt for AI coding agents**. It makes them write down the plan, build against that plan, and prove the work before calling it done—so you get fewer half-finished “looks good” moments.

## Is this a framework or a product I run in production?

It’s a **process kit** for agents (skills + docs + a completion gate). Your app is still your app. The harness shapes *how the agent works*, not your runtime stack.

## Do I need to change how my team codes?

You need agents (or humans driving agents) to follow **Specify → … → Verify** and keep plans under `.specs/`. Day-to-day languages and frameworks stay yours.

## What’s the difference between the six core skills and the “sisters”?

| | Core (always there) | Sisters (on demand) |
|--|---------------------|---------------------|
| Role | Plan → build → prove done | Extra passes: security, QA, simplify, ship |
| When | Every install | Only when you ask—and **one at a time** |

## Will this stop every bad AI change?

No. It stops many **incomplete** finishes and empty stubs. Judgment, product taste, and review still matter. Sisters help when you want a deeper look.

## Why not load security and QA every time?

Cost and focus. Most turns don’t need a full audit. When you do, say so and load **one** sister.

## How is this different from Test-Led Coding or Addy’s agent-skills?

| | This harness | TLC | Addy-style catalogs |
|--|--------------|-----|---------------------|
| Focus | Spec → prove done | Tests as the spine | Broad SDLC skill set |
| Gate | Stronger on “really finished?” | Different emphasis | Usually lighter formal gate |
| Stance | Standalone seatbelt | Inspired / credited | Inspired / credited |

See the README **Credits** section for licenses and links.

## Can I use only part of the kit?

You can emphasize phases, but the **install ships the six core skills** together. Sisters stay optional. Loosening the freeze (e.g. dropping Specify) is a major-version decision—not a casual tweak.

## Where do I put my feature plans?

Under **`.specs/`** in the repo (see skill templates after install). That’s the shared memory across chats and teammates.

## Does the gate replace code review?

No. It checks **structure and evidence**. Humans (and sisters) still review quality, security nuance, and product fit.

## I’m not technical—can I still use this?

Yes at a high level: ask your agent to **install the harness**, then to **specify before building** and **verify before done**. Engineers maintain the repo and the gate; you can still insist on the process in plain language.

## Where should I start reading?

1. [Home](Home)  
2. [Quick start](Quick-start)  
3. [How it works](How-it-works)  

Then [Gates](Gates-and-guarantees) / [Tokens](Token-efficiency) when you care about guarantees or cost.

## Something broken or unclear?

Open an issue on [GitHub](https://github.com/luizssantiago92/spec-driven-harness/issues). For contributing rules (especially the frozen gate), see [CONTRIBUTING](https://github.com/luizssantiago92/spec-driven-harness/blob/main/CONTRIBUTING.md).
