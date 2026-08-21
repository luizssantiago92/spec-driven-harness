import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CHARS_PER_TOKEN,
  LOAD_PROFILES,
  estimateTokens,
  measureBundle,
  measureLoadProfiles,
} from "../lib/token-cost.js";

describe("skill token cost", () => {
  it("estimates tokens with the documented chars-per-token heuristic", () => {
    assert.equal(estimateTokens("abcd"), 1);
    assert.equal(estimateTokens("a".repeat(4000)), 1000);
    assert.equal(CHARS_PER_TOKEN, 4);
  });

  it("measures all sister skills and references as non-trivial bundle", async () => {
    const allPaths = [
      ...LOAD_PROFILES.naiveFullDump.paths,
    ];
    const bundle = await measureBundle(allPaths);
    assert.ok(bundle.chars > 50_000, `expected large bundle, got ${bundle.chars} chars`);
    assert.ok(bundle.tokens > 10_000, `expected >10k est. tokens, got ${bundle.tokens}`);
  });

  it("progressive loads stay well below naive full dump", async () => {
    const report = await measureLoadProfiles();
    const naive = report.profiles.naiveFullDump.tokens;
    const specify = report.profiles.specifyTurn.tokens;
    const execute = report.profiles.executeLoop.tokens;
    const verify = report.profiles.verifyTurn.tokens;

    assert.ok(
      specify < naive * 0.4,
      `Specify turn should be <40% of naive dump (${specify} vs ${naive})`,
    );
    assert.ok(
      execute < naive * 0.2,
      `Execute loop should be <20% of naive dump (${execute} vs ${naive})`,
    );
    assert.ok(verify < naive * 0.25, `Verify turn should be <25% of naive (${verify} vs ${naive})`);
    assert.ok(report.savings.specifyVsNaivePct >= 60, "Specify savings should be at least ~60%");
    assert.ok(report.savings.executeVsNaivePct >= 75, "Execute savings should be at least ~75%");
  });

  it("documents measured profile sizes for README drift checks", async () => {
    const report = await measureLoadProfiles();
    // Guardrails: if someone doubles every skill, tests fail before README lies.
    const naive = report.profiles.naiveFullDump.tokens;
    assert.ok(naive > 20_000 && naive < 80_000, `naiveFullDump tokens out of band: ${naive}`);
    assert.ok(
      report.profiles.executeLoop.tokens < 8_000,
      `executeLoop grew unexpectedly: ${report.profiles.executeLoop.tokens}`,
    );
  });
});
