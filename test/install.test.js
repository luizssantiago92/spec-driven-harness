import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  assertSafeAssetBase,
  HARNESS_SCRIPTS_DIR,
  LESSONS_HEADER,
  PINNED_REF,
  REFERENCE_ASSETS,
  REFERENCES_SUBDIR,
  resolveAssetUrl,
  SCRIPT_ASSETS,
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
  SPEC_GATE_FIXTURE,
  SPECIFY_REFERENCE_FIXTURE,
  TASK_GRAPH_FIXTURE,
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
        const taskGraphSkill = path.join(
          cwd,
          ".cursor/skills/task-graph-engineering.md",
        );
        const claudeSkill = path.join(
          cwd,
          ".claude/skills/agent-architecture.md",
        );
        const baselineRule = path.join(
          cwd,
          ".cursor/rules/engineering-baseline.mdc",
        );
        const stateFile = path.join(cwd, ".specs/STATE.md");
        const lessonsFile = path.join(cwd, ".specs/LESSONS.md");
        const featuresDir = path.join(cwd, ".specs/features");
        const cursorRules = path.join(cwd, ".cursorrules");

        assert.equal(await pathExists(cursorSkill), true);
        assert.equal(await pathExists(engineeringSkill), true);
        assert.equal(await pathExists(securitySkill), true);
        assert.equal(await pathExists(gitHandoffSkill), true);
        assert.equal(await pathExists(taskGraphSkill), true);
        assert.equal(await pathExists(claudeSkill), true);
        assert.equal(await pathExists(baselineRule), true);
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
        assert.equal(
          await fs.readFile(taskGraphSkill, "utf8"),
          TASK_GRAPH_FIXTURE,
        );
        assert.equal(await fs.readFile(claudeSkill, "utf8"), SKILL_FIXTURE);
        assert.equal(await fs.readFile(baselineRule, "utf8"), RULES_FIXTURE);
        assert.equal(await fs.readFile(stateFile, "utf8"), STATE_HEADER);
        assert.equal(await fs.readFile(lessonsFile, "utf8"), LESSONS_HEADER);

        const rulesContent = await fs.readFile(cursorRules, "utf8");
        assert.match(rulesContent, /agent-architecture\.md/);
        assert.match(rulesContent, /engineering-standards\.md/);
        assert.match(rulesContent, /security-review\.md/);
        assert.match(rulesContent, /git-handoff\.md/);
        assert.match(rulesContent, /task-graph-engineering\.md/);
        assert.match(rulesContent, /engineering-baseline\.mdc/);
        assert.match(rulesContent, /references\//);
        assert.match(rulesContent, /validate_spec\.py/);
        assert.doesNotMatch(rulesContent, /pt-BR/);
      } finally {
        await fs.rm(cwd, { recursive: true, force: true });
      }
    });
  });

  it("installs phase references for both agents", async () => {
    await withMockServer(async (mockServer) => {
      const cwd = await createTempDir("harness-references-");

      try {
        await install({ cwd, repoUrl: mockServer.baseUrl, silent: true });

        for (const dir of [".cursor/skills", ".claude/skills"]) {
          for (const reference of REFERENCE_ASSETS) {
            const referencePath = path.join(
              cwd,
              dir,
              REFERENCES_SUBDIR,
              reference.file,
            );
            assert.equal(
              await pathExists(referencePath),
              true,
              `missing ${dir}/${REFERENCES_SUBDIR}/${reference.file}`,
            );
          }
        }

        const specifyReference = path.join(
          cwd,
          ".cursor/skills",
          REFERENCES_SUBDIR,
          "specify.md",
        );
        assert.equal(
          await fs.readFile(specifyReference, "utf8"),
          SPECIFY_REFERENCE_FIXTURE,
        );
      } finally {
        await fs.rm(cwd, { recursive: true, force: true });
      }
    });
  });

  it("installs executable gate scripts under .specs/harness/scripts", async () => {
    await withMockServer(async (mockServer) => {
      const cwd = await createTempDir("harness-gates-");

      try {
        await install({ cwd, repoUrl: mockServer.baseUrl, silent: true });

        for (const script of SCRIPT_ASSETS) {
          const scriptPath = path.join(cwd, HARNESS_SCRIPTS_DIR, script.file);
          assert.equal(
            await pathExists(scriptPath),
            true,
            `missing gate script ${script.file}`,
          );
        }

        const specGate = path.join(
          cwd,
          HARNESS_SCRIPTS_DIR,
          "validate_spec.py",
        );
        assert.equal(await fs.readFile(specGate, "utf8"), SPEC_GATE_FIXTURE);

        const mode = (await fs.stat(specGate)).mode & 0o777;
        assert.equal(
          (mode & 0o100) !== 0,
          true,
          `gate script should be executable, got ${mode.toString(8)}`,
        );
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
        const baselineRule = path.join(
          cwd,
          ".cursor/rules/engineering-baseline.mdc",
        );

        await fs.writeFile(stateFile, "# Custom state\n", "utf8");
        await fs.writeFile(lessonsFile, "# Custom lessons\n", "utf8");
        await fs.writeFile(baselineRule, "# Custom rules\n", "utf8");

        await install({ cwd, repoUrl: mockServer.baseUrl, silent: true });

        assert.equal(await fs.readFile(stateFile, "utf8"), "# Custom state\n");
        assert.equal(
          await fs.readFile(lessonsFile, "utf8"),
          "# Custom lessons\n",
        );
        assert.equal(await fs.readFile(baselineRule, "utf8"), "# Custom rules\n");
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
        assert.match(rulesContent, /task-graph-engineering\.md/);
        assert.match(rulesContent, /engineering-baseline\.mdc/);
        assert.match(rulesContent, /validate_state\.py/);
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

describe("asset source safety", () => {
  it("pins downloads to the released tag by default", () => {
    const url = resolveAssetUrl("skills/agent-architecture.md");

    assert.match(url, /\/spec-driven-harness\/v\d+\.\d+\.\d+\//);
    assert.ok(url.startsWith("https://"), `expected https, got ${url}`);
    assert.ok(
      url.includes(`/${PINNED_REF}/`),
      `expected the pinned ref ${PINNED_REF} in ${url}`,
    );
  });

  it("rejects plain HTTP sources outside localhost", () => {
    assert.throws(
      () => assertSafeAssetBase("http://evil.example.com/assets"),
      /only HTTPS sources are allowed/,
    );
  });

  it("allows HTTP against a local host so the suite can serve fixtures", () => {
    assert.equal(
      assertSafeAssetBase("http://127.0.0.1:8080/"),
      "http://127.0.0.1:8080",
    );
  });

  it("rejects malformed asset bases", () => {
    assert.throws(
      () => assertSafeAssetBase("not-a-url"),
      /Invalid harness asset URL/,
    );
  });

  it("warns before installing from an overridden source", async () => {
    const mockServer = await createMockAssetServer();
    const cwd = await createTempDir("harness-override-");
    const logs = [];
    const originalOverride = process.env.HARNESS_REPO_URL;
    process.env.HARNESS_REPO_URL = mockServer.baseUrl;

    try {
      const originalLog = console.log;
      console.log = (message) => logs.push(String(message));

      try {
        await install({ cwd });
      } finally {
        console.log = originalLog;
      }

      assert.ok(
        logs.some((line) => line.includes("HARNESS_REPO_URL is set")),
        `expected an override warning, got:\n${logs.join("\n")}`,
      );
    } finally {
      if (originalOverride === undefined) {
        delete process.env.HARNESS_REPO_URL;
      } else {
        process.env.HARNESS_REPO_URL = originalOverride;
      }
      await fs.rm(cwd, { recursive: true, force: true });
      await mockServer.close();
    }
  });
});
