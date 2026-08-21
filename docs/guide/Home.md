# Spec Seatbelt

**A seatbelt for AI coding agents.**

Agents are great at writing code and terrible at knowing when to stop. Spec Seatbelt gives them a simple loop: agree on the goal, break it into small jobs, prove each job, then let a fresh review ask for proof — not “trust me”.

It is not another pile of prompts. If the write-up is incomplete or there is no real test evidence, the agent is supposed to **stop and fix it** before saying the feature is done.

Works with **Cursor** and **Claude Code**. Install once; the project remembers where you left off.

## Install

    npx @luizsantiago/spec-seatbelt install

Re-run anytime to refresh the playbook. Your notes and decisions in `.specs/` stay put.

## Why people use it

1. **Only as deep as the work needs** — a typo fix stays light; a big feature gets more ceremony  
2. **Brakes that actually fire** — incomplete paperwork fails a check, not a vibe  
3. **Cheaper chats** — the agent opens **this step’s guide**, not the whole manual (~70% less skill text on a planning turn)  
4. **Someone else checks the homework** — the writer of the code is not the only one who gets to say “done”  
5. **Extra care when risk is high** — short security / QA looks, or a human walkthrough, only when it matters — **one guide at a time**  
6. **Clearer asks** — sharp goals, a small job list, a “may I commit?” pause before each check-in  
7. **Optional polish** — tidy the code without changing behavior, or a ship checklist when you ask — still one guide at a time  

## Everyday brakes (after install)

```bash
npx @luizsantiago/spec-seatbelt validate-spec auth
npx @luizsantiago/spec-seatbelt check-commit --message "feat(auth): add token refresh"
npx @luizsantiago/spec-seatbelt lessons list --status confirmed
```

Plain meaning on [Quick start](Quick-start.md) and [Gates and guarantees](Gates-and-guarantees.md).

## Agent commands (chat — not the terminal)

You do **not** memorize CLI commands. You talk to the agent in **Cursor or Claude Code** using phase commands like `/specify`, `/loop`, and `/verify`. The agent loads the right guide and runs gates for you.

| Command | When |
| --- | --- |
| `/specify` | Start any real feature — written goal first |
| `/tasks` | Break work into small jobs after spec approval |
| `/loop` | Implement — agent runs `loop-plan` for the next wave |
| `/verify` | Fresh-context proof after the last task |

Full table and examples: [Quick start → Agent commands](Quick-start.md#agent-commands-chat--not-the-terminal).

## Start here

| Page | Read when |
| --- | --- |
| [How it works](How-it-works.md) | You want the story from goal → done |
| [Gates and guarantees](Gates-and-guarantees.md) | You want what the brakes catch (and what they don’t) |
| [Token efficiency](Token-efficiency.md) | You care about chat cost / context |
| [Quick start](Quick-start.md) | You want ten minutes to first success (includes agent commands) |
| [FAQ](FAQ.md) | You have a concrete question |
| [Companion: Agentic Fullstack](Companion-agentic-fullstack.md) | You also use frontend / backend / data skills |

## Links

- [README](https://github.com/luizssantiago92/spec-seatbelt#readme) (technical detail)
- [npm `@luizsantiago/spec-seatbelt`](https://www.npmjs.com/package/@luizsantiago/spec-seatbelt)
- Gate contract for maintainers: [`prd/gate-stability.md`](https://github.com/luizssantiago92/spec-seatbelt/blob/main/prd/gate-stability.md)
