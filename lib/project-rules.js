import fs from "node:fs/promises";
import path from "node:path";

import {
  CURSOR_RULES_DIR,
  RULE_ASSETS,
  resolveAssetUrl,
} from "./constants.js";
import { downloadToFile } from "./download.js";
import { ensureDir } from "./fs-utils.js";

/**
 * Install Cursor project rules (.cursor/rules/*.mdc).
 * Create-if-not-exists to preserve user customizations on re-run.
 *
 * @param {string} cwd
 * @param {{ repoUrl?: string }} [options]
 */
export async function installProjectRules(cwd, options = {}) {
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

    const url = resolveAssetUrl(rule.remotePath, options.repoUrl);
    await downloadToFile(url, destPath);
  }
}
