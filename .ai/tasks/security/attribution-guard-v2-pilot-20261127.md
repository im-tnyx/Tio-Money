# Tio-Money Attribution Guard V2 pilot

Status: VALIDATING. Implementation owner: Codex. Previous agent: UNKNOWN_NOT_VERIFIED. Last commit agent: UNKNOWN_NOT_VERIFIED until the proposed PR commit. Model: UNKNOWN_NOT_VERIFIED.

## Decision and scope

The owner's 2026-11-27 request authorizes draft PR preparation for event-driven Attribution Guard integration using App 5032971 and the separate `im-tnyx/im-tnyx` system repository. It does not authorize merge, live ruleset changes, credential migration or mandatory enforcement. The technical decision is to use trusted `pull_request_target` source on Tio-Money `main`, the reviewed central engine, and no consumer App secrets. This task record and the draft PR are the durable RFC and proceed record for this narrow security change.

The PR adds an opt-in, read-only consumer preflight for PR creation/head updates and protected-main pushes. The proposed central wake job was removed after credential review. It proposes separate branch/tag write rules; it does not install them. Existing `static`, `Governance / Python, links and commit attribution`, preview workflows, application source and protect-main ruleset 27567187 remain untouched.

## Data flow and failure behavior

The consumer job obtains only its scoped `GITHUB_TOKEN`. It fetches an owner-approved SHA of central `main`, verifies the SHA is an ancestor of central `main`, and executes central source without checking out or executing the PR. It requires the GitHub Actions event actor to be the immutable approved owner account, re-reads the live PR, base and head, inspects every introduced commit from Git objects, obtains GitHub signature evidence, and fails closed on missing or stale data. The main-push path runs after GitHub accepted a push; native write rules are the preventive layer. No consumer workflow has the App key, encrypted-state key, publisher environment or check-writing token.

Central reconciliation and encrypted enrollment remain separate. The consumer preflight is not the App-backed check and cannot be presented as a mandatory App check. GitHub Actions cannot directly deliver a cross-repository event to the system workflow with a consumer-only `GITHUB_TOKEN`. GitHub does not support fine-grained PAT use by a repository collaborator on the personally owned central repository. An owner PAT would collapse owner-only bootstrap authority, a classic PAT would be too broad, and placing the central App key here would violate isolation. The invalid dispatch path was removed; central App publication still uses scheduled or owner-dispatched reconciliation. A separately approved signed-webhook receiver and secure wake mechanism are needed for automatic central App evaluation. No credential or environment is created in this PR.

The central policy requires valid GitHub signature evidence. A GitHub-web platform-signed PR commit now needs a unique GitHub PushEvent matching that individual commit's parent or a zero-before branch creation, SHA, head ref and authenticated owner actor. A current PR/push actor cannot vouch for historical commits. Events API delay or retention may leave older or bulk-pushed commits without evidence; they fail closed and can be reevaluated when delayed evidence arrives. Personal signing remains optional, while unsigned metadata cannot prove identity. Missing evidence, technical failures, spoofed metadata and bot actors block.

## Security review and activation boundaries

Review disposition: DEFERRED for independent human security review. No live publisher, App check or consumer event test is claimed until the two PRs are merged under separate owner approvals and feature switches are explicitly enabled. PR #101 is read-only negative fixture; never update or merge it for testing.

The proposed owner-only branch rule would also block Dependabot's branch creation/updates and any automated writer other than the owner. Resolve that compatibility and verify the GitHub plan/API accepts the User bypass before enabling. Its bypass applies only to the proposed isolation rules, never to protect-main. Existing security checks and merge requirements must remain active. The current cloud GitHub API read of ruleset 27567187 returned 403; actual effective rule configuration remains UNKNOWN_NOT_VERIFIED pending owner UI inspection.

Rollback after a separately approved activation: set the consumer audit variable false; retain existing CI and protect-main. Do not delete the encrypted state, change App credentials or remove mandatory checks without a separate safety review.
