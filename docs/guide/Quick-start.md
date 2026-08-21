# Quick start

Get from zero to “the seatbelt is watching” in about ten minutes.

## 1. Install

In your project folder:

    npx @luizsantiago/spec-seatbelt install

You should see a playbook land for Cursor (and Claude if you use it), plus a `.specs/` folder where the project keeps notes and the automatic checks.

## 2. Tell your agent what you want

Open Cursor or Claude and say something concrete, for example:

> Specify a small feature: users can sign in with email and password and get a session. Keep social login out of scope.

Ask it to follow the installed seatbelt (the Spec-Driven / hub skill).

## Agent commands (chat — not the terminal)

> Type these in **Cursor or Claude Code** — not in your shell.
> They load phase procedures from `.cursor/skills/references/`.
> The agent runs gates and CLI helpers (`validate-spec`, `loop-plan`, …) for you.

| Command | What it's for | When to use | How (chat) |
| --- | --- | --- | --- |
| `/quick` | Tiny fix without full spec | ≤3 files, no new deps | `/quick` + one-line fix |
| `/explore` | Research before committing | Idea unclear; no prod code | `/explore` + question |
| `/specify` | Written requirements | **Start here** for real features | `/specify` + goal + out of scope |
| `/discuss` | Gray product decisions | Auth, payments, ambiguity | `/discuss` + questions |
| `/plan` | Technical design | Complex — APIs, architecture | `/plan` + design scope |
| `/tasks` | Atomic job list | After approved spec | `/tasks` + “break into tasks” |
| `/task-graph` | Parallel work DAG | 3+ tasks or parallel work | `/task-graph` + “mark groups” |
| `/analyze` | Spec ↔ tasks check | Before approving tasks | `/analyze` + “check consistency” |
| `/loop` | Implement code | After approved tasks | `/loop` + “loop-plan, next wave” |
| `/verify` | Independent proof | **Always** after last task (fresh context) | `/verify` + “you did not write this code” |
| `/archive` | Domain memory | After Verify PASS | `/archive` + domain |
| `/converge` | Recover from drift | Spec/tasks ≠ code | `/converge` + what changed |
| `/handoff` | Session snapshot | End of chat | `/handoff` + next step |
| `/project-init` | Brownfield map | Once, existing repo | `/project-init` + “scan repo” |
| `/constitution` | Project principles | Once, greenfield | `/constitution` + principles |
| `/lessons` | Learn from failures | After Verify FAIL | `/lessons` + what failed |

**Typical order:** `/specify` → `/tasks` → `/analyze` → `/loop` → `/verify` → `/archive`

Full detail with examples: [README → Agent commands](https://github.com/luizssantiago92/spec-seatbelt#agent-commands-chat--not-the-terminal).

## 3. Watch for the written goal

You should get a short write-up: what must happen, what’s assumed, what’s out of scope.

If the agent tries to jump straight into code, nudge it:

> Stop. Finish the written goal and run the specify check first.

## 4. Approve a small shopping list (if the work isn’t tiny)

For anything bigger than a quick fix, ask for tasks: small jobs with a clear “done when”.

Then let it build **one job at a time**.

## 5. Finish with a real review

When the jobs are done, ask for Verify in a **fresh** pass: proof linked to tests, not “trust me”.

If the report still lists open gaps, it isn’t done.

## What “good” looks like after ten minutes

- The seatbelt files are installed  
- There’s a written goal you actually agree with  
- The agent isn’t inventing a giant PR in silence  
- You know the next step (do job 1, or fix a failed check)

## Everyday checks (optional CLI)

After install, you can run the same brakes from the terminal. Think of them as “is this paperwork honest?” — not as a full product test suite.

```bash
# Is the written goal complete enough?
npx @luizsantiago/spec-seatbelt validate-spec auth

# Does this commit message follow the house style?
npx @luizsantiago/spec-seatbelt check-commit --message "feat(auth): add token refresh"

# What lessons has the project already confirmed?
npx @luizsantiago/spec-seatbelt lessons list --status confirmed
```

Replace `auth` with your feature folder name under `.specs/features/`. A non-zero exit means: stop, fix the artifact, run again.

| Command | Plain meaning |
| --- | --- |
| `validate-spec` | The written goal has the required sections and real criteria |
| `check-commit` | The commit title looks Conventional (type, length, no trailing period) |
| `lessons list` | Show rules the team already promoted — candidates stay hidden |

More gates (tasks, “are we actually done?”) live in the [README Gates section](https://github.com/luizssantiago92/spec-seatbelt#gates).

## If something feels stuck

- **No Python?** The playbook still guides the agent; install Python 3 when you want the automatic stop checks.  
- **Agent ignores the seatbelt?** Point it at `.cursor/skills/agent-architecture.md` and say “follow this”.  
- **Want the big picture?** → [How it works](How-it-works.md)  
- **Want the brakes explained?** → [Gates and guarantees](Gates-and-guarantees.md)  

## Next

- Save money on context → [Token efficiency](Token-efficiency.md)  
- Common questions → [FAQ](FAQ.md)  
- Back → [Home](Home.md)
