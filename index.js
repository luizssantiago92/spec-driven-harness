#!/usr/bin/env node

import { PACKAGE_VERSION } from "./lib/constants.js";
import { featureInit } from "./lib/feature.js";
import { GATE_COMMANDS, runGate } from "./lib/gates.js";
import { install } from "./lib/install.js";

const USAGE = `Usage: agentic-harness <command> [args]

Commands:
  install                            Install skills, references, gates and .specs/ memory
  feature-init "<description>"       Allocate NNN-slug feature, STATE, local branch (Tier 0)
    [--no-branch]                    Skip git checkout -b
    [--no-spec]                      Skip spec.md stub
  validate-spec [spec.md|feature]    Closure gate for a feature spec
  analyze-artifacts [feature]        Cross-artifact consistency before task approval
  validate-tasks [tasks.md|feature]  Granularity gate for a task breakdown
  validate-state [feature]           Completion gate before declaring a feature done
  check-commit --message "<msg>"     Conventional Commits gate
  lessons <add|list|penalize|prune|status>  Lessons engine
  --help                             Show this message
  --version                          Print the package version
`;

const [, , command, ...args] = process.argv;

if (command === "--version" || command === "-v" || command === "version") {
  console.log(PACKAGE_VERSION);
  process.exit(0);
} else if (!command || command === "--help" || command === "-h" || command === "help") {
  const out = command ? console.log : console.error;
  out(USAGE);
  process.exit(command ? 0 : 1);
} else if (command === "install") {
  try {
    await install();
    console.log("✨ Setup complete. Your agent now runs on a spec-driven harness.");
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
} else if (command === "feature-init") {
  try {
    const descriptionParts = [];
    const initOptions = { skipBranch: false, skipSpec: false };

    for (const arg of args) {
      if (arg === "--no-branch") {
        initOptions.skipBranch = true;
      } else if (arg === "--no-spec") {
        initOptions.skipSpec = true;
      } else {
        descriptionParts.push(arg);
      }
    }

    const description = descriptionParts.join(" ").trim();
    const result = await featureInit(description, initOptions);

    console.log(`✅ Feature ${result.featureId}`);
    console.log(`   Directory: ${result.featureDir}`);
    console.log(`   Branch: ${result.branchName}`);
    console.log(`   Git: ${result.branchMessage}`);
    console.log("   Tier 0 complete — draft spec.md, then run validate-spec.");
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
