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
 * @typedef {Object} GuardrailsConfigDocument
 * @property {string} [schema]
 * @property {string} [extends]
 * @property {string} [branch_prefix]
 * @property {string} [context]
 * @property {Record<string, string[]>} [rules]
 * @property {{ rules?: Record<string, string[]> }} [overrides]
 */

/**
 * Minimal YAML parser for the guardrails config schema (no external deps).
 *
 * @param {string} text
 * @returns {GuardrailsConfigDocument}
 */
export function parseGuardrailsConfig(text) {
  /** @type {GuardrailsConfigDocument} */
  const config = {};
  /** @type {Record<string, string[]> | undefined} */
  let rules;
  /** @type {Record<string, string[]> | undefined} */
  let overrideRules;
  /** @type {string | undefined} */
  let currentRulesPhase;
  /** @type {"rules" | "overrides" | undefined} */
  let rulesSection;
  let contextLines = null;
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    if (contextLines !== null) {
      if (line.startsWith("  ") || line.startsWith("\t")) {
        contextLines.push(line.replace(/^\s{2}/, ""));
        continue;
      }

      config.context = contextLines.join("\n").replace(/\n+$/, "");
      contextLines = null;

      if (trimmed === "") {
        continue;
      }
    }

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const scalar = trimmed.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (scalar) {
      const [, key, value] = scalar;
      if (key === "schema") {
        config.schema = value.replace(/^['"]|['"]$/g, "");
        continue;
      }
      if (key === "extends") {
        config.extends = value.replace(/^['"]|['"]$/g, "");
        continue;
      }
      if (key === "branch_prefix") {
        config.branch_prefix = value.replace(/^['"]|['"]$/g, "");
        continue;
      }
      if (key === "context" && value === "|") {
        contextLines = [];
        continue;
      }
      if (key === "rules" && value === "") {
        rules = {};
        config.rules = rules;
        rulesSection = "rules";
        currentRulesPhase = undefined;
        continue;
      }
      if (key === "overrides" && value === "") {
        config.overrides = {};
        rulesSection = "overrides";
        currentRulesPhase = undefined;
        continue;
      }
    }

    if (rulesSection === "overrides") {
      const nestedRules = trimmed.match(/^rules:\s*$/);
      if (nestedRules) {
        overrideRules = {};
        config.overrides ??= {};
        config.overrides.rules = overrideRules;
        currentRulesPhase = undefined;
        continue;
      }
    }

    const activeRules = rulesSection === "overrides" ? overrideRules : rules;
    const rulesPhase = trimmed.match(/^([a-zA-Z0-9_-]+):\s*$/);
    if (rulesPhase && activeRules) {
      currentRulesPhase = rulesPhase[1];
      activeRules[currentRulesPhase] = [];
      continue;
    }

    const listItem = trimmed.match(/^-\s+(.+)$/);
    if (listItem && currentRulesPhase && activeRules) {
      activeRules[currentRulesPhase].push(listItem[1]);
    }
  }

  if (contextLines !== null) {
    config.context = contextLines.join("\n").replace(/\n+$/, "");
  }

  return config;
}

/**
 * @param {GuardrailsConfigDocument | null | undefined} base
 * @param {GuardrailsConfigDocument | null | undefined} overlay
 * @returns {GuardrailsConfigDocument}
 */
export function mergeGuardrailsConfigs(base, overlay) {
  /** @type {GuardrailsConfigDocument} */
  const merged = {
    schema: overlay?.schema ?? base?.schema,
    branch_prefix: overlay?.branch_prefix ?? base?.branch_prefix,
    rules: mergeRules(base?.rules, overlay?.rules),
  };

  const contexts = [base?.context, overlay?.context]
    .map((value) => value?.trim())
    .filter(Boolean);
  if (contexts.length) {
    merged.context = contexts.join("\n\n");
  }

  if (overlay?.overrides?.rules) {
    merged.rules = mergeRules(merged.rules, overlay.overrides.rules);
  }

  return merged;
}

/**
 * @param {Record<string, string[]> | undefined} base
 * @param {Record<string, string[]> | undefined} overlay
 * @returns {Record<string, string[]> | undefined}
 */
function mergeRules(base, overlay) {
  if (!base && !overlay) {
    return undefined;
  }

  /** @type {Record<string, string[]>} */
  const merged = { ...(base ?? {}) };

  for (const [phase, items] of Object.entries(overlay ?? {})) {
    merged[phase] = [...(merged[phase] ?? []), ...items];
  }

  return merged;
}

/**
 * Resolve extends chain and apply overrides.
 *
 * @param {GuardrailsConfigDocument} document
 * @param {(name: string) => Promise<GuardrailsConfigDocument>} loadPreset
 * @param {Set<string>} [seen]
 * @returns {Promise<GuardrailsConfigDocument>}
 */
export async function resolveGuardrailsConfig(document, loadPreset, seen = new Set()) {
  const { extends: presetName, overrides, ...local } = document;

  if (!presetName) {
    return mergeGuardrailsConfigs(null, { ...local, overrides });
  }

  if (seen.has(presetName)) {
    throw new Error(`Config preset cycle detected: ${[...seen, presetName].join(" → ")}`);
  }

  seen.add(presetName);
  const preset = await loadPreset(presetName);
  const resolvedPreset = await resolveGuardrailsConfig(preset, loadPreset, seen);
  const merged = mergeGuardrailsConfigs(resolvedPreset, local);
  return mergeGuardrailsConfigs(merged, { overrides });
}

/**
 * @param {string} [cwd]
 * @returns {Promise<GuardrailsConfigDocument | null>}
 */
export async function loadGuardrailsConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, CONFIG_PATH);

  try {
    const text = await readFileSafe(configPath);
    return parseGuardrailsConfig(text);
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
 * @param {GuardrailsConfigDocument | null} config
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
  const { loadResolvedConfig } = await import("./presets.js");
  const config = await loadResolvedConfig(cwd);
  return formatPhaseContext(phase, config);
}
