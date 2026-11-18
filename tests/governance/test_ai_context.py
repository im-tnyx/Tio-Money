"""Governance-only regression tests, Python standard library unittest."""
from __future__ import annotations

import importlib.util
import json
from unittest import mock
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



    def test_reference_style_in_nested_task_creation_and_archiving(self):
        self.write('.ai/tasks/TEMPLATE.md',
                   '# Task Name\n\n[Agent][root] [Core][RULES]\n'
                   '[root]: ../../AGENTS.md#agent-contract\n'
                   '[rules]: ../core/README.md#core-rules "core title"\n')
        self.create()
        task = self.root / '.ai/tasks/governance/case-001.md'
        self.assertIn('[root]: ../../../AGENTS.md#agent-contract', task.read_text())
        self.assertIn('[rules]: ../../core/README.md#core-rules "core title"', task.read_text())
        self.write('.ai/current.md', '[Task][gov]\n[gov]: tasks/governance/case-001.md#task-name\n')
        self.write('.ai/agents/registry.md',
                   '[Task][Registry]\n[registry]: <../tasks/governance/case-001.md#task-name> "reference title"\n')
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=True, verified_terminal=True)
        module.archive_task(self.root, args)
        dest = self.root / '.ai/archive/2026/case-001.md'
        self.assertIn('[root]: ../../../AGENTS.md#agent-contract', dest.read_text())
        self.assertIn('[rules]: ../../core/README.md#core-rules', dest.read_text())
        self.assertIn('[gov]: archive/2026/case-001.md#task-name', (self.root / '.ai/current.md').read_text())
        self.assertIn('[registry]: <../archive/2026/case-001.md#task-name> "reference title"',
                      (self.root / '.ai/agents/registry.md').read_text())
        self.assertEqual(module.validate_links(self.root, module.all_markdown(self.root), anchors=True), [])

    def test_reference_style_missing_destination_rejects_no_mutation(self):
        self.create()
        index = self.write('.ai/current.md', '[task][gov]\n[gov]: tasks/governance/missing.md\n')
        old = (self.root / '.ai/tasks/governance/case-001.md').read_bytes()
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=True, verified_terminal=True)
        self.assertTrue(module.validate_links(self.root, module.all_markdown(self.root)))
        with self.assertRaises(module.GovernanceError):
            module.archive_task(self.root, args)
        self.assertEqual((self.root / '.ai/tasks/governance/case-001.md').read_bytes(), old)
        self.assertIn('missing.md', index.read_text())
        self.assertFalse((self.root / '.ai/archive/2026/case-001.md').exists())

    def test_reference_style_missing_anchor_rejects_no_mutation(self):
        self.create()
        self.write('.ai/current.md', '[task][gov]\n[gov]: tasks/governance/case-001.md#absent-anchor\n')
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=True, verified_terminal=True)
        with self.assertRaisesRegex(module.GovernanceError, 'missing anchor'):
            module.archive_task(self.root, args)
        self.assertTrue((self.root / args.task).exists())
        self.assertFalse((self.root / '.ai/archive/2026/case-001.md').exists())

    def test_unresolved_reference_use_rejects_archive(self):
        self.create()
        self.write('.ai/current.md', '[task][unknown]\n')
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=True, verified_terminal=True)
        with self.assertRaisesRegex(module.GovernanceError, 'Undefined reference-style'):
            module.archive_task(self.root, args)
        self.assertTrue((self.root / args.task).exists())
        self.assertFalse((self.root / '.ai/archive/2026/case-001.md').exists())

    def test_multiline_definition_fails_closed_before_deletion(self):
        self.create()
        self.write('.ai/current.md', '[task][gov]\n[gov]:\n  tasks/governance/case-001.md\n')
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=True, verified_terminal=True)
        with self.assertRaisesRegex(module.GovernanceError, 'Unsupported reference definition'):
            module.archive_task(self.root, args)
        self.assertTrue((self.root / args.task).exists())
        self.assertFalse((self.root / '.ai/archive/2026/case-001.md').exists())

    def test_relative_nonmarkdown_reference_rejects_moved_task(self):
        self.create()
        task = self.root / '.ai/tasks/governance/case-001.md'
        task.write_text(task.read_text() + '\n[Image][img]\n[img]: local-figure.png\n')
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=True, verified_terminal=True)
        with self.assertRaisesRegex(module.GovernanceError, 'Unsupported relative reference'):
            module.archive_task(self.root, args)
        self.assertTrue(task.exists())

    def test_reference_definitions_preserve_external_unrelated_and_fences(self):
        self.create()
        self.write('.ai/current.md',
                   '[task][gov] [Other][remote]\n[gov]: tasks/governance/case-001.md\n'
                   '[remote]: https://example.invalid/safety.md\n'
                   '~~~md\n[do-not-touch][fence]\n[fence]: tasks/governance/case-001.md\n~~~\n')
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=True, verified_terminal=True)
        module.archive_task(self.root, args)
        text = (self.root / '.ai/current.md').read_text()
        self.assertIn('[gov]: archive/2026/case-001.md', text)
        self.assertIn('[remote]: https://example.invalid/safety.md', text)
        self.assertIn('~~~md\n[do-not-touch][fence]\n[fence]: tasks/governance/case-001.md\n~~~', text)

    def test_archive_rollback_if_rename_fails_midway(self):
        self.create()
        self.write('.ai/current.md', '[task][gov]\n[gov]: tasks/governance/case-001.md\n')
        original = self.root / '.ai/tasks/governance/case-001.md'
        old_index = (self.root / '.ai/current.md').read_text()
        old_task = original.read_text()
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=True, verified_terminal=True)
        real_replace = module.os.replace
        calls = 0
        def broken_replace(src, dst):
            nonlocal calls
            calls += 1
            if calls == 2:
                raise OSError('simulated second rename failure')
            return real_replace(src, dst)
        with mock.patch.object(module.os, 'replace', side_effect=broken_replace):
            with self.assertRaises(OSError):
                module.archive_task(self.root, args)
        self.assertEqual(original.read_text(), old_task)
        self.assertEqual((self.root / '.ai/current.md').read_text(), old_index)
        self.assertFalse((self.root / '.ai/archive/2026/case-001.md').exists())

    def recovery(self, **overrides):
        data = dict(blocker_disposition='RESOLVED', blocker_evidence='issue verified closed',
                    risk_clearance_evidence='risk assessment accepted in RFC', last_active_state='IN_REVIEW')
        data.update(overrides)
        return str(self.write('recovery.json', json.dumps(data)))

    def transition(self, before='BLOCKED', after='IN_REVIEW', **kw):
        return SimpleNamespace(before=before, after=after,
            rfc_recorded=kw.get('rfc', False), proceed_recorded=kw.get('proceed', False),
            branch_verified=kw.get('branch', False), review_recorded=kw.get('review', False),
            pr_recorded=kw.get('pr', False), recovery_record=kw.get('recovery', ''),
            owner_merge_approved=kw.get('merge', False), terminal_verified=kw.get('terminal', False))

    def test_blocked_review_requires_all_recovery_evidence(self):
        record = self.recovery()
        args = dict(rfc=True, proceed=True, branch=True, review=True, pr=True, recovery=record)
        for missing in args:
            sub = args.copy()
            sub.pop(missing)
            with self.subTest(missing=missing), self.assertRaises(module.GovernanceError):
                module.check_transition(self.transition(**sub))
        module.check_transition(self.transition(**args))
        for field, value in [('blocker_disposition', 'UNKNOWN'), ('blocker_evidence', ''),
                             ('risk_clearance_evidence', ''), ('last_active_state', 'PROPOSED')]:
            with self.subTest(field=field), self.assertRaises(module.GovernanceError):
                module.check_transition(self.transition(**{**args, 'recovery': self.recovery(**{field: value})}))

    def test_blocked_resume_and_other_review_bypasses(self):
        record = self.recovery(last_active_state='ASSIGNED')
        for next_state in ('ASSIGNED', 'IN_PROGRESS'):
            with self.subTest(next_state=next_state), self.assertRaises(module.GovernanceError):
                module.check_transition(self.transition(after=next_state))
        module.check_transition(self.transition(after='IN_PROGRESS', rfc=True, proceed=True,
                                                branch=True, recovery=record))
        with self.assertRaises(module.GovernanceError):
            module.check_transition(self.transition(before='VALIDATING', after='IN_REVIEW'))
        with self.assertRaises(module.GovernanceError):
            module.check_transition(self.transition(before='IN_REVIEW', after='COMPLETED', review=True,
                                                    pr=True, terminal=True))
        # Returning for *discussion* is intentionally allowed without resume attestations.
        module.check_transition(self.transition(before='BLOCKED', after='DISCUSSION'))


    def test_duplicate_reference_definition_rejected(self):
        self.create()
        self.write('.ai/current.md',
                   '[Task][Gov]\n[gov]: tasks/governance/case-001.md\n'
                   '[GOV]: tasks/governance/case-001.md#task-name\n')
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=True, verified_terminal=True)
        with self.assertRaisesRegex(module.GovernanceError, 'Duplicate'):
            module.archive_task(self.root, args)
        self.assertTrue((self.root / args.task).exists())

    def test_accepted_blocker_requires_attributed_authority(self):
        recovery = self.recovery(blocker_disposition='EXPLICITLY_ACCEPTED')
        kwargs = dict(rfc=True, proceed=True, branch=True, review=True, pr=True, recovery=recovery)
        with self.assertRaisesRegex(module.GovernanceError, 'acceptance authority'):
            module.check_transition(self.transition(**kwargs))
        kwargs['recovery'] = self.recovery(blocker_disposition='EXPLICITLY_ACCEPTED',
                                           acceptance_authority='owner decision URL checked manually')
        module.check_transition(self.transition(**kwargs))

    def test_regular_assignment_requires_proceed_branch_and_rfc(self):
        for missing in ('rfc', 'proceed', 'branch'):
            kwargs = dict(rfc=True, proceed=True, branch=True)
            kwargs.pop(missing)
            with self.subTest(missing=missing), self.assertRaises(module.GovernanceError):
                module.check_transition(self.transition(before='APPROVED', after='ASSIGNED', **kwargs))
        module.check_transition(self.transition(before='APPROVED', after='ASSIGNED',
                                                rfc=True, proceed=True, branch=True))

    def test_footnotes_and_escaped_examples_are_not_reference_links(self):
        self.create()
        self.write('.ai/current.md',
                   '[Task][gov]\n[gov]: tasks/governance/case-001.md\n'
                   '[^note]: This is not a file reference\n'
                   r'\[literal][unused]' + '\n')
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=True, verified_terminal=True)
        module.archive_task(self.root, args)
        self.assertIn('[^note]: This is not a file reference', (self.root / '.ai/current.md').read_text())

    def test_inline_code_link_examples_not_processed(self):
        self.create()
        content = ('`[Example](file.md#anchor)` and `[Example][missing]`\n'
                   '[Task][gov]\n[gov]: tasks/governance/case-001.md\n')
        self.write('.ai/current.md', content)
        args = SimpleNamespace(task='.ai/tasks/governance/case-001.md', year='2026', apply=True,
                               verified_terminal=True)
        module.archive_task(self.root, args)
        actual = (self.root / '.ai/current.md').read_text()
        self.assertIn('`[Example](file.md#anchor)`', actual)
        self.assertIn('`[Example][missing]`', actual)
        self.assertIn('[gov]: archive/2026/case-001.md', actual)
        self.assertEqual(module.validate_links(self.root, module.all_markdown(self.root)), [])


if __name__ == '__main__':
    unittest.main()
