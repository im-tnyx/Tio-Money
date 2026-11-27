"""Static privilege and source-pin regression checks for the pilot workflow."""

import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = ROOT / ".github/workflows/attribution-guard-consumer.yml"
PROPOSED = ROOT / ".github/rulesets/proposed"


class ConsumerWorkflowTest(unittest.TestCase):
    def test_trusted_pr_and_main_push_audits_have_no_consumer_credentials(self):
        source = WORKFLOW.read_text()
        self.assertIn("pull_request_target:", source)
        self.assertIn("types: [opened, reopened, synchronize, edited, ready_for_review]", source)
        self.assertIn("push:\n    branches: [main]", source)
        self.assertIn("GUARD_CONSUMER_AUDIT_ENABLED == 'true'", source)
        self.assertIn("github.repository_id == '1462654174'", source)
        self.assertIn("contents: read", source)
        self.assertIn("pull-requests: read", source)
        self.assertNotIn("contents: write", source)
        self.assertNotIn("secrets.", source)
        self.assertNotIn("environment:", source)
        self.assertNotIn("actions/checkout", source)
        self.assertNotIn("refs/pull/", source)
        self.assertIn("guard.consumer_audit pr", source)
        self.assertIn("guard.consumer_audit push", source)

    def test_central_source_is_immutable_reviewed_main_ancestor(self):
        source = WORKFLOW.read_text()
        self.assertIn("CHECKER_SHA: ${{ vars.GUARD_CHECKER_SHA }}", source)
        self.assertIn('[[ "$CHECKER_SHA" =~ ^[0-9a-f]{40}$ ]]', source)
        self.assertIn("https://github.com/im-tnyx/im-tnyx.git", source)
        self.assertIn("fetch --quiet --no-tags origin refs/heads/main", source)
        self.assertIn('merge-base --is-ancestor "$CHECKER_SHA" FETCH_HEAD', source)
        self.assertIn('checkout --quiet --detach "$CHECKER_SHA"', source)
        self.assertLess(source.index("Fetch only reviewed central checker source"),
                        source.index("GH_TOKEN: ${{ github.token }}"))

    def test_proposed_owner_rules_are_separate_and_never_change_protect_main(self):
        for name, target in (("owner-branches.json", "branch"), ("owner-tags.json", "tag")):
            with self.subTest(name=name):
                ruleset = json.loads((PROPOSED / name).read_text())
                self.assertEqual(ruleset["target"], target)
                self.assertEqual(ruleset["conditions"]["ref_name"], {"include": ["~ALL"], "exclude": []})
                self.assertEqual({rule["type"] for rule in ruleset["rules"]},
                                 {"creation", "update", "deletion"})
                self.assertEqual(ruleset["bypass_actors"], [{"actor_id": 271889561,
                    "actor_type": "User", "bypass_mode": "always"}])
                self.assertEqual(ruleset["enforcement"], "active")


if __name__ == "__main__":
    unittest.main()
