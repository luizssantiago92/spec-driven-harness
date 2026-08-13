import fs from "node:fs/promises";
import path from "node:path";

import { CURSOR_RULES_DIR, RULE_ASSETS } from "./constants.js";
import { ensureDir } from "./fs-utils.js";

/**
 * Install Cursor project rules (.cursor/rules/*.mdc).
 * Create-if-not-exists to preserve user customizations on re-run.
 *
 * @param {string} cwd
 * @param {{ fetchAsset: (remotePath: string, destPath: string) => Promise<void> }} options
 */
export async function installProjectRules(cwd, options) {
  const rulesDir = path.join(cwd, CURSOR_RULES_DIR);
  await ensureDir(rulesDir);

  for (const rule of RULE_ASSETS) {
    const destPath = path.join(rulesDir, rule.file);

    try {
      await fs.access(destPath);
      continue;
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }

    await options.fetchAsset(rule.remotePath, destPath);
  }
}
