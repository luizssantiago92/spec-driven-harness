import fs from "node:fs/promises";

import { packagedAssetPath } from "./assets.js";
import {
  REFERENCE_ASSETS,
  RULE_ASSETS,
  SKILL_ASSETS,
} from "./constants.js";

/** Rough English/code heuristic (~4 characters per token). Not a billing API. */
export const CHARS_PER_TOKEN = 4;

/**
 * @param {string} text
 * @returns {number}
 */
export function estimateTokens(text) {
  if (!text) {
    return 0;
  }
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * @param {string} remotePath
 * @returns {Promise<string>}
 */
async function readPackagedText(remotePath) {
  return fs.readFile(packagedAssetPath(remotePath), "utf8");
}

/**
 * @param {string[]} remotePaths
 * @returns {Promise<{ chars: number, tokens: number, files: number }>}
 */
export async function measureBundle(remotePaths) {
  let chars = 0;
  for (const remotePath of remotePaths) {
    const text = await readPackagedText(remotePath);
    chars += text.length;
  }
  return {
    chars,
    tokens: estimateTokens(" ".repeat(chars)),
    files: remotePaths.length,
  };
}

const ALL_SISTER_SKILLS = SKILL_ASSETS.map((asset) => asset.remotePath);
const ALL_REFERENCES = REFERENCE_ASSETS.map((asset) => asset.remotePath);
const BASELINE_RULE = RULE_ASSETS[0].remotePath;

/** Documented load profiles — mirror agent-architecture progressive disclosure. */
export const LOAD_PROFILES = {
  naiveFullDump: {
    label: "Naive full dump (everything every turn)",
    paths: [...ALL_SISTER_SKILLS, ...ALL_REFERENCES, BASELINE_RULE],
  },
  specifyTurn: {
    label: "Specify turn (hub + phase + standards)",
    paths: [
      "skills/agent-architecture.md",
      "skills/references/specify.md",
      "skills/references/context-limits.md",
      "skills/engineering-standards.md",
      BASELINE_RULE,
    ],
  },
  tasksTurn: {
    label: "Tasks turn (hub + tasks + task graph)",
    paths: [
      "skills/agent-architecture.md",
      "skills/references/tasks.md",
      "skills/task-graph-engineering.md",
      "skills/references/context-limits.md",
      BASELINE_RULE,
    ],
  },
  executeLoop: {
    label: "Execute /loop (one task at a time)",
    paths: [
      "skills/references/implement.md",
      "skills/engineering-standards.md",
      BASELINE_RULE,
    ],
  },
  verifyTurn: {
    label: "Verify turn (independent reviewer)",
    paths: [
      "skills/references/validate.md",
      "skills/security-review.md",
      "skills/references/context-limits.md",
      BASELINE_RULE,
    ],
  },
};

/**
 * @returns {Promise<{
 *   profiles: Record<string, { label: string, chars: number, tokens: number, files: number }>,
 *   savings: { specifyVsNaivePct: number, executeVsNaivePct: number }
 * }>}
 */
export async function measureLoadProfiles() {
  /** @type {Record<string, { label: string, chars: number, tokens: number, files: number }>} */
  const profiles = {};

  for (const [key, profile] of Object.entries(LOAD_PROFILES)) {
    const measured = await measureBundle(profile.paths);
    profiles[key] = { label: profile.label, ...measured };
  }

  const naive = profiles.naiveFullDump.tokens;
  const specify = profiles.specifyTurn.tokens;
  const execute = profiles.executeLoop.tokens;

  return {
    profiles,
    savings: {
      specifyVsNaivePct: naive > 0 ? Math.round((1 - specify / naive) * 100) : 0,
      executeVsNaivePct: naive > 0 ? Math.round((1 - execute / naive) * 100) : 0,
    },
  };
}
