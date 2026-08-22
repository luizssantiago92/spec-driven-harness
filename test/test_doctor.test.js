import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  doctor,
  resolveExecuteHint,
  runDoctorChecks,
  scoreDoctorChecks,
  topDoctorSuggestions,
} from "../lib/doctor.js";

async function createTempDir(prefix) {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("guardrails doctor", () => {
  it("scores installed scaffold highly", async () => {
    const cwd = await createTempDir("doctor-good-");
    await fs.mkdir(path.join(cwd, ".specs/features"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".specs/project"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".specs/guardrails/scripts"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".cursor/skills"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".cursor/rules"), { recursive: true });
    await fs.writeFile(path.join(cwd, ".specs/STATE.md"), "# State\n\n- **Active feature**: none\n");
    await fs.writeFile(path.join(cwd, ".specs/config.yaml"), "schema: spec-driven\n");
    await fs.writeFile(path.join(cwd, ".cursor/skills/agent-architecture.md"), "# Hub\n");
    await fs.writeFile(path.join(cwd, ".cursor/rules/engineering-baseline.mdc"), "---\n");
    await fs.copyFile(
      path.join(process.cwd(), "scripts/check_commit.py"),
      path.join(cwd, ".specs/guardrails/scripts/check_commit.py"),
    );

    const checks = await runDoctorChecks(cwd);
    const score = scoreDoctorChecks(checks);
    assert.ok(score >= 80);
    assert.equal(
      checks.find((check) => check.id === "skills-hub")?.pass,
      true,
    );
  });

  it("flags missing config and suggests init-config", async () => {
    const cwd = await createTempDir("doctor-config-");
    await fs.mkdir(path.join(cwd, ".specs/features"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".specs/project"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".specs/guardrails/scripts"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".cursor/skills"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".cursor/rules"), { recursive: true });
    await fs.writeFile(path.join(cwd, ".specs/STATE.md"), "# State\n\n- **Active feature**: none\n");
    await fs.writeFile(path.join(cwd, ".cursor/skills/agent-architecture.md"), "# Hub\n");
    await fs.writeFile(path.join(cwd, ".cursor/rules/engineering-baseline.mdc"), "---\n");

    const checks = await runDoctorChecks(cwd);
    const config = checks.find((check) => check.id === "config");
    assert.equal(config?.pass, false);
    assert.match(config?.suggest ?? "", /init-config/);
  });

  it("requires task-graph.md when active feature has 3+ tasks", async () => {
    const cwd = await createTempDir("doctor-graph-");
    const feature = "001-auth";
    const featureDir = path.join(cwd, ".specs/features", feature);
    await fs.mkdir(featureDir, { recursive: true });
    await fs.mkdir(path.join(cwd, ".specs/project"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".specs/guardrails/scripts"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".cursor/skills"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".cursor/rules"), { recursive: true });
    await fs.writeFile(
      path.join(cwd, ".specs/STATE.md"),
      `# State\n\n- **Active feature**: ${feature}\n`,
    );
    await fs.writeFile(path.join(cwd, ".specs/config.yaml"), "schema: spec-driven\n");
    await fs.writeFile(path.join(cwd, ".cursor/skills/agent-architecture.md"), "# Hub\n");
    await fs.writeFile(path.join(cwd, ".cursor/rules/engineering-baseline.mdc"), "---\n");
    await fs.writeFile(
      path.join(featureDir, "tasks.md"),
      "# Tasks\n\n## T1: one\n\n## T2: two\n\n## T3: three\n",
    );

    const checks = await runDoctorChecks(cwd);
    const graph = checks.find((check) => check.id === "task-graph");
    assert.equal(graph?.pass, false);
    assert.match(graph?.suggest ?? "", /task-graph\.md/);
  });

  it("topDoctorSuggestions returns failed checks with remedies", () => {
    const suggestions = topDoctorSuggestions([
      { id: "a", label: "a", weight: 1, pass: true },
      { id: "b", label: "b", weight: 1, pass: false, suggest: "fix b" },
      { id: "c", label: "c", weight: 1, pass: false, suggest: "fix c" },
    ]);
    assert.deepEqual(suggestions.map((item) => item.id), ["b", "c"]);
  });

  it("suggests loop-plan when active feature has incomplete tasks", async () => {
    const cwd = await createTempDir("doctor-loop-plan-");
    const feature = "001-auth";
    const featureDir = path.join(cwd, ".specs/features", feature);
    await fs.mkdir(featureDir, { recursive: true });
    await fs.writeFile(
      path.join(cwd, ".specs/STATE.md"),
      `# State\n\n- **Active feature**: ${feature}\n`,
    );
    await fs.writeFile(
      path.join(featureDir, "tasks.md"),
      "# Tasks\n\n## T1: login form\n\nDepends on: —\n\n## T2: session API\n\nDepends on: T1\n",
    );

    const hint = await resolveExecuteHint(cwd, feature);
    assert.match(hint ?? "", /loop-plan/);
    assert.match(hint ?? "", /001-auth/);
  });

  it("suggests validate-state when all tasks are complete", async () => {
    const cwd = await createTempDir("doctor-validate-state-");
    const feature = "002-export";
    const featureDir = path.join(cwd, ".specs/features", feature);
    await fs.mkdir(featureDir, { recursive: true });
    await fs.writeFile(
      path.join(featureDir, "tasks.md"),
      "# Tasks\n\n## T1: csv endpoint\n\n- [x] complete\n",
    );

    const hint = await resolveExecuteHint(cwd, feature);
    assert.match(hint ?? "", /validate-state/);
  });

  it("doctor prints execute hint in human mode", async () => {
    const cwd = await createTempDir("doctor-hint-output-");
    const feature = "001-auth";
    const featureDir = path.join(cwd, ".specs/features", feature);
    await fs.mkdir(featureDir, { recursive: true });
    await fs.mkdir(path.join(cwd, ".specs/features"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".specs/project"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".specs/guardrails/scripts"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".cursor/skills"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".cursor/rules"), { recursive: true });
    await fs.writeFile(
      path.join(cwd, ".specs/STATE.md"),
      `# State\n\n- **Active feature**: ${feature}\n`,
    );
    await fs.writeFile(path.join(cwd, ".specs/config.yaml"), "schema: spec-driven\n");
    await fs.writeFile(path.join(cwd, ".cursor/skills/agent-architecture.md"), "# Hub\n");
    await fs.writeFile(path.join(cwd, ".cursor/rules/engineering-baseline.mdc"), "---\n");
    await fs.writeFile(
      path.join(featureDir, "tasks.md"),
      "# Tasks\n\n## T1: login form\n",
    );

    const logs = [];
    const original = console.log;
    console.log = (...args) => logs.push(args.join(" "));
    try {
      await doctor(cwd, { suggest: false });
      assert.match(logs.join("\n"), /Execute hint:/);
      assert.match(logs.join("\n"), /loop-plan/);
    } finally {
      console.log = original;
    }
  });

  it("doctor json mode prints structured output", async () => {
    const cwd = await createTempDir("doctor-json-");
    await fs.mkdir(path.join(cwd, ".specs/features"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".specs/project"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".specs/guardrails/scripts"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".cursor/skills"), { recursive: true });
    await fs.mkdir(path.join(cwd, ".cursor/rules"), { recursive: true });
    await fs.writeFile(path.join(cwd, ".specs/STATE.md"), "# State\n\n- **Active feature**: none\n");
    await fs.writeFile(path.join(cwd, ".specs/config.yaml"), "schema: spec-driven\n");
    await fs.writeFile(path.join(cwd, ".cursor/skills/agent-architecture.md"), "# Hub\n");
    await fs.writeFile(path.join(cwd, ".cursor/rules/engineering-baseline.mdc"), "---\n");

    const logs = [];
    const original = console.log;
    console.log = (...args) => logs.push(args.join(" "));
    try {
      const result = await doctor(cwd, { json: true });
      assert.ok(result.score >= 0);
      assert.match(logs.join("\n"), /"score"/);
    } finally {
      console.log = original;
    }
  });
});
