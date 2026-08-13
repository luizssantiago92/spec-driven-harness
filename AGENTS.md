# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single, self-contained npm CLI package (`@luizsantiago/agentic-harness`) — a
developer tool that installs Spec-Driven Development skills, references, and Python "gate"
scripts into a target project. There are no long-running services, servers, or databases.

Runtimes (both preinstalled on the Cloud VM): Node.js 18+ (CLI + installer) and Python 3.10+
(gate scripts). The package has **zero npm dependencies** and no lockfile, so there is nothing
to `npm install`; the update script running it is just a harmless no-op guard against future
dependencies.

Standard build/test/run commands are documented in `README.md` (see the "Development" and
"Gates" sections) and `package.json` scripts. There is no build step and no configured linter;
CI (`.github/workflows/ci.yml`) treats `python3 -m compileall -q scripts` plus the two test
suites as the checks.

Non-obvious caveats:
- `npm test` runs both suites: `test:node` (Node's built-in `node --test`) and `test:gates`
  (`test/run-gate-tests.mjs`, which spawns `python3` on `test/test_gates.py`). If Python is
  missing, `test:gates` exits with a message and is skipped ("degraded mode") rather than
  failing — so a green `npm test` does not guarantee the gates ran. Confirm `python3` is on
  PATH when validating gate changes.
- The CLI `install` command **downloads** skills/references/gate scripts over HTTPS from the
  git tag matching the CLI version (not from the local working tree). So `node index.js install`
  requires network access to GitHub and reflects the published tag, not your local edits. Set
  `HARNESS_REPO_URL` to override the asset source (it is announced before writing). The local
  test suite does not hit the network — it serves fixtures from localhost.
- Gate CLI subcommands (`check-commit`, `validate-spec`, `validate-tasks`, `validate-state`)
  shell out to the installed Python scripts under `.specs/harness/scripts/`, so they only work
  in a directory where `install` has already run.
