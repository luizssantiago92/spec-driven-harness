import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  LESSONS_HEADER,
  STATE_HEADER,
} from "../lib/constants.js";
import { install } from "../lib/install.js";
import {
  createMockSkillServer,
  SKILL_FIXTURE,
} from "./helpers/mock-server.js";

async function createTempDir(prefix) {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function withMockServer(fn, options) {
  const mockServer = await createMockSkillServer(
    options?.body,
    options?.statusCode ?? 200,
  );
  try {
    await fn(mockServer);
  } finally {
    await mockServer.close();
  }
}

describe("install harness", () => {
  it("creates the full harness structure in the target project", async () => {
    await withMockServer(async (mockServer) => {
      const cwd = await createTempDir("harness-install-");

      try {
        await install({ cwd, skillUrl: mockServer.url, silent: true });

        const cursorSkill = path.join(
          cwd,
          ".cursor/skills/agent-architecture.md",
        );
        const claudeSkill = path.join(
          cwd,
          ".claude/skills/agent-architecture.md",
        );
        const stateFile = path.join(cwd, ".specs/STATE.md");
        const lessonsFile = path.join(cwd, ".specs/LESSONS.md");
        const featuresDir = path.join(cwd, ".specs/features");
        const cursorRules = path.join(cwd, ".cursorrules");

        assert.equal(await pathExists(cursorSkill), true);
        assert.equal(await pathExists(claudeSkill), true);
        assert.equal(await pathExists(featuresDir), true);
        assert.equal(await pathExists(cursorRules), true);

        assert.equal(await fs.readFile(cursorSkill, "utf8"), SKILL_FIXTURE);
        assert.equal(await fs.readFile(claudeSkill, "utf8"), SKILL_FIXTURE);
        assert.equal(await fs.readFile(stateFile, "utf8"), STATE_HEADER);
        assert.equal(await fs.readFile(lessonsFile, "utf8"), LESSONS_HEADER);

        const rulesContent = await fs.readFile(cursorRules, "utf8");
        assert.match(rulesContent, /agent-architecture\.md/);
        assert.match(
          rulesContent,
          /Specify → Design → Tasks → Execute → Verify/,
        );
      } finally {
        await fs.rm(cwd, { recursive: true, force: true });
      }
    });
  });

  it("does not overwrite existing STATE.md and LESSONS.md on re-run", async () => {
    await withMockServer(async (mockServer) => {
      const cwd = await createTempDir("harness-idempotent-");

      try {
        await install({ cwd, skillUrl: mockServer.url, silent: true });

        const stateFile = path.join(cwd, ".specs/STATE.md");
        const lessonsFile = path.join(cwd, ".specs/LESSONS.md");

        await fs.writeFile(stateFile, "# Custom state\n", "utf8");
        await fs.writeFile(lessonsFile, "# Custom lessons\n", "utf8");

        await install({ cwd, skillUrl: mockServer.url, silent: true });

        assert.equal(await fs.readFile(stateFile, "utf8"), "# Custom state\n");
        assert.equal(
          await fs.readFile(lessonsFile, "utf8"),
          "# Custom lessons\n",
        );
      } finally {
        await fs.rm(cwd, { recursive: true, force: true });
      }
    });
  });

  it("throws a descriptive error when download fails", async () => {
    await withMockServer(
      async (failingServer) => {
        const cwd = await createTempDir("harness-download-fail-");

        try {
          await assert.rejects(
            () => install({ cwd, skillUrl: failingServer.url, silent: true }),
            (err) => {
              assert.match(err.message, /Download failed: 404/);
              return true;
            },
          );

          const partialSkill = path.join(
            cwd,
            ".cursor/skills/agent-architecture.md",
          );
          assert.equal(await pathExists(partialSkill), false);
        } finally {
          await fs.rm(cwd, { recursive: true, force: true });
        }
      },
      { body: "", statusCode: 404 },
    );
  });

  it("throws a clear permission error when directory creation is denied", async () => {
    await withMockServer(async (mockServer) => {
      const cwd = await createTempDir("harness-permission-");
      const blockedDir = path.join(cwd, "blocked");
      await fs.mkdir(blockedDir, { recursive: true });
      await fs.chmod(blockedDir, 0o444);

      try {
        await assert.rejects(
          () =>
            install({
              cwd: blockedDir,
              skillUrl: mockServer.url,
              silent: true,
            }),
          (err) => {
            assert.match(err.message, /Permission denied/);
            return true;
          },
        );
      } finally {
        await fs.chmod(blockedDir, 0o755);
        await fs.rm(cwd, { recursive: true, force: true });
      }
    });
  });
});
