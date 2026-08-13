# Design

Define HOW to build it: architecture, components, reuse, and risk. Optional phase.

## When to Use

- New architecture, new API surface, or infrastructure change
- Unfamiliar technology or a pattern the codebase does not have yet
- More than one defensible approach with real trade-offs

## When NOT to Use

- Straightforward changes with no architectural decision — design inline during Execute
- Bug fixes, copy changes, config tweaks

Skipping Design is the default for Simple and Medium tiers.

## Inputs

- Approved `spec.md`
- `context.md` when Discuss ran
- `.specs/STATE.md` decisions (`AD-NNN`)
- Existing codebase structure and conventions
- `context-limits.md` — this feature only

## Output

`.specs/features/[feature]/design.md`

## Procedure

1. **Map what already exists.** List the components you will reuse before proposing new ones. Reuse beats invention.
2. **Follow the Knowledge Verification Chain** for anything unfamiliar: codebase → project docs → MCP/Context → web search → flag uncertainty. Never fabricate an API.
3. **Choose an approach and state it definitively.** Record the alternatives you rejected and why — that is the part future readers need.
4. **Draw the shape.** A small mermaid diagram of components and data flow beats three paragraphs.
5. **Name the risks** and the mitigation for each. A risk without a mitigation is a blocker.
6. **Link every component back to requirement IDs.** Anything that serves no `REQ` is scope creep.
7. **Promote project-wide decisions** to `STATE.md` as `AD-NNN` (see `memory.md`).

## Template

```markdown
# Design: [Feature]

## Approach
[The chosen approach in two or three sentences.]

## Components

| Component | Responsibility | New or reuse | Serves |
| --- | --- | --- | --- |
| [name] | [what it does] | reuse `src/...` | REQ-001 |

## Data Flow

\`\`\`mermaid
flowchart LR
  Client --> Api --> Service --> Store
\`\`\`

## Decisions

### AD-00X: [Decision]
- **Chosen**: [option]
- **Rejected**: [option] because [reason]

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| [risk] | [impact] | [mitigation] |

## Out of Scope for This Design
- [explicitly excluded]
```

## Rules

- No implementation code in `design.md` — interfaces and signatures only when they clarify a contract.
- If the design reveals that the spec is wrong or incomplete, stop and update `spec.md` first; re-run the spec gate.
- Prefer the smallest design that satisfies the spec. Extensibility that no requirement asks for is speculation.

## Next

`tasks.md` — break the design into atomic tasks.
