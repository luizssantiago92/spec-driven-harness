# Git Handoff

Version project memory and spec artifacts in git at phase boundaries and session end.
Sister skill to `agent-architecture.md` — SDD defines *what* to build; this skill defines *when and how* to persist progress in git.

## When to Use

- End of any agent session (mandatory handoff)
- After **Specify**, **Tasks**, or **Verify** phases complete
- Before switching branches, agents, or human reviewers
- When `STATE.md` or `.specs/features/` changed materially

## Sister Skills (use together)

| Skill | Role |
| --- | --- |
| `agent-architecture.md` | Process — Specify → Verify workflow |
| `engineering-standards.md` | Quality — locale, secure coding, commit format |
| `security-review.md` | Verification — OWASP checklist for `/verify` |
| `task-graph-engineering.md` | Topology — task DAG and parallelism |
| **`git-handoff.md`** | **Persistence — git sync for `.specs/` and handoff** |

## What to Commit

### Always commit (project memory)

```
.specs/STATE.md
.specs/LESSONS.md
.specs/features/**/*
```

Treat `.specs/` as **versioned product documentation**, not ephemeral notes.

### Never commit via handoff

```
.cursor/skills/          # installed by harness; upstream is spec-driven-harness repo
.claude/skills/
.cursor/rules/             # unless team customized — then commit intentionally
node_modules/
.env, secrets, credentials
```

### Code commits

Follow `engineering-standards.md` — separate commits for code vs docs when possible.

## Handoff Workflow (`/handoff`)

Run at session end or phase milestone:

### 1. Update memory

Use this structure in `.specs/STATE.md`:

```markdown
## Active Feature
- Feature: [name]
- Phase: [Specify|Design|Tasks|Execute|Verify]
- Branch: [branch-name]

## Decisions (this session)
- [decision and rationale]

## Next Step (single item)
- [ ] [one concrete action]

## Blockers
- [open questions or dependencies]
```

- Refresh all sections above each handoff
- Append to `.specs/LESSONS.md` if verification failed or a mistake was corrected

### 2. Validate before commit

- Run relevant tests / linters (operational harness — not self-declaration)
- Ensure no secrets in staged files
- Commit messages in **English** (Conventional Commits)

### 3. Stage and commit

```bash
git add .specs/
git status   # review — no secrets, no accidental paths
git commit -m "docs(spec): update STATE handoff for [feature]"
```

### 4. Do NOT auto-push

Stop after commit. Human or explicit instruction handles `git push`.

## Commit Messages by Phase

| Phase completed | Example commit |
| --- | --- |
| Specify | `docs(spec): add REQ-001 auth requirements` |
| Design | `docs(spec): design OAuth flow for auth feature` |
| Tasks | `docs(spec): task breakdown for auth feature` |
| Task graph | `docs(spec): add task graph for auth feature` |
| Verify | `docs(spec): validation report auth feature` |
| Session handoff | `docs(spec): update STATE handoff — auth in progress` |
| Lessons learned | `docs(spec): record lesson — JWT expiry edge case` |

## Phase Boundary Rules

| Event | Git action |
| --- | --- |
| Spec approved | Commit `spec.md` (+ tests scaffold if created) |
| Tasks approved | Commit `tasks.md` (+ `task-graph.md` if created) |
| Verify passed | Commit `validation.md` |
| Execute loop | Atomic code commits per task (existing Execute rules) |
| Session ends | `/handoff` — always update STATE + commit `.specs/` |

## `.gitignore` Guidance

Ensure target projects **do not** ignore `.specs/`:

```gitignore
# Keep .specs/ tracked — it is project memory
# DO NOT add: .specs/
```

Agent tooling may stay ignored:

```gitignore
.cursor/skills/
.claude/skills/
```

## Evidence-or-Zero for Handoff

A handoff is complete only when:

1. `STATE.md` has a concrete "Next step" line
2. `git log -1` shows the handoff commit
3. Staged files were reviewed (no secrets)

Report to owner in **pt-BR**; commit messages remain in **English**.

## Related Commands

| Command | Action |
| --- | --- |
| `/handoff` | End session — update STATE, commit `.specs/`, no push |
| `/sync-spec` | Commit current feature spec artifacts only (`spec.md`, `tasks.md`, `task-graph.md`, etc.) |
| `/verify` | After verify — commit `validation.md` (see `security-review.md`) |
