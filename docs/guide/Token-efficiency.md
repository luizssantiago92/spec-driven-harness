# Token efficiency

**Who this is for:** teams who care about **cost and focus** — not dumping the entire playbook into every chat turn.

## The idea in one sentence

Load **only the phase you’re in**, keep the written plan on disk, and pull in extra reviews **only when you ask**.

That’s the difference between “guardrails” and “paste every skill into every message.”

## Why chat dumps hurt

If the agent reloads planning + building + checking + security + QA on every turn, you pay for text you aren’t using. Worse: the model’s attention spreads thin.

Spec Guardrails fights that with:

1. **Progressive skill loading** — one phase (or one sister) at a time  
2. **`.specs/` on disk** — the plan doesn’t need to live only in the prompt  
3. **Conditional sisters** — AppSec, QA, simplify, ship when needed; never all at once  

## Measured profiles (order of magnitude)

Numbers come from `lib/token-cost.js`; CI guardrails in `test/test_token_cost.test.js`. **Not a billing API** — treat as illustrative.

| Profile | Est. tokens | When |
| ---: | ---: | --- |
| Naive full dump (don’t) | ~31k | Every skill + reference every message |
| Specify turn | ~9k | `/specify` — hub + `specify.md` + standards |
| Tasks turn | ~10k | `/tasks` — hub + `tasks.md` + task-graph skill |
| Execute `/loop` (one wave) | ~4k | One implement wave (inline or parallel) |
| Verify turn | ~6k | Independent reviewer stack |

**Savings vs full dump:** ~**72%** on Specify, ~**86%** on Execute.

## How loading works each turn

| Step | Who | Action |
| ---: | --- | --- |
| 1 | You | `/specify`, `/tasks`, `/loop`, … |
| 2 | Agent | Read hub (`agent-architecture.md`) — contract + router |
| 3 | Agent | Read **one** reference for this phase only |
| 4 | Agent | Optionally load **one** sister skill (never a stack) |
| 5 | Agent | Run the gate at the phase boundary |

Full skill map: [Skills and hub](skills-and-hub.md).

## Sub-agents (optional)

For a **huge** build batch, you can split work across helpers when files don’t overlap. For a normal feature, one agent walking Specify → Verify is enough. Don’t spawn a fleet by default — that can *increase* cost.

## Related

- [How it works](How-it-works.md)  
- [Gates and guarantees](Gates-and-guarantees.md)  
- [FAQ](FAQ.md)
