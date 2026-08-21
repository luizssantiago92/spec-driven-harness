import path from "node:path";

import {
  LESSONS_HEADER,
  STATE_HEADER,
} from "./constants.js";
import { ensureDir, writeFileIfMissing } from "./fs-utils.js";

const CONFIG_EXAMPLE = `# Project harness config (optional). Copy to .specs/config.yaml and edit.

schema: spec-driven

context: |
  Tech stack: (fill in)
  Test command: npm test
  Branch prefix: feat

rules:
  specify:
    - Prefer EARS acceptance criteria
`;

export async function initMemoryHarness(cwd) {
  const specsDir = path.join(cwd, ".specs");
  const featuresDir = path.join(specsDir, "features");
  const projectDir = path.join(specsDir, "project");
  const domainsDir = path.join(specsDir, "domains");

  await ensureDir(featuresDir);
  await ensureDir(projectDir);
  await ensureDir(domainsDir);

  const stateCreated = await writeFileIfMissing(
    path.join(specsDir, "STATE.md"),
    STATE_HEADER,
  );
  const lessonsCreated = await writeFileIfMissing(
    path.join(specsDir, "LESSONS.md"),
    LESSONS_HEADER,
  );
  await writeFileIfMissing(
    path.join(specsDir, "config.yaml.example"),
    CONFIG_EXAMPLE,
  );

  return { stateCreated, lessonsCreated };
}
