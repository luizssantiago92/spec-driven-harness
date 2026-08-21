import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { archiveFeature, inferDomainFromFeature } from "../lib/archive.js";
import { initMemoryHarness } from "../lib/memory.js";
import { STATE_HEADER } from "../lib/constants.js";

async function createTempDir(prefix) {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function writeFeature(cwd, featureId, files) {
  const dir = path.join(cwd, ".specs/features", featureId);
  await fs.mkdir(dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    await fs.writeFile(path.join(dir, name), content);
  }
}

describe("archive feature", () => {
  it("infers domain slug from feature id", () => {
    assert.equal(inferDomainFromFeature("003-chat-system"), "chat-system");
  });

  it("updates ROADMAP, merges delta spec, and resets STATE", async () => {
    const cwd = await createTempDir("archive-");
    await initMemoryHarness(cwd);

    const featureId = "001-presence";
    await writeFeature(cwd, featureId, {
      "spec.md": `# Spec

## Goal
Presence indicator

## ADDED Requirements

### REQ-001: Online status
- **Acceptance Criteria**: WHEN user online THEN the system SHALL show green dot

## MODIFIED Requirements
- none

## REMOVED Requirements
- none

## Assumptions
- none
`,
      "validation.md": `# Validation

Verdict: PASS

## Evidence
- REQ-001 - test/presence.test.ts:10
`,
    });

    await fs.writeFile(
      path.join(cwd, ".specs/STATE.md"),
      STATE_HEADER.replace("- Feature: —", `- Feature: ${featureId}`),
    );

    const result = await archiveFeature(featureId, {
      cwd,
      skipVerify: true,
      domain: "chat",
    });

    assert.equal(result.featureId, featureId);
    assert.equal(result.domainPath, ".specs/domains/chat/spec.md");

    const domainSpec = await fs.readFile(
      path.join(cwd, ".specs/domains/chat/spec.md"),
      "utf8",
    );
    assert.match(domainSpec, /REQ-001: Online status/);

    const roadmap = await fs.readFile(
      path.join(cwd, ".specs/project/ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /001-presence/);
    assert.match(roadmap, /domains\/chat\/spec.md/);

    const state = await fs.readFile(path.join(cwd, ".specs/STATE.md"), "utf8");
    assert.match(state, /Feature: —/);
    assert.match(state, /Phase: —/);
  });

  it("respects --no-domain and --no-state flags", async () => {
    const cwd = await createTempDir("archive-skip-");
    await initMemoryHarness(cwd);

    const featureId = "002-quick-fix";
    await writeFeature(cwd, featureId, {
      "spec.md": `# Spec\n\n## Goal\nx\n\n## Requirements\n\n### REQ-001: A\n- **Acceptance Criteria**: WHEN a THEN the system SHALL b\n\n## Assumptions\n- none\n\n## Out of Scope\n- none\n`,
      "validation.md": "Verdict: PASS\n",
    });

    await fs.writeFile(
      path.join(cwd, ".specs/STATE.md"),
      STATE_HEADER.replace("- Feature: —", `- Feature: ${featureId}`),
    );

    await archiveFeature(featureId, {
      cwd,
      skipVerify: true,
      skipDomainMerge: true,
      skipState: true,
    });

    const domainExists = await fs
      .access(path.join(cwd, ".specs/domains/quick-fix/spec.md"))
      .then(() => true)
      .catch(() => false);
    assert.equal(domainExists, false);

    const state = await fs.readFile(path.join(cwd, ".specs/STATE.md"), "utf8");
    assert.match(state, /Feature: 002-quick-fix/);
  });
});
