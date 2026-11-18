#!/usr/bin/env python3
"""Tio Money governance helper. Standard library only; --apply is opt-in.

The helper checks document structure, not GitHub permissions or owner identity.
No commit message may contain a Co-authored-by trailer (AI or otherwise).
"""
from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote

LINK = re.compile(r'(!?\[[^\]\n]+\]\()(<[^>\n]+>|[^\s)]+)(\s+"[^"]*")?(\))')
FENCE = re.compile(r'^\s*(```|~~~)')
SLUG = re.compile(r'[a-z0-9][a-z0-9_-]*\Z')
COAUTHOR = re.compile(r'^\s*co[\s_-]*authored[\s_-]*by\s*:', re.IGNORECASE | re.MULTILINE)
IGNORED_DIRS = {'.git', 'node_modules', '.expo', 'dist', 'coverage', '.venv', 'venv'}
STATES = {
    'PROPOSED': {'DISCUSSION', 'CANCELLED'},
    'DISCUSSION': {'DECISION_PENDING', 'DEFERRED', 'CANCELLED'},
    'DECISION_PENDING': {'APPROVED', 'CHANGES_REQUESTED', 'DEFERRED', 'BLOCKED', 'CANCELLED'},
    'APPROVED': {'ASSIGNED', 'DISCUSSION', 'CANCELLED'},
    'ASSIGNED': {'IN_PROGRESS', 'BLOCKED', 'DISCUSSION', 'CANCELLED'},
    'IN_PROGRESS': {'VALIDATING', 'BLOCKED', 'DISCUSSION', 'CANCELLED'},
    'VALIDATING': {'IN_REVIEW', 'IN_PROGRESS', 'BLOCKED'},
    'IN_REVIEW': {'IN_PROGRESS', 'COMPLETED', 'BLOCKED'},
    'COMPLETED': {'ARCHIVED'},
    'ARCHIVED': set(),
    'BLOCKED': {'DISCUSSION', 'DECISION_PENDING', 'ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW', 'CANCELLED'},
    'DEFERRED': {'DISCUSSION', 'CANCELLED'},
    'CANCELLED': set(),
    'CHANGES_REQUESTED': {'DISCUSSION', 'CANCELLED'},
}


class GovernanceError(Exception):
    pass


def safe_path(root: Path, path: Path) -> Path:
    """Reject traversal outside repo and symlinks in any existing component."""
    path = Path(path)
    raw = path if path.is_absolute() else root / path
    absolute = Path(os.path.abspath(raw))
    try:
        components = absolute.relative_to(root).parts
    except ValueError as exc:
        raise GovernanceError(f'Path escapes repository: {path}') from exc
    node = root
    for part in components:
        node /= part
        if node.is_symlink():
            raise GovernanceError(f'Symlink not allowed: {node}')
    return absolute


def markdown_files(root: Path) -> list[Path]:
    result = []
    for directory, dirs, files in os.walk(root, followlinks=False):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS and not (Path(directory) / d).is_symlink()]
        for name in files:
            p = Path(directory) / name
            if p.suffix.lower() == '.md' and not p.is_symlink():
                result.append(safe_path(root, p))
    return sorted(result)


def split_link(href: str) -> tuple[str, str] | None:
    if href.startswith(('#', '?', '/', '//')) or re.match(r'^[a-z][a-z0-9+.-]*:', href, re.I):
        return None
    name, sep, fragment = href.partition('#')
    if not name or '?' in name or not name.lower().endswith('.md'):
        return None
    return unquote(name), ('#' + fragment if sep else '')


def transform_links(content: str, transformer) -> str:
    """Handle simple inline Markdown links; leave fenced examples untouched."""
    output = []
    fence = None
    for line in content.splitlines(keepends=True):
        f = FENCE.match(line)
        if f:
            kind = f.group(1)[:3]
            if fence is None:
                fence = kind
            elif fence == kind:
                fence = None
            output.append(line)
            continue
        if fence:
            output.append(line)
            continue

        def replace(match):
            raw = match.group(2)
            wrapped = raw.startswith('<') and raw.endswith('>')
            old = raw[1:-1] if wrapped else raw
            new = transformer(old)
            if old == new:
                return match.group(0)
            return match.group(1) + ('<' + new + '>' if wrapped else new) + (match.group(3) or '') + match.group(4)

        output.append(LINK.sub(replace, line))
    return ''.join(output)


def relative_link(root: Path, href: str, old_dir: Path, new_dir: Path,
                  old_target: Path | None = None, new_target: Path | None = None) -> str:
    result = split_link(href)
    if not result:
        return href
    raw, fragment = result
    target = safe_path(root, old_dir / raw)
    if old_target is not None and old_dir == new_dir and target != old_target:
        return href  # do not reformat unrelated links during inbound-reference repair
    if target == old_target:
        target = new_target
    path = os.path.relpath(target, new_dir).replace(os.sep, '/')
    return path + fragment


def slug_heading(heading: str) -> str:
    heading = re.sub(r'<[^>]+>', '', heading).strip().lower()
    heading = re.sub(r'[^\w\- ]', '', heading, flags=re.UNICODE)
    return heading.replace(' ', '-')


def anchors_of(content: str) -> set[str]:
    seen = {}
    ids = set()
    for line in content.splitlines():
        match = re.match(r'^#{1,6}\s+(.+?)\s*#*\s*$', line)
        if match:
            slug = slug_heading(match.group(1))
            n = seen.get(slug, 0)
            seen[slug] = n + 1
            ids.add(slug + (f'-{n}' if n else ''))
        ids.update(re.findall(r'<a\s+(?:[^>]*\s)?id=["\']([^"\']+)', line))
    return ids


def validate_links(root: Path, files: dict[Path, str], *, anchors: bool = False) -> list[str]:
    issues = []
    anchor_cache = {}
    for source, content in sorted(files.items()):
        def check(href):
            parts = split_link(href)
            if not parts:
                return href
            name, fragment = parts
            try:
                target = safe_path(root, source.parent / name)
            except GovernanceError as exc:
                issues.append(f'{source.relative_to(root)}: {exc}')
                return href
            if target not in files and not target.is_file():
                issues.append(f'{source.relative_to(root)}: missing {href}')
            elif anchors and fragment:
                if target not in anchor_cache:
                    text = files.get(target)
                    if text is None:
                        text = target.read_text(encoding='utf-8')
                    anchor_cache[target] = anchors_of(text)
                if unquote(fragment[1:]) not in anchor_cache[target]:
                    issues.append(f'{source.relative_to(root)}: missing anchor {href}')
            return href
        transform_links(content, check)
    return issues


def all_markdown(root: Path) -> dict[Path, str]:
    return {p: p.read_text(encoding='utf-8') for p in markdown_files(root)}


def create_task(root: Path, args) -> list[str]:
    if not SLUG.fullmatch(args.scope) or not SLUG.fullmatch(args.slug):
        raise GovernanceError('Scope and slug must use a-z, 0-9, _ or - without traversal')
    old = safe_path(root, '.ai/tasks/TEMPLATE.md')
    target = safe_path(root, Path('.ai/tasks') / args.scope / (args.slug + '.md'))
    if target.exists():
        raise GovernanceError(f'Task already exists: {target}')
    if not old.is_file():
        raise GovernanceError('Task template is missing')
    source = old.read_text(encoding='utf-8')
    content = transform_links(source, lambda href: relative_link(root, href, old.parent, target.parent))
    files = all_markdown(root)
    files[target] = content
    issues = validate_links(root, {target: content})
    if issues:
        raise GovernanceError('; '.join(issues))
    if args.apply:
        target.parent.mkdir(parents=True, exist_ok=True)
        safe_path(root, target)
        with target.open('x', encoding='utf-8') as handle:
            handle.write(content)
    return [f'{"CREATED" if args.apply else "DRY-RUN"} {target.relative_to(root)}']


def archive_task(root: Path, args) -> list[str]:
    if not re.fullmatch(r'20\d{2}', args.year):
        raise GovernanceError('Archive year must be YYYY beginning with 20')
    if '..' in Path(args.task).parts:
        raise GovernanceError('Traversal in task path is forbidden')
    source = safe_path(root, Path(args.task))
    tasks_root = safe_path(root, '.ai/tasks')
    if not source.is_relative_to(tasks_root) or source.parent == tasks_root or source.name == 'TEMPLATE.md':
        raise GovernanceError('Only nested active task records may be archived')
    if not source.is_file():
        raise GovernanceError('Task does not exist')
    target = safe_path(root, Path('.ai/archive') / args.year / source.name)
    if target.exists():
        raise GovernanceError('Archive destination already exists')
    if args.apply and not args.verified_terminal:
        raise GovernanceError('--apply requires --verified-terminal (manual assertion, not GitHub verification)')
    originals = all_markdown(root)
    planned = originals.copy()
    moved = transform_links(planned.pop(source), lambda h: relative_link(root, h, source.parent, target.parent, source, target))
    planned[target] = moved
    modified = {}
    for path, text in list(planned.items()):
        if path == target:
            continue
        updated = transform_links(text, lambda h, path=path: relative_link(root, h, path.parent, path.parent, source, target))
        if updated != text:
            planned[path] = updated
            modified[path] = updated
    issues = validate_links(root, {target: moved, **modified}, anchors=True)
    if issues:
        raise GovernanceError('; '.join(issues[:20]))
    lines = [f'{"ARCHIVE" if args.apply else "DRY-RUN"} {source.relative_to(root)} -> {target.relative_to(root)}']
    lines.extend(f'REWRITE {p.relative_to(root)}' for p in sorted(modified))
    if args.apply:
        target.parent.mkdir(parents=True, exist_ok=True)
        safe_path(root, target)
        with target.open('x', encoding='utf-8') as handle:
            handle.write(moved)
        # Files are prevalidated in-memory, but a filesystem crash can interrupt an
        # archive. Review git diff and recover with Git, rather than implying atomicity.
        for path, updated in sorted(modified.items()):
            path.write_text(updated, encoding='utf-8')
        source.unlink()
    return lines


def check_transition(args) -> None:
    before, after = args.before, args.after
    if after not in STATES[before]:
        raise GovernanceError(f'Invalid transition {before} -> {after}')
    if after == 'APPROVED' and not (args.rfc_recorded and args.proceed_recorded):
        raise GovernanceError('APPROVED requires a recorded RFC and proceed decision (owner signoff optional)')
    if after == 'IN_PROGRESS' and not (args.rfc_recorded and args.proceed_recorded and args.branch_verified):
        raise GovernanceError('IN_PROGRESS requires RFC, proceed decision and verified branch')
    if before == 'IN_REVIEW' and after == 'COMPLETED' and not (args.owner_merge_approved and args.terminal_verified):
        raise GovernanceError('PR completion requires separate owner merge approval and verified terminal state')


def check_commits(root: Path, base: str, head: str) -> list[str]:
    for ref in (base, head):
        if not re.fullmatch(r'[a-zA-Z0-9_./-]+', ref) or ref.startswith('-') or '..' in ref or '@{' in ref:
            raise GovernanceError('Unsafe commit ref')
    def git(*params):
        r = subprocess.run(['git', '-C', str(root), *params], text=True, capture_output=True)
        if r.returncode:
            raise GovernanceError('git command failed: ' + r.stderr.strip()[:300])
        return r.stdout
    shas = [x for x in git('rev-list', f'{base}..{head}').splitlines() if x]
    for sha in shas:
        message = git('show', '-s', '--format=%B', sha)
        if COAUTHOR.search(message):
            raise GovernanceError(f'Forbidden Co-authored-by trailer in commit {sha}; never credit AI agents in commit messages')
    return [f'PASS {len(shas)} commit messages: no Co-authored-by trailers']


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo-root', type=Path, default=Path(__file__).resolve().parent.parent)
    sub = parser.add_subparsers(dest='command', required=True)
    c = sub.add_parser('create-task', help='Rebase template links; dry run by default')
    c.add_argument('--scope', required=True)
    c.add_argument('--slug', required=True)
    c.add_argument('--apply', action='store_true')
    a = sub.add_parser('archive-task', help='Repair all Markdown references; dry run by default')
    a.add_argument('--task', required=True)
    a.add_argument('--year', required=True)
    a.add_argument('--apply', action='store_true')
    a.add_argument('--verified-terminal', action='store_true', help='Operator assertion; does not query GitHub')
    l = sub.add_parser('check-links')
    l.add_argument('--anchors', action='store_true', help='Check conventional headings; complex GitHub slugs may differ')
    t = sub.add_parser('check-transition')
    t.add_argument('--before', required=True, choices=sorted(STATES))
    t.add_argument('--after', required=True, choices=sorted(STATES))
    t.add_argument('--rfc-recorded', action='store_true')
    t.add_argument('--proceed-recorded', action='store_true')
    t.add_argument('--branch-verified', action='store_true')
    t.add_argument('--owner-merge-approved', action='store_true')
    t.add_argument('--terminal-verified', action='store_true')
    commit = sub.add_parser('check-commits', help='Reject ALL Co-authored-by trailers, including AI attribution')
    commit.add_argument('--base', required=True)
    commit.add_argument('--head', required=True)
    args = parser.parse_args(argv)
    root = Path(os.path.abspath(args.repo_root))
    if not root.is_dir() or root.is_symlink():
        parser.error('repository root does not exist or is a symlink')
    try:
        if args.command == 'create-task':
            results = create_task(root, args)
        elif args.command == 'archive-task':
            results = archive_task(root, args)
        elif args.command == 'check-links':
            issues = validate_links(root, all_markdown(root), anchors=args.anchors)
            if issues:
                raise GovernanceError('\n'.join(issues[:40]))
            results = ['PASS: local Markdown targets resolve']
        elif args.command == 'check-transition':
            check_transition(args)
            results = [f'PASS: {args.before} -> {args.after} (self-attested evidence only)']
        else:
            results = check_commits(root, args.base, args.head)
    except (GovernanceError, OSError, UnicodeError) as exc:
        print('FAIL: ' + str(exc), file=sys.stderr)
        return 1
    print('\n'.join(results))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
