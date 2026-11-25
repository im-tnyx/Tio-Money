# TM-SEC-SETUP-NODE-20261124

[Gate 3E technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/65#issuecomment-7141036974) assigns Codex the existing #65 branch only. Previous HEAD `dc378c27e6d8040a9cada9624de905fa264b4240`. Main `885c861d30d7ebc10cade3cf3f781ffb79732d4b` contains #106.

Reconciliation preserves main's full workflow architecture and pins all three intended setup-node steps to reviewed v7.1.0. Node versions are unchanged. Phase 0 automatic caching is disabled. EAS validation and publishing retain explicit setup-node npm caching. Separate runners prevent filesystem sharing, but matching cache keys can still share npm cache data. Locked installs and the publisher's isolated locked CLI signature gate remain in place. Cache policy changes require separate review.

[Issue #71](https://github.com/im-tnyx/Tio-Money/issues/71) remains open. PR #65 remains on SECURITY HOLD. This maintenance does not resolve the historical signature failure. Preserve the first fresh CI result. Roll back scoped changes via a forward commit on #65 while retaining main ancestry.

## 2026-11-25 — Gate 4A.4
[Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/65#issuecomment-7152077907) scopes the existing branch reconciliation from `88627c5e75ce8a1bbf3c033f918065f2e5599ce6` through main `66048d6ca3870ac8d971af89e3c45de1f8cfde90`. Pin the three reviewed setup-node v7.1.0 invocations and explicitly disable their automatic npm caching. Inherit the private validation, publisher root and isolated CLI caches, verified downstream root cache inheritance, and the fail-closed signature and credential controls. Exact-HEAD CI and the preview rejection are tracked in #65, RFC #108 and Issue #71. PR #65 remains on SECURITY HOLD.
