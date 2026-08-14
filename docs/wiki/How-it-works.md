# How it works

Think of the harness as a **seatbelt for an AI coding agent**.

Without it, the agent often jumps straight into code, says “done”, and leaves you with half-finished work. With it, the agent has to **write down the goal, break the work into clear steps, prove each step, and only then call it finished**.

## The simple idea

1. **Say what you want** (a short written spec)
2. **Break it into small jobs** (tasks an agent can finish in one go)
3. **Build one job at a time** (with a real check that it worked)
4. **Have a second pass review it** (not the same “mind” that wrote the code)

If any of those steps is incomplete, the harness **stops the agent** until it’s fixed.

## The journey (in plain words)

### 1. Specify — “What are we building?”
You and the agent agree on the outcome in writing: who it’s for, what must happen, what’s out of scope.

No vague “make auth better”. Clear “when the user logs in with a valid password, they get a session” — and the same sharpness for errors, states, and always-on rules.

### 2. Discuss / Design — only when needed
If something is unclear or the design is big, you pause and decide. Small fixes skip this. Big features don’t.

### 3. Tasks — “What’s the shopping list?”
The work becomes a list of small, checkable jobs: which files change, how we’ll know it’s done, what depends on what. A short **coverage table** maps each goal to a job and a test so nothing in the spec is left without an owner.

Two agents won’t accidentally edit the same file at the same time unless the list says they should wait for each other.

### 4. Execute — “Do the next job only”
The agent picks **one** task, writes the test for the outcome, implements it, runs the project’s checks, and commits only if that test, file list, and command still match the job. Then the next task. No giant mystery PR.

### 5. Verify — “Would a stranger believe this is done?”
A fresh review looks at the original goals and asks for **proof** (links to real tests), not confidence. If something’s still open, it’s a fail — not a soft “mostly fine”.

On bigger or riskier work the verifier may also, **one guide at a time**:

- a short **AppSec** threat sketch (auth, payments, PII, trust boundaries) — not a full pentest  
- a **QA** smoke / regression focus for multi-step UI  
- a **walkthrough** script for Complex user-facing flows  

Backend-only or tiny changes skip those extras. The Python gate still only checks the structural report — AppSec, QA, and the walkthrough are human/verifier judgment.

## What you get day to day

- Fewer “it works on my machine / in the chat” moments  
- Clearer handoffs between sessions (the project remembers where it left off)  
- Less wasted AI context: the agent loads **this phase’s guide**, not a giant manual every time  
- A product feel: install once, same workflow on Cursor or Claude  

## What it does *not* do

It doesn’t replace your judgment about product taste or whether a test is “smart enough”.  
It **does** stop the agent from skipping the boring-but-important paperwork that keeps software honest.

## Next

- New here? → [[Quick-start]]  
- Want the “stop rules”? → [[Gates-and-guarantees]]  
- Care about cost? → [[Token-efficiency]]  
- Back → [[Home]]
