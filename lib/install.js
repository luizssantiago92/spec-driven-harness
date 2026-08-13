import fs from "node:fs/promises";
import path from "node:path";

import {
  HARNESS_SCRIPTS_DIR,
  REFERENCE_ASSETS,
  REFERENCES_SUBDIR,
  SCRIPT_ASSETS,
  SKILL_ASSETS,
  SKILL_DIRS,
  resolveAssetUrl,
} from "./constants.js";
import { injectCursorRules } from "./cursorrules.js";
import { downloadToFile } from "./download.js";
import { ensureDir } from "./fs-utils.js";
import { hasPython } from "./gates.js";
import { initMemoryHarness } from "./memory.js";
import { installProjectRules } from "./project-rules.js";

/**
 * @param {{ cwd?: string, repoUrl?: string, skillUrl?: string, silent?: boolean }} [options]
 */
export async function install(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const repoUrl =
    options.repoUrl ??
    (options.skillUrl
      ? options.skillUrl.replace(/\/skills\/agent-architecture\.md$/, "")
      : undefined);
  const log = options.silent ? () => {} : console.log;

  log("🚀 Instalando o Harness de Arquitetura Agêntica...");

  for (const skill of SKILL_ASSETS) {
    const url = resolveAssetUrl(skill.remotePath, repoUrl);
    log(`📦 Instalando skill: ${skill.file}`);

    for (const dir of SKILL_DIRS) {
      const targetDir = path.join(cwd, dir);
      await ensureDir(targetDir);
      await downloadToFile(url, path.join(targetDir, skill.file));
      log(`✅ ${skill.file} → ${dir}`);
    }
  }

  log("📚 Instalando references de fase...");
  for (const reference of REFERENCE_ASSETS) {
    const url = resolveAssetUrl(reference.remotePath, repoUrl);

    for (const dir of SKILL_DIRS) {
      const targetDir = path.join(cwd, dir, REFERENCES_SUBDIR);
      await ensureDir(targetDir);
      await downloadToFile(url, path.join(targetDir, reference.file));
    }
  }
  log(`✅ ${REFERENCE_ASSETS.length} references → ${REFERENCES_SUBDIR}/`);

  log("🔒 Instalando gates determinísticos (Python)...");
  const scriptsDir = path.join(cwd, HARNESS_SCRIPTS_DIR);
  await ensureDir(scriptsDir);

  for (const script of SCRIPT_ASSETS) {
    const url = resolveAssetUrl(script.remotePath, repoUrl);
    const destPath = path.join(scriptsDir, script.file);
    await downloadToFile(url, destPath);
    await fs.chmod(destPath, 0o755).catch(() => {});
  }
  log(`✅ ${SCRIPT_ASSETS.length} scripts → ${HARNESS_SCRIPTS_DIR}`);

  log("📋 Configurando regras do projeto (.cursor/rules/)...");
  await installProjectRules(cwd, { repoUrl });

  log("🧠 Configurando persistência em .specs/...");
  const { stateCreated, lessonsCreated } = await initMemoryHarness(cwd);

  if (stateCreated) {
    log("✅ Arquivo STATE.md inicializado [Feed Forward]");
  }

  if (lessonsCreated) {
    log("✅ Arquivo LESSONS.md inicializado [Feedback Loop]");
  }

  await injectCursorRules(cwd);

  const pythonAvailable = await hasPython();
  if (!pythonAvailable) {
    log(
      "⚠️  Python 3 não encontrado. As skills funcionam em modo degradado " +
        "(checagens manuais). Instale Python 3.10+ para ativar os gates.",
    );
  }

  return { pythonAvailable };
}
