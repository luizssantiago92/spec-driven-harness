/**
 * Normalize ChatPRD document payloads and markdown into harness PRD JSON.
 */

/**
 * @param {unknown} value
 * @returns {string}
 */
function extractText(value) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => extractText(item)).filter(Boolean).join("\n");
  }

  if (value && typeof value === "object") {
    const record = /** @type {Record<string, unknown>} */ (value);
    if (typeof record.text === "string") {
      return record.text;
    }
    if (typeof record.content === "string") {
      return record.content;
    }
    if (Array.isArray(record.content)) {
      return extractText(record.content);
    }
    if (typeof record.markdown === "string") {
      return record.markdown;
    }
    if (typeof record.body === "string") {
      return record.body;
    }
  }

  return "";
}

/**
 * @param {string} markdown
 * @returns {Array<{ id?: string, title: string, description: string }>}
 */
export function parseRequirementsFromMarkdown(markdown) {
  const requirements = [];
  const lines = markdown.split("\n");
  let current = null;

  const flush = () => {
    if (!current) {
      return;
    }
    const description = current.body.join(" ").trim() || current.title;
    requirements.push({
      id: current.id,
      title: current.title,
      description,
    });
    current = null;
  };

  for (const line of lines) {
    const heading = line.match(/^###\s+(?:(REQ-\d{3}|[A-Z][A-Z0-9]{1,9}-\d{2,4})\s*:\s*)?(.+)$/);
    if (heading) {
      flush();
      current = {
        id: heading[1],
        title: heading[2].trim(),
        body: [],
      };
      continue;
    }

    if (current && line.trim()) {
      current.body.push(line.trim());
    }
  }

  flush();
  return requirements;
}

/**
 * @param {unknown} document
 * @param {string} [fallbackId]
 * @returns {{ id: string, title: string, requirements: Array<Record<string, unknown>> }}
 */
export function normalizeChatPrdDocument(document, fallbackId = "unknown") {
  if (!document || typeof document !== "object") {
    throw new Error("ChatPRD document response must be an object.");
  }

  const record = /** @type {Record<string, unknown>} */ (document);

  if (Array.isArray(record.requirements)) {
    return {
      id: String(record.id ?? record.documentUuid ?? record.uuid ?? fallbackId),
      title: String(record.title ?? record.name ?? "Untitled PRD"),
      requirements: record.requirements,
    };
  }

  const nested = record.document ?? record.data ?? record.result;
  if (nested && typeof nested === "object") {
    return normalizeChatPrdDocument(nested, fallbackId);
  }

  const markdown = extractText(record.content ?? record.markdown ?? record.body ?? record);
  const title = String(record.title ?? record.name ?? "Untitled PRD");
  const requirements = parseRequirementsFromMarkdown(markdown);

  if (!requirements.length && markdown.trim()) {
    requirements.push({
      title: title,
      description: markdown.trim().slice(0, 240),
    });
  }

  return {
    id: String(record.id ?? record.documentUuid ?? record.uuid ?? fallbackId),
    title,
    requirements,
  };
}

/**
 * @param {unknown} mcpResult
 * @param {string} documentId
 */
export function payloadFromMcpResult(mcpResult, documentId) {
  if (!mcpResult || typeof mcpResult !== "object") {
    throw new Error("ChatPRD MCP returned an empty document result.");
  }

  const record = /** @type {Record<string, unknown>} */ (mcpResult);

  if (record.structuredContent && typeof record.structuredContent === "object") {
    return normalizeChatPrdDocument(record.structuredContent, documentId);
  }

  const text = extractText(record.content ?? record);
  if (!text.trim()) {
    throw new Error("ChatPRD MCP document result contained no readable content.");
  }

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object") {
      return normalizeChatPrdDocument(parsed, documentId);
    }
  } catch {
    // Markdown body — parse below.
  }

  return normalizeChatPrdDocument({ title: documentId, content: text }, documentId);
}
