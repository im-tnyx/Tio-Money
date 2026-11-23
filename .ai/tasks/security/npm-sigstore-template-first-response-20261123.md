# TM-SEC-71 — Exact template first-response diagnostic coverage

- **Source / technical PROCEED:** [Issue #71 Gate 9](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7097967232), agent-transcribed owner “Go”, 2026-11-23 IST.
- **Agent / branch:** ChatGPT GPT-6; `security/issue-71-template-http-first-response-20261123` from verified main `f865969d200d70fbc8e84dd6a48d8020a155e42c`.
- **Purpose:** PR #100 first npm10 audit failed closed for exact locked `@babel/template@7.29.7`; existing diagnostic HTTP tap omitted it.
- **Scope:** add this single exact identity to the instrumented no-secrets fetch tap and sanitized report; fixture test verifies packument and attestation capture, wrong version/origin/query rejection, no raw body or credential output. Existing diagnostic workflow path trigger already covers both script/test files.
- **Security / non-goals:** Keep unchanged isolated EAS lock, first-attempt required Phase 0 signature gate, trust policy, npm toolchain, workflow permission and credential boundaries. No retry-to-green, raw HTTP upload, live EAS/Codespace, main change or merge. Instrumentation may affect timing; it cannot recover the historical failed HTTP response, prove the cause or grant publisher/root trust.
- **Acceptance:** local syntax and focused fixture tests; exact-HEAD unprivileged diagnostic and required CI; inspect any first failure fingerprint without interpreting later samples as the original. Independent security review DEFERRED; Issue #71 stays OPEN, PR #100 remains blocked at its failed HEAD.
- **Rollback:** close this unmerged Draft PR. Any cause-based remediation requires separate evidence and security decision.
