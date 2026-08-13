#!/usr/bin/env node

import { GATE_COMMANDS, runGate } from "./lib/gates.js";
import { install } from "./lib/install.js";

const USAGE = `Usage: agentic-harness <command> [args]

Commands:
  install                            Install skills, references, gates and .specs/ memory
  validate-spec [spec.md|feature]    Closure gate for a feature spec
  validate-tasks [tasks.md|feature]  Granularity gate for a task breakdown
  validate-state [feature]           Completion gate before declaring a feature done
  check-commit --message "<msg>"     Conventional Commits gate
  lessons <add|list|penalize|prune|status>  Lessons engine
`;

const [, , command, ...args] = process.argv;

if (command === "install") {
  try {
    await install();
    console.log("✨ Setup complete. Your agent now runs on a spec-driven harness.");
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
} else if (GATE_COMMANDS.includes(command)) {
  try {
    const code = await runGate(command, args);
    process.exit(code);
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(2);
  }
} else {
  console.error(USAGE);
  process.exit(1);
}
