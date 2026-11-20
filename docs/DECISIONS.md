# 📌 Tio Money — Owner Decision Register

> **Live GitHub status verified 2026-11-20:** Decisions TM-DEC-001 through TM-DEC-005 remain in force. Governance [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) **MERGED** 2026-11-19 06:16:11 UTC at `04e6aa8d657627516b8ce7de91bd8304fdcbcf90`; Phase 0 [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) **MERGED** 2026-11-19 20:30:09 UTC at `e647f78ce200fed1323d80ea794396c371fba7bf`. [PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) is **READY FOR REVIEW / OPEN / NOT MERGED** (GitHub `draft:false` on 2026-11-20), undergoing documentation-only branch reconciliation. Older PR #1 DRAFT / READY FOR REVIEW statements below describe **past review checkpoints**, not current GitHub status. Owner-reported Android UI smoke testing does not establish complete device, SQLite or iPhone QA. Decisions alone never authorize a PR merge.

[Documentation hub](00-INDEX.md) · [PRD](01-PRD.md) · [Architecture](05-TECH-ARCHITECTURE.md) · [Agent contract](../AGENTS.md)

## Decision index

| ID | Date | Decision | State | Scope |
|---|---|---|---|---|
| [TM-DEC-001](#tm-dec-001--english-only-initial-app) | 2026-11-18 | Initial mobile app user-facing language is **English only** | **Owner decided** | P0/MVP UI, copy, accessibility, validation |
| [TM-DEC-002](#tm-dec-002--independent-review-optional-by-default) | 2026-11-19 | Independent review optional by default, known blockers and configured protections binding | **Owner decided; agent-transcribed** | All PRs; sensitive-scope guidance |
| [TM-DEC-003](#tm-dec-003--owner-authorized-agent-merge) | 2026-11-19 | Specific owner authorization mandatory; agent may merge only after safety preflight | **Owner decided; agent-transcribed** | Every PR; PR #1 and #2 later merged under separate owner authorizations; PR #7 still requires its own |
| [TM-DEC-004](#tm-dec-004--five-destinations-and-floating-add) | 2026-11-19 | Five destinations and a standalone floating Add FAB | **Owner decided; agent-transcribed** | Phase 0 navigation shell only |
| [TM-DEC-005](#tm-dec-005--phase-0-empty-navigation-shell-and-disabled-fab) | 2026-11-19 | Only five blank tab screens; disabled visual FAB, no other screens | **Owner decided; agent-transcribed** | Phase 0 visible UI, supersedes DEC-004 editor/Settings availability |

## TM-DEC-001 — English-only initial app

**Decision date:** 2026-11-18  
**Authority:** Direct owner instruction in the AI-context governance task  
**Status:** Confirmed owner decision; implemented for available Phase 0 copy on the feature branch under review, not a merged or released app

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

**Supersedes:** wording implying an agent can **never** merge, or that owner implementation/proceed/review approval automatically permits merge. **Historical note:** This policy decision alone did **not** authorize PR #2; the owner later gave separate explicit PR #2 merge permission, and GitHub verifies it was **MERGED** on 2026-11-19 at `04e6aa8d657627516b8ce7de91bd8304fdcbcf90` with all six review threads now resolved. These standing policies did **not** authorize PR #1 by themselves (it was separately authorized and later merged on 2026-11-19); they do **not** authorize PR #7 to merge, change financial/SMS/privacy invariants, force-push or evade required checks.

## TM-DEC-004 — Five destinations and floating Add

> **Historical decision with later current-Phase-0 refinement:** The five destinations and right-above-More FAB placement are still valid; the editor-opening/Settings/legacy History behavior originally written below was **superseded for current Phase 0** by [TM-DEC-005](#tm-dec-005--phase-0-empty-navigation-shell-and-disabled-fab). Keep the original wording below as owner-decision provenance, **not a currently active UI promise**.

**Decision date:** 2026-11-19. **Authority:** Direct owner message in connected ChatGPT conversation for Phase 0 alignment (agent-transcribed in the [PR #1 RFC](https://github.com/im-tnyx/Tio-Money/pull/1#issuecomment-7001758473); that comment is **not** GitHub-authenticated owner merge authorization).

**Decision:** The Phase 0 mobile bottom navigation contains **Home · Trans. · Stats. · Account · More** as five content destinations. The exactly **one** `+` is a **floating action button**, independent of the bottom bar, positioned on the **right directly above the More tab** (aligned to More's center), and never implemented as a content tab. The owner's screenshot is a spatial-placement reference, not a design or branding copy. `Trans.` routes to the future transaction timeline, `Stats.` routes to the reports/statistics placeholder, `Account` routes to accounts, and `More` provides access to Settings. The FAB opens the **same single Income / Expense / Transfer editor**; Home must not show three type-specific shortcut cards. In Phase 0, all save actions stay disabled and no invented balances or reports appear.

**Supersedes:** Earlier draft screen/README/flow guidance describing four bottom destinations with a center Add **bar slot**. This is a navigation presentation decision only; it does not change the canonical finance ledger, migration policy, SMS/Expo Go limits, or [English-only initial app (TM-DEC-001)](#tm-dec-001--english-only-initial-app). No native module or financial feature is authorized.

**Acceptance:** Five distinct navigable root destinations with accessible English labels; a separately floating single Add FAB; safe-area and screen-reader testing on both devices; legacy `/history` navigation remains recoverable. Formal design review and physical-device QA remain pending. **Owner permission to merge PR #1 is NOT granted by this decision.**

## TM-DEC-005 — Phase 0 empty navigation shell and disabled FAB

**Decision date:** 2026-11-19. **Authority:** Direct owner instructions in the connected ChatGPT project conversation (agent-transcribed; [PR #1 scope discussion](https://github.com/im-tnyx/Tio-Money/pull/1#issuecomment-7006286494)). This is not GitHub-authenticated permission to merge.

**Decision:** For the **current Phase 0 user interface only**, display five bottom navigation destinations **Home · Trans. · Stats. · Account · More**, with **completely empty screen bodies and no top app bar**. Preserve the single `+` floating icon at the **right above More**, but it is **disabled and has no press handler, action or modal route**. No Add Transaction editor, no Settings page, no Welcome page, no old History route, no cards, placeholder text, mock balances or other feature screens. Bottom navigation itself remains selectable to switch among the five blank screens.

**Scope precedence:** This latest direct owner direction **supersedes TM-DEC-004 solely for current Phase 0 FAB interactivity and editor/Settings/History availability**. TM-DEC-004's five-destination labels and More-aligned FAB placement remain valid. Earlier feature specs and documents describe **future-phase product intent**, not a present UI release contract. Any later editor/Settings/onboarding implementation requires a new scoped task. The old removed routes should not be advertised as working. No automatic SMS, financial posting, permission or database schema change is authorized.

**Startup clarification (2026-11-19, owner):** After the native splash screen, launch **directly into the five-tab blank Home shell**, with no intermediate loading text/spinner, login, onboarding or separate screen. Keep native splash visible while SQLite initializes, and hide it once the navigation layout mounts. An exceptional database-startup failure can still display the minimum safe retry/error recovery needed to avoid a stuck app; no normal-path additional UI is permitted. Expo Go splash visuals are not equivalent to a production native build. This refines TM-DEC-005, not an extra feature authorization.

**Foundation remains intact:** Preserve non-visible Expo Router/TypeScript, theme tokens, SQLite startup/settings-only migrations and safe error recovery, domain interfaces, tests, privacy controls and governance. The platform status bar is not an app top bar. The disabled FAB is accessibility-labeled as unavailable.

**Owner implementation clarification — centralized visuals and presentation-only screens (2026-11-19):** The owner's later direct instruction requires **one centralized physical-size and shared icon-size token owner**, not per-screen hardcoded sizes. The same default **24dp** icon size must be reused in bottom navigation and future reusable top bars, buttons, bottom sheets, cards and text fields, with additional semantic roles introduced only by a separate design decision. Current UI visual sizes and colors remain unchanged; theme mode automatically follows **system light/dark** with no picker. All feature screens remain **dumb/presentation-only**; route navigation, safe-area positioning, splash lifecycle, SQLite and domain/business behavior belong to hooks/controllers/services outside screens. [Theme contract](../src/shared/theme/README.md) · [owner technical RFC/proceed](https://github.com/im-tnyx/Tio-Money/pull/1#issuecomment-7014064590) · [explicit shared icon rule](https://github.com/im-tnyx/Tio-Money/pull/1#issuecomment-7014109780). These are owner-clarified Phase 0 implementation constraints, **not permission to implement an editor or future feature screens**.

**Acceptance:** Exactly five blank, selectable screen routes with no top app toolbar; exactly one disabled FAB icon above More, with no `onPress` and no target route; no other app screen routes; shared sizes/icons from theme tokens; automatic OS appearance and presentation-only screens; CI checks pass; physical Android/iPhone Expo Go on latest tokenized HEAD and on-device SQLite testing remain separately **NOT_VERIFIED**. **Historical checkpoint:** PR #1 was then ready for review, but later merged under separate owner authorization on 2026-11-19. This UI decision alone did not authorize that merge.

## Pending choices — not decisions

| Topic | Evidence | Status |
|---|---|---|
| Final iconography and contrast | [TM-DEC-004](#tm-dec-004--five-destinations-and-floating-add) · [TM-DEC-005](#tm-dec-005--phase-0-empty-navigation-shell-and-disabled-fab) · [Screen spec](03-SCREEN-SPEC.md) | Five tab destinations, More-aligned disabled FAB and shared 24dp icon-size contract decided/implemented for Phase 0; final visual contrast/device validation pending |
| Detailed ledger correction/idempotency strategy and device transaction behavior | [Database design](04-DATABASE-DESIGN.md) · [test plan](06-IMPLEMENTATION-TEST-PLAN.md) | Proposed / needs implementation validation |
| Android native SMS capability and Play policy eligibility | [Architecture](05-TECH-ARCHITECTURE.md) | Conditional, not authorized |
| Phase 0 post-merge device QA | [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) | **MERGED** 2026-11-19 20:30:09 UTC; owner-reported Android UI smoke PASS; full iPhone/device accessibility and SQLite persistence/restart proof not yet verified |
| Governance PR #2 outcome | [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) · [Governance task](../.ai/tasks/governance/ai-context-setup.md) | **MERGED** 2026-11-19 06:16:11 UTC; SHA `04e6aa8d657627516b8ce7de91bd8304fdcbcf90`, 6/6 review threads resolved when inspected; separate [PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) is open / Ready for review / not merged |

**Amendment policy:** Future decisions must include date, source/authority, exact scope, superseded passages and verification. Do not infer owner approval from a merged planning document alone.

[← Documentation hub](00-INDEX.md)
