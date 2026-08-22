#!/usr/bin/env python3
"""Structural gate for Quick-mode artifacts under `.specs/quick/`.

    python3 validate_quick.py .specs/quick/001-theme-persist
    python3 validate_quick.py 001-theme-persist

Checks (markdown structure only):
  * TASK.md present with Files / Approach / Verify fields
  * Files list has 1–3 paths
  * Sensitive paths (auth/payment/migration) → promote to specify
  * SUMMARY.md present with Changed + Evidence (file:line or manual steps)

Does not run validate-state / discrimination sensor / REQ coverage.

Exit codes: 0 pass, 1 blocking issues, 2 usage error.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from _common import Report, visible_markdown

GATE = "validate-quick"
QUICK_DIR = Path(".specs/quick")

FIELD = re.compile(
    r"^\s*[-*]?\s*\*{0,2}(?P<key>Files|Approach|Verify|Changed|Commit|Evidence)"
    r"\*{0,2}\s*:\s*(?P<value>.+?)\s*$",
    re.MULTILINE | re.IGNORECASE,
)
SENSITIVE = re.compile(
    r"(?:^|/)(?:auth|oauth|payment|billing|migration|migrate)(?:/|$)|"
    r"(?:^|/)(?:schema|secrets?)(?:/|$)",
    re.IGNORECASE,
)
EVIDENCE_LINE = re.compile(
    r"[\w./\\-]+\.[A-Za-z][A-Za-z0-9]{0,9}:\d{1,6}\b|manual\b|reload\b|steps?\b",
    re.IGNORECASE,
)


def resolve_quick_dir(raw: str | None, root: Path = Path(".")) -> Path:
    if raw:
        candidate = Path(raw).expanduser()
        if candidate.is_dir():
            return candidate
        named = root / QUICK_DIR / raw
        if named.is_dir():
            return named
        print(f"[{GATE}] USAGE - no such quick folder: {raw}", file=sys.stderr)
        raise SystemExit(2)

    base = root / QUICK_DIR
    if not base.is_dir():
        print(
            f"[{GATE}] USAGE - {base} missing — create .specs/quick/NNN-slug/ first",
            file=sys.stderr,
        )
        raise SystemExit(2)

    folders = sorted(p for p in base.iterdir() if p.is_dir())
    if len(folders) == 1:
        return folders[0]
    if not folders:
        print(f"[{GATE}] USAGE - no quick folders under {base}", file=sys.stderr)
        raise SystemExit(2)

    listed = "\n".join(f"            {p.name}" for p in folders)
    print(
        f"[{GATE}] USAGE - {len(folders)} quick folders — name one:\n{listed}",
        file=sys.stderr,
    )
    raise SystemExit(2)


def field_map(text: str) -> dict[str, str]:
    found: dict[str, str] = {}
    for match in FIELD.finditer(visible_markdown(text)):
        key = match.group("key").strip().lower()
        found[key] = match.group("value").strip()
    return found


def split_files(value: str) -> list[str]:
    parts = re.split(r"[,;\n]+", value)
    return [p.strip().strip("`") for p in parts if p.strip()]


def build_report(quick_dir: Path) -> Report:
    report = Report(gate=GATE, target=str(quick_dir))

    task_path = quick_dir / "TASK.md"
    summary_path = quick_dir / "SUMMARY.md"

    if not task_path.is_file() or not task_path.read_text(encoding="utf-8").strip():
        report.error("TASK.md missing or empty")
        return report

    task_fields = field_map(task_path.read_text(encoding="utf-8"))
    for required in ("files", "approach", "verify"):
        if required not in task_fields or not task_fields[required]:
            report.error(f"TASK.md missing required field: {required.title()}")

    files = split_files(task_fields.get("files", ""))
    if files:
        report.ok(f"{len(files)} file(s) listed")
        if len(files) > 3:
            report.error(
                f"{len(files)} files listed — Quick max is 3; promote to /specify"
            )
        for path in files:
            if SENSITIVE.search(path.replace("\\", "/")):
                report.error(
                    f"sensitive path '{path}' — promote to full pipeline + security-review"
                )
    elif "files" in task_fields:
        report.error("Files field is empty")

    if not summary_path.is_file() or not summary_path.read_text(encoding="utf-8").strip():
        report.error("SUMMARY.md missing or empty")
        return report

    summary_fields = field_map(summary_path.read_text(encoding="utf-8"))
    if "changed" not in summary_fields or not summary_fields["changed"]:
        report.error("SUMMARY.md missing Changed field")
    else:
        report.ok("Changed field present")

    evidence = summary_fields.get("evidence", "")
    if not evidence:
        report.error("SUMMARY.md missing Evidence field")
    elif not EVIDENCE_LINE.search(evidence):
        report.error(
            "Evidence must cite file:line or explicit manual verification steps"
        )
    else:
        report.ok("Evidence recorded")

    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate Quick-mode artifacts")
    parser.add_argument(
        "target",
        nargs="?",
        help="quick folder name or path under .specs/quick/",
    )
    args = parser.parse_args(argv)
    quick_dir = resolve_quick_dir(args.target)
    return build_report(quick_dir).emit()


if __name__ == "__main__":
    sys.exit(main())
