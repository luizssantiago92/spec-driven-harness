# ADR 0001: Harness freeze (0.7.x)

## Status

Accepted for the **0.7.x** line.

## Context

Free-form gate audits kept rediscovering the same false-pass families. Without a written freeze and an adversarial CI matrix, every probe invented another PR.

## Decision

For **0.7.x**:

1. Structural gates keep the guarantees listed in `prd/gate-stability.md` (requirement IDs under `## Requirements`, task fields, verdict/evidence shape, conventional commits, grounded lessons).
2. Closed false-pass families live in `test/test_adversarial_gates.py` and must stay red-then-green forever.
3. New gate behavior changes that loosen those guarantees need a new major and an explicit ADR.
4. Free-form “find more gate bugs” only becomes a PR when a failing matrix case lands first.

## Consequences

- Skill PASS language that gates do not enforce stays labeled as verifier judgment.
- Docs link here for the freeze table; adversarial details point at the matrix file, not a separate `tests/adversarial/` tree.

## References

- `prd/gate-stability.md`
- `test/test_adversarial_gates.py`
- `docs/guide/Gates-and-guarantees.md`
