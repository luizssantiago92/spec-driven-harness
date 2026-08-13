import path from "node:path";

import {
  CURSORRULES_BLOCK,
  CURSORRULES_MARKER_BEGIN,
  CURSORRULES_MARKER_END,
} from "./constants.js";
import {
  appendFileSafe,
  readFileSafe,
  writeFileSafe,
} from "./fs-utils.js";

function extractHarnessBlock(content) {
  const start = content.indexOf(CURSORRULES_MARKER_BEGIN);
  const end = content.indexOf(CURSORRULES_MARKER_END);

  if (start === -1 || end === -1 || end < start) {
    return null;
  }

  return content.slice(start, end + CURSORRULES_MARKER_END.length);
}

function replaceHarnessBlock(content) {
  const start = content.indexOf(CURSORRULES_MARKER_BEGIN);
  const end = content.indexOf(CURSORRULES_MARKER_END);

  if (start === -1 || end === -1 || end < start) {
    return null;
  }

  // Only the harness block is rewritten. Whitespace the user chose elsewhere in
  // the file is left exactly as it was.
  const before = content.slice(0, start);
  const after = content.slice(end + CURSORRULES_MARKER_END.length);
  const trimmedBlock = `${CURSORRULES_BLOCK.trim()}\n`;

  return `${before}${trimmedBlock}${after.replace(/^\n+/, "")}`;
}

export async function injectCursorRules(cwd) {
  const rulesPath = path.join(cwd, ".cursorrules");
  const expectedBlock = CURSORRULES_BLOCK.trim();

  try {
    const existing = await readFileSafe(rulesPath);
    const currentBlock = extractHarnessBlock(existing);

    if (currentBlock) {
      if (currentBlock.trim() === expectedBlock) {
        return { created: false, updated: false };
      }

      const replaced = replaceHarnessBlock(existing);
      if (replaced === null) {
        throw new Error(`Failed to upgrade harness block in ${rulesPath}`);
      }

      await writeFileSafe(rulesPath, replaced.endsWith("\n") ? replaced : `${replaced}\n`);
      return { created: false, updated: true };
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
