import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isDeltaSpec,
  mergeFeatureIntoDomain,
} from "../lib/delta-merge.js";

describe("delta merge", () => {
  it("detects delta specs", () => {
    assert.equal(
      isDeltaSpec("## Goal\n\n## ADDED Requirements\n\n### REQ-001: x\n"),
      true,
    );
    assert.equal(isDeltaSpec("## Goal\n\n## Requirements\n\n### REQ-001: x\n"), false);
  });

  it("merges ADDED and MODIFIED requirements into domain spec", () => {
    const domain = `# Domain: chat

## Requirements

### REQ-001: Old title
- **Acceptance Criteria**: WHEN x THEN the system SHALL y
`;

    const delta = `# Delta

## Goal
Extend chat

## ADDED Requirements

### REQ-002: Presence
- **Acceptance Criteria**: WHEN online THEN the system SHALL show green

## MODIFIED Requirements

### REQ-001: Renamed title
- **Acceptance Criteria**: WHEN x THEN the system SHALL z

## REMOVED Requirements
- none
`;

    const { spec, summary } = mergeFeatureIntoDomain(domain, delta);
    assert.match(spec, /REQ-001: Renamed title/);
    assert.match(spec, /REQ-002: Presence/);
    assert.match(spec, /SHALL z/);
    assert.ok(summary.some((line) => line.includes("ADDED REQ-002")));
    assert.ok(summary.some((line) => line.includes("MODIFIED REQ-001")));
  });

  it("removes requirements listed in REMOVED section", () => {
    const domain = `# Domain

## Requirements

### REQ-001: Keep
- **Acceptance Criteria**: WHEN a THEN the system SHALL b

### REQ-002: Drop
- **Acceptance Criteria**: WHEN c THEN the system SHALL d
`;

    const delta = `## Goal
Retire REQ-002

## ADDED Requirements
- none

## MODIFIED Requirements
- none

## REMOVED Requirements
- REQ-002
`;

    const { spec, summary } = mergeFeatureIntoDomain(domain, delta);
    assert.match(spec, /REQ-001: Keep/);
    assert.doesNotMatch(spec, /REQ-002: Drop/);
    assert.ok(summary.some((line) => line.startsWith("REMOVED REQ-002")));
  });

  it("copies full spec requirements when not a delta", () => {
    const domain = `# Domain

## Requirements
- none
`;

    const full = `# Feature

## Goal
Ship auth

## Requirements

### REQ-001: Login
- **Acceptance Criteria**: WHEN valid THEN the system SHALL issue token

## Assumptions
- none

## Out of Scope
- none
`;

    const { spec, summary } = mergeFeatureIntoDomain(domain, full);
    assert.match(spec, /REQ-001: Login/);
    assert.match(summary[0], /copied 1 requirement/);
  });
});
