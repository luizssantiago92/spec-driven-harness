import fs from "node:fs/promises";
import path from "node:path";

import { CURSOR_RULES_DIR, RULE_ASSETS } from "./constants.js";
import { ensureDir } from "./fs-utils.js";

/** Markers around the catalog skills table — refreshed on every install. */
export const SKILLS_MAP_START = "<!-- harness-managed:skills-map:start -->";
export const SKILLS_MAP_END = "<!-- harness-managed:skills-map:end -->";

/**
 * @param {string} content
 * @returns {string | null}
 */
export function extractSkillsMapBlock(content) {
  const start = content.indexOf(SKILLS_MAP_START);
  const end = content.indexOf(SKILLS_MAP_END);
  if (start < 0 || end < 0 || end < start) {
    return null;
  }
  return content.slice(start, end + SKILLS_MAP_END.length);
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
  const shippedBlock = extractSkillsMapBlock(shipped);
  if (!shippedBlock) {
    return shipped;
  }

  const existingBlock = extractSkillsMapBlock(existing);
  if (existingBlock) {
    return existing.replace(existingBlock, shippedBlock);
  }

  const skillsSection = /^# Harness Skills\b[\s\S]*?(?=^# |\Z)/m;
  if (skillsSection.test(existing)) {
    const shippedSection = shipped.match(/^# Harness Skills\b[\s\S]*?(?=^# |\Z)/m);
    if (shippedSection) {
      return existing.replace(skillsSection, shippedSection[0]);
    }
  }

  return `${existing.trimEnd()}\n\n# Harness Skills\n\n${shippedBlock}\n`;
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
