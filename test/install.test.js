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
  createMockAssetServer,
  createMockSkillServer,
  ENGINEERING_FIXTURE,
  GIT_HANDOFF_FIXTURE,
  RULES_FIXTURE,
  SECURITY_FIXTURE,
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
  if (options?.statusCode && options.statusCode !== 200) {
    const mockServer = await createMockSkillServer(
      options.body ?? "",
      options.statusCode,
    );
    try {
      await fn(mockServer);
    } finally {
      await mockServer.close();
    }
    return;
  }

  const mockServer = await createMockAssetServer(options?.fixtures);
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
        await install({ cwd, repoUrl: mockServer.baseUrl, silent: true });

        const cursorSkill = path.join(
          cwd,
          ".cursor/skills/agent-architecture.md",
        );
        const engineeringSkill = path.join(
          cwd,
          ".cursor/skills/engineering-standards.md",
        );
        const securitySkill = path.join(
          cwd,
          ".cursor/skills/security-review.md",
        );
        const gitHandoffSkill = path.join(
          cwd,
          ".cursor/skills/git-handoff.md",
        );
        const claudeSkill = path.join(
          cwd,
          ".claude/skills/agent-architecture.md",
        );
        const localeRule = path.join(
          cwd,
          ".cursor/rules/locale-and-standards.mdc",
        );
        const stateFile = path.join(cwd, ".specs/STATE.md");
        const lessonsFile = path.join(cwd, ".specs/LESSONS.md");
        const featuresDir = path.join(cwd, ".specs/features");
        const cursorRules = path.join(cwd, ".cursorrules");

        assert.equal(await pathExists(cursorSkill), true);
        assert.equal(await pathExists(engineeringSkill), true);
        assert.equal(await pathExists(securitySkill), true);
        assert.equal(await pathExists(gitHandoffSkill), true);
        assert.equal(await pathExists(claudeSkill), true);
        assert.equal(await pathExists(localeRule), true);
        assert.equal(await pathExists(featuresDir), true);
        assert.equal(await pathExists(cursorRules), true);

        assert.equal(await fs.readFile(cursorSkill, "utf8"), SKILL_FIXTURE);
        assert.equal(
          await fs.readFile(engineeringSkill, "utf8"),
          ENGINEERING_FIXTURE,
        );
        assert.equal(
          await fs.readFile(securitySkill, "utf8"),
          SECURITY_FIXTURE,
        );
        assert.equal(
          await fs.readFile(gitHandoffSkill, "utf8"),
          GIT_HANDOFF_FIXTURE,
        );
        assert.equal(await fs.readFile(claudeSkill, "utf8"), SKILL_FIXTURE);
        assert.equal(await fs.readFile(localeRule, "utf8"), RULES_FIXTURE);
        assert.equal(await fs.readFile(stateFile, "utf8"), STATE_HEADER);
        assert.equal(await fs.readFile(lessonsFile, "utf8"), LESSONS_HEADER);

        const rulesContent = await fs.readFile(cursorRules, "utf8");
        assert.match(rulesContent, /agent-architecture\.md/);
        assert.match(rulesContent, /engineering-standards\.md/);
        assert.match(rulesContent, /security-review\.md/);
        assert.match(rulesContent, /git-handoff\.md/);
        assert.match(rulesContent, /locale-and-standards\.mdc/);
        assert.match(rulesContent, /pt-BR/);
        assert.match(rulesContent, /Specify → Verify/);
      } finally {
        await fs.rm(cwd, { recursive: true, force: true });
      }
    });
  });

  it("does not overwrite existing STATE.md, LESSONS.md, or project rules on re-run", async () => {
    await withMockServer(async (mockServer) => {
      const cwd = await createTempDir("harness-idempotent-");

      try {
        await install({ cwd, repoUrl: mockServer.baseUrl, silent: true });

        const stateFile = path.join(cwd, ".specs/STATE.md");
        const lessonsFile = path.join(cwd, ".specs/LESSONS.md");
        const localeRule = path.join(
          cwd,
          ".cursor/rules/locale-and-standards.mdc",
        );

        await fs.writeFile(stateFile, "# Custom state\n", "utf8");
        await fs.writeFile(lessonsFile, "# Custom lessons\n", "utf8");
        await fs.writeFile(localeRule, "# Custom rules\n", "utf8");

        await install({ cwd, repoUrl: mockServer.baseUrl, silent: true });

        assert.equal(await fs.readFile(stateFile, "utf8"), "# Custom state\n");
        assert.equal(
          await fs.readFile(lessonsFile, "utf8"),
          "# Custom lessons\n",
        );
        assert.equal(await fs.readFile(localeRule, "utf8"), "# Custom rules\n");
      } finally {
        await fs.rm(cwd, { recursive: true, force: true });
      }
    });
  });

  it("upgrades an outdated .cursorrules harness block on re-run", async () => {
    await withMockServer(async (mockServer) => {
      const cwd = await createTempDir("harness-cursorrules-upgrade-");

      try {
        await install({ cwd, repoUrl: mockServer.baseUrl, silent: true });

        const cursorRules = path.join(cwd, ".cursorrules");
        await fs.writeFile(
          cursorRules,
          `<!-- AGENTIC-HARNESS:BEGIN -->
# Old block
- \`.cursor/skills/agent-architecture.md\`
<!-- AGENTIC-HARNESS:END -->
`,
          "utf8",
        );

        await install({ cwd, repoUrl: mockServer.baseUrl, silent: true });

        const rulesContent = await fs.readFile(cursorRules, "utf8");
        assert.match(rulesContent, /engineering-standards\.md/);
        assert.match(rulesContent, /security-review\.md/);
        assert.match(rulesContent, /git-handoff\.md/);
        assert.match(rulesContent, /locale-and-standards\.mdc/);
        assert.doesNotMatch(rulesContent, /# Old block/);
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
            () =>
              install({
                cwd,
                repoUrl: failingServer.baseUrl,
                silent: true,
              }),
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
      { statusCode: 404, body: "" },
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
              repoUrl: mockServer.baseUrl,
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
