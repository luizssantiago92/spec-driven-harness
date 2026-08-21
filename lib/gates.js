import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import path from "node:path";

import {
  LEGACY_SCRIPTS_DIR,
  NPX,
  SEATBELT_SCRIPTS_DIR,
} from "./constants.js";

const PYTHON_CANDIDATES = ["python3", "python"];

const GATE_SCRIPTS = {
  "validate-spec": "validate_spec.py",
  "validate-tasks": "validate_tasks.py",
  "validate-state": "validate_state.py",
  "analyze-artifacts": "analyze_artifacts.py",
  "check-commit": "check_commit.py",
  lessons: "lessons.py",
};

const AUX_SCRIPTS = {
  "loop-plan": "loop_plan.py",
};

const SEATBELT_SCRIPTS = { ...GATE_SCRIPTS, ...AUX_SCRIPTS };

export const GATE_COMMANDS = Object.keys(GATE_SCRIPTS);

export const AUX_COMMANDS = Object.keys(AUX_SCRIPTS);

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
 * Resolve gate scripts directory — prefer `.specs/seatbelt/scripts`, fall back to legacy harness path.
 *
 * @param {string} cwd
 * @returns {Promise<string>}
 */
export async function resolveScriptsDir(cwd) {
  for (const dir of [SEATBELT_SCRIPTS_DIR, LEGACY_SCRIPTS_DIR]) {
    try {
      await access(path.join(cwd, dir, "_common.py"), constants.R_OK);
      return dir;
    } catch {
      // try next candidate
    }
  }

  return SEATBELT_SCRIPTS_DIR;
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
 * Run a seatbelt Python script installed under `.specs/seatbelt/scripts/` (or legacy path).
 *
 * @param {string} command gate or aux command name
 * @param {string[]} args forwarded to the Python script
 * @param {{ cwd?: string, stdio?: import("node:child_process").StdioOptions }} [options]
 * @returns {Promise<number>} process exit code
 */
export async function runSeatbeltScript(command, args, options = {}) {
  const scriptName = SEATBELT_SCRIPTS[command];

  if (!scriptName) {
    throw new Error(`Unknown seatbelt command: ${command}`);
  }

  const cwd = options.cwd ?? process.cwd();
  const scriptsDir = await resolveScriptsDir(cwd);
  const scriptPath = path.join(cwd, scriptsDir, scriptName);

  for (const required of [scriptName, "_common.py"]) {
    try {
      await access(path.join(cwd, scriptsDir, required), constants.R_OK);
    } catch {
      throw new Error(
        `Seatbelt script not found at ${path.join(scriptsDir, required)}. ` +
          `Run \`${NPX("install")}\` in this project first.`,
      );
    }
  }

  const python = await resolvePython();

  if (!python) {
    throw new Error(
      "Python 3 not found. Install Python 3.10+ to run seatbelt scripts, " +
        "or perform the equivalent checks manually (degraded mode).",
    );
  }

  return run(python, [scriptPath, ...args], {
    cwd,
    stdio: options.stdio,
  });
}

/**
 * Run a structural gate script installed under `.specs/seatbelt/scripts/`.
 *
 * @param {string} gate one of GATE_COMMANDS
 * @param {string[]} args forwarded to the Python script
 * @param {{ cwd?: string, stdio?: import("node:child_process").StdioOptions }} [options]
 * @returns {Promise<number>} process exit code
 */
export async function runGate(gate, args, options = {}) {
  if (!GATE_SCRIPTS[gate]) {
    throw new Error(`Unknown gate: ${gate}`);
  }

  return runSeatbeltScript(gate, args, options);
}
