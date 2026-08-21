#!/usr/bin/env node

import { archiveFeature } from "./lib/archive.js";
import { PACKAGE_VERSION } from "./lib/constants.js";
import { phaseContext } from "./lib/config.js";
import { featureInit } from "./lib/feature.js";
import { GATE_COMMANDS, runGate } from "./lib/gates.js";
import { install } from "./lib/install.js";
import {
  initProjectConfig,
  listPresets,
  loadPresetText,
} from "./lib/presets.js";

const USAGE = `Usage: agentic-harness <command> [args]

Commands:
  install                            Install skills, references, gates and .specs/ memory
    [--preset <name>]                Seed .specs/config.yaml from a built-in preset
    [--force-config]                 Replace existing config.yaml when using --preset
  init-config [--preset <name>]      Create .specs/config.yaml (default preset: default)
    [--force]                        Replace existing config.yaml
  preset list                        List built-in config presets
  preset show <name>                 Print a preset YAML file
  feature-init "<description>"       Allocate NNN-slug feature, STATE, local branch (Tier 0)
    [--no-branch]                    Skip git checkout -b
    [--no-spec]                      Skip spec.md stub
  archive-feature [feature]          Fold verified feature into ROADMAP + domain spec; reset STATE
    [--domain <slug>]                Domain folder under .specs/domains/ (default: feature slug)
    [--skip-verify]                  Skip validate-state (tests / recovery only)
    [--no-roadmap]                   Skip ROADMAP update
    [--no-domain]                    Skip domain spec merge
    [--no-state]                     Skip STATE reset
  phase-context <phase>              Print .specs/config.yaml context + rules for a phase
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
    const installOptions = {};
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === "--preset") {
        installOptions.preset = args[++i];
        if (!installOptions.preset) {
          throw new Error("--preset requires a name. Run preset list.");
        }
      } else if (arg === "--force-config") {
        installOptions.forceConfig = true;
      } else {
        throw new Error(`Unknown install flag: ${arg}`);
      }
    }

    await install(installOptions);
    console.log("✨ Setup complete. Your agent now runs on a spec-driven harness.");
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
} else if (command === "init-config") {
  try {
    let preset = "default";
    let force = false;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === "--preset") {
        preset = args[++i];
        if (!preset) {
          throw new Error("--preset requires a name. Run preset list.");
        }
      } else if (arg === "--force") {
        force = true;
      } else {
        throw new Error(`Unknown init-config flag: ${arg}`);
      }
    }

    const result = await initProjectConfig({ preset, force });
    if (result.skipped) {
      console.log(`ℹ️  ${result.path} already exists — kept your file (use --force to replace)`);
    } else if (result.updated) {
      console.log(`✅ ${result.path} replaced from preset: ${result.preset}`);
    } else {
      console.log(`✅ ${result.path} created from preset: ${result.preset}`);
    }
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
} else if (command === "preset") {
  try {
    const sub = args[0];
    if (sub === "list") {
      const presets = await listPresets();
      console.log("Built-in presets:");
      for (const name of presets) {
        console.log(`  ${name}`);
      }
    } else if (sub === "show") {
      const name = args[1];
      if (!name) {
        throw new Error("Preset name required. Example: preset show node-ts");
      }
      process.stdout.write(await loadPresetText(name));
    } else {
      throw new Error("Usage: preset list | preset show <name>");
    }
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
} else if (command === "archive-feature") {
  try {
    const archiveOptions = {
      skipVerify: false,
      skipRoadmap: false,
      skipDomainMerge: false,
      skipState: false,
    };
    const positional = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === "--skip-verify") {
        archiveOptions.skipVerify = true;
      } else if (arg === "--no-roadmap") {
        archiveOptions.skipRoadmap = true;
      } else if (arg === "--no-domain") {
        archiveOptions.skipDomainMerge = true;
      } else if (arg === "--no-state") {
        archiveOptions.skipState = true;
      } else if (arg === "--domain") {
        archiveOptions.domain = args[++i];
        if (!archiveOptions.domain) {
          throw new Error("--domain requires a slug argument.");
        }
      } else {
        positional.push(arg);
      }
    }

    const result = await archiveFeature(positional[0], archiveOptions);

    console.log(`✅ Archived ${result.featureId}`);
    if (result.roadmapPath) {
      console.log(`   ROADMAP: ${result.roadmapPath}${result.roadmapUpdated ? " (updated)" : ""}`);
    }
    if (result.domainPath) {
      console.log(`   Domain: ${result.domainPath}`);
      if (result.mergeSummary.length) {
        console.log(`   Merge: ${result.mergeSummary.join(", ")}`);
      }
    }
    if (result.stateReset) {
      console.log("   STATE: reset for next feature");
    }
    console.log("   Tier 0 — commit archive updates locally; push needs owner go-ahead.");
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
} else if (command === "phase-context") {
  try {
    const phase = args[0];
    if (!phase) {
      throw new Error("Phase is required. Example: phase-context specify");
    }
    const output = await phaseContext(phase);
    process.stdout.write(output);
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
