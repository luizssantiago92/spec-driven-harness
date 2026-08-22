import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  formatPhaseContext,
  loadGuardrailsConfig,
  normalizePhase,
  parseGuardrailsConfig,
  phaseContext,
} from "../lib/config.js";

async function createTempDir(prefix) {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("guardrails config", () => {
  it("parses schema, context block, and phase rules", () => {
    const yaml = `# comment
schema: spec-driven

context: |
  Tech stack: Node
  Test command: npm test

rules:
  specify:
    - Prefer EARS acceptance criteria
  verify:
    - Evidence must cite test file:line paths
`;

    const config = parseGuardrailsConfig(yaml);
    assert.equal(config.schema, "spec-driven");
    assert.match(config.context ?? "", /Tech stack: Node/);
    assert.deepEqual(config.rules?.specify, ["Prefer EARS acceptance criteria"]);
    assert.deepEqual(config.rules?.verify, ["Evidence must cite test file:line paths"]);
  });

  it("normalizes phase aliases", () => {
    assert.equal(normalizePhase("execute"), "implement");
    assert.equal(normalizePhase("verify"), "verify");
  });

  it("formats phase context markdown", () => {
    const output = formatPhaseContext("specify", {
      context: "Tech stack: Node",
      rules: { specify: ["Use EARS"] },
    });

    assert.match(output, /Project context/);
    assert.match(output, /Tech stack: Node/);
    assert.match(output, /Use EARS/);
  });

  it("loads config from .specs/config.yaml", async () => {
    const cwd = await createTempDir("config-load-");
    await fs.mkdir(path.join(cwd, ".specs"), { recursive: true });
    await fs.writeFile(
      path.join(cwd, ".specs/config.yaml"),
      `context: |
  Branch prefix: feat
rules:
  tasks:
    - Every REQ must appear in the Test Coverage Matrix
`,
    );

    const config = await loadGuardrailsConfig(cwd);
    assert.match(config?.context ?? "", /Branch prefix: feat/);
    assert.deepEqual(config?.rules?.tasks?.[0], "Every REQ must appear in the Test Coverage Matrix");
  });

  it("does not absorb unindented comments into context block", () => {
    const yaml = `extends: node-ts

context: |
  Team: Acme

# overrides:
#   rules:
`;

    const config = parseGuardrailsConfig(yaml);
    assert.equal(config.extends, "node-ts");
    assert.equal(config.context?.trim(), "Team: Acme");
  });

  it("phaseContext returns empty notice when config is missing", async () => {
    const cwd = await createTempDir("config-missing-");
    const output = await phaseContext("specify", { cwd });
    assert.match(output, /no .specs\/config.yaml/);
  });
});
