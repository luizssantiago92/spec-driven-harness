import path from "node:path";

import {
  CURSORRULES_MARKER_BEGIN,
  CURSORRULES_MARKER_END,
  LEGACY_CURSORRULES_MARKER_PAIRS,
} from "./constants.js";
import {
  appendFileSafe,
  readFileSafe,
  writeFileSafe,
} from "./fs-utils.js";

export const CLAUDE_MD_MARKER_BEGIN = CURSORRULES_MARKER_BEGIN;
export const CLAUDE_MD_MARKER_END = CURSORRULES_MARKER_END;

export const CLAUDE_MD_BLOCK = `${CLAUDE_MD_MARKER_BEGIN}
# Execution Contract (Spec Guardrails)

When planning architecture, specs, or multi-step features, read the hub first:

- \`.claude/skills/agent-architecture.md\` — SDD hub: contract, phases, gates, complexity router
- \`.claude/skills/references/\` — phase procedures (explore, project-init, constitution, specify, discuss, design, tasks, analyze, implement, validate, converge, archive, memory, quick-mode, context-limits, lessons, sub-agents)
- \`.claude/skills/task-graph-engineering.md\` — task DAG, parallelism, verify topology
- \`.claude/skills/engineering-standards.md\` — secure coding, code quality, artifact language
- \`.claude/skills/security-review.md\` — security checklist for /verify
- Sister skills (\`appsec\`, \`qa-strategy\`, \`code-simplify\`, \`ship-ready\`, \`git-handoff\`) — load **one conditional** at a time

Deterministic gates (\`python3\`, non-zero exit means STOP):

- Scripts in \`.specs/guardrails/scripts/\` — the **agent** runs them at phase boundaries (see hub).
- Humans: \`install\` once; optional \`feature-init\`, \`project-init\`, \`doctor\`, \`classify-change\`, \`feature-status\`.
- Full CLI: \`npx @luizsantiago/spec-guardrails --help\`
- Onboarding: \`.specs/GETTING_STARTED.md\`

All project artifacts are written in English.
Persistent state: \`.specs/STATE.md\`, \`.specs/lessons.json\`, \`.specs/LESSONS.md\`.

Cursor users also get \`.cursorrules\` + \`.cursor/rules/engineering-baseline.mdc\` — same contract, different entrypoint. See \`docs/guide/Platform-parity.md\` in the package repo.
${CLAUDE_MD_MARKER_END}
`;

const MARKER_PAIRS = [
  [CLAUDE_MD_MARKER_BEGIN, CLAUDE_MD_MARKER_END],
  ...LEGACY_CURSORRULES_MARKER_PAIRS,
];

/**
 * @param {string} content
 */
function locateBlock(content) {
  for (const [begin, endMarker] of MARKER_PAIRS) {
    const start = content.indexOf(begin);
    const end = content.indexOf(endMarker);
    if (start !== -1 && end !== -1 && end >= start) {
      return { start, end, endMarker };
    }
  }
  return null;
}

/**
 * Install or refresh `.claude/CLAUDE.md` with the Spec Guardrails contract.
 *
 * @param {string} cwd
 */
export async function injectClaudeMd(cwd) {
  const target = path.join(cwd, ".claude", "CLAUDE.md");
  const expected = CLAUDE_MD_BLOCK.trim();

  try {
    const existing = await readFileSafe(target);
    const located = locateBlock(existing);
    if (located) {
      const current = existing.slice(
        located.start,
        located.end + located.endMarker.length,
      );
      if (current.trim() === expected) {
        return { created: false, updated: false };
      }
      const before = existing.slice(0, located.start);
      const after = existing.slice(located.end + located.endMarker.length);
      const replaced = `${before}${expected}\n${after.replace(/^\n+/, "")}`;
      await writeFileSafe(
        target,
        replaced.endsWith("\n") ? replaced : `${replaced}\n`,
      );
      return { created: false, updated: true };
    }

    const separator = existing.endsWith("\n") ? "\n" : "\n\n";
    await appendFileSafe(target, `${separator}${CLAUDE_MD_BLOCK}\n`);
    return { created: false, updated: true };
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  await writeFileSafe(target, `${CLAUDE_MD_BLOCK}\n`);
  return { created: true, updated: false };
}
