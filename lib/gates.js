import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import path from "node:path";

import { HARNESS_SCRIPTS_DIR, NPX } from "./constants.js";

const PYTHON_CANDIDATES = ["python3", "python"];

const GATE_SCRIPTS = {
  "validate-spec": "validate_spec.py",
  "validate-tasks": "validate_tasks.py",
  "validate-state": "validate_state.py",
  "analyze-artifacts": "analyze_artifacts.py",
  "check-commit": "check_commit.py",
  lessons: "lessons.py",
};

export const GATE_COMMANDS = Object.keys(GATE_SCRIPTS);

/**
 * @param {string} command
 * @param {string[]} args
 * @returns {Promise<number>}
 */
function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio ?? "inherit",
      ...(options.cwd ? { cwd: options.cwd } : {}),
    });
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
}

/**
 * Resolve the available Python interpreter, or null when none is installed.
 * @returns {Promise<string | null>}
 */
export async function resolvePython() {
  for (const candidate of PYTHON_CANDIDATES) {
    try {
      const code = await run(candidate, ["--version"], { stdio: "ignore" });
      if (code === 0) {
        return candidate;
      }
    } catch {
      // Interpreter not on PATH; try the next candidate.
    }
  }

  return null;
}

/** @returns {Promise<boolean>} */
export async function hasPython() {
  return (await resolvePython()) !== null;
}

/**
 * Run a structural gate script installed under .specs/harness/scripts/.
 *
 * @param {string} gate one of GATE_COMMANDS
 * @param {string[]} args forwarded to the Python script
 * @param {{ cwd?: string, stdio?: import("node:child_process").StdioOptions }} [options]
 * @returns {Promise<number>} process exit code
 */
export async function runGate(gate, args, options = {}) {
  const scriptName = GATE_SCRIPTS[gate];

  if (!scriptName) {
    throw new Error(`Unknown gate: ${gate}`);
  }

  const cwd = options.cwd ?? process.cwd();
  const scriptPath = path.join(cwd, HARNESS_SCRIPTS_DIR, scriptName);

  for (const required of [scriptName, "_common.py"]) {
    try {
      await access(path.join(cwd, HARNESS_SCRIPTS_DIR, required), constants.R_OK);
    } catch {
      throw new Error(
        `Gate script not found at ${path.join(HARNESS_SCRIPTS_DIR, required)}. ` +
          `Run \`${NPX("install")}\` in this project first.`,
      );
    }
  }

  const python = await resolvePython();

  if (!python) {
    throw new Error(
      "Python 3 not found. Install Python 3.10+ to run structural gates, " +
        "or perform the equivalent checks manually (degraded mode).",
    );
  }

  return run(python, [scriptPath, ...args], {
    cwd,
    stdio: options.stdio,
  });
}
