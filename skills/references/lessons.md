# Lessons

How to record, promote, and load grounded lessons. The engine owns the files; this reference owns the judgment.

## When to Use

- The last step of `/verify` when the verdict is FAIL for a grounded reason
- The first step of `/specify` and `/plan`, loading only confirmed lessons
- After a confirmed lesson was loaded and the same failure still happened (`penalize`)

## When NOT to Use

- A clean PASS — record nothing
- A preference, a style nit, or anything not evidenced in `validation.md`
- Hand-editing `.specs/LESSONS.md` or `.specs/lessons.json`

## Files

| Path | Owner | Role |
| --- | --- | --- |
| `.specs/lessons.json` | `lessons.py` | Canonical store |
| `.specs/LESSONS.md` | `lessons.py` | Rendered playbook — read, never write |
| `.specs/harness/scripts/lessons.py` | Harness | `add`, `list`, `penalize`, `prune`, `status` |

## How to Phrase

A lesson is a trigger plus a rule the next agent can apply without the original thread:

```bash
python3 .specs/harness/scripts/lessons.py add \
  --title "Assert error codes, not just status" \
  --trigger "mutant returning 403 instead of 401 survived" \
  --rule "Acceptance criteria must name the error code, and tests must assert it" \
  --source .specs/features/auth/validation.md:41
```

`--source` is mandatory and must point at a non-empty `validation.md`. A lesson without evidence is opinion, and the engine refuses it.

Titles and rules are deduped after normalization (casefold, accents stripped, punctuation ignored). Rephrase the same idea and it attaches to the existing ID instead of creating a twin.

## Lifecycle

```
FAIL with evidence → add (candidate)
candidate seen in 2 distinct features → confirmed (guidance)
confirmed loaded but the same failure recurs → penalize
2 penalties → quarantined (stop loading)
candidate idle 90 days → prune
```

Same-feature recurrence does not promote. One noisy feature must not turn a guess into a house rule.

## When to Load

At the start of Specify and Design:

```bash
python3 .specs/harness/scripts/lessons.py list --status confirmed
```

Apply every confirmed rule that matches this work. Candidates are not guidance — they live in `lessons.json` until a second feature corroborates them.

If a confirmed lesson was in the working set and the same gap still appears in `/verify`, penalize it with the new `validation.md` as `--source`. Two penalties quarantine it.

## Degraded mode

Without Python the engine does not run. Do not write `LESSONS.md` by hand to compensate — that file is generated, and a hand-written entry has no store, no dedup, and no promotion. Note the gap in `STATE.md` and record the lesson once Python is available.

## Next

Return to `validate.md` after recording, or to `specify.md` / `design.md` after loading.
