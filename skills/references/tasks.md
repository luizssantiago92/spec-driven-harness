# Tasks

Break the work into atomic tasks with real dependencies and binary done criteria. Optional phase.

## When to Use

- More than 3 obvious steps
- Multiple files, modules, or people involved
- Any work that could be split across parallel agents

## When NOT to Use

- ≤3 obvious steps — list them inline at the start of Execute instead

**Safety valve:** if the inline listing in Execute reveals more than 5 steps or real dependencies, STOP and create a formal `tasks.md`. The Tasks phase was skipped in error.

## Inputs

- Approved `spec.md` (and `design.md` when it exists)
- `task-graph-engineering.md` for topology rules

## Output

`.specs/features/[feature]/tasks.md`, plus `task-graph.md` when the feature has 3+ tasks or parallel work.

## Procedure

1. **Write one task per deliverable.** A task is something you would hand to a single agent and check in one commit.
2. **Give every task the full field set.** Missing fields fail the gate:
   - `Requirement` — the spec ID it serves
   - `Files` — where the change lands
   - `Depends on` — real dependencies only, or `—`
   - `Tests` — the test file that proves it
   - `Gate` — the command that must pass
   - `Done when` — binary criterion
3. **Delete fake edges.** For every "and then", ask whether the next task actually reads the previous task's output. If not, the edge is fake — remove it and the tasks can run in parallel. See `task-graph-engineering.md`.
4. **Order tasks so dependencies come first.** Forward dependencies fail the gate. When grouping under `### Phase N`, a task must not depend on a task in a later phase.
5. **Apply the stop rule.** Only split work that never reads its siblings' results; sequential work stays with one agent.
6. **Draw the graph** in `task-graph.md` when there are 3+ tasks or any parallel group.
7. **Run the gate**, then present the breakdown for approval.

## Gate

```bash
python3 .specs/harness/scripts/validate_tasks.py .specs/features/[feature]/tasks.md
python3 .specs/harness/scripts/validate_tasks.py [feature]
python3 .specs/harness/scripts/validate_tasks.py          # single-feature projects
```

Checks task IDs, required fields, dependency direction, later-phase dependencies, cycles, and granularity smells. Non-zero exit means STOP.

## Template

```markdown
# Tasks: [Feature]

### T1: [Imperative, specific title]
- **Requirement**: REQ-001
- **Files**: src/auth/token.ts
- **Depends on**: —
- **Tests**: test/auth/token.test.ts
- **Gate**: npm test
- **Done when**: token module signs and verifies tokens
- [ ] complete

### T2: [Imperative, specific title]
- **Requirement**: REQ-001
- **Files**: src/routes/login.ts
- **Depends on**: T1
- **Tests**: test/routes/login.test.ts
- **Gate**: npm test
- **Done when**: endpoint returns 200 for valid credentials
- [ ] complete
```

## Granularity

| Too coarse | Atomic |
| --- | --- |
| "Create form" | T1: add email input component · T2: add email validation · T3: add submit handler |
| "Implement feature" | One task per file or per contract |
| "Fix bugs" | One task per reproducible defect |

A task that cannot be verified by a single named test is not atomic yet.

## Next

- 3+ tasks or parallel groups → `/task-graph` per `task-graph-engineering.md`
- Otherwise → `implement.md`
