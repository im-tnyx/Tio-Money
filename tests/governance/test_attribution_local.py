"""Offline adapter fixtures; provider and central engine live tests are separate."""
import importlib.util
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock

SOURCE = Path(__file__).resolve().parents[2] / "scripts/security/attribution_local.py"
spec = importlib.util.spec_from_file_location("attribution_local", SOURCE)
a = importlib.util.module_from_spec(spec)
spec.loader.exec_module(a)
BASE, HEAD, LIVE = "a" * 40, "b" * 40, "c" * 40
FEATURE = "refs/heads/feature/accounts"


def event_fixture(before=BASE, after=HEAD, ref=FEATURE):
    e = {"repository": {"id": a.REPO_ID, "full_name": a.REPO, "private": False},
         "sender": {"id": a.OWNER_ID, "login": a.OWNER, "type": "User"},
         "ref": ref, "before": before, "after": after,
         "forced": False, "deleted": after == a.ZERO, "created": before == a.ZERO}
    env = {"GITHUB_REPOSITORY_ID": str(a.REPO_ID), "GITHUB_REPOSITORY": a.REPO,
           "GITHUB_ACTOR_ID": str(a.OWNER_ID), "GITHUB_ACTOR": a.OWNER,
           "GITHUB_TRIGGERING_ACTOR": a.OWNER, "GITHUB_EVENT_NAME": "push",
           "GITHUB_REF": ref, "GITHUB_SHA": after}
    return e, env


class EventTests(unittest.TestCase):
    def test_exact_push(self):
        e, env = event_fixture()
        self.assertEqual(a.push_scope(e, env), (FEATURE, BASE, HEAD))

    def test_new_branch(self):
        e, env = event_fixture(before=a.ZERO)
        self.assertEqual(a.push_scope(e, env), (FEATURE, a.ZERO, HEAD))

    def test_deleted_branch_has_no_new_commits(self):
        e, env = event_fixture(after=a.ZERO)
        env.update(GITHUB_REF=a.MAIN, GITHUB_SHA=LIVE)
        self.assertEqual(a.push_scope(e, env), (FEATURE, BASE, a.ZERO))

    def test_reject_bot_even_with_owner_login(self):
        e, env = event_fixture()
        e["sender"]["type"] = "Bot"
        with self.assertRaises(a.Blocked):
            a.push_scope(e, env)

    def test_reject_spoofed_owner_id(self):
        e, env = event_fixture()
        e["sender"]["id"] = 1234
        with self.assertRaises(a.Blocked):
            a.push_scope(e, env)

    def test_reject_mismatched_actor_context(self):
        e, env = event_fixture()
        env["GITHUB_ACTOR_ID"] = "1234"
        with self.assertRaises(a.Blocked):
            a.push_scope(e, env)

    def test_reject_unapproved_rerun(self):
        e, env = event_fixture()
        env["GITHUB_TRIGGERING_ACTOR"] = "other"
        with self.assertRaises(a.Blocked):
            a.push_scope(e, env)

    def test_reject_wrong_repository(self):
        e, env = event_fixture()
        e["repository"]["id"] += 1
        with self.assertRaises(a.Blocked):
            a.push_scope(e, env)

    def test_reject_force_push(self):
        e, env = event_fixture()
        e["forced"] = True
        with self.assertRaises(a.Blocked):
            a.push_scope(e, env)

    def test_reject_tags_and_injection(self):
        for ref in ("refs/tags/v1", "x;echo attack"):
            e, env = event_fixture(ref=ref)
            with self.assertRaises(a.Blocked):
                a.push_scope(e, env)

    def test_reject_ref_or_sha_mismatch(self):
        for key, value in (("GITHUB_REF", a.MAIN), ("GITHUB_SHA", LIVE)):
            e, env = event_fixture()
            env[key] = value
            with self.assertRaises(a.Blocked):
                a.push_scope(e, env)

    def test_reject_creation_flag_mismatch(self):
        e, env = event_fixture(before=a.ZERO)
        e["created"] = False
        with self.assertRaises(a.Blocked):
            a.push_scope(e, env)

    def pr(self):
        e, env = event_fixture()
        env["GITHUB_EVENT_NAME"] = "pull_request_target"
        e["number"] = 119
        e["pull_request"] = {"number": 119, "base": {"repo": {"id": a.REPO_ID}, "ref": "main", "sha": BASE},
                             "head": {"sha": HEAD}}
        return e, env

    def test_exact_pr(self):
        e, env = self.pr()
        self.assertEqual(a.pr_scope(e, env), (119, a.MAIN, BASE, HEAD))

    def test_reject_pr_number_mismatch(self):
        e, env = self.pr()
        e["number"] = 120
        with self.assertRaises(a.Blocked):
            a.pr_scope(e, env)

    def test_reject_pr_target_repo_mismatch(self):
        e, env = self.pr()
        e["pull_request"]["base"]["repo"]["id"] += 1
        with self.assertRaises(a.Blocked):
            a.pr_scope(e, env)


class RangeTests(unittest.TestCase):
    def setUp(self):
        self.api = Mock()
        self.api.protected_tip.return_value = BASE
        self.scope = Mock(return_value=object())
        self.validate = Mock()
        self.tip = Mock(return_value=LIVE)
        self.objects = Mock()
        self.objects.is_ancestor.return_value = True
        self.objects.introduced.return_value = (SimpleNamespace(sha=HEAD),)
        self.fetch = Mock(return_value=self.objects)
        self.prior = Mock()
        self.verify = Mock()
        self.deps = (self.scope, self.validate, self.tip, self.fetch, self.prior, self.verify)

    def check(self, before=BASE, after=HEAD):
        return a.feature_range(self.api, FEATURE, before, after, Path("/unused"), BASE, self.deps)

    def test_existing_branch_exact_range(self):
        self.assertEqual(self.check(), 1)
        self.objects.introduced.assert_called_once_with(BASE, HEAD)
        self.verify.assert_called_once()
        self.prior.assert_not_called()

    def test_new_branch_uses_audited_main_anchor(self):
        self.assertEqual(self.check(before=a.ZERO), 1)
        self.prior.assert_called_once_with(self.api, BASE, BASE, a.OWNER_ID, a.CHECKER, a.EPOCH)
        self.objects.introduced.assert_called_once_with(BASE, HEAD)

    def test_creation_at_main_tip_has_no_introduced_commits(self):
        self.tip.return_value = BASE
        self.assertEqual(self.check(before=a.ZERO, after=BASE), 0)
        self.prior.assert_called_once()
        self.fetch.assert_not_called()

    def test_new_branch_missing_main_receipt_fails(self):
        self.prior.side_effect = a.Blocked("main_audit_gap")
        with self.assertRaises(a.Blocked):
            self.check(before=a.ZERO)
        self.verify.assert_not_called()

    def test_delete_no_git_fetch(self):
        self.assertEqual(self.check(after=a.ZERO), 0)
        self.fetch.assert_not_called()

    def test_live_ref_move_fails(self):
        self.tip.side_effect = [LIVE, "d" * 40]
        with self.assertRaises(a.Blocked):
            self.check()

    def test_non_fast_forward_fails(self):
        self.objects.is_ancestor.side_effect = [True, False]
        with self.assertRaises(a.Blocked):
            self.check()

    def test_superseded_or_rewritten_fails(self):
        self.objects.is_ancestor.return_value = False
        with self.assertRaises(a.Blocked):
            self.check()

    def test_incomplete_history_fails(self):
        self.objects.introduced.return_value = ()
        with self.assertRaises(a.Blocked):
            self.check()

    def test_rejected_commit_fails(self):
        self.verify.side_effect = a.Blocked("bad_signature")
        with self.assertRaises(a.Blocked):
            self.check()

    def test_all_introduced_commits_forwarded(self):
        introduced = (SimpleNamespace(sha="d" * 40), SimpleNamespace(sha=HEAD))
        self.objects.introduced.return_value = introduced
        self.assertEqual(self.check(), 2)
        self.verify.assert_called_once_with(self.api, self.objects, introduced, FEATURE)


if __name__ == "__main__":
    unittest.main()
