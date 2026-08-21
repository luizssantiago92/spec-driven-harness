# ChatPRD Sync (Spike)

Import product requirements from ChatPRD into harness feature specs. **Spike scope:** one-way PRD → delta spec preview; no production MCP client in the npm CLI yet.

## When to Use

- Owner has a PRD in ChatPRD and wants harness-aligned EARS requirements
- Before `/specify` on a brownfield repo with domain truth already in `.specs/domains/`
- Evaluating whether ChatPRD MCP auth works in desktop Cursor

## When NOT to Use

- Cloud agents without ChatPRD MCP authentication (document only; use fixture-based CLI dry-run locally)
- Bidirectional sync (archive → ChatPRD) — not in spike
- Replacing owner review of mapped requirements

## Prerequisites

1. **ChatPRD MCP** authenticated in Cursor desktop (Settings → MCP → ChatPRD).
2. **Environment variable** `CHATPRD_API_KEY` — never commit; CLI uses it as an auth gate.
3. **Optional config** `chatprd.org_id` in `.specs/config.yaml` (from preset); secrets stay in env.

## Workflow (one-way import)

1. **Fetch PRD in Cursor** using ChatPRD MCP tools (`get_prd`, `list_prds`, etc.) when authenticated.
2. **Map to harness shape** — each PRD requirement becomes a delta heading (`### DOMAIN-NNN: Title`) with EARS acceptance criteria.
3. **Dry-run preview (CLI spike):**
   ```bash
   export CHATPRD_API_KEY=...          # from ChatPRD / MCP setup
   export HARNESS_CHATPRD_FIXTURE=path/to/prd-export.json   # local spike only
   npx @luizsantiago/agentic-harness chatprd pull --prd-id <id> --dry-run
   ```
4. **Owner approves** mapped output, then paste into `.specs/features/NNN-slug/spec.md` as `## ADDED Requirements`.
5. **Run gates** — `validate-spec`, then `tasks` / `analyze` as usual.

## PRD JSON fixture shape (spike)

For CLI dry-run without live MCP from Node:

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

The CLI maps each item to a preview block with a suggested EARS line (owner edits before approve).

## Limits

| Environment | MCP pull | CLI dry-run |
| --- | --- | --- |
| Cursor desktop (ChatPRD MCP on) | Yes — agent tools | Yes — with `CHATPRD_API_KEY` + fixture |
| Cloud agent | No — MCP auth blocked | No — spike documents only |
| CI | No | Yes — set `HARNESS_CHATPRD_FIXTURE` in tests |

## Out of Scope (spike)

- Writing files under `.specs/features/` from CLI (preview stdout only)
- `archive-feature` pushing back to ChatPRD
- Enabling sync by default on `install`

## Next

- Approve mapped delta → `specify.md` gate → `tasks.md` → implement real MCP/HTTP client in a follow-up feature
