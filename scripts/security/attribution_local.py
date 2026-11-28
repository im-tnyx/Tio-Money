"""Repository-local attribution audit adapter; no central runtime or state writer.

The pinned central guard provides the Git, signature and actor-evidence logic.
Only a main-target PR publisher may receive the App key. Push/non-main PR
runs are detection signals, not a native authorization boundary.
"""
import json
import os
import sys
from dataclasses import replace
from pathlib import Path
from tempfile import TemporaryDirectory

ZERO = "0" * 40
REPO = "im-tnyx/Tio-Money"
REPO_ID = 1462654174
OWNER = "im-tnyx"
OWNER_ID = 271889561
CHECKER = "5e0ff0a56b4f5f503419a12c20930bef0df22bc7"
EPOCH = "tio-money-v2-pilot-1"
MAIN = "refs/heads/main"


class Blocked(Exception):
    pass


def demand(ok, reason):
    if not ok:
        raise Blocked(reason)


def sha(value):
    return (isinstance(value, str) and len(value) == 40
            and all(c in "0123456789abcdef" for c in value))


def owner_event(event, env):
    repo, sender = event.get("repository", {}), event.get("sender", {})
    demand(repo.get("id") == REPO_ID and repo.get("full_name", "").casefold() == REPO.casefold()
           and repo.get("private") is False and env.get("GITHUB_REPOSITORY_ID") == str(REPO_ID)
           and env.get("GITHUB_REPOSITORY", "").casefold() == REPO.casefold(), "repository_mismatch")
    demand(sender.get("id") == OWNER_ID and sender.get("login") == OWNER and sender.get("type") == "User"
           and env.get("GITHUB_ACTOR_ID") == str(OWNER_ID) and env.get("GITHUB_ACTOR") == OWNER
           and env.get("GITHUB_TRIGGERING_ACTOR") == OWNER, "actor_not_authorized")


def push_scope(event, env):
    owner_event(event, env)
    demand(env.get("GITHUB_EVENT_NAME") == "push", "wrong_event")
    ref, before, after = (event.get(k) for k in ("ref", "before", "after"))
    demand(isinstance(ref, str) and ref.startswith("refs/heads/") and sha(before) and sha(after)
           and before != after, "invalid_push_scope")
    demand(event.get("forced") is False, "force_push_rejected")
    if after == ZERO:
        demand(event.get("deleted") is True and event.get("created") is False and before != ZERO,
               "invalid_delete_event")
        return ref, before, after
    demand(env.get("GITHUB_REF") == ref and env.get("GITHUB_SHA") == after
           and event.get("deleted") is False and event.get("created") is (before == ZERO),
           "push_event_mismatch")
    return ref, before, after


def pr_scope(event, env):
    owner_event(event, env)
    demand(env.get("GITHUB_EVENT_NAME") in {"pull_request_target", "pull_request"}, "wrong_event")
    pr = event.get("pull_request", {})
    base, head = pr.get("base", {}), pr.get("head", {})
    number = event.get("number")
    demand(type(number) is int and number > 0 and pr.get("number") == number
           and base.get("repo", {}).get("id") == REPO_ID
           and isinstance(base.get("ref"), str) and bool(base["ref"])
           and sha(base.get("sha")) and sha(head.get("sha"))
           and base["sha"] != head["sha"], "invalid_pr_scope")
    return number, "refs/heads/" + base["ref"], base["sha"], head["sha"]


def feature_range(api, ref, before, after, directory, baseline, deps):
    """Audit a single exact transition; new branches compare to audited main.

    No per-feature predecessor receipt is claimed. Missing evidence, force
    pushes, unreachable objects and moving live tips are failures, not skips.
    """
    Scope, validate_scope, current_tip, fetch_transition, prior, verify = deps
    scope = Scope(REPO_ID, ref, before, after, "push")
    validate_scope(api.policy, scope)
    if after == ZERO:
        return 0  # authorized deletion, no introduced commits
    anchor = before
    if before == ZERO:
        anchor = api.protected_tip(MAIN)
        prior(api, anchor, baseline, OWNER_ID, CHECKER, EPOCH)
    live = current_tip(api, scope)
    if anchor == live:
        demand(before == ZERO and after == live, "unverifiable_transition")
        demand(current_tip(api, scope) == live, "push_snapshot_changed")
        return 0
    objects = fetch_transition(api, anchor, live, directory)
    demand(objects.is_ancestor(after, live), "superseded_or_rewritten_push")
    if before != ZERO:
        demand(objects.is_ancestor(before, after), "non_fast_forward_push")
    introduced = objects.introduced(anchor, after)
    if before != ZERO:
        demand(bool(introduced) and introduced[-1].sha == after, "incomplete_history")
    verify(api, objects, introduced, ref)
    demand(current_tip(api, scope) == live, "push_snapshot_changed")
    return len(introduced)


def verify_commits(api, objects, introduced, ref):
    """Reuse V2 signature/raw-identity checks and independent actor records."""
    from guard.actor_evidence import platform_commit_actor, platform_merge_actor
    from guard.policy import Scope, validate_human_commit, validate_platform_commit
    proofs = {c.sha: api.signature(REPO_ID, c.sha) for c in introduced}
    merges = {c.sha: (c, platform_merge_actor(api, c, ref, OWNER_ID))
              for c in introduced if proofs[c.sha].github_generated and len(c.parents) == 2}
    for c in introduced:
        proof = proofs[c.sha]
        if not proof.github_generated:
            validate_human_commit(api.policy, c, proof)
            continue
        if len(c.parents) == 1:
            sources = [source for merged, (_, source) in merges.values() if source is not None
                       and objects.is_ancestor(c.sha, merged.parents[1])
                       and not objects.is_ancestor(c.sha, merged.parents[0])]
            demand(len(sources) <= 1, "ambiguous_platform_commit_source")
            transition = Scope(REPO_ID, sources[0] if sources else ref, c.parents[0], c.sha, "push")
            actor = platform_commit_actor(api, transition, OWNER_ID)
        elif len(c.parents) == 2:
            actor, _ = merges[c.sha][1]
        else:
            raise Blocked("platform_actor_record_missing")
        validate_platform_commit(api.policy, c, proof, api.policy.human(actor.account_id))


def run():
    from guard.actor_evidence import current_tip
    from guard.consumer_audit import audit_pr, audit_push, require_prior_main_audit
    from guard.github import GitHub
    from guard.policy import Scope, policy_from_registry, validate_scope
    from guard.shadow import check_shadow, fetch_transition
    env = os.environ
    demand(len(sys.argv) == 2 and sys.argv[1] in {"push", "pr", "publish"}, "invalid_operation")
    mode = sys.argv[1]
    demand(env.get("CHECKER_SHA") == CHECKER and env.get("POLICY_EPOCH") == EPOCH,
           "unapproved_checker_or_policy")
    event = json.loads(Path(env["GITHUB_EVENT_PATH"]).read_text(encoding="utf-8"))
    token = env.pop("GH_TOKEN", "")
    key = env.pop("ATTRIBUTION_GUARD_APP_PRIVATE_KEY", "")
    demand(bool(token) and (mode == "publish" or not key), "invalid_credential_boundary")
    policy = policy_from_registry(json.loads(Path(env["POLICY_FILE"]).read_text(encoding="utf-8")))
    demand(policy.repository_id == REPO_ID and policy.epoch == EPOCH and policy.protected_refs == (MAIN,)
           and len(policy.writers) == 1 and policy.human(OWNER_ID).login == OWNER, "unexpected_policy")
    with TemporaryDirectory(prefix="local-attribution-") as tmp:
        state = Path(tmp)
        if mode == "push":
            ref, before, after = push_scope(event, env)
            baseline = env.get("AUDIT_BASELINE", "")
            demand(sha(baseline) and baseline != ZERO, "missing_approved_baseline")
            api = GitHub(REPO, policy, token)
            if ref == MAIN:
                demand(before != ZERO and after != ZERO, "main_creation_or_deletion_rejected")
                result = audit_push(api, ref, before, after, OWNER_ID, OWNER, state,
                                    baseline=baseline, checker_sha=CHECKER, policy_epoch=EPOCH)
                demand(result["conclusion"] == "success", "main_audit_rejected")
                print("Main exact transition verified.")
            else:
                # The extra ref authorizes V2 evidence lookup only; it is not a
                # declaration of native branch protection or an enrollment.
                api = GitHub(REPO, replace(policy, protected_refs=(MAIN, ref)), token)
                deps = (Scope, validate_scope, current_tip, fetch_transition,
                        require_prior_main_audit, verify_commits)
                with TemporaryDirectory(prefix="branch-objects-", dir=state) as objects:
                    count = feature_range(api, ref, before, after, Path(objects), baseline, deps)
                print(f"Exact feature transition verified: {count} introduced commits.")
        else:
            number, ref, base, head = pr_scope(event, env)
            if mode == "publish":
                demand(ref == MAIN and env.get("GITHUB_REF") == MAIN
                       and env.get("GITHUB_EVENT_NAME") == "pull_request_target" and bool(key),
                       "publisher_requires_trusted_main")
                api = GitHub(REPO, policy, token)  # shadow check only
                scope = api.current_pr(number)
                demand((scope.ref, scope.base, scope.head) == (ref, base, head), "stale_pr_event")
                result = check_shadow(api, number, head, key, state, expected_scope=scope)
            else:
                demand(ref != MAIN and env.get("GITHUB_EVENT_NAME") == "pull_request", "wrong_pr_target")
                api = GitHub(REPO, replace(policy, protected_refs=(ref,)), token)
                result = audit_pr(api, number, base, head, OWNER_ID, OWNER, state)
            demand(result["conclusion"] == "success", "pr_audit_rejected")
            print("Exact PR scope verified.")


def main():
    try:
        run()
    except Blocked as exc:
        print("Local attribution audit blocked: " + str(exc))
        return 1
    except Exception:
        # Do not print provider exceptions, raw event payloads or credentials.
        print("Local attribution audit failed: unavailable or invalid evidence.")
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
