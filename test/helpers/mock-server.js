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

export const RULES_FIXTURE = `---
description: test rule
alwaysApply: true
---
# Locale Policy (test fixture)
`;

/** @type {Record<string, string>} */
export const DEFAULT_FIXTURES = {
  "/skills/agent-architecture.md": SKILL_FIXTURE,
  "/skills/engineering-standards.md": ENGINEERING_FIXTURE,
  "/skills/security-review.md": SECURITY_FIXTURE,
  "/skills/git-handoff.md": GIT_HANDOFF_FIXTURE,
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
