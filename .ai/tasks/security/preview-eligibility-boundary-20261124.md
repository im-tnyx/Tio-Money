# TM-OPS-PREVIEW-20261124-3A

- [RFC #105](https://github.com/im-tnyx/Tio-Money/issues/105) and [Gate 3B technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/105#issuecomment-7138757954).
- Codex, owner-authorized for `security/preview-eligibility-boundary-20261124` and an unlabeled Draft PR only. Base `main` at `2698fb3f1988e7a6247974fa3e79a410a6bb5b70`.
- A separate read-only runner verifies event origin, immutable PR identity and scope before selecting the Codespaces environment. The trusted runner revalidates before credential use and retains exact-source and ownership checks. Only approved Codespaces jobs share the preview concurrency group. EAS job definitions and signal workflow are unchanged.
- Deployed bootstrap preflight requires the new SHA to have no eligible PR association, the candidate PR to remain unlabeled, and #97 to remain the sole labeled open preview. Inspect the preview queue before publishing. The current receiver's credential-bearing steps depend on its successful selection output. Owner authorization covers incidental environment selection only.
- Exact-head validation and any publication evidence belong in RFC #105 and the Draft PR. Independent security review is deferred. PR #65 remains on SECURITY HOLD, Issue #71 remains open and #101 is unchanged.
- Rollback before merge is leaving the draft unmerged. A future deployed rollback requires separate authorization and should preserve fail-closed admission or pause only the Codespaces routes while retaining EAS and required CI.

Local validation used Node 24.22.3 and npm 11.19.1. The app suite passed 132/132, and preview passed 129 with the one CI-only signature test skipped locally. Governance passed 29 tests, Markdown links, actionlint and diff checks. A read-only replay using #97's recorded signal and current GitHub metadata approved its exact head and base. That replay made no Codespaces requests.

The trusted job retains its existing read permission set. Only the isolated eligibility job receives Actions metadata read access. After admission the trusted job reuses the authenticated event in the same run and independently reads live PR, label and compare data.
