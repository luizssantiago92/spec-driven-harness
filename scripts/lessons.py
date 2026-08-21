#!/usr/bin/env python3
"""Lessons engine for `.specs/lessons.json` and the generated `LESSONS.md`.

A lesson is recorded only from a grounded verification failure. A clean PASS
records nothing. Candidates are not guidance; only confirmed lessons are.

    python3 lessons.py add --title "..." --rule "..." --source features/auth/validation.md
    python3 lessons.py list --status confirmed
    python3 lessons.py penalize --id L-001 --source features/auth/validation.md
    python3 lessons.py prune
    python3 lessons.py status

Exit codes: 0 ok, 1 refused / corrupt store, 2 usage error.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
import unicodedata
from datetime import date, datetime, timedelta
from pathlib import Path

from _common import EXIT_FAILED, EXIT_OK, EXIT_USAGE

GATE = "lessons"
STORE_PATH = Path(".specs/lessons.json")
MARKDOWN_PATH = Path(".specs/LESSONS.md")
SPECS_DIR = Path(".specs")
FEATURES_DIR = Path(".specs/features")
PRUNE_AFTER = timedelta(days=90)
PROMOTE_AFTER_FEATURES = 2
QUARANTINE_AFTER_PENALTIES = 2
SOURCE_LINE = re.compile(r":(\d{1,6})$")
FEATURE_IN_PATH = re.compile(
    r"(?:^|/)features/(?P<name>[^/]+)/", re.IGNORECASE
)

STATUSES = ("candidate", "confirmed", "quarantined")


def fail(message: str, code: int = EXIT_FAILED) -> int:
    print(f"[{GATE}] FAIL - {STORE_PATH}")
    print(f"  error   {message}")
    return code


def ok(message: str) -> int:
    print(f"[{GATE}] PASS - {message}")
    return EXIT_OK


def normalize(text: str) -> str:
    """Casefold, strip accents and punctuation, collapse whitespace."""

    decomposed = unicodedata.normalize("NFKD", text)
    stripped = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", stripped.casefold()).strip()


def parse_source(raw: str) -> tuple[Path, str | None]:
    """Split an optional `:line` suffix from a source path."""

    match = SOURCE_LINE.search(raw)
    if match:
        return Path(raw[: match.start()]), match.group(1)
    return Path(raw), None


def infer_feature(source: Path, explicit: str | None) -> str:
    if explicit:
        return explicit.strip()

    # Path.as_posix() does not convert backslashes that were part of the original
    # string on POSIX, so normalize both separators before matching.
    normalized = str(source).replace("\\", "/")
    match = FEATURE_IN_PATH.search(normalized)
    if match:
        return match.group("name")

    return source.parent.name or "unknown"


def _under_specs(path: Path) -> bool:
    """Return True when `path` resolves inside `.specs/` of the current project."""

    try:
        resolved = path.expanduser().resolve()
        specs = SPECS_DIR.expanduser().resolve()
        resolved.relative_to(specs)
        return True
    except (OSError, ValueError):
        return False


def validate_source(raw: str) -> tuple[Path, str] | int:
    """Return (path, original) or an exit code."""

    if not raw or not raw.strip():
        return fail("--source is required - a lesson without evidence is opinion", EXIT_USAGE)

    path, _line = parse_source(raw.strip())
    if not path.exists() or not path.is_file():
        return fail(f"source file not found: {path}")

    if path.name.lower() != "validation.md":
        return fail(
            f"source must be a validation.md (got {path.name}) - "
            "lessons are distilled from /verify, not from opinion"
        )

    if not _under_specs(path):
        return fail("source must live under .specs/")

    if not path.read_text(encoding="utf-8").strip():
        return fail(f"source is empty: {path}")

    return path, raw.strip()


def empty_store() -> dict:
    return {"version": 1, "lessons": []}


def load_store() -> dict | int:
    if not STORE_PATH.exists():
        return empty_store()

    try:
        payload = json.loads(STORE_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as err:
        return fail(f"lessons.json is corrupt: {err}")

    if not isinstance(payload, dict) or not isinstance(payload.get("lessons"), list):
        return fail("lessons.json is corrupt: expected an object with a lessons array")

    for index, item in enumerate(payload["lessons"]):
        if not isinstance(item, dict):
            return fail(f"lessons.json is corrupt: lesson {index} is not an object")
        if not str(item.get("title") or "").strip() or not str(item.get("rule") or "").strip():
            identity = item.get("id") or f"index {index}"
            return fail(f"lessons.json is corrupt: {identity} is missing title or rule")

    return payload


def next_id(lessons: list[dict]) -> str:
    numbers = []
    for lesson in lessons:
        match = re.match(r"L-(\d+)$", str(lesson.get("id", "")))
        if match:
            numbers.append(int(match.group(1)))
    return f"L-{max(numbers, default=0) + 1:03d}"


def fingerprint(lesson: dict) -> str:
    return f"{normalize(lesson.get('title', ''))}\n{normalize(lesson.get('rule', ''))}"


def today_iso() -> str:
    return date.today().isoformat()


def parse_iso_date(raw: str) -> date | None:
    try:
        return datetime.strptime(raw, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


def render_markdown(store: dict) -> str:
    confirmed = [item for item in store["lessons"] if item.get("status") == "confirmed"]
    lines = [
        "# Lessons Learned",
        "",
        "Generated by `lessons.py` from `.specs/lessons.json`. Do not edit this file.",
        "A clean PASS records nothing. Only **confirmed** lessons below are guidance.",
        "Inspect candidates with `python3 .specs/seatbelt/scripts/lessons.py list --status all`.",
        "",
    ]

    if not confirmed:
        lines.append("- none yet")
        lines.append("")
        return "\n".join(lines)

    for lesson in confirmed:
        lines.append(f"### {lesson.get('id', '?')}: {lesson.get('title', '')}")
        if lesson.get("trigger"):
            lines.append(f"- **Trigger**: {lesson['trigger']}")
        lines.append(f"- **Rule**: {lesson.get('rule', '')}")
        features = ", ".join(lesson.get("features") or [])
        if features:
            lines.append(f"- **Features**: {features}")
        lines.append(f"- **Source**: {lesson.get('source', '—')}")
        lines.append("")

    return "\n".join(lines)


def atomic_write(path: Path, text: str) -> None:
    """Write `text` via a same-directory tempfile so a crash cannot truncate the store."""

    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(
        prefix=f".{path.name}.", suffix=".tmp", dir=str(path.parent)
    )
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(text)
        Path(tmp_name).replace(path)
    except Exception:
        try:
            os.unlink(tmp_name)
        except OSError:
            pass
        raise


def save_store(store: dict) -> None:
    SPECS_DIR.mkdir(parents=True, exist_ok=True)
    atomic_write(
        STORE_PATH, json.dumps(store, indent=2, ensure_ascii=False) + "\n"
    )
    atomic_write(MARKDOWN_PATH, render_markdown(store))


def find_duplicate(store: dict, title: str, rule: str) -> dict | None:
    needle = f"{normalize(title)}\n{normalize(rule)}"
    for lesson in store["lessons"]:
        if fingerprint(lesson) == needle:
            return lesson
    return None


def cmd_add(args: argparse.Namespace) -> int:
    source = validate_source(args.source)
    if isinstance(source, int):
        return source
    source_path, source_raw = source

    title = (args.title or "").strip()
    rule = (args.rule or "").strip()
    if not title or not rule:
        return fail("--title and --rule are required", EXIT_USAGE)

    store = load_store()
    if isinstance(store, int):
        return store

    feature = infer_feature(source_path, args.feature)
    existing = find_duplicate(store, title, rule)
    now = today_iso()

    if existing:
        features = list(existing.get("features") or [])
        if feature in features:
            existing["updated"] = now
            save_store(store)
            return ok(
                f"{existing['id']} already recorded for '{feature}' - "
                "same-feature recurrence does not promote"
            )

        features.append(feature)
        existing["features"] = features
        existing["updated"] = now
        existing["source"] = source_raw
        if (
            existing.get("status") == "candidate"
            and len(features) >= PROMOTE_AFTER_FEATURES
        ):
            existing["status"] = "confirmed"
            save_store(store)
            return ok(
                f"{existing['id']} promoted to confirmed "
                f"(seen in {len(features)} features)"
            )

        save_store(store)
        return ok(f"{existing['id']} recorded for '{feature}'")

    lesson = {
        "id": next_id(store["lessons"]),
        "title": title,
        "trigger": (args.trigger or "").strip(),
        "rule": rule,
        "status": "candidate",
        "source": source_raw,
        "features": [feature],
        "created": now,
        "updated": now,
        "penalties": 0,
    }
    store["lessons"].append(lesson)
    save_store(store)
    return ok(f"{lesson['id']} stored as candidate from '{feature}'")


def cmd_list(args: argparse.Namespace) -> int:
    store = load_store()
    if isinstance(store, int):
        return store

    wanted = args.status or "confirmed"
    if wanted == "all":
        rows = store["lessons"]
    elif wanted in STATUSES:
        rows = [item for item in store["lessons"] if item.get("status") == wanted]
    else:
        return fail(f"unknown status '{wanted}' - use {', '.join(STATUSES)} or all", EXIT_USAGE)

    print(f"[{GATE}] {len(rows)} {wanted} lesson(s)")
    for lesson in rows:
        trigger = f" — {lesson['trigger']}" if lesson.get("trigger") else ""
        print(f"  {lesson.get('id', '?')}  {lesson.get('status', '?'):<12} {lesson.get('title', '')}{trigger}")
        print(f"           {lesson.get('rule', '')}")
    return EXIT_OK


def cmd_penalize(args: argparse.Namespace) -> int:
    source = validate_source(args.source)
    if isinstance(source, int):
        return source

    store = load_store()
    if isinstance(store, int):
        return store

    lesson_id = (args.id or "").strip().upper()
    lesson = next((item for item in store["lessons"] if item.get("id") == lesson_id), None)
    if not lesson:
        return fail(f"no such lesson: {lesson_id}")

    if lesson.get("status") != "confirmed":
        return fail(
            f"{lesson_id} is {lesson.get('status')} - only confirmed lessons can be penalized"
        )

    try:
        lesson["penalties"] = int(lesson.get("penalties") or 0) + 1
    except (TypeError, ValueError):
        return fail(f"{lesson_id} has a corrupt penalties field")
    lesson["updated"] = today_iso()
    lesson["source"] = source[1]

    if lesson["penalties"] >= QUARANTINE_AFTER_PENALTIES:
        lesson["status"] = "quarantined"
        save_store(store)
        return ok(
            f"{lesson_id} quarantined after {lesson['penalties']} penalties - "
            "stop loading it as guidance"
        )

    save_store(store)
    return ok(f"{lesson_id} penalized ({lesson['penalties']}/{QUARANTINE_AFTER_PENALTIES})")


def cmd_prune(args: argparse.Namespace) -> int:
    store = load_store()
    if isinstance(store, int):
        return store

    cutoff = date.today() - PRUNE_AFTER
    kept: list[dict] = []
    removed: list[str] = []

    for lesson in store["lessons"]:
        updated = parse_iso_date(str(lesson.get("updated") or ""))
        stale_candidate = lesson.get("status") == "candidate" and (
            updated is None or updated <= cutoff
        )
        if stale_candidate:
            removed.append(lesson.get("id", "?"))
        else:
            kept.append(lesson)

    store["lessons"] = kept
    save_store(store)
    if removed:
        return ok(f"pruned {len(removed)} stale candidate(s): {', '.join(removed)}")
    return ok("no stale candidates to prune")


def cmd_status(args: argparse.Namespace) -> int:
    store = load_store()
    if isinstance(store, int):
        return store

    counts = {status: 0 for status in STATUSES}
    for lesson in store["lessons"]:
        status = lesson.get("status")
        if status in counts:
            counts[status] += 1

    total = sum(counts.values())
    print(f"[{GATE}] {total} lesson(s) in {STORE_PATH}")
    for status in STATUSES:
        print(f"  {status:<12} {counts[status]}")
    return EXIT_OK


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Manage grounded lessons")
    sub = parser.add_subparsers(dest="command")

    add = sub.add_parser("add", help="record a grounded lesson as a candidate")
    add.add_argument("--title", required=True)
    add.add_argument("--rule", required=True)
    add.add_argument("--source", required=True, help="path to validation.md, optionally :line")
    add.add_argument("--trigger", default="")
    add.add_argument("--feature", default="")
    add.set_defaults(func=cmd_add)

    listing = sub.add_parser("list", help="list lessons (default: confirmed)")
    listing.add_argument("--status", default="confirmed")
    listing.set_defaults(func=cmd_list)

    penalize = sub.add_parser("penalize", help="mark a confirmed lesson that failed to prevent a repeat")
    penalize.add_argument("--id", required=True)
    penalize.add_argument("--source", required=True)
    penalize.set_defaults(func=cmd_penalize)

    prune = sub.add_parser("prune", help="drop candidates idle for 90 days")
    prune.set_defaults(func=cmd_prune)

    status = sub.add_parser("status", help="counts by status")
    status.set_defaults(func=cmd_status)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if not args.command:
        parser.print_help()
        return EXIT_USAGE
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
