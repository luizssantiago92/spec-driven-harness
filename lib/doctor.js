import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { NPX, SKILL_DIRS } from "./constants.js";
import { resolveScriptsDir } from "./gates.js";
import { readFileSafe } from "./fs-utils.js";
import { listFeatureIds } from "./specs-utils.js";

const execFileAsync = promisify(execFile);

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   weight: number,
 *   pass: boolean,
 *   suggest?: string,
 *   optional?: boolean,
 * }} DoctorCheck
 */

/**
 * @param {string} cwd
 * @param {string} relativePath
 * @returns {Promise<boolean>}
 */
async function pathExists(cwd, relativePath) {
  try {
    await fs.access(path.join(cwd, relativePath));
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} cwd
 * @returns {Promise<boolean>}
 */
async function pythonAvailable() {
  for (const bin of ["python3", "python"]) {
    try {
      const { stdout } = await execFileAsync(bin, ["--version"]);
      const match = stdout.match(/(\d+)\.(\d+)/);
      if (!match) {
        continue;
      }
      const major = Number(match[1]);
      const minor = Number(match[2]);
      if (major > 3 || (major === 3 && minor >= 10)) {
        return true;
      }
    } catch {
      // try next binary
    }
  }
  return false;
}

/**
 * @param {string} cwd
 * @returns {Promise<string | null>}
 */
async function readActiveFeature(cwd) {
  try {
    const state = await readFileSafe(path.join(cwd, ".specs/STATE.md"));
    const match = state.match(/^\s*[-*]\s*\*\*Active feature\*\*:\s*(.+)$/im);
    if (!match) {
      return null;
    }
    const value = match[1].trim();
    if (!value || /^none|idle|—|-$/i.test(value)) {
      return null;
    }
    return value.replace(/^`|`$/g, "");
  } catch {
    return null;
  }
}

/**
 * @param {string} cwd
 * @returns {Promise<DoctorCheck[]>}
 */
export async function runDoctorChecks(cwd) {
  /** @type {DoctorCheck[]} */
  const checks = [];

  const hubInstalled = (
    await Promise.all(
      SKILL_DIRS.map((dir) => pathExists(cwd, path.join(dir, "agent-architecture.md"))),
    )
  ).some(Boolean);

  checks.push({
    id: "skills-hub",
    label: "Agent hub skill (agent-architecture.md)",
    weight: 12,
    pass: hubInstalled,
    suggest: NPX("install"),
  });

  const scriptsDir = await resolveScriptsDir(cwd);
  const gatesDir = path.join(cwd, scriptsDir);
  let gatesPresent = false;
  try {
    const entries = await fs.readdir(gatesDir);
    gatesPresent = entries.some((name) => name.endsWith(".py"));
  } catch {
    gatesPresent = false;
  }

  checks.push({
    id: "gate-scripts",
    label: `Python gate scripts under ${scriptsDir}/`,
    weight: 15,
    pass: gatesPresent,
    suggest: NPX("install"),
  });

  const pythonOk = await pythonAvailable();
  checks.push({
    id: "python",
    label: "Python 3.10+ available for gates",
    weight: 8,
    pass: pythonOk,
    suggest: "Install Python 3.10+ or run gate checklists manually from skills/references/",
  });

  const specsScaffold =
    (await pathExists(cwd, ".specs/STATE.md")) &&
    (await pathExists(cwd, ".specs/features")) &&
    (await pathExists(cwd, ".specs/project"));

  checks.push({
    id: "specs-scaffold",
    label: ".specs/ memory scaffold (STATE, features/, project/)",
    weight: 10,
    pass: specsScaffold,
    suggest: NPX("install"),
  });

  checks.push({
    id: "config",
    label: ".specs/config.yaml project config",
    weight: 10,
    pass: await pathExists(cwd, ".specs/config.yaml"),
    suggest: NPX("init-config --preset default"),
  });

  checks.push({
    id: "baseline-rule",
    label: "engineering-baseline.mdc always-on rule",
    weight: 8,
    pass: await pathExists(cwd, ".cursor/rules/engineering-baseline.mdc"),
    suggest: NPX("install"),
  });

  const hasProjectMd = await pathExists(cwd, ".specs/project/PROJECT.md");
  checks.push({
    id: "project-context",
    label: "PROJECT.md brownfield context",
    weight: 10,
    pass: hasProjectMd,
    optional: true,
    suggest: NPX("project-init"),
  });

  const activeFeature = await readActiveFeature(cwd);
  let activeFeatureOk = true;
  let activeFeatureSuggest;

  if (activeFeature) {
    const features = await listFeatureIds(cwd);
    activeFeatureOk = features.includes(activeFeature);
    if (!activeFeatureOk) {
      activeFeatureSuggest = `Update .specs/STATE.md or run feature-init — "${activeFeature}" not found under .specs/features/`;
    }
  }

  checks.push({
    id: "state-feature",
    label: "STATE.md active feature matches .specs/features/",
    weight: 5,
    pass: activeFeatureOk,
    suggest: activeFeatureSuggest,
  });

  let gateSmoke = false;
  if (gatesPresent && pythonOk) {
    try {
      const script = path.join(cwd, scriptsDir, "check_commit.py");
      await execFileAsync("python3", [
        script,
        "--message",
        "chore(seatbelt): doctor smoke test",
      ], { cwd });
      gateSmoke = true;
    } catch {
      gateSmoke = false;
    }
  }

  checks.push({
    id: "gate-smoke",
    label: "check-commit gate runs",
    weight: 12,
    pass: gateSmoke,
    suggest: gatesPresent
      ? "Fix Python gate install or run: python3 .specs/seatbelt/scripts/check_commit.py --message \"test: smoke\""
      : NPX("install"),
  });

  if (activeFeature) {
    const featureDir = path.join(cwd, ".specs/features", activeFeature);
    const tasksPath = path.join(featureDir, "tasks.md");
    let taskCount = 0;
    let needsGraph = false;
    let hasGraph = false;

    try {
      const tasks = await readFileSafe(tasksPath);
      taskCount = (tasks.match(/^#{2,6}\s*T\d+/gim) ?? []).length;
      needsGraph = taskCount >= 3;
      hasGraph = await pathExists(cwd, path.join(".specs/features", activeFeature, "task-graph.md"));
    } catch {
      needsGraph = false;
    }

    if (needsGraph) {
      checks.push({
        id: "task-graph",
        label: `task-graph.md for active feature (${taskCount} tasks)`,
        weight: 10,
        pass: hasGraph,
        suggest: `Draw the DAG in .specs/features/${activeFeature}/task-graph.md (see task-graph-engineering.md)`,
      });
    }
  }

  return checks;
}

/**
 * Contextual Execute hint when the active feature has tasks.md.
 *
 * @param {string} cwd
 * @param {string | null} activeFeature
 * @returns {Promise<string | null>}
 */
export async function resolveExecuteHint(cwd, activeFeature) {
  if (!activeFeature) {
    return null;
  }

  const tasksPath = path.join(cwd, ".specs/features", activeFeature, "tasks.md");

  try {
    const tasks = await readFileSafe(tasksPath);
    const taskIds = tasks.match(/^#{2,6}\s*T\d+/gim) ?? [];
    if (taskIds.length === 0) {
      return null;
    }

    const completeCount = (tasks.match(/-\s*\[x\]\s*complete\b/gi) ?? []).length;
    if (completeCount >= taskIds.length) {
      return `${NPX(`validate-state ${activeFeature}`)} — tasks look complete; run Validate before /verify`;
    }

    return `${NPX(`loop-plan ${activeFeature}`)} — next Execute wave (then /loop in chat)`;
  } catch {
    return null;
  }
}

/**
 * @param {DoctorCheck[]} checks
 * @returns {number}
 */
export function scoreDoctorChecks(checks) {
  const scored = checks.filter((check) => !check.optional);
  const earned = scored.filter((check) => check.pass).reduce((sum, check) => sum + check.weight, 0);
  const total = scored.reduce((sum, check) => sum + check.weight, 0);
  if (total === 0) {
    return 0;
  }
  return Math.round((earned / total) * 100);
}

/**
 * @param {DoctorCheck[]} checks
 * @param {number} limit
 * @returns {DoctorCheck[]}
 */
export function topDoctorSuggestions(checks, limit = 3) {
  return checks.filter((check) => !check.pass && check.suggest).slice(0, limit);
}

/**
 * @param {string} cwd
 * @param {{ suggest?: boolean, json?: boolean }} [options]
 * @returns {Promise<{ score: number, checks: DoctorCheck[], suggestions: DoctorCheck[], executeHint: string | null }>}
 */
export async function doctor(cwd, options = {}) {
  const checks = await runDoctorChecks(cwd);
  const score = scoreDoctorChecks(checks);
  const suggestions = topDoctorSuggestions(checks);
  const activeFeature = await readActiveFeature(cwd);
  const executeHint = await resolveExecuteHint(cwd, activeFeature);

  if (options.json) {
    console.log(
      JSON.stringify({ score, checks, suggestions, executeHint }, null, 2),
    );
    return { score, checks, suggestions, executeHint };
  }

  console.log(`Seatbelt Ready: ${score}/100\n`);

  for (const check of checks) {
    const mark = check.pass ? "✓" : "✗";
    const optional = check.optional ? " (optional)" : "";
    console.log(`${mark} ${check.label}${optional}`);
    if (!check.pass && check.suggest && options.suggest !== false) {
      console.log(`  → ${check.suggest}`);
    }
  }

  if (suggestions.length > 0) {
    console.log("\nTop next actions:");
    suggestions.forEach((check, index) => {
      console.log(`${index + 1}. ${check.suggest}`);
    });
  }

  if (executeHint) {
    console.log(`\nExecute hint:\n  → ${executeHint}`);
  }

  return { score, checks, suggestions, executeHint };
}
