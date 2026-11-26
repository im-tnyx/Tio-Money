# TM-SEC-SETUP-NODE-20261124

[Gate 3E technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/65#issuecomment-7141036974) assigns Codex the existing #65 branch only. Previous HEAD `dc378c27e6d8040a9cada9624de905fa264b4240`. Main `885c861d30d7ebc10cade3cf3f781ffb79732d4b` contains #106.

Reconciliation preserves main's full workflow architecture and pins all three intended setup-node steps to reviewed v7.1.0. Node versions are unchanged. Phase 0 automatic caching is disabled. EAS validation and publishing retain explicit setup-node npm caching. Separate runners prevent filesystem sharing, but matching cache keys can still share npm cache data. Locked installs and the publisher's isolated locked CLI signature gate remain in place. Cache policy changes require separate review.

[Issue #71](https://github.com/im-tnyx/Tio-Money/issues/71) remains open. PR #65 remains on SECURITY HOLD. This maintenance does not resolve the historical signature failure. Preserve the first fresh CI result. Roll back scoped changes via a forward commit on #65 while retaining main ancestry.

## 2026-11-25 — Gate 4A.4
[Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/65#issuecomment-7152077907) scopes the existing branch reconciliation from `88627c5e75ce8a1bbf3c033f918065f2e5599ce6` through main `66048d6ca3870ac8d971af89e3c45de1f8cfde90`. Pin the three reviewed setup-node v7.1.0 invocations and explicitly disable their automatic npm caching. Inherit the private validation, publisher root and isolated CLI caches, verified downstream root cache inheritance, and the fail-closed signature and credential controls. Exact-HEAD CI and the preview rejection are tracked in #65, RFC #108 and Issue #71. PR #65 remains on SECURITY HOLD.

## 2026-11-25 — Gate 4C.1

[Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/65#issuecomment-7154384270) assigns Codex this existing branch. Merge old HEAD `3a2b4b7fc8ea06da090ae0492c175b9feec64841` with main `febc61b579c8b920af8707e6c281b7351ddb675c` (6 ahead, 120 behind before the merge). The merge is clean. Accept the merged Accounts UI and its documentation while retaining all three v7.1.0 pins, disabled automatic caching, the three private EAS caches, downstream cache inheritance and all npm verification and credential boundaries.

[PR #97 original static job, attempt 1](https://github.com/im-tnyx/Tio-Money/actions/runs/45551563771/job/138993701612) at `aacd04d00c985917d7892db321f8c5912a379676` captured one invalid provenance attestation for `@babel/parser@7.29.15` on npm 10.9.2. The first CLI exited nonzero and blocked CI. No separate registry integrity-signature failure was identified in the diagnostic. The original registry HTTP body was unavailable. Commit `b37dd5793f45927c7d9510ba688521ab7e278d37` has the same tree and its later passes cannot adjudicate the failure. See [Issue #71](https://github.com/im-tnyx/Tio-Money/issues/71) for the preserved evidence and exact-HEAD disposition. #65 stays on SECURITY HOLD. Independent human review deferred.
