import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ChatPrdUnavailableError } from "../lib/chatprd-errors.js";
import { callChatPrdMcpTool, fetchChatPrdDocument } from "../lib/chatprd-mcp.js";
import { pullPrdPreview } from "../lib/chatprd.js";

describe("chatprd MCP client", () => {
  it("callChatPrdMcpTool sends bearer auth and parses tool result", async () => {
    let authHeader = "";
    let body = "";

    const fetchImpl = async (_url, init) => {
      authHeader = String(init?.headers?.Authorization ?? "");
      body = String(init?.body ?? "");
      return {
        ok: true,
        status: 200,
        json: async () => ({
          jsonrpc: "2.0",
          id: 1,
          result: {
            content: [{ type: "text", text: '{"id":"doc-9","title":"Billing","requirements":[]}' }],
          },
        }),
      };
    };

    const result = await callChatPrdMcpTool({
      token: "secret-token",
      toolName: "get_document",
      arguments: { documentUuid: "doc-9" },
      mcpUrl: "https://chatprd.test/mcp",
      fetchImpl,
    });

    assert.match(authHeader, /Bearer secret-token/);
    assert.match(body, /get_document/);
    assert.ok(result);
  });

  it("fetchChatPrdDocument maps auth failures to ChatPrdUnavailableError", async () => {
    const fetchImpl = async () => ({
      ok: false,
      status: 401,
      json: async () => ({
        error: "invalid_token",
        error_description: "No authorization provided",
      }),
    });

    await assert.rejects(
      () =>
        fetchChatPrdDocument({
          token: "bad",
          documentId: "doc-1",
          mcpUrl: "https://chatprd.test/mcp",
          fetchImpl,
        }),
      (err) => {
        assert.ok(err instanceof ChatPrdUnavailableError);
        return true;
      },
    );
  });

  it("pullPrdPreview uses MCP when fixture is absent", async () => {
    const previousKey = process.env.CHATPRD_API_KEY;
    const previousFixture = process.env.HARNESS_CHATPRD_FIXTURE;
    delete process.env.HARNESS_CHATPRD_FIXTURE;
    process.env.CHATPRD_API_KEY = "secret-token";

    const fetchImpl = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        jsonrpc: "2.0",
        id: 1,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                id: "doc-42",
                title: "Payments",
                requirements: [
                  { id: "PAY-001", title: "Refund", description: "user requests refund" },
                ],
              }),
            },
          ],
        },
      }),
    });

    try {
      const result = await pullPrdPreview({
        prdId: "doc-42",
        dryRun: true,
        fetchImpl,
      });

      assert.equal(result.source, "mcp");
      assert.equal(result.preview.title, "Payments");
      assert.equal(result.preview.requirements[0].id, "PAY-001");
    } finally {
      if (previousKey === undefined) {
        delete process.env.CHATPRD_API_KEY;
      } else {
        process.env.CHATPRD_API_KEY = previousKey;
      }
      if (previousFixture !== undefined) {
        process.env.HARNESS_CHATPRD_FIXTURE = previousFixture;
      }
    }
  });
});
