# Quick start

Get from zero to “the harness is watching” in about ten minutes.

## 1. Install

In your project folder:

    npx @luizsantiago/agentic-harness install

You should see skills land under `.cursor/` (and `.claude/` if you use Claude), plus a `.specs/` folder for memory and gate scripts.

## 2. Tell your agent what you want

Open Cursor or Claude and say something concrete, for example:

> Specify a small feature: users can sign in with email and password and get a session. Keep social login out of scope.

Ask it to follow the installed harness (the hub skill / Spec-Driven flow).

## 3. Watch for the written goal

You should get a short `spec.md`-style write-up: what must happen, what’s assumed, what’s out of scope.

If the agent tries to jump straight into code, nudge it:

> Stop. Finish the spec and run the specify gate first.

## 4. Approve a small shopping list (if the work isn’t tiny)

For anything bigger than a quick fix, ask for tasks: small jobs with a clear “done when”.

Then let it build **one job at a time**.

## 5. Finish with a real review

When the jobs are done, ask for Verify in a **fresh** pass: proof linked to tests, not “trust me”.

If the report still lists open gaps, it isn’t done.

## What “good” looks like after ten minutes

- The project has the harness files installed  
- There’s a written goal you actually agree with  
- The agent isn’t inventing a giant PR in silence  
- You know the next step (implement task 1, or fix a gate failure)

## If something feels stuck

- **No Python?** Skills still guide the agent; install Python 3 when you want the automatic gate scripts.  
- **Agent ignores the harness?** Point it at `.cursor/skills/agent-architecture.md` and say “follow this”.  
- **Want the big picture?** → [[How-it-works]]  
- **Want the brakes explained?** → [[Gates-and-guarantees]]  

## Next

- Save money on context → [[Token-efficiency]]  
- Common questions → [[FAQ]]  
- Back → [[Home]]
