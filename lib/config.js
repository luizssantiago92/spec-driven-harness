import path from "node:path";

import { readFileSafe } from "./fs-utils.js";

const CONFIG_PATH = ".specs/config.yaml";

/** Map CLI phase names to config.yaml rules keys. */
export const PHASE_ALIASES = {
  explore: "explore",
  constitution: "constitution",
  specify: "specify",
  discuss: "discuss",
  design: "design",
  tasks: "tasks",
  analyze: "analyze",
  implement: "implement",
  execute: "implement",
  loop: "implement",
  verify: "verify",
  validate: "verify",
  archive: "archive",
  converge: "converge",
  quick: "quick",
  handoff: "handoff",
  memory: "handoff",
};

/**
 * Minimal YAML parser for the harness config schema (no external deps).
 *
 * @param {string} text
 * @returns {{ schema?: string, context?: string, rules?: Record<string, string[]> }}
 */
export function parseHarnessConfig(text) {
  /** @type {{ schema?: string, context?: string, rules?: Record<string, string[]> }} */
  const config = {};
  /** @type {Record<string, string[]> | undefined} */
  let rules;
  /** @type {string | undefined} */
  let currentRulesPhase;
  let contextLines = null;
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      if (contextLines !== null) {
        contextLines.push(line.replace(/^\s{2}/, ""));
      }
      continue;
    }

    if (contextLines !== null) {
      if (/^\S/.test(line) && !line.startsWith("  ")) {
        config.context = contextLines.join("\n").replace(/\n+$/, "");
        contextLines = null;
      } else {
        contextLines.push(line.replace(/^\s{2}/, ""));
        continue;
      }
    }

    const scalar = trimmed.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (scalar) {
      const [, key, value] = scalar;
      if (key === "schema") {
        config.schema = value.replace(/^['"]|['"]$/g, "");
        continue;
      }
      if (key === "context" && value === "|") {
        contextLines = [];
        continue;
      }
      if (key === "rules" && value === "") {
        rules = {};
        config.rules = rules;
        currentRulesPhase = undefined;
        continue;
      }
    }

    const rulesPhase = trimmed.match(/^([a-zA-Z0-9_-]+):\s*$/);
    if (rulesPhase && rules) {
      currentRulesPhase = rulesPhase[1];
      rules[currentRulesPhase] = [];
      continue;
    }

    const listItem = trimmed.match(/^-\s+(.+)$/);
    if (listItem && currentRulesPhase && rules) {
      rules[currentRulesPhase].push(listItem[1]);
    }
  }

  if (contextLines !== null) {
    config.context = contextLines.join("\n").replace(/\n+$/, "");
  }

  return config;
}

/**
 * @param {string} [cwd]
 * @returns {Promise<ReturnType<typeof parseHarnessConfig> | null>}
 */
export async function loadHarnessConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, CONFIG_PATH);

  try {
    const text = await readFileSafe(configPath);
    return parseHarnessConfig(text);
  } catch (err) {
    if (err.code === "ENOENT" || /cannot read/i.test(err.message)) {
      return null;
    }
    throw err;
  }
}

/**
 * @param {string} phase
 * @returns {string}
 */
export function normalizePhase(phase) {
  const key = phase.trim().toLowerCase();
  const mapped = PHASE_ALIASES[key];
  if (!mapped) {
    throw new Error(
      `Unknown phase "${phase}". Known phases: ${[...new Set(Object.keys(PHASE_ALIASES))].sort().join(", ")}`,
    );
  }
  return mapped;
}

/**
 * Build markdown injected before a phase procedure.
 *
 * @param {string} phase
 * @param {ReturnType<typeof parseHarnessConfig> | null} config
 * @returns {string}
 */
export function formatPhaseContext(phase, config) {
  const normalized = normalizePhase(phase);
  const parts = [];

  if (config?.context?.trim()) {
    parts.push("## Project context (.specs/config.yaml)\n");
    parts.push(config.context.trim());
    parts.push("");
  }

  const rules = config?.rules?.[normalized] ?? [];
  if (rules.length) {
    parts.push(`## Phase rules (${normalized})\n`);
    for (const rule of rules) {
      parts.push(`- ${rule}`);
    }
    parts.push("");
  }

  if (!parts.length) {
    return `# Phase context: ${normalized}\n\n(no .specs/config.yaml or no entries for this phase)\n`;
  }

  return `# Phase context: ${normalized}\n\n${parts.join("\n").trimEnd()}\n`;
}

/**
 * @param {string} phase
 * @param {{ cwd?: string }} [options]
 */
export async function phaseContext(phase, options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const config = await loadHarnessConfig(cwd);
  return formatPhaseContext(phase, config);
}
