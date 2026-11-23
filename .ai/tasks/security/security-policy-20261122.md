# TM-SEC-POLICY-20261122-001 — Root security policy and release reporting gate

> **State: IN_REVIEW — open, unmerged PR #76.** This checkpoint records observed evidence, not a GitHub approval, successful future check, permission to publish or permission to merge.

## Task identity, decision and lifecycle

| Field | Verified value |
| --- | --- |
| Repository | `im-tnyx/Tio-Money` (private) |
| Task ID | `TM-SEC-POLICY-20261122-001` |
| Lifecycle state | `IN_REVIEW`; no terminal merge or archive |
| RFC and discussion | [Issue #75](https://github.com/im-tnyx/Tio-Money/issues/75) |
| Original technical proceed | Owner's 2026-11-22 chat “Go you are working on” after security audit; [agent-transcribed RFC](https://github.com/im-tnyx/Tio-Money/issues/75), bounded draft documentation preparation, **not** owner-authored GitHub confirmation |
| Subsequent owner security-policy decision | [Issue #75 decision checkpoint](https://github.com/im-tnyx/Tio-Money/issues/75#issuecomment-7078130716): defer dedicated reporting email until first external beta/public release; [hard manual release gate #77](https://github.com/im-tnyx/Tio-Money/issues/77) |
| Scope expansion / documented proceed | Owner's 2026-11-22 chat “Go gap pura kare”, [agent-transcribed decision](https://github.com/im-tnyx/Tio-Money/issues/75#issuecomment-7078378710), adding this task and compact current-index checkpoint to same PR |
| Current working agent / model | ChatGPT / GPT-6, **self-identified by this session**; not derived from Git authorship |
| Previous verified agent / model | `UNKNOWN_NOT_VERIFIED` for prior PR #76 preparation; GitHub actor alone does not identify the working model |
| GitHub commit and PR author | `im-tnyx` on previously inspected PR #76 commits and PR; **distinct from agent identity and reviewer approval** |
| Reviewer | Prior security review submitted via connected `im-tnyx` account as an **agent-conducted `COMMENTED` review**, not independent human sign-off or formal `APPROVED` |
| Independent review disposition | `DEFERRED` / **NOT_PERFORMED** for independent human/security review; optional by default under root contract; stronger recommendation for security/privacy policy |
| Merge authorization | `NOT_GRANTED` for `im-tnyx/Tio-Money` PR #76; **separate, action-specific owner approval required** |
| Base | Protected `main` `7d2bb686bde5cf1b04f2704b085714aef503f63a` observed again before this task-file write |
| Working branch / last pre-remediation HEAD | `docs/security-policy-20261122` / `c4656ada7770bdfdcacbfffc193e3118f024997f`; creating this record changes HEAD, so **reverify** after writes |
| PR | [PR #76](https://github.com/im-tnyx/Tio-Money/pull/76), Ready for Review; **NOT merged** |
| Task date | 2026-11-22; exact start/last UTC times `UNKNOWN_NOT_VERIFIED` (do not invent timestamps) |
| Next verified agent | `UNASSIGNED`; next worker must reread live refs, this task and current index |

## Mandatory discussion, architecture and failure boundaries

- **Need:** Root `SECURITY.md` was absent, leaving pre-release supported-version and confidential vulnerability-contact guidance undefined. This task is **documentation/governance only**, not remediation of application vulnerabilities.
- **Owner policy:** Do **not** create, expose, or promise a project security mailbox now. A working, dedicated project-controlled confidential reporting address (or separately owner-authorized equivalent), tested intake, responsible responders, discoverable instructions, and security release signoff must be confirmed **before first external beta/public distribution** under [#77](https://github.com/im-tnyx/Tio-Money/issues/77). This is presently a **manual release gate, not an automated GitHub check**.
- **Current failure modes:** Researchers without an existing private contact cannot submit confidential technical details through a verified external intake. Normal GitHub issues are **not** secure disclosure channels: only a metadata-only private contact request can be posted there. No fictitious email, no publication of exploits, financial records or access tokens.
- **Architecture boundaries:** Zero app/UI, ledger, SQLite, FX, identity/auth, network integration or platform permission effects. No new APIs, stores, secrets, GitHub security settings, npm package/version, native/EAS/Expo workflow or publishing behavior.
- **Alternative:** Leave the root policy missing or use [security baseline guide](../../../docs/security/SECURITY-BASELINE-SETUP.md) alone — insufficient disclosure discoverability. Creating a placeholder mailbox now conflicts with the owner's decision.
- **Threats / safeguards:** Financial-data leakage, exploit-detail exposure to ordinary issue viewers, impersonated contact addresses, false claims that private reporting or scanners are enabled, premature external release, and attestation evidence overstatement. Use synthetic reproduction data and fail closed on release-gate evidence.
- **Acceptance criteria:** Explicit pre-release support scope, precise interim handling, verified external-release blocker reference; RFC and decision, stable task record/index/provenance; exact diff and commit attribution; `static` and `Governance / Python, links and commit attribution` PASS on actual final PR HEAD; no review-thread blockers; separate owner merge authorization.
- **Rollback:** If later necessary, revert the reviewed three-file documentation/governance change via separately authorized PR; no app/data migration. Do not rewrite history or override rulesets.
- **Canonical decision:** [Issue #75](https://github.com/im-tnyx/Tio-Money/issues/75) plus release gate [#77](https://github.com/im-tnyx/Tio-Money/issues/77). Related root [AGENTS.md](../../../AGENTS.md), [task lifecycle](../README.md), [discussion contract](../../discussions/README.md), [current index](../../current.md), [security baseline](../../../docs/security/SECURITY-BASELINE-SETUP.md).

## Scope, ownership and integration

**Allowed, deliberately bounded PR paths:** `SECURITY.md`, `.ai/tasks/security/security-policy-20261122.md` (this file), and a compact **additive** `.ai/current.md` entry; PR #76 description may be updated without touching repository files.

**Explicitly excluded:** `main`, `AGENTS.md`, `docs/governance/DECISIONS.md`, other task sections/index entries, existing PR #65 and #73, issue #71 Sigstore forensics, repository settings, paid scanning, secrets, email creation and production/external publishing. This is an agent-governance gap repair under the recorded scope amendment, not unrelated feature work.

**Owner/agent boundary:** This session conducts limited documentation maintenance using a connected GitHub account. It cannot substantiate an independent human approval merely by posting an account comment. Any other agent ownership of shared `.ai/current.md` entries is preserved; do not replace existing history.

## Immutable session checkpoints

### 2026-11-22 — Historical PR #76 preparation and owner decisions (recorded retrospectively; precise UTC unknown)

- **RFC/proceed:** [issue #75](https://github.com/im-tnyx/Tio-Money/issues/75); technical decision and owner chat quoted **as agent-transcribed**, not GitHub owner-verified approval. Dedicated reporting email deliberately deferred in [decision comment](https://github.com/im-tnyx/Tio-Money/issues/75#issuecomment-7078130716); external release remains blocked by issue #77.
- **Base and HEAD:** `main` `7d2bb686bde5cf1b04f2704b085714aef503f63a`; original `94238081cc3cbc1e75b668ce9e63620cfcbe6c92`; policy revision `c4656ada7770bdfdcacbfffc193e3118f024997f`.
- **Changed file then:** only root `SECURITY.md`. SHA-pinned `c4656ada...` GitHub checks: [Phase 0 `static` PASS](https://github.com/im-tnyx/Tio-Money/actions/runs/45014939637), [`Governance` PASS](https://github.com/im-tnyx/Tio-Money/actions/runs/45014939615), `signal` PASS at that head, 0 unresolved review threads. This **does not certify later commits**.
- **Security review:** [agent-authored `COMMENTED` review](https://github.com/im-tnyx/Tio-Money/pull/76#pullrequestreview-6011881471) covering the policy at `c4656ada...`; not independent human review or GitHub `APPROVED`.
- **Commit attribution:** GitHub PR #76 commit API returned messages “docs(security): add pre-release vulnerability reporting policy” and “docs(security): defer reporting inbox to mandatory external release gate”; neither contains `Co-authored-by:`. The governance GitHub check succeeded at that **historical** head. Local `python3 scripts/ai_context.py check-commits` **NOT_RUN** (connector-only access).
- **NOT_RUN / N/A:** local checkout/Markdown commands and native-device QA not executed here; external EAS, secret access and app-device validation N/A for documentation. Classic branch protection endpoint access previously returned 403; do not assume that makes settings absent.

### 2026-11-22 — AGENTS.md governance gap remediation (current session; precise UTC unknown)

- **Current agent / model:** ChatGPT / GPT-6 (self-identified current session). **Prior verified agent:** `UNKNOWN_NOT_VERIFIED`. GitHub PR author `im-tnyx` is not agent provenance.
- **Discussion / decision:** [scope-amendment PROCEED](https://github.com/im-tnyx/Tio-Money/issues/75#issuecomment-7078378710) recorded before these changes, based on owner's instruction to complete identified gaps.
- **Inspected before writing:** protected base/main `7d2bb686bde5cf1b04f2704b085714aef503f63a`, branch `docs/security-policy-20261122` HEAD `c4656ada7770bdfdcacbfffc193e3118f024997f`, Ready PR #76, one existing changed file.
- **Planned/authorized change:** add this scoped task file and minimal `.ai/current.md` index entry, then correct PR description; do not rewrite historical entries. Exact new HEAD will be observed and recorded in the PR conversation **after** commits; no claim yet of current-head CI success.
- **Test plan and status:** Relative links manually calculated from nested `.ai/tasks/security/` path. Fresh exact-HEAD GitHub `static` and `Governance` **PENDING until observed**. Previous head results must never be reused. GitHub commit-message audit for new commits **PENDING**; local CLI checks `NOT_RUN`; native QA `NOT_APPLICABLE`.
- **Independent review:** `DEFERRED` (no verified independent human approval); prior agent `COMMENTED` review was at previous HEAD only. New review needed if material security wording changes (this gap repair does not alter policy wording).
- **Merge authorization:** `NOT_GRANTED`; no branch-protection bypass or merge.
- **Remaining work:** verify after writes, ensure only three intended files, observe fresh required checks, record exact run URLs and unresolved findings in PR checkpoint. Review the [release gate #77](https://github.com/im-tnyx/Tio-Money/issues/77) at external release; **not** a pre-merge email requirement.
- **Next safe action:** fetch PR #76 actual HEAD/base, verify three-file diff, GitHub check jobs + governance and authorship, review threads, then request separate owner authorization for PR #76 only after gate satisfaction.

## Review and terminal boundaries

- **P0–P2:** No confirmed finding introduced by earlier one-file policy review; this record does not independently audit future changes.
- **P3:** Confidential external security-reporting channel is missing but its creation was deferred by the owner to **hard external-release gate #77**; not silently accepted for external release. Separate intermittent npm/Sigstore anomaly [#71](https://github.com/im-tnyx/Tio-Money/issues/71) remains unresolved.
- **Independent review:** `DEFERRED`, optional under AGENTS.md; no fabricated independent reviewer, `APPROVED` state or security attestation.
- **Completion:** PR #76 is still open. Owner merge authorization `NOT_GRANTED`; do not mark this task `COMPLETED`/`ARCHIVED` until exact merged SHA and post-merge sync are verified.
