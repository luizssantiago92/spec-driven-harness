/**
 * Human-facing messages after install — keep CLI surface minimal.
 */

/**
 * @param {{ pythonAvailable?: boolean, preset?: string }} [options]
 * @returns {string[]}
 */
export function formatInstallNextSteps(options = {}) {
  const lines = [
    "",
    "✨ Setup complete.",
    "",
    "Next:",
    "  1. Open Cursor or Claude Code in this project.",
    "  2. **Open Cursor or Claude Code** and run **Specify** (`/specify` or “Specify a feature: …”).",
    "",
    "  Read: .specs/GETTING_STARTED.md",
  ];

  if (options.preset) {
    lines.push(`  Config: .specs/config.yaml (preset: ${options.preset})`);
  }

  if (options.pythonAvailable === false) {
    lines.push(
      "  Note: install Python 3.10+ for automatic gates, or the agent checks by hand.",
    );
  }

  lines.push(
    "",
    "Optional CLI (you rarely need these on day one):",
    "  project-init   existing repo with code already",
    "  doctor         if something looks wrong",
    "  --help         full command list",
    "",
  );

  return lines;
}

/**
 * @param {{ pythonAvailable?: boolean, preset?: string }} [options]
 */
export function printInstallNextSteps(options = {}) {
  for (const line of formatInstallNextSteps(options)) {
    console.log(line);
  }
}
