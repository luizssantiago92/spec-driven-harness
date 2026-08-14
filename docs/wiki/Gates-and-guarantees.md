# Gates and guarantees

Gates are the harness’s **brakes**.

Skills tell the agent *how* to work. Gates check that the paperwork is actually there before the agent moves on or says “we’re done”.

If a gate fails, the agent is supposed to **stop, fix the file, and run the check again** — not shrug and keep coding.

## Why brakes matter

AI is optimistic. It will happily invent a “done” that isn’t.

Gates answer only one kind of question:

> “Is this write-up complete enough that a careful human wouldn’t immediately send it back?”

They do **not** answer:

> “Is this the best product idea?” or “Is this test clever?”

That’s still on you (and on the verifier’s judgment).

## What the brakes catch (in human terms)

**Before you lock the goal**  
Is the wish list written down? Are the must-haves clear? Did we say what’s *not* in this round?

**Before you approve the to-do list**  
Does every goal have a job? Does every job say where it changes, how we’ll know it’s finished, and what it waits on? Are two parallel jobs fighting over the same file?

**On every commit**  
Does the commit message look like a normal engineering commit (clear type, not a novel ending with a period)?

**Before you call the feature finished**  
Is there a real pass/fail from a fresh review? Is there a pointer to a **test** that backs each goal? For bigger work (a design write-up, several tasks, or more than one phase group), did we poke the tests with a small “what if we break this?” check? Are leftover “still broken” notes still sitting under Gaps?

## What “PASS” means here

**PASS** means: the forms are filled, the evidence is cited, and nothing obvious is left open in the report.

It does **not** mean: users will love it, security is perfect forever, or every test is deep.

If Gaps still lists real problems, or security was marked fail, that’s not a PASS — rewrite the verdict or fix the issues.

A human walkthrough (click through the UI) helps on big user-facing work, but the harness **does not** run that walkthrough — the verifier still owns that call. Same for optional AppSec / QA write-ups: useful process, not a Python brake.

## Guarantees (honest version)

| The harness **does** | The harness **does not** |
| --- | --- |
| Stop incomplete specs and task lists | Invent your product vision |
| Demand proof links to tests at the end | Judge if those tests are brilliant |
| Keep parallel work from colliding on files | Run your app in production for you |
| Save tokens by loading only the current phase | Magically make a weak idea strong |
| Ask for a mutant/sensor result on bigger work | Run an interactive UI walkthrough for you |
| Offer short AppSec / QA guides when risk is high | Guarantee real-world security or product QA by code alone |
| Ask for EARS-shaped criteria, a REQ↔test table, and a pre-commit adequacy check | Fail the Python gate if those authoring steps were skipped |

## How it feels in practice

You ask for a feature.  
The agent writes the goal. A check runs.  
It breaks the work into jobs. A check runs.  
It builds job by job.  
Another pass reviews with proof. A final check runs.

Green checks don’t replace trust — they **remove the easy lies**.

## Next

- See the flow → [[How-it-works]]  
- Try it in 10 minutes → [[Quick-start]]  
- Context cost → [[Token-efficiency]]  
- Back → [[Home]]
