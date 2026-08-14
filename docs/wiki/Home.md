# Spec-Driven Harness

**A seatbelt for AI coding agents.**

Agents are great at writing code and terrible at knowing when to stop. This harness gives them a simple loop: agree on the goal, break it into small jobs, prove each job, then let a fresh review ask for proof — not “trust me”.

It is not another pile of prompts. If the write-up is incomplete or there is no real test evidence, the agent is supposed to **stop and fix it** before saying the feature is done.

Works with **Cursor** and **Claude Code**. Install once; the project remembers where you left off.

## Install

    npx @luizsantiago/agentic-harness install

Re-run anytime to refresh the playbook. Your notes and decisions in `.specs/` stay put.

## Why people use it

1. **Only as deep as the work needs** — a typo fix stays light; a big feature gets more ceremony  
2. **Brakes that actually fire** — incomplete paperwork fails a check, not a vibe  
3. **Cheaper chats** — the agent opens **this step’s guide**, not the whole manual (~70% less skill text on a planning turn)  
4. **Someone else checks the homework** — the writer of the code is not the only one who gets to say “done”  
5. **Extra care when risk is high** — short security / QA looks, or a human walkthrough, only when it matters — **one guide at a time**  
6. **Clearer asks** — sharp goals, a small job list, a “may I commit?” pause before each check-in  
7. **Optional polish** — tidy the code without changing behavior, or a ship checklist when you ask — still one guide at a time  

## Start here

| Page | Read when |
| --- | --- |
| [[How-it-works]] | You want the story from goal → done |
| [[Gates-and-guarantees]] | You want what the brakes catch (and what they don’t) |
| [[Token-efficiency]] | You care about chat cost / context |
| [[Quick-start]] | You want ten minutes to first success |
| [[FAQ]] | You have a concrete question |

## Links

- [README](https://github.com/luizssantiago92/spec-driven-harness#readme) (technical detail)
- [npm `@luizsantiago/agentic-harness`](https://www.npmjs.com/package/@luizsantiago/agentic-harness)
- Gate contract for maintainers: [`prd/gate-stability.md`](https://github.com/luizssantiago92/spec-driven-harness/blob/main/prd/gate-stability.md)
