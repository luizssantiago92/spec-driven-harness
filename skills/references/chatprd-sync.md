# ChatPRD Sync

Import product requirements from ChatPRD into harness feature specs. One-way PRD → delta spec preview.

## When to Use

- Owner has a PRD in ChatPRD and wants harness-aligned EARS requirements
- Before `/specify` on a brownfield repo with domain truth already in `.specs/domains/`
- Pulling a document UUID from ChatPRD into a dry-run harness preview

## When NOT to Use

- Bidirectional sync (archive → ChatPRD) — not supported
- Replacing owner review of mapped requirements
- Writing `.specs/features/` automatically from CLI (preview stdout only)

## Prerequisites

1. **ChatPRD MCP** authenticated in Cursor desktop (Settings → MCP → ChatPRD) for agent-driven fetch, **or**
2. **CLI bearer token** — `CHATPRD_ACCESS_TOKEN` (OAuth access token from ChatPRD connected app / session)
3. **Legacy alias** — `CHATPRD_API_KEY` still accepted for backward compatibility
4. **Optional config** — `chatprd_org_id` in `.specs/config.yaml` (from preset); secrets stay in env

ChatPRD MCP endpoint (default): `https://app.chatprd.ai/mcp` — override with `CHATPRD_MCP_URL` only for tests.

## Workflow (one-way import)

1. **Fetch PRD** — in Cursor use ChatPRD MCP tools (`get_document`, `list_documents`, `search_documents`), or use CLI pull with a document UUID.
2. **Map to harness shape** — each PRD requirement becomes a delta heading (`### DOMAIN-NNN: Title`) with EARS acceptance criteria.
3. **Dry-run preview (CLI):**
   ```bash
   export CHATPRD_ACCESS_TOKEN=...   # OAuth bearer from ChatPRD
   npx @luizsantiago/agentic-harness chatprd pull --prd-id <document-uuid> --dry-run
   ```
4. **Owner approves** mapped output, then paste into `.specs/features/NNN-slug/spec.md` as `## ADDED Requirements`.
5. **Run gates** — `validate-spec`, then `tasks` / `analyze` as usual.

### Local / CI without live ChatPRD

```bash
export CHATPRD_ACCESS_TOKEN=test
export HARNESS_CHATPRD_FIXTURE=path/to/prd-export.json
npx @luizsantiago/agentic-harness chatprd pull --prd-id demo --dry-run
```

Fixture JSON shape:

```json
{
  "id": "prd-123",
  "title": "Feature title",
  "requirements": [
    {
      "id": "REQ-001",
      "title": "Short title",
      "description": "What the user needs"
    }
  ]
}
```

Markdown documents from MCP are parsed via `### REQ-001: Title` headings when structured JSON is absent.

## Limits

| Environment | MCP agent tools | CLI `chatprd pull` |
| --- | --- | --- |
| Cursor desktop (ChatPRD MCP on) | Yes | Yes — with `CHATPRD_ACCESS_TOKEN` |
| Cloud agent | Only if MCP authenticated | Yes — with bearer token + network |
| CI | No | Yes — fixture env + token gate |

## Out of Scope

- Writing files under `.specs/features/` from CLI (preview stdout only)
- `archive-feature` pushing back to ChatPRD
- OAuth browser flow inside the npm CLI (bring your own token)

## Next

- Approve mapped delta → `specify.md` gate → `tasks.md` → optional bidirectional sync feature
