import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  CHATPRD_API_KEY_ENV,
  CHATPRD_FIXTURE_ENV,
  ChatPrdUnavailableError,
  formatPreviewOutput,
  mapPrdToPreview,
  pullPrdPreview,
  requireChatPrdApiKey,
} from "../lib/chatprd.js";

async function createTempDir(prefix) {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("chatprd pull spike", () => {
  it("requireChatPrdApiKey rejects missing env", () => {
    const previous = process.env[CHATPRD_API_KEY_ENV];
    delete process.env[CHATPRD_API_KEY_ENV];

    assert.throws(
      () => requireChatPrdApiKey(),
      (err) => {
        assert.ok(err instanceof ChatPrdUnavailableError);
        assert.match(err.message, /CHATPRD_API_KEY/);
        return true;
      },
    );

    if (previous !== undefined) {
      process.env[CHATPRD_API_KEY_ENV] = previous;
    }
  });

  it("mapPrdToPreview builds EARS-shaped requirements", () => {
    const preview = mapPrdToPreview({
      id: "prd-42",
      title: "Auth refresh",
      requirements: [{ id: "AUTH-001", title: "Idle timeout", description: "session is idle 30m" }],
    });

    assert.equal(preview.prdId, "prd-42");
    assert.equal(preview.requirements.length, 1);
    assert.match(preview.requirements[0].acceptanceCriteria, /SHALL/);
    assert.match(preview.requirements[0].acceptanceCriteria, /idle 30m/);
  });

  it("pullPrdPreview returns JSON preview with fixture and api key", async () => {
    const cwd = await createTempDir("chatprd-");
    const fixturePath = path.join(cwd, "prd.json");
    await fs.writeFile(
      fixturePath,
      JSON.stringify({
        id: "prd-99",
        title: "Billing",
        requirements: [{ id: "BILL-001", title: "Invoice export", description: "user exports CSV" }],
      }),
    );

    const previousKey = process.env[CHATPRD_API_KEY_ENV];
    const previousFixture = process.env[CHATPRD_FIXTURE_ENV];
    process.env[CHATPRD_API_KEY_ENV] = "test-key";
    process.env[CHATPRD_FIXTURE_ENV] = fixturePath;

    try {
      const result = await pullPrdPreview({
        cwd,
        prdId: "prd-99",
        dryRun: true,
      });

      assert.equal(result.dryRun, true);
      assert.equal(result.preview.title, "Billing");
      const output = formatPreviewOutput(result);
      assert.match(output, /"acceptanceCriteria"/);
    } finally {
      if (previousKey === undefined) {
        delete process.env[CHATPRD_API_KEY_ENV];
      } else {
        process.env[CHATPRD_API_KEY_ENV] = previousKey;
      }
      if (previousFixture === undefined) {
        delete process.env[CHATPRD_FIXTURE_ENV];
      } else {
        process.env[CHATPRD_FIXTURE_ENV] = previousFixture;
      }
    }
  });

  it("pullPrdPreview fails when fixture env is missing", async () => {
    const previousKey = process.env[CHATPRD_API_KEY_ENV];
    const previousFixture = process.env[CHATPRD_FIXTURE_ENV];
    process.env[CHATPRD_API_KEY_ENV] = "test-key";
    delete process.env[CHATPRD_FIXTURE_ENV];

    try {
      await assert.rejects(
        () => pullPrdPreview({ prdId: "x", dryRun: true }),
        (err) => {
          assert.ok(err instanceof ChatPrdUnavailableError);
          assert.match(err.message, /MCP server not reachable/);
          return true;
        },
      );
    } finally {
      if (previousKey === undefined) {
        delete process.env[CHATPRD_API_KEY_ENV];
      } else {
        process.env[CHATPRD_API_KEY_ENV] = previousKey;
      }
      if (previousFixture !== undefined) {
        process.env[CHATPRD_FIXTURE_ENV] = previousFixture;
      }
    }
  });

  it("CLI chatprd pull exits non-zero without API key", () => {
    const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
    const previous = process.env[CHATPRD_API_KEY_ENV];
    delete process.env[CHATPRD_API_KEY_ENV];

    const result = spawnSync(
      "node",
      ["index.js", "chatprd", "pull", "--prd-id", "demo", "--dry-run"],
      { cwd: root, encoding: "utf8", env: { ...process.env } },
    );

    if (previous !== undefined) {
      process.env[CHATPRD_API_KEY_ENV] = previous;
    }

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /CHATPRD_API_KEY/);
  });
});
