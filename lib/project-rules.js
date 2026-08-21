import fs from "node:fs/promises";
import path from "node:path";

import { CURSOR_RULES_DIR, RULE_ASSETS } from "./constants.js";
import { ensureDir } from "./fs-utils.js";

/** Markers around the catalog skills table — refreshed on every install. */
export const SKILLS_MAP_START = "<!-- harness-managed:skills-map:start -->";
export const SKILLS_MAP_END = "<!-- harness-managed:skills-map:end -->";

/** Markers around the gates table — refreshed on every install. */
export const GATES_MAP_START = "<!-- harness-managed:gates-map:start -->";
export const GATES_MAP_END = "<!-- harness-managed:gates-map:end -->";

/**
 * @param {string} content
 * @param {string} startMarker
 * @param {string} endMarker
 * @returns {string | null}
 */
export function extractManagedBlock(content, startMarker, endMarker) {
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker);
  if (start < 0 || end < 0 || end < start) {
    return null;
  }
  return content.slice(start, end + endMarker.length);
}

/**
 * @param {string} content
 * @returns {string | null}
 */
export function extractSkillsMapBlock(content) {
  return extractManagedBlock(content, SKILLS_MAP_START, SKILLS_MAP_END);
}

/**
 * @param {string} content
 * @returns {string | null}
 */
export function extractGatesMapBlock(content) {
  return extractManagedBlock(content, GATES_MAP_START, GATES_MAP_END);
}

/**
 * Replace a managed block when present in `existing`, otherwise append it.
 *
 * @param {string} existing
 * @param {string} shippedBlock
 * @param {string} startMarker
 * @param {string} endMarker
 * @param {string} [appendHeading]
 * @returns {string}
 */
function mergeManagedBlock(
  existing,
  shippedBlock,
  startMarker,
  endMarker,
  appendHeading = "",
) {
  const existingBlock = extractManagedBlock(existing, startMarker, endMarker);
  if (existingBlock) {
    return existing.replace(existingBlock, shippedBlock);
  }

  if (appendHeading) {
    return `${existing.trimEnd()}\n\n${appendHeading}\n\n${shippedBlock}\n`;
  }

  return `${existing.trimEnd()}\n\n${shippedBlock}\n`;
}

/**
 * Merge shipped baseline into an existing rule file without wiping user prose.
 *
 * - Managed skills-map markers → replace only that block
 * - Legacy `# Harness Skills` section (no markers) → replace that section
 * - Fully custom file → append the managed skills map
 *
 * @param {string} existing
 * @param {string} shipped
 * @returns {string}
 */
export function mergeBaselineRule(existing, shipped) {
  const shippedSkills = extractSkillsMapBlock(shipped);
  const shippedGates = extractGatesMapBlock(shipped);
  if (!shippedSkills && !shippedGates) {
    return shipped;
  }

  let merged = existing;

  if (shippedSkills) {
    const skillsSection = /^# Harness Skills\b[\s\S]*?(?=^# |\Z)/m;
    if (
      !extractSkillsMapBlock(merged) &&
      skillsSection.test(merged) &&
      shipped.match(/^# Harness Skills\b[\s\S]*?(?=^# |\Z)/m)
    ) {
      const shippedSection = shipped.match(/^# Harness Skills\b[\s\S]*?(?=^# |\Z)/m);
      if (shippedSection) {
        merged = merged.replace(skillsSection, shippedSection[0]);
      }
    } else {
      merged = mergeManagedBlock(
        merged,
        shippedSkills,
        SKILLS_MAP_START,
        SKILLS_MAP_END,
        extractSkillsMapBlock(merged) ? "" : "# Harness Skills",
      );
    }
  }

  if (shippedGates) {
    merged = mergeManagedBlock(
      merged,
      shippedGates,
      GATES_MAP_START,
      GATES_MAP_END,
      extractGatesMapBlock(merged) ? "" : "# Deterministic Gates",
    );
  }

  return merged;
}

/**
 * Install Cursor project rules (.cursor/rules/*.mdc).
 * Creates missing files; refreshes the managed skills map on re-run while
 * preserving user customizations outside that block.
 *
 * @param {string} cwd
 * @param {{ fetchAsset: (remotePath: string, destPath: string) => Promise<void> }} options
 */
export async function installProjectRules(cwd, options) {
  const rulesDir = path.join(cwd, CURSOR_RULES_DIR);
  await ensureDir(rulesDir);

  for (const rule of RULE_ASSETS) {
    const destPath = path.join(rulesDir, rule.file);
    const tmpPath = path.join(rulesDir, `.${rule.file}.incoming`);

    try {
      await options.fetchAsset(rule.remotePath, tmpPath);
      const shipped = await fs.readFile(tmpPath, "utf8");

      let exists = false;
      try {
        await fs.access(destPath);
        exists = true;
      } catch (err) {
        if (err.code !== "ENOENT") {
          throw err;
        }
      }

      if (!exists) {
        await fs.rename(tmpPath, destPath);
        continue;
      }

      const existing = await fs.readFile(destPath, "utf8");
      const merged = mergeBaselineRule(existing, shipped);
      await fs.writeFile(destPath, merged, "utf8");
      await fs.rm(tmpPath, { force: true });
    } catch (err) {
      await fs.rm(tmpPath, { force: true }).catch(() => {});
      throw err;
    }
  }
}
