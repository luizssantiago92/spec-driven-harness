export const REPO_RAW_URL =
  "https://raw.githubusercontent.com/luizssantiago92/spec-driven-harness/main";

export const SKILL_DIRS = [".cursor/skills", ".claude/skills"];

export const CURSOR_RULES_DIR = ".cursor/rules";

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

/** @type {{ file: string, remotePath: string }[]} */
export const RULE_ASSETS = [
  {
    file: "locale-and-standards.mdc",
    remotePath: "rules/locale-and-standards.mdc",
  },
];

export const STATE_HEADER = "# 📝 Project State & Decisions\n";

export const LESSONS_HEADER = "# 📚 Lessons Learned\n";

export const CURSORRULES_MARKER_BEGIN = "<!-- AGENTIC-HARNESS:BEGIN -->";

export const CURSORRULES_MARKER_END = "<!-- AGENTIC-HARNESS:END -->";

export const CURSORRULES_BLOCK = `${CURSORRULES_MARKER_BEGIN}
# Execution Contract (Agentic Harness)
When planning architecture, specs, or multi-step features, read:
- \`.cursor/skills/agent-architecture.md\` — SDD workflow (Specify → Verify)
- \`.cursor/skills/engineering-standards.md\` — locale, security, code quality
- \`.cursor/skills/security-review.md\` — security checklist for /verify
- \`.cursor/skills/git-handoff.md\` — git sync and session handoff for .specs/
- \`.cursor/skills/task-graph-engineering.md\` — task DAG, parallelism, verify topology

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
