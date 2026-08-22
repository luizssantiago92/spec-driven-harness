# Platform parity — Cursor and Claude Code

Spec Guardrails installs the **same** skills, phase references, and Python gates for both agents. Entry docs differ because each product has its own always-on file.

## What install writes

| Asset | Cursor | Claude Code |
| --- | --- | --- |
| Sister skills | `.cursor/skills/*.md` | `.claude/skills/*.md` |
| Phase references | `.cursor/skills/references/` | `.claude/skills/references/` |
| Gate scripts | `.specs/guardrails/scripts/` (shared) | same |
| Project memory | `.specs/` (shared) | same |
| Always-on contract | `.cursorrules` + `.cursor/rules/engineering-baseline.mdc` | `.claude/CLAUDE.md` |

Re-run `npx @luizsantiago/spec-guardrails install` to refresh skills and managed blocks. User prose outside Spec Guardrails markers is kept.

## Same loop

| Step | Both agents |
| --- | --- |
| Specify | Hub + `references/specify.md` |
| Tasks / Execute | `tasks.md` / `implement.md` + gates |
| Verify | Fresh context + `validate.md` + sisters |
| Quick | `references/quick-mode.md` + `validate-quick` |

CLI helpers that work in either shell: `doctor`, `classify-change`, `feature-status`, `feature-init`, gate commands.

## Differences (intentional)

| Topic | Note |
| --- | --- |
| Rule format | Cursor uses `.mdc` always-apply rules; Claude uses `CLAUDE.md` |
| Skill discovery | Each product loads from its own skills directory |
| Chat commands | `/specify`, `/loop`, `/verify` are **chat** conventions — not shell binaries |

## Check after install

```bash
npx @luizsantiago/spec-guardrails doctor
```

Expect skills under both trees when you use both agents in the same repo. Missing Python still shows the doctor banner — gates degrade to manual checklists from `references/`.

## Related

- [Skills and hub](skills-and-hub.md)
- [Quick start](Quick-start.md)
- [Migration](Migration.md)
