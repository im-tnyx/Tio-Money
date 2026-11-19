# 📌 Tio Money — Owner Decision Register

> **Status: confirmed MVP language and governance authorization decisions.** This is the durable record of explicit owner decisions, **not** an automatic approval to implement, merge or deploy. Proposed architecture and open design choices remain proposals until separately resolved.

[Documentation hub](00-INDEX.md) · [PRD](01-PRD.md) · [Architecture](05-TECH-ARCHITECTURE.md) · [Agent contract](../AGENTS.md)

## Decision index

| ID | Date | Decision | State | Scope |
|---|---|---|---|---|
| [TM-DEC-001](#tm-dec-001--english-only-initial-app) | 2026-11-18 | Initial mobile app user-facing language is **English only** | **Owner decided** | P0/MVP UI, copy, accessibility, validation |
| [TM-DEC-002](#tm-dec-002--independent-review-optional-by-default) | 2026-11-19 | Independent review optional by default, known blockers and configured protections binding | **Owner decided; agent-transcribed** | All PRs; sensitive-scope guidance |
| [TM-DEC-003](#tm-dec-003--owner-authorized-agent-merge) | 2026-11-19 | Specific owner authorization mandatory; agent may merge only after safety preflight | **Owner decided; agent-transcribed** | All PR merges, including PR #2 (not authorized) |
| [TM-DEC-004](#tm-dec-004--five-destinations-and-floating-add) | 2026-11-19 | Five destinations and a standalone floating Add FAB | **Owner decided; agent-transcribed** | Phase 0 navigation shell only |

## TM-DEC-001 — English-only initial app

**Decision date:** 2026-11-18  
**Authority:** Direct owner instruction in the AI-context governance task  
**Status:** Confirmed owner decision, pending implementation in a separately approved app branch

### Decision

- All initial user-facing app text, labels, errors, accessibility names/hints and onboarding are **English**.
- **No language-selection screen or Settings language selector** in the initial MVP.
- Hindi and other languages are **future features**, not an initial release acceptance gate.
- Remain localization-ready: centrally organized semantic strings/keys, stable identifiers independent of translations and layout capable of future translations.
- Currency, amounts and dates use formatting utilities independent from translation; INR storage is still **integer paise**.
- **Prefer system fonts** in the MVP unless the owner separately approves a different font.
- Agent conversation language or GitHub documentation prose is **not** the app-language decision.

### Why / superseded drafts

Older PRD `3 / `4.1 / `4.8`, screen setup/settings/microcopy, architecture `10` and implementation-plan Phase 1 included Hindi/English MVP or a language picker. This entry supersedes **those language-specific requirements only**. It does **not** alter the single Add flow, ledger, transfer fees, account classes, security, SMS limits, app implementation scope or other undecided screen designs.

### Impact and acceptance

- Documentation reconciliation on `chore/ai-context-governance`; downstream coding agents must reconcile this choice with their scaffold once owner approves implementation/integration.
- Phase 1 UI validation checks **English** microcopy and screen-reader labels, no active language selector, centralizable strings and accessible system-font behavior.
- Later multilingual support requires its own product design, localization QA and owner-approved scope.

## TM-DEC-002 — Independent review optional by default

**Decision date:** 2026-11-19. **Authority:** explicit owner instruction in connected ChatGPT conversation; [agent-transcribed technical discussion and proceed record](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-7000574123). **Provenance limitation:** the linked GitHub comment is written by an agent and is **not a directly authenticated owner-authored GitHub approval**.

**Decision:** Independent review is **optional by default**, **not** a general merge prerequisite or something requiring automatic owner-approved deferral when skipped. Strongly recommend independent review for canonical financial ledger/accounting, migrations, security, privacy, authentication and sensitive Android/iOS/platform changes. Record **`PERFORMED`, `SKIPPED`, `UNAVAILABLE` or `DEFERRED`** with reason/source and reviewer/inspected SHA if performed. Never fabricate reviewer verdicts. Known blocking findings must be addressed or validly dispositioned by appropriate authority. **Do not bypass any actually configured GitHub required review/check/branch-protection setting.**

**Supersedes:** prior AGENTS/AI task/review-guide phrasing that always required independent review or an owner-approved deferral, and prior CLI `IN_REVIEW` evidence gate requiring independent-review request. Does **not** waive security, financial or restricted-operation approvals, PR discussion/proceed gates, known blockers or configured GitHub protections.

## TM-DEC-003 — Owner-authorized agent merge

**Decision date:** 2026-11-19. **Authority:** explicit owner instruction in connected ChatGPT conversation; [agent-transcribed technical discussion and proceed record](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-7000574123). The agent transcription is **not itself merge permission for any PR**.

**Decision:** Every merge requires **separate, action-specific owner authorization** naming **repository, specific PR number, explicit permission to merge and any conditions**. General implementation, review, fix or PR-opening instructions never grant merge permission. **An agent is allowed to execute a merge after the owner explicitly authorizes that PR and action**. Without authorization, agent merge is **strictly prohibited**. Enabling auto-merge requires **separate express owner permission**.

**Required preflight and finish:** Verify authentic owner instruction; refresh GitHub PR state/HEAD and base `main`; check all required checks, branch protections and GitHub review settings; assess unresolved blocking findings, reviewed/authorized scope and conditions; seek **renewed owner authorization** if material changes occurred or permission is unclear. Use only permitted **non-force** merge methods. Confirm GitHub reports `MERGED`, record resulting merge commit SHA and use [post-merge sync](../.github/POST-MERGE-SYNC.md) to reconcile `.ai/current.md`, agent provenance, task terminal status and archive. Stop when required checks fail or scope/authority is uncertain.

**Supersedes:** wording implying an agent can **never** merge, or that owner implementation/proceed/review approval automatically permits merge. Does **not** authorize PR #2 or PR #1 to merge now, change financial/SMS/privacy invariants, permit force-push or evade required checks.

## TM-DEC-004 — Five destinations and floating Add

**Decision date:** 2026-11-19. **Authority:** Direct owner message in connected ChatGPT conversation for Phase 0 alignment (agent-transcribed in the [PR #1 RFC](https://github.com/im-tnyx/Tio-Money/pull/1#issuecomment-7001758473); that comment is **not** GitHub-authenticated owner merge authorization).

**Decision:** The Phase 0 mobile bottom navigation contains **Home · Trans. · Stats. · Account · More** as five content destinations. The exactly **one** `+` is a **floating action button**, independent of the bottom bar, positioned on the **right directly above the More tab** (aligned to More's center), and never implemented as a content tab. The owner's screenshot is a spatial-placement reference, not a design or branding copy. `Trans.` routes to the future transaction timeline, `Stats.` routes to the reports/statistics placeholder, `Account` routes to accounts, and `More` provides access to Settings. The FAB opens the **same single Income / Expense / Transfer editor**; Home must not show three type-specific shortcut cards. In Phase 0, all save actions stay disabled and no invented balances or reports appear.

**Supersedes:** Earlier draft screen/README/flow guidance describing four bottom destinations with a center Add **bar slot**. This is a navigation presentation decision only; it does not change the canonical finance ledger, migration policy, SMS/Expo Go limits, or [English-only initial app (TM-DEC-001)](#tm-dec-001--english-only-initial-app). No native module or financial feature is authorized.

**Acceptance:** Five distinct navigable root destinations with accessible English labels; a separately floating single Add FAB; safe-area and screen-reader testing on both devices; legacy `/history` navigation remains recoverable. Formal design review and physical-device QA remain pending. **Owner permission to merge PR #1 is NOT granted by this decision.**

## Pending choices — not decisions

| Topic | Evidence | Status |
|---|---|---|
| Final iconography, colors and fine FAB placement | [TM-DEC-004](#tm-dec-004--five-destinations-and-floating-add) · [Screen spec](03-SCREEN-SPEC.md) | Five destinations + floating Add decided; visual/icon refinement still proposed |
| Detailed ledger correction/idempotency strategy and device transaction behavior | [Database design](04-DATABASE-DESIGN.md) · [test plan](06-IMPLEMENTATION-TEST-PLAN.md) | Proposed / needs implementation validation |
| Android native SMS capability and Play policy eligibility | [Architecture](05-TECH-ARCHITECTURE.md) | Conditional, not authorized |
| Phase 0 Expo PR device QA and merge | [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) | Open draft at initial inspection; recheck live |
| Governance PR and its merge | [Governance task](../.ai/tasks/governance/ai-context-setup.md) | Owner review and separate merge approval required |

**Amendment policy:** Future decisions must include date, source/authority, exact scope, superseded passages and verification. Do not infer owner approval from a merged planning document alone.

[← Documentation hub](00-INDEX.md)
