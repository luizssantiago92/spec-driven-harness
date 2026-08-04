export const REPO_RAW_URL =
  "https://raw.githubusercontent.com/luizssantiago92/spec-driven-harness/main";

export const DEFAULT_SKILL_URL = `${REPO_RAW_URL}/skills/agent-architecture.md`;

export const SKILL_DIRS = [".cursor/skills", ".claude/skills"];

export const SKILL_FILENAME = "agent-architecture.md";

export const STATE_HEADER = "# 📝 Project State & Decisions\n";

export const LESSONS_HEADER = "# 📚 Lessons Learned\n";

export const CURSORRULES_MARKER_BEGIN = "<!-- AGENTIC-HARNESS:BEGIN -->";

export const CURSORRULES_MARKER_END = "<!-- AGENTIC-HARNESS:END -->";

export const CURSORRULES_BLOCK = `${CURSORRULES_MARKER_BEGIN}
# Execution Contract (Agentic Harness)
When planning architecture, specs, or multi-step features, read:
- \`.cursor/skills/agent-architecture.md\`

Follow the 5-phase workflow: Specify → Design → Tasks → Execute → Verify.
Persistent state: \`.specs/STATE.md\` (decisions/handoff) and \`.specs/LESSONS.md\` (lessons learned).
${CURSORRULES_MARKER_END}
`;

export function resolveSkillUrl() {
  return process.env.HARNESS_SKILL_URL ?? DEFAULT_SKILL_URL;
}
