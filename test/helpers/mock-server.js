import http from "node:http";

export const SKILL_FIXTURE = `# Agent Architecture Skill (test fixture)
Workflow: Specify → Design → Tasks → Execute → Verify
`;

export function createMockSkillServer(body = SKILL_FIXTURE, statusCode = 200) {
  const server = http.createServer((_req, res) => {
    res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(body);
  });

  return new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        url: `http://127.0.0.1:${port}/agent-architecture.md`,
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((err) => (err ? closeReject(err) : closeResolve()));
          }),
      });
    });
    server.on("error", reject);
  });
}
