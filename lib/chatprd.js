/**
 * ChatPRD pull spike — auth gate + PRD JSON → EARS preview (dry-run only).
 */

import fs from "node:fs/promises";

import { loadResolvedConfig } from "./presets.js";

export const CHATPRD_API_KEY_ENV = "CHATPRD_API_KEY";
export const CHATPRD_FIXTURE_ENV = "HARNESS_CHATPRD_FIXTURE";

export class ChatPrdUnavailableError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "ChatPrdUnavailableError";
  }
}

/**
 * @returns {string}
 */
export function requireChatPrdApiKey() {
  const key = process.env[CHATPRD_API_KEY_ENV]?.trim();
  if (!key) {
    throw new ChatPrdUnavailableError(
      "ChatPRD MCP unavailable: authenticate ChatPRD MCP in Cursor desktop and set " +
        `${CHATPRD_API_KEY_ENV}, or export an API key for dry-run preview.`,
    );
  }
  return key;
}

/**
 * @param {unknown} payload
 * @returns {{ prdId: string, title: string, requirements: Array<{ id: string, title: string, acceptanceCriteria: string }> }}
 */
export function mapPrdToPreview(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("PRD payload must be a JSON object.");
  }

  const record = /** @type {Record<string, unknown>} */ (payload);
  const prdId = String(record.id ?? record.prd_id ?? "unknown");
  const title = String(record.title ?? "Untitled PRD");
  const rawRequirements = Array.isArray(record.requirements) ? record.requirements : [];

  const requirements = rawRequirements.map((item, index) => {
    const req = /** @type {Record<string, unknown>} */ (item ?? {});
    const id = String(req.id ?? `REQ-${String(index + 1).padStart(3, "0")}`);
    const reqTitle = String(req.title ?? "Requirement");
    const description = String(req.description ?? req.body ?? reqTitle);
    const acceptanceCriteria =
      `WHEN ${description} THEN the system SHALL deliver the documented outcome`;

    return { id, title: reqTitle, acceptanceCriteria };
  });

  return { prdId, title, requirements };
}

/**
 * @param {{ cwd?: string, prdId: string, dryRun?: boolean }} options
 */
export async function pullPrdPreview({ cwd = process.cwd(), prdId, dryRun = false }) {
  if (!prdId?.trim()) {
    throw new Error("--prd-id is required.");
  }

  if (!dryRun) {
    throw new Error("Only --dry-run is supported in the ChatPRD sync spike.");
  }

  requireChatPrdApiKey();

  const resolved = await loadResolvedConfig(cwd);
  const orgId = resolved?.chatprd_org_id?.trim() || null;

  const fixturePath = process.env[CHATPRD_FIXTURE_ENV]?.trim();
  if (!fixturePath) {
    throw new ChatPrdUnavailableError(
      "ChatPRD MCP server not reachable from CLI: use Cursor desktop with ChatPRD MCP " +
        `authenticated, or set ${CHATPRD_FIXTURE_ENV} for local spike tests.`,
    );
  }

  let payload;
  try {
    payload = JSON.parse(await fs.readFile(fixturePath, "utf8"));
  } catch (err) {
    throw new Error(`Cannot read ChatPRD fixture at ${fixturePath}: ${err.message}`);
  }

  const preview = mapPrdToPreview(payload);
  return {
    requestedPrdId: prdId.trim(),
    orgId,
    dryRun: true,
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
