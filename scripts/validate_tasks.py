#!/usr/bin/env python3
"""Granularity gate for `.specs/features/[feature]/tasks.md`.

Run before presenting a task breakdown for approval:

    python3 validate_tasks.py .specs/features/auth/tasks.md

Checks:
  * at least one task with a well-formed ID (T1, T2, ...)
  * every task carries Requirement, Depends on, Tests and Gate fields
  * dependencies reference existing tasks, never forward, never self
  * dependency graph is acyclic
  * vague task titles are flagged as granularity smells

Exit codes: 0 pass, 1 blocking issues, 2 usage error.
"""

from __future__ import annotations

import argparse
import re
import sys

from _common import Report, find_placeholders, read_artifact

GATE = "validate-tasks"

TASK_HEADING = re.compile(
    r"^#{2,6}\s*(?P<id>T\d{1,3})\s*[:\-–]?\s*(?P<title>.*)$",
    re.MULTILINE | re.IGNORECASE,
)
FIELD = re.compile(
    r"^\s*[-*]?\s*\*{0,2}(?P<key>[A-Za-z][A-Za-z ]+?)\*{0,2}\s*:\s*(?P<value>.+?)\s*$",
    re.MULTILINE,
)
TASK_REF = re.compile(r"\bT(\d{1,3})\b", re.IGNORECASE)
REQUIREMENT_REF = re.compile(r"\b[A-Z][A-Z0-9]{1,9}-\d{2,4}\b")
NONE_VALUES = {"-", "—", "–", "none", "n/a", "na", "nenhum", "nenhuma", "no"}

REQUIRED_FIELDS = ("requirement", "depends on", "tests", "gate")
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


def parse_dependencies(value: str) -> list[str]:
    if not value or value.strip().lower() in NONE_VALUES:
        return []
    return [f"T{number}" for number in TASK_REF.findall(value)]


def detect_cycle(graph: dict[str, list[str]]) -> list[str] | None:
    visiting: set[str] = set()
    visited: set[str] = set()
    stack: list[str] = []

    def walk(node: str) -> list[str] | None:
        if node in visited:
            return None
        if node in visiting:
            return stack[stack.index(node):] + [node]

        visiting.add(node)
        stack.append(node)

        for neighbour in graph.get(node, []):
            cycle = walk(neighbour)
            if cycle:
                return cycle

        stack.pop()
        visiting.discard(node)
        visited.add(node)
        return None

    for node in graph:
        cycle = walk(node)
        if cycle:
            return cycle

    return None


def build_report(target: str, text: str) -> Report:
    report = Report(gate=GATE, target=target)
    tasks = split_tasks(text)

    if not tasks:
        report.error("no tasks found - use '### T1: Short imperative title'")
        return report

    report.ok(f"{len(tasks)} task(s) with well-formed IDs")

    order: dict[str, int] = {}
    graph: dict[str, list[str]] = {}
    seen: set[str] = set()

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
            if required not in fields or not fields[required]:
                report.error(f"{task_id}: missing '{required.title()}' field")

        requirement = fields.get("requirement", "")
        if requirement and not REQUIREMENT_REF.search(requirement):
            report.error(
                f"{task_id}: Requirement '{requirement}' does not reference a spec ID"
            )

        graph[task_id] = parse_dependencies(fields.get("depends on", ""))

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

    placeholders = find_placeholders(text)
    if placeholders:
        for item in placeholders[:10]:
            report.error(f"unresolved placeholder at {item}")
    else:
        report.ok("no unresolved placeholders")

    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate a feature tasks.md")
    parser.add_argument("tasks", help="path to .specs/features/[feature]/tasks.md")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="treat warnings as blocking failures",
    )
    args = parser.parse_args(argv)

    path, text = read_artifact(args.tasks, GATE)
    report = build_report(str(path), text)
    return report.emit(strict=args.strict)


if __name__ == "__main__":
    sys.exit(main())
