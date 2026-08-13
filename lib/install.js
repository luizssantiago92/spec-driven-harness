import fs from "node:fs/promises";
import path from "node:path";

import {
  FALLBACK_REPO_URL,
  HARNESS_SCRIPTS_DIR,
  PINNED_REF,
  REFERENCE_ASSETS,
  REFERENCES_SUBDIR,
  SCRIPT_ASSETS,
  SKILL_ASSETS,
  SKILL_DIRS,
  resolveAssetOverride,
  resolveAssetUrl,
} from "./constants.js";
import { injectCursorRules } from "./cursorrules.js";
import { downloadToFile } from "./download.js";
import { ensureDir } from "./fs-utils.js";
import { hasPython } from "./gates.js";
import { initMemoryHarness } from "./memory.js";
import { installProjectRules } from "./project-rules.js";

/**
 * Fetch one asset from the pinned release tag, falling back to the default
 * branch only while a freshly published version has no tag yet.
 *
 * @param {{ remotePath: string, destPath: string, repoUrl?: string, state: { warned: boolean }, log: (msg: string) => void }} params
 */
async function downloadAsset({ remotePath, destPath, repoUrl, state, log }) {
  try {
    await downloadToFile(resolveAssetUrl(remotePath, repoUrl), destPath);
    return;
  } catch (err) {
    const missingPinnedAsset =
      !repoUrl && /Download failed: 404/.test(err.message);

    if (!missingPinnedAsset) {
      throw err;
    }

    if (!state.warned) {
      state.warned = true;
      log(
        `⚠️  Tag ${PINNED_REF} has no published assets yet — ` +
          "falling back to the default branch.",
      );
    }
  }

  await downloadToFile(
    resolveAssetUrl(remotePath, FALLBACK_REPO_URL),
    destPath,
  );
}

/**
 * @param {{ cwd?: string, repoUrl?: string, silent?: boolean }} [options]
 */
export async function install(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const log = options.silent ? () => {} : console.log;
  const override = options.repoUrl ?? resolveAssetOverride();
  const state = { warned: false };

  if (!options.repoUrl && override) {
    log(
      `⚠️  HARNESS_REPO_URL is set — installing skills and executable gate ` +
        `scripts from ${override} instead of the official repository.`,
    );
  }

  const fetchAsset = (remotePath, destPath) =>
    downloadAsset({ remotePath, destPath, repoUrl: override, state, log });

  log("🚀 Installing the Spec-Driven Harness...");

  for (const skill of SKILL_ASSETS) {
    log(`📦 Installing skill: ${skill.file}`);

    for (const dir of SKILL_DIRS) {
      const targetDir = path.join(cwd, dir);
      await ensureDir(targetDir);
      await fetchAsset(skill.remotePath, path.join(targetDir, skill.file));
      log(`✅ ${skill.file} → ${dir}`);
    }
  }

  log("📚 Installing phase references...");
  for (const reference of REFERENCE_ASSETS) {
    for (const dir of SKILL_DIRS) {
      const targetDir = path.join(cwd, dir, REFERENCES_SUBDIR);
      await ensureDir(targetDir);
      await fetchAsset(
        reference.remotePath,
        path.join(targetDir, reference.file),
      );
    }
  }
  log(`✅ ${REFERENCE_ASSETS.length} references → ${REFERENCES_SUBDIR}/`);

  log("🔒 Installing deterministic gates (Python)...");
  const scriptsDir = path.join(cwd, HARNESS_SCRIPTS_DIR);
  await ensureDir(scriptsDir);

  for (const script of SCRIPT_ASSETS) {
    const destPath = path.join(scriptsDir, script.file);
    await fetchAsset(script.remotePath, destPath);

    try {
      await fs.chmod(destPath, 0o755);
    } catch (err) {
      log(
        `⚠️  Could not mark ${script.file} as executable (${err.code ?? err.message}). ` +
          "Run it with `python3 <script>` instead.",
      );
    }
  }
  log(`✅ ${SCRIPT_ASSETS.length} scripts → ${HARNESS_SCRIPTS_DIR}`);

  log("📋 Installing project rules (.cursor/rules/)...");
  await installProjectRules(cwd, { fetchAsset });

  log("🧠 Setting up persistent memory in .specs/...");
  const { stateCreated, lessonsCreated } = await initMemoryHarness(cwd);

  if (stateCreated) {
    log("✅ STATE.md initialized [feed forward]");
  }

  if (lessonsCreated) {
    log("✅ LESSONS.md initialized [feedback loop]");
  }

  await injectCursorRules(cwd);

  const pythonAvailable = await hasPython();
  if (!pythonAvailable) {
    log(
      "⚠️  Python 3 not found. Skills still work in degraded mode " +
        "(manual checks). Install Python 3.10+ to enable the gates.",
    );
  }

  return { pythonAvailable };
}
