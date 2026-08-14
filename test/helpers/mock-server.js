import http from "node:http";

import {
  REFERENCE_ASSETS,
  RULE_ASSETS,
  SCRIPT_ASSETS,
  SKILL_ASSETS,
} from "../../lib/constants.js";

export const SKILL_FIXTURE = `# Agent Architecture Skill (test fixture)
Workflow: Specify → Design → Tasks → Execute → Verify
`;

export const ENGINEERING_FIXTURE = `# Engineering Standards (test fixture)
All project artifacts are written in English
`;

export const SECURITY_FIXTURE = `# Security Review (test fixture)
OWASP checklist for verify phase
`;

export const GIT_HANDOFF_FIXTURE = `# Git Handoff (test fixture)
Git sync at phase boundaries
`;

export const TASK_GRAPH_FIXTURE = `# Task Graph Engineering (test fixture)
Task DAG and parallelism rules
`;

export const RULES_FIXTURE = `---
description: test rule
alwaysApply: true
---
# Engineering Baseline (test fixture)
`;

export const SPECIFY_REFERENCE_FIXTURE = `# Specify (test fixture)
Requirements with REQ IDs and binary acceptance criteria
`;

export const VALIDATE_REFERENCE_FIXTURE = `# Validate (test fixture)
Independent verifier, discrimination sensor, evidence-or-zero
`;

export const SPEC_GATE_FIXTURE = `#!/usr/bin/env python3
"""validate_spec (test fixture)"""
`;

export const COMMIT_GATE_FIXTURE = `#!/usr/bin/env python3
"""check_commit (test fixture)"""
`;

function catalogFixtures() {
  /** @type {Record<string, string>} */
  const fixtures = {};
  for (const asset of [
    ...SKILL_ASSETS,
    ...REFERENCE_ASSETS,
    ...SCRIPT_ASSETS,
    ...RULE_ASSETS,
  ]) {
    fixtures[`/${asset.remotePath}`] = `# mock fixture for ${asset.file}\n`;
  }
  return fixtures;
}

/** @type {Record<string, string>} */
export const DEFAULT_FIXTURES = {
  ...catalogFixtures(),
  "/skills/agent-architecture.md": SKILL_FIXTURE,
  "/skills/engineering-standards.md": ENGINEERING_FIXTURE,
  "/skills/security-review.md": SECURITY_FIXTURE,
  "/skills/git-handoff.md": GIT_HANDOFF_FIXTURE,
  "/skills/task-graph-engineering.md": TASK_GRAPH_FIXTURE,
  "/skills/references/specify.md": SPECIFY_REFERENCE_FIXTURE,
  "/skills/references/validate.md": VALIDATE_REFERENCE_FIXTURE,
  "/scripts/validate_spec.py": SPEC_GATE_FIXTURE,
  "/scripts/check_commit.py": COMMIT_GATE_FIXTURE,
  "/rules/engineering-baseline.mdc": RULES_FIXTURE,
};

/**
 * @param {Record<string, string>} [fixtures]
 * @param {{ redirects?: Record<string, string> }} [options]
 */
export function createMockAssetServer(fixtures = DEFAULT_FIXTURES, options = {}) {
  const redirects = options.redirects ?? {};
  const server = http.createServer((req, res) => {
    const key = req.url ?? "";
    const location = redirects[key];
    if (location !== undefined) {
      res.writeHead(302, { Location: location });
      res.end("");
      return;
    }
    const body = fixtures[key];
    if (body === undefined) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("not found");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(body);
  });

  return new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((err) => (err ? closeReject(err) : closeResolve()));
          }),
      });
    });
    server.on("error", reject);
  });
}

/**
 * Serves the given status for every asset, so the installer's failure path can
 * be exercised.
 *
 * @param {number} statusCode
 */
export function createFailingAssetServer(statusCode) {
  const server = http.createServer((_req, res) => {
    res.writeHead(statusCode);
    res.end("");
  });

  return new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((err) => (err ? closeReject(err) : closeResolve()));
          }),
      });
    });
    server.on("error", reject);
  });
}
