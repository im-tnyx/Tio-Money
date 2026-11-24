# TM-SEC-EAS-CACHE-20261125

[Gate 4A.1 technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/108#issuecomment-7142635709) assigns Codex the dedicated unlabeled Draft PR from main `885c861d30d7ebc10cade3cf3f781ffb79732d4b`.

EAS validation and publishing use the existing setup-node v4.4.0 pin, whose cache is opt-in. Each install verifies its private runner-local npm cache. Publisher root and EAS CLI caches are distinct. The integrity check, locked install and single signature command run before the Expo token step. Publishing consumes no Actions cache data even if PR execution can access the cache service elsewhere.

Validation covers the workflow structure and synthetic command success and failure without credentials. Exact-HEAD CI and bootstrap evidence are tracked in RFC #108. Independent review and live privileged validation are deferred. Keep #65 SECURITY HOLD, #101 unchanged and #71 open. Roll back via a separately reviewed forward change that preserves publisher cache isolation, or pause publication under separate authorization.
