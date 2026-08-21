/**
 * ChatPRD pull — auth gate, MCP/HTTP fetch, PRD JSON → EARS preview (dry-run).
 */

import fs from "node:fs/promises";

import { fetchChatPrdDocument } from "./chatprd-mcp.js";
import { normalizeChatPrdDocument, payloadFromMcpResult } from "./chatprd-parse.js";
import { ChatPrdUnavailableError } from "./chatprd-errors.js";
import { loadResolvedConfig } from "./presets.js";

export { ChatPrdUnavailableError } from "./chatprd-errors.js";
export const CHATPRD_API_KEY_ENV = "CHATPRD_API_KEY";
export const CHATPRD_ACCESS_TOKEN_ENV = "CHATPRD_ACCESS_TOKEN";
export const CHATPRD_FIXTURE_ENV = "HARNESS_CHATPRD_FIXTURE";

/**
 * @returns {string}
 */
export function requireChatPrdToken() {
  const token =
    process.env[CHATPRD_ACCESS_TOKEN_ENV]?.trim() ||
    process.env[CHATPRD_API_KEY_ENV]?.trim();

  if (!token) {
    throw new ChatPrdUnavailableError(
      "ChatPRD credentials missing: set CHATPRD_ACCESS_TOKEN (OAuth bearer from ChatPRD) " +
        `or ${CHATPRD_API_KEY_ENV} for CLI pull.`,
    );
  }

  return token;
}

/** @deprecated use requireChatPrdToken */
export function requireChatPrdApiKey() {
  return requireChatPrdToken();
}

/**
 * @param {unknown} payload
 * @returns {{ prdId: string, title: string, requirements: Array<{ id: string, title: string, acceptanceCriteria: string }> }}
 */
export function mapPrdToPreview(payload) {
  const normalized = normalizeChatPrdDocument(payload);
  const requirements = normalized.requirements.map((item, index) => {
    const req = /** @type {Record<string, unknown>} */ (item ?? {});
    const id = String(req.id ?? `REQ-${String(index + 1).padStart(3, "0")}`);
    const reqTitle = String(req.title ?? "Requirement");
    const description = String(req.description ?? req.body ?? reqTitle);
    const acceptanceCriteria =
      `WHEN ${description} THEN the system SHALL deliver the documented outcome`;

    return { id, title: reqTitle, acceptanceCriteria };
  });

  return {
    prdId: normalized.id,
    title: normalized.title,
    requirements,
  };
}

/**
 * @param {{
 *   prdId: string,
 *   token: string,
 *   fetchImpl?: typeof fetch,
 * }} options
 */
export async function loadPrdPayload({ prdId, token, fetchImpl }) {
  const fixturePath = process.env[CHATPRD_FIXTURE_ENV]?.trim();
  if (fixturePath) {
    try {
      return JSON.parse(await fs.readFile(fixturePath, "utf8"));
    } catch (err) {
      throw new Error(`Cannot read ChatPRD fixture at ${fixturePath}: ${err.message}`);
    }
  }

  const mcpResult = await fetchChatPrdDocument({
    token,
    documentId: prdId,
    fetchImpl,
  });

  return payloadFromMcpResult(mcpResult, prdId);
}

/**
 * @param {{ cwd?: string, prdId: string, dryRun?: boolean, fetchImpl?: typeof fetch }} options
 */
export async function pullPrdPreview({
  cwd = process.cwd(),
  prdId,
  dryRun = false,
  fetchImpl,
}) {
  if (!prdId?.trim()) {
    throw new Error("--prd-id is required.");
  }

  if (!dryRun) {
    throw new Error("Only --dry-run is supported for chatprd pull.");
  }

  const token = requireChatPrdToken();

  const resolved = await loadResolvedConfig(cwd);
  const orgId = resolved?.chatprd_org_id?.trim() || null;

  const payload = await loadPrdPayload({ prdId: prdId.trim(), token, fetchImpl });
  const preview = mapPrdToPreview(payload);

  return {
    requestedPrdId: prdId.trim(),
    orgId,
    dryRun: true,
    source: process.env[CHATPRD_FIXTURE_ENV]?.trim() ? "fixture" : "mcp",
    preview,
  };
}

/**
 * @param {Awaited<ReturnType<typeof pullPrdPreview>>} result
 * @returns {string}
 */
export function formatPreviewOutput(result) {
  return `${JSON.stringify(result, null, 2)}\n`;
}
