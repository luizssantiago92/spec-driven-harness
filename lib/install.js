import path from "node:path";

import { SKILL_ASSETS, SKILL_DIRS, resolveAssetUrl } from "./constants.js";
import { injectCursorRules } from "./cursorrules.js";
import { downloadToFile } from "./download.js";
import { ensureDir } from "./fs-utils.js";
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
}
