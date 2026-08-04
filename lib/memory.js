import path from "node:path";

import {
  LESSONS_HEADER,
  STATE_HEADER,
} from "./constants.js";
import { ensureDir, writeFileIfMissing } from "./fs-utils.js";

export async function initMemoryHarness(cwd) {
  const specsDir = path.join(cwd, ".specs");
  const featuresDir = path.join(specsDir, "features");

  await ensureDir(featuresDir);

  const stateCreated = await writeFileIfMissing(
    path.join(specsDir, "STATE.md"),
    STATE_HEADER,
  );
  const lessonsCreated = await writeFileIfMissing(
    path.join(specsDir, "LESSONS.md"),
    LESSONS_HEADER,
  );

  return { stateCreated, lessonsCreated };
}
