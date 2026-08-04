import path from "node:path";

import {
  resolveSkillUrl,
  SKILL_DIRS,
  SKILL_FILENAME,
} from "./constants.js";
import { injectCursorRules } from "./cursorrules.js";
import { downloadToFile } from "./download.js";
import { ensureDir } from "./fs-utils.js";
import { initMemoryHarness } from "./memory.js";

/**
 * @param {{ cwd?: string, skillUrl?: string, silent?: boolean }} [options]
 */
export async function install(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const skillUrl = options.skillUrl ?? resolveSkillUrl();
  const log = options.silent ? () => {} : console.log;

  log("🚀 Instalando o Harness de Arquitetura Agêntica...");

  for (const dir of SKILL_DIRS) {
    const targetDir = path.join(cwd, dir);
    log(`📂 Configurando diretório: ${dir}`);
    await ensureDir(targetDir);
    await downloadToFile(skillUrl, path.join(targetDir, SKILL_FILENAME));
    log(`✅ Skill instalada em ${dir}`);
  }

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
