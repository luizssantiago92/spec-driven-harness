import http from "node:http";

export const SKILL_FIXTURE = `# Agent Architecture Skill (test fixture)
Workflow: Specify → Design → Tasks → Execute → Verify
`;

export const ENGINEERING_FIXTURE = `# Engineering Standards (test fixture)
Locale: pt-BR chat, English artifacts
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
# Locale Policy (test fixture)
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

/** @type {Record<string, string>} */
export const DEFAULT_FIXTURES = {
  "/skills/agent-architecture.md": SKILL_FIXTURE,
  "/skills/engineering-standards.md": ENGINEERING_FIXTURE,
  "/skills/security-review.md": SECURITY_FIXTURE,
  "/skills/git-handoff.md": GIT_HANDOFF_FIXTURE,
  "/skills/task-graph-engineering.md": TASK_GRAPH_FIXTURE,
  "/skills/references/specify.md": SPECIFY_REFERENCE_FIXTURE,
  "/skills/references/validate.md": VALIDATE_REFERENCE_FIXTURE,
  "/scripts/validate_spec.py": SPEC_GATE_FIXTURE,
  "/scripts/check_commit.py": COMMIT_GATE_FIXTURE,
  "/rules/locale-and-standards.mdc": RULES_FIXTURE,
};

/**
 * @param {Record<string, string>} [fixtures]
 */
export function createMockAssetServer(fixtures = DEFAULT_FIXTURES) {
  const server = http.createServer((req, res) => {
    const body = fixtures[req.url ?? ""] ?? "# mock fixture\n";
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

/** @deprecated Use createMockAssetServer */
export function createMockSkillServer(body = SKILL_FIXTURE, statusCode = 200) {
  if (statusCode !== 200) {
    const server = http.createServer((_req, res) => {
      res.writeHead(statusCode);
      res.end(body);
    });
    return new Promise((resolve, reject) => {
      server.listen(0, "127.0.0.1", () => {
        const { port } = server.address();
        resolve({
          url: `http://127.0.0.1:${port}/skills/agent-architecture.md`,
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
  return createMockAssetServer({ "/skills/agent-architecture.md": body });
}
