export const REPO_RAW_URL =
  "https://raw.githubusercontent.com/luizssantiago92/spec-driven-harness/main";

export const SKILL_DIRS = [".cursor/skills", ".claude/skills"];

export const CURSOR_RULES_DIR = ".cursor/rules";

export const REFERENCES_SUBDIR = "references";

export const HARNESS_SCRIPTS_DIR = ".specs/harness/scripts";

/** @type {{ file: string, remotePath: string }[]} */
export const SKILL_ASSETS = [
  {
    file: "agent-architecture.md",
    remotePath: "skills/agent-architecture.md",
  },
  {
    file: "engineering-standards.md",
    remotePath: "skills/engineering-standards.md",
  },
  {
    file: "security-review.md",
    remotePath: "skills/security-review.md",
  },
  {
    file: "git-handoff.md",
    remotePath: "skills/git-handoff.md",
  },
  {
    file: "task-graph-engineering.md",
    remotePath: "skills/task-graph-engineering.md",
  },
];

/** Phase procedures loaded on demand by the hub skill. */
/** @type {{ file: string, remotePath: string }[]} */
export const REFERENCE_ASSETS = [
  { file: "specify.md", remotePath: "skills/references/specify.md" },
  { file: "discuss.md", remotePath: "skills/references/discuss.md" },
  { file: "design.md", remotePath: "skills/references/design.md" },
  { file: "tasks.md", remotePath: "skills/references/tasks.md" },
  { file: "implement.md", remotePath: "skills/references/implement.md" },
  { file: "validate.md", remotePath: "skills/references/validate.md" },
  { file: "memory.md", remotePath: "skills/references/memory.md" },
  { file: "quick-mode.md", remotePath: "skills/references/quick-mode.md" },
];

/** Deterministic gates executed with python3. */
/** @type {{ file: string, remotePath: string }[]} */
export const SCRIPT_ASSETS = [
  { file: "_common.py", remotePath: "scripts/_common.py" },
  { file: "validate_spec.py", remotePath: "scripts/validate_spec.py" },
  { file: "validate_tasks.py", remotePath: "scripts/validate_tasks.py" },
  { file: "validate_state.py", remotePath: "scripts/validate_state.py" },
  { file: "check_commit.py", remotePath: "scripts/check_commit.py" },
];

/** @type {{ file: string, remotePath: string }[]} */
export const RULE_ASSETS = [
  {
    file: "locale-and-standards.mdc",
    remotePath: "rules/locale-and-standards.mdc",
  },
];

export const STATE_HEADER = `# 📝 Project State & Decisions

## Active Feature
- Feature: —
- Phase: —
- Branch: —

## Next Step (single item)
- [ ] —

## Blockers
- none

## Deferred Ideas
- none

## Decisions
`;

export const LESSONS_HEADER = `# 📚 Lessons Learned

Recorded only from grounded failures during \`/verify\`: surviving mutants,
imprecise acceptance criteria, failed requirements, or spec deviations.
A clean PASS records nothing.
`;

export const CURSORRULES_MARKER_BEGIN = "<!-- AGENTIC-HARNESS:BEGIN -->";

export const CURSORRULES_MARKER_END = "<!-- AGENTIC-HARNESS:END -->";

export const CURSORRULES_BLOCK = `${CURSORRULES_MARKER_BEGIN}
# Execution Contract (Agentic Harness)
When planning architecture, specs, or multi-step features, read the hub first:
- \`.cursor/skills/agent-architecture.md\` — SDD hub: contract, phases, gates, complexity router
- \`.cursor/skills/references/\` — phase procedures (specify, discuss, design, tasks, implement, validate, memory, quick-mode)
- \`.cursor/skills/task-graph-engineering.md\` — task DAG, parallelism, verify topology
- \`.cursor/skills/engineering-standards.md\` — locale, security, code quality
- \`.cursor/skills/security-review.md\` — security checklist for /verify
- \`.cursor/skills/git-handoff.md\` — git sync and session handoff for .specs/

Deterministic gates (python3, non-zero exit means STOP):
- \`.specs/harness/scripts/validate_spec.py\` before confirming a spec
- \`.specs/harness/scripts/validate_tasks.py\` before approving tasks
- \`.specs/harness/scripts/check_commit.py\` on each commit
- \`.specs/harness/scripts/validate_state.py\` before declaring a feature done

Locale: chat with owner in pt-BR; all project artifacts in English.
Persistent state: \`.specs/STATE.md\` (decisions/handoff) and \`.specs/LESSONS.md\` (lessons learned).
Project rules: \`.cursor/rules/locale-and-standards.mdc\`
${CURSORRULES_MARKER_END}
`;

/**
 * @param {string} remotePath
 * @param {string} [repoUrl]
 */
export function resolveAssetUrl(remotePath, repoUrl) {
  const base = repoUrl ?? process.env.HARNESS_REPO_URL ?? REPO_RAW_URL;
  return `${base}/${remotePath}`;
}

/** @deprecated Use resolveAssetUrl with SKILL_ASSETS */
export function resolveSkillUrl(repoUrl) {
  return resolveAssetUrl("skills/agent-architecture.md", repoUrl);
}
