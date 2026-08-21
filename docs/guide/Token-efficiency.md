# Token efficiency

**Who this is for:** teams who care about **cost and focus**—not dumping the entire playbook into every chat turn.

## The idea in one sentence

Load **only the phase you’re in**, keep the written plan on disk, and pull in extra reviews **only when you ask**.

That’s the difference between “seatbelt” and “paste every skill into every message.”

## Why chat dumps hurt

If the agent reloads planning + building + checking + security + QA on every turn, you pay for text you aren’t using. Worse: the model’s attention spreads thin.

Spec Seatbelt fights that with:

1. **Progressive skill loading** — one phase (or one sister) at a time  
2. **`.specs/` on disk** — the plan doesn’t need to live only in the prompt  
3. **Conditional sisters** — AppSec, QA, simplify, ship when needed; never all at once  

## Rough picture (order of magnitude)

| Approach | What you feel |
|----------|----------------|
| Dump everything every turn | Expensive, noisy, easy to lose the thread |
| Plan-heavy turn with one skill | Much smaller working set |
| Medium feature, phase by phase | Large savings vs naive reload |

Exact numbers move with model and feature size. Treat published figures as **illustrative**, not a billing guarantee.

## Sub-agents (optional)

For a **huge** build batch, you can split work across helpers. For a normal feature, one agent walking Specify → Verify is enough. Don’t spawn a fleet by default—that can *increase* cost.

## Related

- [How it works](How-it-works)  
- [Gates and guarantees](Gates-and-guarantees)  
- [FAQ](FAQ)
