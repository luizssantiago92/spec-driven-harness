import path from "node:path";

import {
  CURSORRULES_BLOCK,
  CURSORRULES_MARKER_BEGIN,
} from "./constants.js";
import {
  appendFileSafe,
  readFileSafe,
  writeFileSafe,
} from "./fs-utils.js";

export async function injectCursorRules(cwd) {
  const rulesPath = path.join(cwd, ".cursorrules");

  try {
    const existing = await readFileSafe(rulesPath);
    if (existing.includes(CURSORRULES_MARKER_BEGIN)) {
      return { created: false, updated: false };
    }

    const separator = existing.endsWith("\n") ? "\n" : "\n\n";
    await appendFileSafe(rulesPath, `${separator}${CURSORRULES_BLOCK}\n`);
    return { created: false, updated: true };
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  await writeFileSafe(rulesPath, `${CURSORRULES_BLOCK}\n`);
  return { created: true, updated: false };
}
