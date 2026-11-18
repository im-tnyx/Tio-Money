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
import json
import tempfile
import stat
from pathlib import Path
from urllib.parse import quote, unquote

LINK = re.compile(r'(!?\[[^\]\n]+\]\()(<[^>\n]+>|[^\s)]+)(\s+"[^"]*")?(\))')
FENCE = re.compile(r'^\s*(```|~~~)')
# Bounded CommonMark-style single-line definitions. Complex/multiline definitions
# intentionally fail closed during relocation instead of being silently orphaned.
REF_START = re.compile(r'^[ \t]{0,3}\[(?!\^)[^\]\n]+\]:', re.IGNORECASE)
REF_DEF = re.compile(
    r'^(?P<prefix>[ \t]{0,3}\[(?P<label>(?!\^)[^\]\n]+)\]:[ \t]*)'
    r'(?P<target><[^<>\n]+>|[^\s<>]+)'
    r'(?P<suffix>[ \t]*(?:\"[^\"\n]*\"|\'[^\'\n]*\'|\([^()\n]*\))?[ \t]*)$'
)
REF_USE = re.compile(r'(?<!\\)!?\[(?P<text>[^\]\n]+)\]\[(?P<label>[^\]\n]*)\]')

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


def non_fenced_lines(content: str):
    """Iterate lines with a conservative fence classifier (no parsing in fences)."""
    fence = None
    for line in content.splitlines(keepends=True):
        marker = FENCE.match(line)
        if marker:
            kind = marker.group(1)[:3]
            if fence is None:
                fence = kind
            elif fence == kind:
                fence = None
            yield line, False
        else:
            yield line, fence is None


def reference_id(value: str) -> str:
    """Markdown reference labels match case-insensitively with collapsed spaces."""
    return ' '.join(value.split()).casefold()


def reference_definitions(content: str) -> tuple[dict[str, str], list[str]]:
    """Find single-line definitions and reject duplicate or dangling explicit uses."""
    definitions = {}
    uses = []
    for line, active in non_fenced_lines(content):
        if not active:
            continue
        bare = line.rstrip('\r\n')
        if REF_START.match(bare):
            match = REF_DEF.fullmatch(bare)
            if not match:
                raise GovernanceError(f'Unsupported reference definition: {bare[:100]!r}')
            label = reference_id(match.group('label'))
            if not label or label in definitions:
                raise GovernanceError(f'Duplicate or empty reference label: {label!r}')
            target = match.group('target').strip('<>')
            definitions[label] = target
            continue
        for m in REF_USE.finditer(bare):
            uses.append(reference_id(m.group('label') or m.group('text')))
    for label in uses:
        if label not in definitions:
            raise GovernanceError(f'Undefined reference-style link: [{label}]')
    return definitions, uses


def transform_links(content: str, transformer) -> str:
    """Rewrite inline links and single-line reference definitions, not code fences."""
    output = []
    for line, active in non_fenced_lines(content):
        if not active:
            output.append(line)
            continue
        bare = line.rstrip('\r\n')
        ending = line[len(bare):]
        if REF_START.match(bare):
            match = REF_DEF.fullmatch(bare)
            if not match:
                raise GovernanceError(f'Unsupported reference definition: {bare[:100]!r}')
            token = match.group('target')
            wrapped = token.startswith('<') and token.endswith('>')
            href = token[1:-1] if wrapped else token
            new = transformer(href)
            if new != href:
                token = '<' + new + '>' if wrapped else new
            output.append(match.group('prefix') + token + match.group('suffix') + ending)
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


def split_link(href: str) -> tuple[str, str] | None:
    if href.startswith(('#', '?', '/', '//')) or re.match(r'^[a-z][a-z0-9+.-]*:', href, re.I):
        return None
    name, sep, fragment = href.partition('#')
    if not name or '?' in name or not name.lower().endswith('.md'):
        return None
    return unquote(name), ('#' + fragment if sep else '')


def require_safe_references(content: str, *, relocated: bool = False) -> None:
    """Refuse unknown relative resources when their containing document is moved."""
    definitions, _ = reference_definitions(content)
    if relocated:
        for target in definitions.values():
            if not split_link(target) and not (
                target.startswith(('#', '/', '//', '?')) or
                re.match(r'^[a-z][a-z0-9+.-]*:', target, re.I)
            ):
                raise GovernanceError(f'Unsupported relative reference during relocation: {target!r}')


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
    return quote(path, safe='/._-') + fragment


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


def validate_links(root: Path, files: dict[Path, str], *, anchors: bool = False,
                   removed: set[Path] | None = None) -> list[str]:
    issues = []
    anchor_cache = {}
    removed = removed or set()
    for source, content in sorted(files.items()):
        try:
            require_safe_references(content)
        except GovernanceError as exc:
            issues.append(f'{source.relative_to(root)}: {exc}')
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
            if target in removed or (target not in files and not target.is_file()):
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
        try:
            transform_links(content, check)
        except GovernanceError as exc:
            message = f'{source.relative_to(root)}: {exc}'
            if message not in issues:
                issues.append(message)
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
    require_safe_references(source, relocated=True)
    content = transform_links(source, lambda href: relative_link(root, href, old.parent, target.parent))
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
    old_body = planned.pop(source)
    require_safe_references(old_body, relocated=True)
    moved = transform_links(old_body, lambda h: relative_link(root, h, source.parent, target.parent, source, target))
    planned[target] = moved
    modified = {}
    for path, text in list(planned.items()):
        if path == target:
            continue
        updated = transform_links(text, lambda h, path=path: relative_link(root, h, path.parent, path.parent, source, target))
        if updated != text:
            planned[path] = updated
            modified[path] = updated
    issues = validate_links(root, planned, anchors=True, removed={source})
    if issues:
        raise GovernanceError('; '.join(issues[:20]))
    lines = [f'{"ARCHIVE" if args.apply else "DRY-RUN"} {source.relative_to(root)} -> {target.relative_to(root)}']
    lines.extend(f'REWRITE {p.relative_to(root)}' for p in sorted(modified))
    if args.apply:
        apply_archive(root, source, target, moved, modified, originals)
    return lines


def apply_archive(root: Path, source: Path, target: Path, moved: str,
                  modified: dict[Path, str], originals: dict[Path, str]) -> None:
    """Stage files, replace them, and restore on ordinary I/O failures.

    Multi-file updates cannot be crash-atomic; Git is the ultimate recovery path.
    """
    changes = {target: moved, **modified}
    staged = {}
    replaced = []
    try:
        # Preflight all existing files before touching the contents.
        if not source.is_file() or source.read_text(encoding='utf-8') != originals[source]:
            raise GovernanceError('Task changed since validation; abort archive')
        for path in modified:
            safe_path(root, path)
            if not path.is_file() or path.read_text(encoding='utf-8') != originals[path]:
                raise GovernanceError(f'File changed during archive planning: {path}')
        for path, content in sorted(changes.items()):
            safe_path(root, path)
            path.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=path.parent,
                                             prefix='.ai-context-', delete=False) as f:
                staged[path] = Path(f.name)
                f.write(content)
            os.chmod(staged[path], stat.S_IMODE(path.stat().st_mode) if path.exists() else 0o644)
        for path, temp in sorted(staged.items()):
            safe_path(root, path)
            os.replace(temp, path)
            replaced.append(path)
        source.unlink()  # last, only after new task and incoming refs are written
    except Exception:
        for path in reversed(replaced):
            if path == target:
                path.unlink(missing_ok=True)
            else:
                # This is best-effort rollback; if filesystem operations continue
                # to fail, Git checkout/restore is the documented recovery path.
                try:
                    path.write_text(originals[path], encoding='utf-8')
                except OSError:
                    pass
        raise
    finally:
        for staged_path in staged.values():
            staged_path.unlink(missing_ok=True)


def read_recovery_record(path: str) -> dict:
    """Read a human attestation (NOT independently verified GitHub evidence)."""
    if not path:
        raise GovernanceError('BLOCKED recovery requires --recovery-record FILE (self-attested)')
    try:
        record = json.loads(Path(path).read_text(encoding='utf-8'))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise GovernanceError('Invalid or unreadable recovery record') from exc
    if not isinstance(record, dict):
        raise GovernanceError('Recovery record must be a JSON object')
    required = ('blocker_disposition', 'blocker_evidence', 'risk_clearance_evidence', 'last_active_state')
    if any(not isinstance(record.get(k), str) or not record[k].strip() for k in required):
        raise GovernanceError('Recovery record missing blocker/risk/state evidence')
    if record['blocker_disposition'] not in {'RESOLVED', 'EXPLICITLY_ACCEPTED'}:
        raise GovernanceError('Blocker must be RESOLVED or EXPLICITLY_ACCEPTED')
    if record['blocker_disposition'] == 'EXPLICITLY_ACCEPTED' and not (
            isinstance(record.get('acceptance_authority'), str) and
            record['acceptance_authority'].strip()):
        raise GovernanceError('Accepted blocker requires an attested acceptance authority/source')
    return record


def check_transition(args) -> None:
    before, after = args.before, args.after
    if after not in STATES[before]:
        raise GovernanceError(f'Invalid transition {before} -> {after}')
    # These are self-attestations, not verification of GitHub identities/permissions.
    starting = args.rfc_recorded and args.proceed_recorded and args.branch_verified
    if after == 'APPROVED' and not (args.rfc_recorded and args.proceed_recorded):
        raise GovernanceError('APPROVED requires recorded RFC and proceed decision (owner signoff optional)')
    if after == 'ASSIGNED' and not starting:
        raise GovernanceError('ASSIGNED requires RFC, proceed decision and verified branch')
    if after == 'IN_PROGRESS' and not starting:
        raise GovernanceError('IN_PROGRESS requires RFC, proceed decision and verified branch')
    if after == 'IN_REVIEW' and not (args.review_recorded and args.pr_recorded):
        raise GovernanceError('IN_REVIEW requires recorded PR and independent review request')
    if before == 'BLOCKED' and after in {'ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW'}:
        if not starting:
            raise GovernanceError('BLOCKED recovery requires RFC, PROCEED and verified branch')
        record = read_recovery_record(args.recovery_record)
        allowed_prior = {
            'ASSIGNED': {'APPROVED', 'ASSIGNED'},
            'IN_PROGRESS': {'ASSIGNED', 'IN_PROGRESS', 'VALIDATING', 'IN_REVIEW'},
            'IN_REVIEW': {'VALIDATING', 'IN_REVIEW'},
        }
        if record['last_active_state'] not in allowed_prior[after]:
            raise GovernanceError('Recovery conflicts with last known active task state')
    if before == 'IN_REVIEW' and after == 'COMPLETED' and not (
            args.owner_merge_approved and args.terminal_verified):
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
    t.add_argument('--review-recorded', action='store_true', help='self-attested independent review request')
    t.add_argument('--pr-recorded', action='store_true', help='self-attested PR link')
    t.add_argument('--recovery-record', default='', metavar='FILE', help='self-attested JSON blocker/risk/state evidence')
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
