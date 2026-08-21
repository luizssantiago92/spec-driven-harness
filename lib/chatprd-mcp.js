/**
 * Minimal ChatPRD MCP HTTP client (JSON-RPC over HTTPS + Bearer token).
 */

import { ChatPrdUnavailableError } from "./chatprd-errors.js";

export const CHATPRD_MCP_URL_ENV = "CHATPRD_MCP_URL";
export const DEFAULT_CHATPRD_MCP_URL = "https://app.chatprd.ai/mcp";

/**
 * @param {string | undefined} raw
 * @returns {string}
 */
export function resolveMcpUrl(raw) {
  const value = raw?.trim() || DEFAULT_CHATPRD_MCP_URL;
  const url = new URL(value);

  if (url.protocol !== "https:") {
    throw new Error(`ChatPRD MCP URL must use HTTPS (got ${url.protocol})`);
  }

  return url.toString().replace(/\/$/, "");
}

/**
 * @param {unknown} body
 */
function parseJsonRpc(body) {
  if (!body || typeof body !== "object") {
    throw new Error("ChatPRD MCP returned a non-JSON response.");
  }

  const record = /** @type {Record<string, unknown>} */ (body);
  if (record.error) {
    const error = /** @type {Record<string, unknown>} */ (record.error);
    const message = String(error.message ?? error.error_description ?? "unknown MCP error");
    if (String(error.error ?? "").includes("invalid_token") || /auth/i.test(message)) {
      throw new ChatPrdUnavailableError(
        `ChatPRD MCP authentication failed: ${message}. ` +
          "Set CHATPRD_ACCESS_TOKEN (OAuth bearer from ChatPRD) or authenticate MCP in Cursor.",
      );
    }
    throw new Error(`ChatPRD MCP error: ${message}`);
  }

  return record.result;
}

/**
 * @param {{
 *   token: string,
 *   toolName: string,
 *   arguments?: Record<string, unknown>,
 *   mcpUrl?: string,
 *   fetchImpl?: typeof fetch,
 * }} options
 */
export async function callChatPrdMcpTool({
  token,
  toolName,
  arguments: toolArgs = {},
  mcpUrl,
  fetchImpl = fetch,
}) {
  const endpoint = resolveMcpUrl(mcpUrl ?? process.env[CHATPRD_MCP_URL_ENV]);
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: toolArgs,
      },
    }),
  });

  const body = await response.json().catch(() => {
    throw new Error(`ChatPRD MCP returned non-JSON HTTP ${response.status}.`);
  });

  if (!response.ok) {
    const errorMessage =
      typeof body === "object" && body && "error_description" in body
        ? String(/** @type {Record<string, unknown>} */ (body).error_description)
        : `HTTP ${response.status}`;
    if (response.status === 401 || response.status === 403) {
      throw new ChatPrdUnavailableError(
        `ChatPRD MCP authentication failed: ${errorMessage}`,
      );
    }
    throw new Error(`ChatPRD MCP request failed: ${errorMessage}`);
  }

  return parseJsonRpc(body);
}

/**
 * @param {{
 *   token: string,
 *   documentId: string,
 *   mcpUrl?: string,
 *   fetchImpl?: typeof fetch,
 * }} options
 */
export async function fetchChatPrdDocument({
  token,
  documentId,
  mcpUrl,
  fetchImpl = fetch,
}) {
  const toolCandidates = [
    { name: "get_document", args: { documentUuid: documentId } },
    { name: "get_document", args: { documentId } },
    { name: "get_document", args: { id: documentId } },
  ];

  let lastError;
  for (const candidate of toolCandidates) {
    try {
      return await callChatPrdMcpTool({
        token,
        toolName: candidate.name,
        arguments: candidate.args,
        mcpUrl,
        fetchImpl,
      });
    } catch (err) {
      lastError = err;
      if (err instanceof ChatPrdUnavailableError) {
        throw err;
      }
    }
  }

  throw lastError ?? new Error("ChatPRD MCP get_document failed.");
}
