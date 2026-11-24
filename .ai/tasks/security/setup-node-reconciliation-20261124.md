# TM-SEC-SETUP-NODE-20261124

[Gate 3E technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/65#issuecomment-7141036974) assigns Codex the existing #65 branch only. Previous HEAD `dc378c27e6d8040a9cada9624de905fa264b4240`. Main `885c861d30d7ebc10cade3cf3f781ffb79732d4b` contains #106.

Reconciliation preserves main's full workflow architecture and pins all three intended setup-node steps to reviewed v7.1.0. Node versions are unchanged. Phase 0 automatic caching is disabled. EAS validation and publishing retain explicit setup-node npm caching. Separate runners prevent filesystem sharing, but matching cache keys can still share npm cache data. Locked installs and the publisher's isolated locked CLI signature gate remain in place. Cache policy changes require separate review.

[Issue #71](https://github.com/im-tnyx/Tio-Money/issues/71) remains open. PR #65 remains on SECURITY HOLD. This maintenance does not resolve the historical signature failure. Preserve the first fresh CI result. Roll back scoped changes via a forward commit on #65 while retaining main ancestry.
