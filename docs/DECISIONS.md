# 📌 Tio Money — Owner Decision Register

> **2026-11-21 verified post-merge status:** [PR #14](https://github.com/im-tnyx/Tio-Money/pull/14), [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) and [PR #22](https://github.com/im-tnyx/Tio-Money/pull/22) are **MERGED**, latest checked `main` is `f4332eb338ca75e27a5b35ff57511f522a4bb96a`. TM-DEC-011 adds the owner's **strict dumb-screen** rule; it does NOT approve unsettled financial/FX/provider policies. [Finance ADR register](11-STAGE-1-FINANCE-ADRS.md). Older status snapshots below remain historical.

> **Status check · 2026-11-20:** [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) merged 2026-11-19 (merge `e647f78ce200fed1323d80ea794396c371fba7bf`); [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) merged 2026-11-19 (merge `04e6aa8d657627516b8ce7de91bd8304fdcbcf90`); [PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) merged 2026-11-20 (merge `5dbdbe047a542463f0de66b9c0c6e09ef7d2605a`). Older open/unmerged statements below are **historical snapshots**, not current GitHub state. Decisions TM-DEC-001–005 and the newer **TM-DEC-010 bottom-navigation freeze** govern current Phase 0 visuals; TM-DEC-006–009 define **future product stages**, not implemented features or merge permission. iPhone and real on-device SQLite QA remain unverified.

[Documentation hub](00-INDEX.md) · [PRD](01-PRD.md) · [Architecture](05-TECH-ARCHITECTURE.md) · [Agent contract](../AGENTS.md)

## Decision index

| ID | Date | Decision | State | Scope |
|---|---|---|---|---|
| [TM-DEC-001](#tm-dec-001--english-only-initial-app) | 2026-11-18 | Initial mobile app user-facing language is **English only** | **Owner decided** | P0/MVP UI, copy, accessibility, validation |
| [TM-DEC-002](#tm-dec-002--independent-review-optional-by-default) | 2026-11-19 | Independent review optional by default, known blockers and configured protections binding | **Owner decided; agent-transcribed** | All PRs; sensitive-scope guidance |
| [TM-DEC-003](#tm-dec-003--owner-authorized-agent-merge) | 2026-11-19 | Specific owner authorization mandatory; agent may merge only after safety preflight | **Owner decided; agent-transcribed** | Every PR; PR #1 and #2 later merged under separate owner authorizations; PR #7 later received separate merge authorization; this policy alone never authorized it |
| [TM-DEC-004](#tm-dec-004--five-destinations-and-floating-add) | 2026-11-19 | Five destinations and a standalone floating Add FAB | **Owner decided; agent-transcribed** | Phase 0 navigation shell only |
| [TM-DEC-005](#tm-dec-005--phase-0-empty-navigation-shell-and-disabled-fab) | 2026-11-19 | Only five blank tab screens; disabled visual FAB, no other screens | **Owner decided; agent-transcribed** | Current Phase 0 UI |
| [TM-DEC-006](#tm-dec-006--local-first-delivery-order-and-backup-boundary) | 2026-11-20 | Complete local app → backup/restore → optional Supabase | **Owner directed; agent-transcribed** | Future delivery order, no change to Phase 0 |
| [TM-DEC-007](#tm-dec-007--account-group-driven-setup) | 2026-11-20 | Group-specific accounts: Cash, Bank, Wallet, Card, Investment, Loan | **Owner directed; agent-transcribed** | Future Accounts and Settings |
| [TM-DEC-008](#tm-dec-008--main-and-optional-sub-currency-with-refresh-on-use) | 2026-11-20 | Main Currency + distinct optional Sub Currency, refresh on currency use | **Owner directed; agent-transcribed** | Future currency experience; accounting ADR pending |
| [TM-DEC-009](#tm-dec-009--conditional-identity-only-for-opt-in-supabase) | 2026-11-20 | No app login until user opts in to future Supabase sync | **Owner directed; agent-transcribed** | Future identity and synchronization |
| [TM-DEC-010](#tm-dec-010--bottom-navigation-ui-freeze) | 2026-11-20 | Keep existing five bottom tabs, icons, spacing and More-aligned FAB unchanged | **Owner directed; agent-transcribed** | Existing Phase 0 visual baseline and all future UI work |

| [TM-DEC-011](#tm-dec-011--strict-dumb-screen-presentation-only-rule) | 2026-11-21 | All screens strictly dumb/presentation-only: no business, navigation, SQL or workflow logic | **Owner directed in connected chat; agent-transcribed** | Every future app screen, feature architecture and tests |
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

## TM-DEC-006 — Local-first delivery order and backup boundary

**Decision date:** 2026-11-20. **Source/authority:** owner's direct instructions in connected ChatGPT conversation; **agent-transcribed**, not owner-authored on GitHub. Durable [RFC #13](https://github.com/im-tnyx/Tio-Money/issues/13). **Status:** confirmed future product direction; **not implemented** and not authorization to merge any PR.

**Decision:** (1) Complete and test the full personal-finance app **locally on SQLite** first, including account groups, income, expenses, transfers, cards, investments, loans, reports and currency capabilities. (2) Add **optional encrypted, user-initiated Google Drive/iCloud-compatible backup and restore** only after the local feature set is complete. (3) Add **optional Supabase synchronization** last. SQLite remains the on-device primary working store. The Stage 1 app has **no cloud finance-data upload, no signup/login and no dependency on a backend**; network is permitted **only for selected-currency exchange-rate retrieval**. Stage 2 backup is not continuous synchronization.

**Supersedes:** older draft roadmap placing backup/sync in a generic polish phase with no sequence, or suggesting a cloud-primary design. It does **not** supersede current Phase 0 UI TM-DEC-005, English-only TM-DEC-001, canonical balanced ledger, transfer-fee classification or SMS restrictions.

**Gate:** stage transitions require documented functional tests, error/restore cases and applicable privacy/security design. Google/Apple accounts or device permissions used by external file providers are **not** an app signup. Provider integrations, backup encryption/key recovery and restore semantics require later ADR/security review before implementation.

## TM-DEC-007 — Account-group-driven setup

**Decision date:** 2026-11-20. **Source:** direct owner chat instructions, agent-transcribed; [RFC #13](https://github.com/im-tnyx/Tio-Money/issues/13). **Status:** future product contract, not current Phase 0 UI.

**Decision:** Settings defines/configures Account Groups; choosing a group from Accounts → Add Account dynamically presents group-specific fields. Built-in groups are **Cash, Bank Account, Wallet, Credit Card, Investment and Loan**; multiple accounts per group are allowed. Core Cash fields: **name, opening amount, currency, description**. Bank adds **payment capability flags** such as UPI, debit card, cheque and internet banking, which do not create duplicate funded balances. Credit Card adds **outstanding, currency, payment-from linked account, description, statement date, due date, credit limit and calculated available credit**, plus an **automatic payment configuration/tracking control**. Investment and Loan have typed fields and distinct accounting semantics documented in [Account Groups Specification](08-ACCOUNT-GROUPS-SPEC.md).

**Security boundary:** a button labelled automatic payment does **not** initiate a bank debit; no bank integration, real autopay or automatic posting is approved by this decision. Credit-card credentials/CVV, bank passwords, UPI PINs and OTPs are never needed. Interest, valuation and cross-account events require single-ledger domain rules and acceptance tests.

**Supersedes:** P0/P1 draft wording limiting the *future finished app* to four account types. It does not turn all six groups into currently implemented features or authorize unrestricted custom financial posting categories.

## TM-DEC-008 — Main and optional Sub Currency with refresh on use

**Decision date:** 2026-11-20. **Source:** owner's direct chat instructions, agent-transcribed; [RFC #13](https://github.com/im-tnyx/Tio-Money/issues/13). **Status:** future requirements approved in direction; **multi-currency journal technical design blocked pending ADR**.

**Decision:** Settings offers one **Main Currency** and one **optional Sub Currency**. Sub Currency is enabled/selected only when it differs from Main Currency. When the user invokes a sub-currency-dependent experience (open/foreground currency view, change pair, convert, or enter a currency-dependent report/transaction), the app **attempts an online refresh** of the exchange rate, not merely a 24-hour refresh. The UI shows rate source and last update. If offline or the provider fails, clearly disclose **cached/stale** rate; if no valid rate exists, show conversion as unavailable rather than fabricate a number. Never claim the feed is tick-by-tick live: the provider's latest published value may remain unchanged.

**Non-negotiable:** original transaction amounts and currencies never change because a display FX rate changes; do not sum mixed currency minor units as though they are INR. Account currency, currency-pair changes, historical valuation, cross-currency transfers, precision and rounding require a finance ADR before editing the current INR-only schema. See [Currency Specification](10-CURRENCY-SPEC.md).

**Supersedes:** open-ended 'currency expansion beyond INR' as an unspecified product direction and the earlier proposed 24-hour-only rate refresh. It does **not** silently lift the INR-only database constraint.

## TM-DEC-009 — Conditional identity only for opt-in Supabase

**Decision date:** 2026-11-20. **Source:** direct owner chat instructions, agent-transcribed; [RFC #13](https://github.com/im-tnyx/Tio-Money/issues/13). **Status:** future product/identity direction, **no Supabase integration authorized in this documentation PR**.

**Decision:** Local-only and Drive/iCloud backup experiences require **no Tio Money signup or signin**. When and only when the user **explicitly selects future Supabase sync**, present app signup/signin and obtain informed consent before uploading local finance records. Declining sync must preserve full local functionality. Logout does not silently delete local data. Tenant isolation, Supabase RLS, credential/session lifecycle, migration, conflicts, deletion and withdrawal-of-consent policies require independent future security/identity design and tests. No service-role key is ever shipped in the mobile app.

**Supersedes:** any implication that cloud sync or authentication is mandatory to use core features. This decision does not implement cloud transport, user records or backend permissions.

## TM-DEC-010 — Bottom navigation UI freeze

**Decision date:** 2026-11-20. **Authority/source:** owner's direct instruction in connected ChatGPT conversation, **agent-transcribed** in [RFC #20](https://github.com/im-tnyx/Tio-Money/issues/20); not a GitHub-authenticated owner comment. **Status:** confirmed design constraint on the implemented Phase 0 shell and all downstream feature work; **does not authorize app changes or PR merges**.

**Decision:** The existing bottom tabs are **already correct and must not change**. Preserve exactly five selectable bottom destinations **Home · Trans. · Stats. · Account · More**, with unchanged order, labels, Google Material Symbols icon choice/weight/24dp sizing, tokenized nav visuals, **50dp baseline plus OS safe-area inset**, **1dp icon/label gap** and **single 50dp circular floating +** centered **above More** with **16dp vertical clearance** (24dp Add glyph, weight 400). Current system light/dark behavior, safe-area layout, shared visual token ownership and disabled Phase 0 FAB remain unchanged. Do not move the + into a bar tab or introduce a center Add slot, extra tab, different size or spacing.

**Future behavior constraint:** New Account/Settings/Transaction/Reports screens may be implemented **inside the existing navigation structure** in separately authorized tasks. That does **not** permit redesign of the bottom tab bar. Activating the floating Add later is a separate owner-scoped interaction task and is not part of this documentation-only plan. Existing TM-DEC-005 remains authoritative for **current** Phase 0 blank screens and disabled +.

**Supersedes:** any old four-root/center-Add exploratory proposal and unresolved language implying owner still needs to decide the bottom navigation placement, icon or dimensions. It **does not** supersede TM-DEC-001 English-only UI, ledger invariants, data/identity/storage stages or real-device verification requirements.

**Acceptance:** future UI PRs must show exact label/order/count and token/layout invariants, retained FAB geometry, same theme behavior, and a device accessibility/safe-area smoke matrix. If a requested feature genuinely requires a bottom-nav change, stop and request a **new explicit owner decision** first.

## TM-DEC-011 — Strict dumb-screen presentation-only rule

**Decision date:** 2026-11-21. **Source:** direct owner instruction in the connected Tio Money chat: “all screen dump screen rahega koi bhi logic screen m nahi rahega verify ke baad go.” This is an **agent-transcribed owner instruction**, not a GitHub-owner-authored approval of finance accounting choices. [RFC #23](https://github.com/im-tnyx/Tio-Money/issues/23) documents docs-only technical PROCEED.

**Decision:** **Every app screen is dumb/presentation-only.** It only renders immutable typed ViewModel props, accessible controls and forwards injected callbacks. Screen files must not own business logic, financial math, balances/fees, local SQL, network/FX requests, permissions, router decisions, lifecycle/async side effects, or workflow-state hooks. Feature **controllers/hooks** own state/navigation/async; **use cases** own validation/orchestration; one pure **domain ledger** owns financial rules; **repository adapters** own SQLite; platform services own OS/network behavior. Static Expo Router **route/layout composition** may wire providers/controllers but may not become business-logic screens. Read the exact [12 — Dumb-Screen Contract](12-DUMB-SCREEN-BOUNDARIES.md) and [finance ADR release gates](11-STAGE-1-FINANCE-ADRS.md).

**Enforcement:** Future code PRs must add static boundary/negative-fixture tests `TM-PRES-001–006`; passing visual smoke tests is insufficient. **These tests are a future code task, not implemented by this documentation decision.** Current blank five-tab shell, disabled More-aligned Add and visual token geometry stay untouched under TM-DEC-005/TM-DEC-010. No added feature routes or financial logic is authorized by this entry.

**Supersedes:** older permissive wording that allowed screen-owned form workflow/business actions; it does not change route composition, existing Phase 0 provider bootstrap, or independent finance ADR/merge gates.

## Pending choices — not decisions

| Topic | Evidence | Status |
|---|---|---|
| Final iconography and contrast | [TM-DEC-004](#tm-dec-004--five-destinations-and-floating-add) · [TM-DEC-005](#tm-dec-005--phase-0-empty-navigation-shell-and-disabled-fab) · [Screen spec](03-SCREEN-SPEC.md) | Five tab destinations, More-aligned disabled FAB and shared 24dp icon-size contract decided/implemented for Phase 0; final visual contrast/device validation pending |
| Detailed ledger correction/idempotency strategy and device transaction behavior | [Database design](04-DATABASE-DESIGN.md) · [test plan](06-IMPLEMENTATION-TEST-PLAN.md) | Proposed / needs implementation validation |
| Android native SMS capability and Play policy eligibility | [Architecture](05-TECH-ARCHITECTURE.md) | Conditional, not authorized |
| Phase 0 post-merge device QA | [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) | **MERGED** 2026-11-19 20:30:09 UTC; owner-reported Android UI smoke PASS; full iPhone/device accessibility and SQLite persistence/restart proof not yet verified |
| New account/currency accounting detail | [Account Groups](08-ACCOUNT-GROUPS-SPEC.md) · [Currency](10-CURRENCY-SPEC.md) · [RFC #13](https://github.com/im-tnyx/Tio-Money/issues/13) | Product direction set; currency journal, loan/valuation and card billing ADRs **not yet approved for coding** |
| Future backup/auth security design | [TM-DEC-006](#tm-dec-006--local-first-delivery-order-and-backup-boundary) · [TM-DEC-009](#tm-dec-009--conditional-identity-only-for-opt-in-supabase) | Backup encryption/key handling and later Supabase tenant isolation remain future review gates |
| Governance PR #2 outcome | [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) · [Governance task](../.ai/tasks/governance/ai-context-setup.md) | **MERGED** 2026-11-19 06:16:11 UTC; SHA `04e6aa8d657627516b8ce7de91bd8304fdcbcf90`, 6/6 review threads resolved when inspected; [PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) later merged on 2026-11-20 |

**Amendment policy:** Future decisions must include date, source/authority, exact scope, superseded passages and verification. Do not infer owner approval from a merged planning document alone.

[← Documentation hub](00-INDEX.md)
