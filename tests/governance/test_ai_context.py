"""Governance-only regression tests, Python standard library unittest."""
from __future__ import annotations

import importlib.util
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

SOURCE = Path(__file__).resolve().parents[2] / 'scripts' / 'ai_context.py'
spec = importlib.util.spec_from_file_location('ai_context', SOURCE)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class GovernanceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.write('AGENTS.md', '# Agent Contract\n')
        self.write('.ai/core/README.md', '# Core Rules\n')
        self.write('.ai/discussions/README.md', '# Discussion Guide\n')
        self.write('.ai/tasks/README.md', '# Task Guide\n')
        self.write('.ai/tasks/TEMPLATE.md', '# Task Name\n\n[Agent](../../AGENTS.md) · [Core](../core/README.md) · [Discussion](../discussions/README.md) · [Guide](README.md)\n')
        self.write('.ai/current.md', '# Index\n')
        self.write('.ai/agents/registry.md', '# Registry\n')
        self.write('docs/DECISIONS.md', '# Decisions\n')

    def write(self, name, content):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding='utf-8')
        return path

    def create(self, apply=True):
        return module.create_task(self.root, SimpleNamespace(scope='governance', slug='case-001', apply=apply))

    def test_nested_template_links_dry_run_then_create(self):
        self.create(apply=False)
        task = self.root / '.ai/tasks/governance/case-001.md'
        self.assertFalse(task.exists())
        self.create(apply=True)
        self.assertTrue(task.exists())
        text = task.read_text()
        self.assertIn('../../../AGENTS.md', text)
        self.assertIn('../../core/README.md', text)
        self.assertIn('../../discussions/README.md', text)
        self.assertIn('../README.md', text)
        self.assertEqual(module.validate_links(self.root, module.all_markdown(self.root)), [])

    def test_archive_rewrites_outgoing_and_all_incoming_links(self):
        self.create()
        self.write('.ai/current.md', '[task](tasks/governance/case-001.md#task-name)\n')
        self.write('.ai/agents/registry.md', '[agent](../tasks/governance/case-001.md)\n')
        self.write('docs/DECISIONS.md', '[decision](../.ai/tasks/governance/case-001.md)\n')
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=False, verified_terminal=False)
        original = self.root / '.ai/tasks/governance/case-001.md'
        before = original.read_text()
        preview = module.archive_task(self.root, args)
        self.assertIn('DRY-RUN', preview[0])
        self.assertEqual(original.read_text(), before)
        args.apply, args.verified_terminal = True, True
        module.archive_task(self.root, args)
        dest = self.root / '.ai/archive/2026/case-001.md'
        self.assertTrue(dest.exists())
        self.assertFalse(original.exists())
        self.assertIn('../../../AGENTS.md', dest.read_text())
        self.assertIn('../../core/README.md', dest.read_text())
        self.assertIn('archive/2026/case-001.md#task-name', (self.root / '.ai/current.md').read_text())
        self.assertIn('../archive/2026/case-001.md', (self.root / '.ai/agents/registry.md').read_text())
        self.assertIn('../.ai/archive/2026/case-001.md', (self.root / 'docs/DECISIONS.md').read_text())
        self.assertEqual(module.validate_links(self.root, module.all_markdown(self.root), anchors=True), [])

    def test_archive_requires_terminal_and_rejects_collision(self):
        self.create()
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=True, verified_terminal=False)
        with self.assertRaises(module.GovernanceError):
            module.archive_task(self.root, args)
        self.assertTrue((self.root / args.task).exists())
        args.verified_terminal = True
        self.write('.ai/archive/2026/case-001.md', '# Collision')
        with self.assertRaises(module.GovernanceError):
            module.archive_task(self.root, args)

    def test_rejects_traversal_and_symlinks(self):
        with self.assertRaises(module.GovernanceError):
            module.create_task(self.root, SimpleNamespace(scope='../evil', slug='case-001', apply=True))
        self.create()
        args = SimpleNamespace(task='.ai/tasks/governance/../../AGENTS.md', year='2026', apply=False, verified_terminal=False)
        with self.assertRaises(module.GovernanceError):
            module.archive_task(self.root, args)
        outside = self.root.parent / 'external_governance_fixture'
        symlink = self.root / '.ai/tasks/link'
        try:
            symlink.symlink_to(outside, target_is_directory=True)
            with self.assertRaises(module.GovernanceError):
                module.safe_path(self.root, symlink / 'bad.md')
        finally:
            symlink.unlink(missing_ok=True)

    def test_missing_anchor_blocks_archive_without_changes(self):
        self.create()
        self.write('.ai/current.md', '[bad](tasks/governance/case-001.md#absent-heading)\n')
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=True, verified_terminal=True)
        self.assertTrue(module.validate_links(self.root, module.all_markdown(self.root), anchors=True))
        with self.assertRaises(module.GovernanceError):
            module.archive_task(self.root, args)
        self.assertTrue((self.root / args.task).exists())
        self.assertFalse((self.root / ".ai/archive/2026/case-001.md").exists())

    def test_unrelated_links_and_fenced_examples_not_rewritten(self):
        self.create()
        self.write('.ai/current.md', '[Other](../AGENTS.md) [Moved](tasks/governance/case-001.md)\n```md\n[Demo](tasks/governance/case-001.md)\n```\n')
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=True, verified_terminal=True)
        module.archive_task(self.root, args)
        actual = (self.root / '.ai/current.md').read_text()
        self.assertIn('[Other](../AGENTS.md)', actual)
        self.assertIn('[Moved](archive/2026/case-001.md)', actual)
        self.assertIn('```md\n[Demo](tasks/governance/case-001.md)\n```', actual)

    def test_state_gate_proceed_is_not_owner_signoff(self):
        def args(before, after, **kw):
            return SimpleNamespace(before=before, after=after, rfc_recorded=kw.get('rfc', False), proceed_recorded=kw.get('proceed', False), branch_verified=kw.get('branch', False), owner_merge_approved=kw.get('merge', False), terminal_verified=kw.get('terminal', False))
        with self.assertRaises(module.GovernanceError):
            module.check_transition(args('DECISION_PENDING', 'APPROVED'))
        module.check_transition(args('DECISION_PENDING', 'APPROVED', rfc=True, proceed=True))
        with self.assertRaises(module.GovernanceError):
            module.check_transition(args('ASSIGNED', 'IN_PROGRESS', rfc=True, proceed=True))
        module.check_transition(args('ASSIGNED', 'IN_PROGRESS', rfc=True, proceed=True, branch=True))
        with self.assertRaises(module.GovernanceError):
            module.check_transition(args('IN_REVIEW', 'COMPLETED', terminal=True))
        module.check_transition(args('IN_REVIEW', 'COMPLETED', merge=True, terminal=True))
        with self.assertRaises(module.GovernanceError):
            module.check_transition(args('PROPOSED', 'ARCHIVED', merge=True, terminal=True))

    def test_forbid_all_coauthored_by_trailers(self):
        for name in ('Claude Opus 5.5', 'Codex', 'Cursor', 'Human User'):
            line = f'fix: safer action\n\nCo-Authored-By: {name} <noreply@example.invalid>\n'
            self.assertTrue(module.COAUTHOR.search(line))
        self.assertTrue(module.COAUTHOR.search('co_authored_by: Agent <noreply@example.invalid>'))
        self.assertFalse(module.COAUTHOR.search('docs: Explain why Co-authored-by trailers are prohibited'))

    def test_git_commit_history_checker(self):
        def git(*args):
            result = subprocess.run(['git', '-C', str(self.root), *args], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            return result.stdout.strip()
        git('init', '-q')
        git('config', 'user.name', 'Test Human')
        git('config', 'user.email', 'test@example.invalid')
        git('add', '.')
        git('commit', '-qm', 'chore: initial')
        base = git('rev-parse', 'HEAD')
        self.write('sample.txt', 'ok')
        git('add', 'sample.txt')
        git('commit', '-qm', 'chore: second commit')
        self.assertIn('PASS 1 commit', module.check_commits(self.root, base, 'HEAD')[0])
        self.write('sample.txt', 'changed')
        git('add', 'sample.txt')
        git('commit', '-qm', 'fix: unsafe', '-m', 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')
        with self.assertRaises(module.GovernanceError):
            module.check_commits(self.root, base, 'HEAD')


if __name__ == '__main__':
    unittest.main()
