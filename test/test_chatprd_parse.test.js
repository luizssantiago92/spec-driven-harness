import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseRequirementsFromMarkdown, payloadFromMcpResult } from "../lib/chatprd-parse.js";

describe("chatprd parse", () => {
  it("parses markdown requirement headings", () => {
    const markdown = `# PRD

### REQ-001: Login
Users must sign in with email.

### AUTH-002: Session timeout
Sessions expire after 30 minutes.
`;

    const requirements = parseRequirementsFromMarkdown(markdown);
    assert.equal(requirements.length, 2);
    assert.equal(requirements[0].id, "REQ-001");
    assert.match(requirements[1].description, /30 minutes/);
  });

  it("payloadFromMcpResult reads MCP text content", () => {
    const payload = payloadFromMcpResult(
      {
        content: [
          {
            type: "text",
            text: "### REQ-001: Export\nUsers export invoices as CSV.",
          },
        ],
      },
      "doc-1",
    );

    assert.equal(payload.id, "doc-1");
    assert.equal(payload.requirements.length, 1);
    assert.equal(payload.requirements[0].id, "REQ-001");
  });
});
