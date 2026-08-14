# Gates and guarantees

**Who this is for:** anyone who wonders *“what does the harness actually enforce?”*

The short answer: it **blocks** some incomplete work (missing files, empty stubs, weak evidence) and **guides** the rest (judgment, how you write specs). Not everything is a hard stop—and that’s intentional.

## Freeze (do not loosen)

These guarantees are locked for the **0.7.x** line. Changing them needs a new major and a clear reason.

| Guarantee | What it means in practice |
|-----------|---------------------------|
| **Six skills always install** | Planning, building, and checking aren’t optional pieces of the kit. |
| **Specify before Verify** | You can’t “finish” without a written plan the harness can check against. |
| **`.specs/` is the memory** | Plans and status live in the repo, not only in chat. |
| **Structural gates stay on** | Empty plans, stub code, missing tests, and similar gaps fail the gate. |
| **Conditional sisters** | Extra reviews (security, QA, simplify, ship) load only when you ask—and **one at a time**. |
| **Python gate scripts stay frozen** | The automated checker’s behavior doesn’t drift casually. |

Full freeze text: [ADR 0001](https://github.com/luizssantiago92/spec-driven-harness/blob/main/docs/adr/0001-harness-freeze-v0.7.md).

## What the gate **blocks** (hard)

When you claim you’re done, the gate looks for real artifacts—not vibes:

- Spec folder and plan documents present  
- Status that matches a finished flow  
- Code that isn’t an empty stub  
- Tests that actually exercise something  
- Evidence that validation ran  

If those aren’t there, **done** doesn’t stick.

## Run the brakes yourself

Same checks the agent should run — from your shell after install:

```bash
npx @luizsantiago/agentic-harness validate-spec auth
npx @luizsantiago/agentic-harness check-commit --message "feat(auth): add token refresh"
npx @luizsantiago/agentic-harness lessons list --status confirmed
```

| Command | Catches |
| --- | --- |
| `validate-spec` | Thin or incomplete written goals |
| `check-commit` | Sloppy commit titles |
| `lessons list --status confirmed` | Nothing broken — lists hard-won rules to reuse |

Fail → fix the file → re-run. Full reject lists: [README Gates](https://github.com/luizssantiago92/spec-driven-harness#gates).


## What the gate **does not** fully enforce

These stay in the **guides** (judgment and authoring quality):

| Topic | Why it isn’t a hard gate |
|-------|---------------------------|
| How deep a discussion went | Conversation quality isn’t a file checksum. |
| Exact shape of every plan section | Authoring skill, not a parser. |
| Perfect task graphs | Guidance + templates; not a full dependency engine. |
| “Did we talk enough before coding?” | Process habit—skills teach it; the gate doesn’t score chats. |

**Rule of thumb:** if it isn’t in the freeze table or the gate scripts, don’t promise users that the harness “guarantees” it.

## Adversarial matrix

A large suite of failure cases must keep failing. That stops “helpful” edits from accidentally making the gate too soft.

Details: [`tests/adversarial/`](https://github.com/luizssantiago92/spec-driven-harness/tree/main/tests/adversarial) and [CONTRIBUTING](https://github.com/luizssantiago92/spec-driven-harness/blob/main/CONTRIBUTING.md).

## Related

- [How it works](How-it-works) — full journey and sisters  
- [Token efficiency](Token-efficiency) — why not everything loads at once  
- [FAQ](FAQ)
