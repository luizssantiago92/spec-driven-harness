import path from "node:path";

import { SKILL_DIRS } from "./constants.js";

export function resolveTargetDirs(cwd) {
  return SKILL_DIRS.map((dir) => path.join(cwd, dir));
}

export function resolveSkillPath(cwd, skillDir) {
  return path.join(cwd, skillDir, "agent-architecture.md");
}
