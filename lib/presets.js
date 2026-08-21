import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { mergeHarnessConfigs, parseHarnessConfig, resolveHarnessConfig } from "./config.js";
import { ensureDir, readFileSafe, writeFileIfMissing, writeFileSafe } from "./fs-utils.js";

const PACKAGE_ROOT = path.resolve(
  path.join(path.dirname(fileURLToPath(import.meta.url)), ".."),
);

export const PRESETS_DIR = "templates/presets";
export const CONFIG_PATH = ".specs/config.yaml";

/**
 * @param {string} name
 * @returns {string}
 */
export function presetAssetPath(name) {
  return path.join(PACKAGE_ROOT, PRESETS_DIR, `${name}.yaml`);
}

/**
 * @returns {Promise<string[]>}
 */
export async function listPresets() {
  const dir = path.join(PACKAGE_ROOT, PRESETS_DIR);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".yaml"))
    .map((entry) => entry.name.replace(/\.yaml$/, ""))
    .sort();
}

/**
 * @param {string} name
 * @returns {Promise<string>}
 */
export async function loadPresetText(name) {
  const presets = await listPresets();
  if (!presets.includes(name)) {
    throw new Error(
      `Unknown preset "${name}". Available: ${presets.join(", ")}`,
    );
  }

  return readFileSafe(presetAssetPath(name));
}

/**
 * @param {string} name
 */
export async function loadPreset(name) {
  const text = await loadPresetText(name);
  return parseHarnessConfig(text);
}

/**
 * @param {ReturnType<typeof parseHarnessConfig>} document
 * @param {Set<string>} [seen]
 * @returns {Promise<ReturnType<typeof parseHarnessConfig>>}
 */
export async function resolveConfigDocument(document, seen = new Set()) {
  return resolveHarnessConfig(document, loadPreset, seen);
}

/**
 * @param {string} [cwd]
 * @returns {Promise<ReturnType<typeof parseHarnessConfig> | null>}
 */
export async function loadResolvedConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, CONFIG_PATH);

  try {
    const text = await readFileSafe(configPath);
    const document = parseHarnessConfig(text);
    return resolveConfigDocument(document);
  } catch (err) {
    if (err.code === "ENOENT" || /cannot read/i.test(err.message)) {
      return null;
    }
    throw err;
  }
}

/**
 * @param {string} preset
 * @returns {string}
 */
export function configFromPreset(preset) {
  if (preset === "default") {
    return `# Project harness config (preset: default)
# Copy/edit freely. See templates/presets/ for other stacks.

schema: spec-driven

context: |
  Tech stack: (fill in)
  Test command: npm test
  Branch prefix: feat

rules:
  specify:
    - Prefer EARS acceptance criteria
    - Mark unknowns with [NEEDS CLARIFICATION: question]
  tasks:
    - Every REQ must appear in the Test Coverage Matrix
  verify:
    - Evidence must cite test file:line paths
`;
  }

  return `# Project harness config (extends preset: ${preset})
extends: ${preset}

context: |
  # Project-specific context (appended to preset context)

# overrides:
#   rules:
#     specify:
#       - Your extra rule on top of the preset
`;
}

/**
 * @param {{ preset?: string, cwd?: string, force?: boolean }} [options]
 */
export async function initProjectConfig(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const preset = options.preset ?? "default";
  const presets = await listPresets();

  if (!presets.includes(preset)) {
    throw new Error(
      `Unknown preset "${preset}". Available: ${presets.join(", ")}`,
    );
  }

  await ensureDir(path.join(cwd, ".specs"));
  const configPath = path.join(cwd, CONFIG_PATH);
  const content = configFromPreset(preset);

  if (options.force) {
    await writeFileSafe(configPath, content);
    return { created: false, updated: true, path: CONFIG_PATH, preset };
  }

  const created = await writeFileIfMissing(configPath, content);
  return {
    created,
    updated: false,
    path: CONFIG_PATH,
    preset,
    skipped: !created,
  };
}

/**
 * Read branch prefix from resolved config (explicit field or context line).
 *
 * @param {ReturnType<typeof parseHarnessConfig> | null | undefined} config
 * @returns {string | undefined}
 */
export function readBranchPrefix(config) {
  if (config?.branch_prefix?.trim()) {
    return config.branch_prefix.trim();
  }

  const match = config?.context?.match(/^Branch prefix:\s*(\S+)/im);
  return match?.[1];
}

export { mergeHarnessConfigs };
