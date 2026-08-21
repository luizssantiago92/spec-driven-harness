#!/usr/bin/env python3
"""Granularity gate for `.specs/features/[feature]/tasks.md`.

Run before presenting a task breakdown for approval:

    python3 validate_tasks.py .specs/features/auth/tasks.md
    python3 validate_tasks.py auth
    python3 validate_tasks.py            # when the project has a single feature

Checks:
  * at least one task with a well-formed ID (T1, T2, ...)
  * every task carries Requirement, Files, Depends on, Tests, Gate and Done when
  * Tests and Done when reject placeholder values (none, —, n/a)
  * dependencies reference existing tasks, never forward, never self
  * a task never depends on a task in a later `### Phase N` group
  * dependency graph is acyclic
  * every requirement ID in sibling spec.md is covered by at least one task
  * independent tasks do not share Files paths
  * 3+ tasks require sibling task-graph.md (when validating on disk)
  * vague task titles are flagged as granularity smells

Exit codes: 0 pass, 1 blocking issues, 2 usage error.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from _common import (
    Report,
    find_placeholders,
    normalize_file_path,
    requirement_ids,
    resolve_artifact,
    visible_markdown,
)

GATE = "validate-tasks"

TASK_HEADING = re.compile(
    r"^#{2,6}\s*(?P<id>T\d{1,6})\s*[:\-–]?\s*(?P<title>.*)$",
    re.MULTILINE | re.IGNORECASE,
)
FIELD = re.compile(
    r"^\s*[-*]?\s*\*{0,2}(?P<key>[A-Za-z][A-Za-z ]+?)\*{0,2}\s*:\s*(?P<value>.+?)\s*$",
    re.MULTILINE,
)
# Do not treat REQ-T100 as task T100: a hyphen glued to a letter is not a
# task-id boundary. Still matches T1, T12, and "see T3".
TASK_REF = re.compile(r"(?<![A-Za-z0-9-])T(\d{1,6})\b", re.IGNORECASE)
PHASE_HEADING = re.compile(
    r"^#{1,6}\s*Phase\s+(?P<number>\d+)\b", re.MULTILINE | re.IGNORECASE
)
REQUIREMENT_REF = re.compile(r"\b[A-Z][A-Z0-9]{1,9}-\d{2,4}\b")
NONE_VALUES = {"-", "—", "–", "none", "n/a", "na", "nenhum", "nenhuma", "no"}

REQUIRED_FIELDS = ("requirement", "files", "depends on", "tests", "gate", "done when")
# Depends on: — remains valid (no deps). Files/Gate/Tests/Done when reject none/—.
PLACEHOLDER_FIELDS = frozenset({"done when", "tests", "gate", "files"})
VAGUE_TITLE_WORDS = {
    "implement feature",
    "create form",
    "build ui",
    "do backend",
    "make it work",
    "finish",
    "misc",
    "cleanup",
    "refactor code",
}


def parse_fields(body: str) -> dict[str, str]:
    fields: dict[str, str] = {}
    for match in FIELD.finditer(body):
        key = match.group("key").strip().lower()
        value = match.group("value").strip()
        fields.setdefault(key, value)
    return fields


def split_tasks(text: str) -> list[tuple[str, str, str]]:
    matches = list(TASK_HEADING.finditer(text))
    tasks: list[tuple[str, str, str]] = []

    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        tasks.append(
            (match.group("id").upper(), match.group("title").strip(), text[start:end])
        )

    return tasks


def task_phases(text: str) -> dict[str, int]:
    """Map each task ID to the phase it sits under, or 0 when phases are unused."""

    marks = [
        (match.start(), int(match.group("number")))
        for match in PHASE_HEADING.finditer(text)
    ]

    if not marks:
        return {}

    phases: dict[str, int] = {}

    for match in TASK_HEADING.finditer(text):
        current = 0
        for position, number in marks:
            if position < match.start():
                current = number
            else:
                break
        phases[match.group("id").upper()] = current

    return phases


def parse_dependencies(value: str) -> list[str]:
    if not value or value.strip().lower() in NONE_VALUES:
        return []
    return [f"T{number}" for number in TASK_REF.findall(value)]


def parse_files(value: str) -> list[str]:
    if not value or value.strip().lower() in NONE_VALUES:
        return []
    files: list[str] = []
    for chunk in re.split(r"[,;\n]", value):
        path = normalize_file_path(chunk)
        if path and path.lower() not in NONE_VALUES:
            files.append(path)
    return files


def detect_cycle(graph: dict[str, list[str]]) -> list[str] | None:
    """Iterative DFS so a long dependency chain cannot blow the call stack."""

    visited: set[str] = set()

    for root in graph:
        if root in visited:
            continue

        path: list[str] = []
        on_path: set[str] = set()
        stack: list[tuple[str, bool]] = [(root, False)]

        while stack:
            node, expanded = stack.pop()

            if expanded:
                path.pop()
                on_path.discard(node)
                continue

            if node in visited:
                continue

            if node in on_path:
                return path[path.index(node):] + [node]

            visited.add(node)
            path.append(node)
            on_path.add(node)
            stack.append((node, True))

            for neighbour in graph.get(node, []):
                if neighbour in on_path:
                    return path[path.index(neighbour):] + [neighbour]
                if neighbour not in visited:
                    stack.append((neighbour, False))

    return None


def reachable(graph: dict[str, list[str]], start: str, goal: str) -> bool:
    if start == goal:
        return True
    seen = {start}
    stack = [start]
    while stack:
        node = stack.pop()
        for neighbour in graph.get(node, []):
            if neighbour == goal:
                return True
            if neighbour not in seen:
                seen.add(neighbour)
                stack.append(neighbour)
    return False


def build_report(
    target: str,
    text: str,
    *,
    spec_text: str | None = None,
    feature_dir: Path | None = None,
) -> Report:
    report = Report(gate=GATE, target=target)
    visible = visible_markdown(text)
    tasks = split_tasks(visible)

    if not tasks:
        report.error("no tasks found - use '### T1: Short imperative title'")
        return report

    report.ok(f"{len(tasks)} task(s) with well-formed IDs")

    order: dict[str, int] = {}
    graph: dict[str, list[str]] = {}
    seen: set[str] = set()
    covered_requirements: set[str] = set()
    files_by_task: dict[str, list[str]] = {}

    for position, (task_id, title, body) in enumerate(tasks):
        if task_id in seen:
            report.error(f"duplicate task ID: {task_id}")
        seen.add(task_id)
        order[task_id] = position

        if not title:
            report.error(f"{task_id}: heading has no title")
        elif title.strip().lower() in VAGUE_TITLE_WORDS:
            report.error(f"{task_id}: title is not atomic: '{title}'")
        elif len(title.split()) < 3:
            report.warn(f"{task_id}: title may be too coarse: '{title}'")

        fields = parse_fields(body)

        for required in REQUIRED_FIELDS:
            value = fields.get(required, "")
            missing = not value
            if required in PLACEHOLDER_FIELDS and value.strip().lower() in NONE_VALUES:
                missing = True
            if required == "files" and value and not parse_files(value):
                missing = True
            if missing:
                report.error(f"{task_id}: missing '{required.title()}' field")

        requirement = fields.get("requirement", "")
        if requirement and not REQUIREMENT_REF.search(requirement):
            report.error(
                f"{task_id}: Requirement '{requirement}' does not reference a spec ID"
            )
        covered_requirements.update(REQUIREMENT_REF.findall(requirement))

        files_by_task[task_id] = parse_files(fields.get("files", ""))
        graph[task_id] = parse_dependencies(fields.get("depends on", ""))

    phases = task_phases(visible)
    if phases:
        report.ok(f"{len(set(phases.values()))} execution phase(s) detected")

    for task_id, dependencies in graph.items():
        for dependency in dependencies:
            if dependency == task_id:
                report.error(f"{task_id}: depends on itself")
            elif dependency not in seen:
                report.error(f"{task_id}: depends on unknown task {dependency}")
            elif order[dependency] > order[task_id]:
                report.error(
                    f"{task_id}: forward dependency on {dependency} "
                    "- reorder tasks so dependencies come first"
                )
            elif phases.get(dependency, 0) > phases.get(task_id, 0):
                report.error(
                    f"{task_id} (phase {phases.get(task_id, 0)}): depends on "
                    f"{dependency} from phase {phases[dependency]} "
                    "- a phase never depends on a later one"
                )

    cycle = detect_cycle(graph)
    if cycle:
        report.error(f"dependency cycle detected: {' -> '.join(cycle)}")
    else:
        report.ok("dependency graph is acyclic")

    independent = [task_id for task_id, deps in graph.items() if not deps]
    if len(independent) > 1:
        report.ok(
            f"{len(independent)} task(s) without dependencies - candidates for parallel work "
            "(see task-graph-engineering.md)"
        )

    owners: dict[str, list[str]] = {}
    for task_id, paths in files_by_task.items():
        for path in paths:
            owners.setdefault(path, []).append(task_id)

    for path, writers in owners.items():
        if len(writers) < 2:
            continue
        for index, left in enumerate(writers):
            for right in writers[index + 1 :]:
                if reachable(graph, left, right) or reachable(graph, right, left):
                    continue
                report.error(
                    f"{left} and {right} both write '{path}' with no dependency "
                    "between them - merge the tasks or make one depend on the other"
                )

    if spec_text is not None:
        spec_requirements = requirement_ids(visible_markdown(spec_text))
        if spec_requirements:
            missing = [
                requirement_id
                for requirement_id in spec_requirements
                if requirement_id not in covered_requirements
            ]
            if missing:
                for requirement_id in missing:
                    report.error(
                        f"spec requirement {requirement_id} has no task "
                        "- map it in a task Requirement field"
                    )
            else:
                report.ok(
                    f"all {len(spec_requirements)} spec requirement(s) covered by tasks"
                )

    placeholders = find_placeholders(text)
    if placeholders:
        for item in placeholders[:10]:
            report.error(f"unresolved placeholder at {item}")
    else:
        report.ok("no unresolved placeholders")

    if len(seen) >= 3 and feature_dir is not None:
        graph_path = feature_dir / "task-graph.md"
        if graph_path.is_file():
            report.ok("task-graph.md present for 3+ task breakdown")
        else:
            report.error(
                "3+ tasks require task-graph.md - draw the DAG before approval "
                "(see task-graph-engineering.md)"
            )

    return report


def _load_sibling_spec(tasks_path: Path) -> str | None:
    spec_path = tasks_path.parent / "spec.md"
    if spec_path.is_file():
        return spec_path.read_text(encoding="utf-8")
    return None


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate a feature tasks.md")
    parser.add_argument(
        "tasks",
        nargs="?",
        help="feature name, feature directory, or path to tasks.md",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="treat warnings as blocking failures",
    )
    args = parser.parse_args(argv)

    path, text = resolve_artifact(args.tasks, "tasks.md", GATE)
    report = build_report(
        str(path),
        text,
        spec_text=_load_sibling_spec(path),
        feature_dir=path.parent,
    )
    return report.emit(strict=args.strict)


if __name__ == "__main__":
    sys.exit(main())
