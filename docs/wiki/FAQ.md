# FAQ

Short answers to the questions people ask first.

## What is this, in one sentence?

A seatbelt for AI coding agents: written goals, small jobs, proof at the end, and automatic checks that stop “fake done”.

## Is it only for Cursor?

No. Install puts the same skills under `.cursor/` and `.claude/`, so Cursor and Claude Code both get the playbook.

## Do I need Python?

Recommended. The soft rules live in the skills either way. Python runs the **automatic** gates that fail with a clear exit code. Without it, the agent should still follow the checklists by hand — just with less enforcement.

## Will it overwrite my project memory?

Re-running install refreshes skills, guides, and gate scripts. It keeps your `STATE.md`, lessons, and project rules you’ve edited.

## Does a green gate mean the feature is perfect?

No. It means the **forms and proof links** look complete. You still judge product taste, test depth, and real-world risk. Optional AppSec / QA sections and UI walkthroughs are **judgment** too — the gate does not run them.

## Do AppSec and QA skills always run?

No. They load on **Complex** work or clear risk (auth, PII, multi-step UI, etc.), **one at a time** (AppSec then QA). Tiny fixes skip them.

## What about code-simplify and ship-ready?

Optional sisters. **code-simplify** may load after a Medium+ task clears adequacy A–D, or when you ask to simplify without changing behavior. **ship-ready** loads only when you ask for a ship/deploy checklist — it does **not** authorize `git push` or deploy. Never hold more than one conditional sister (AppSec, QA, simplify, ship-ready) in the same window.

## Does every spec have to look like EARS? Does every tasks file need the coverage table?

The gate **requires** `SHALL` or `MUST` on each criterion. The EARS patterns (WHEN / IF / WHILE / always-on) are the recommended shape — missing them is a **warning**, not a hard fail.

The **Test Coverage Matrix** and Execute **adequacy A–D** (does the test match the job, files, command, spec?) are authoring checklists. The Python tasks/state gates already cover REQ↔task and evidence; they do not parse those extra headings.

## What is “Author ≠ verifier”?

The agent that wrote the code shouldn’t be the only one declaring victory. Verify is a fresh pass that asks for evidence, not confidence.

## Why do you talk about tokens so much?

Because dumping the whole manual into every chat wastes money and attention. The harness tells the agent to load **this step’s guide**, not the entire shelf. See [[Token-efficiency]].

## Can two agents work in parallel?

Yes, when the task list says so — and when they don’t fight over the same files. The harness treats file collisions between independent jobs as a stop sign.

## What if the agent ignores all of this?

Point it at the installed hub (`.cursor/skills/agent-architecture.md` or the Claude copy) and say: follow that workflow, run the gates, don’t skip Verify.

## Where is the “serious” technical contract?

In the repo: the README, `prd/gate-stability.md`, and the Python scripts under `.specs/harness/scripts/` after install. This wiki is the human tour.

## How do I upgrade?

    npx @luizsantiago/agentic-harness install

Same command. Skills and gates refresh; your feature memory stays.

## Next

- First run → [[Quick-start]]  
- The story → [[How-it-works]]  
- The brakes → [[Gates-and-guarantees]]  
- Home → [[Home]]
