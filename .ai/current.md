## 2026-11-23 — Accounts UI foundation

- [TM-ACCOUNTS-20261123-001](tasks/accounts/accounts-ui-foundation-20261123.md) · [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) · [technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7096382991). Codex Cloud on `feat/accounts-ui-foundation-20261123` from `f865969d200d70fbc8e84dd6a48d8020a155e42c`. Accounts group picker, Cash/Bank previews and separate Manage Accounts foundation only. Finance persistence, projections and Default Cash remain BLOCKED_PENDING_DECISION. Android navigation QA remains tracked separately in #91.

- Draft #97 source audit recorded at `7042a1ba8ac78b6fd1b7a347666212cd1630a7f6`. Exact reviewed HEAD CI passed; independent and device review pending. [Audit and technical decision](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7096975333) · [Finance RFC #98](https://github.com/im-tnyx/Tio-Money/issues/98), DECISION_PENDING.

- [Add Account UI technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7097494971) extends Draft #97 to six transient forms, named Bank payment modes, accessible currency selection and draft/navigation regression fixes. Insurance stays informational. Save, account linking, and financial behavior remain gated in [RFC #98](https://github.com/im-tnyx/Tio-Money/issues/98).

- [Currency and Credit Card correction PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7097962644) hides Currency without configured Sub Currencies, retains the amount-reset guard and puts tracking-only Auto Pay in a disabled dedicated control. Draft #97 remains UI-only.
- [Owner correction follow-up PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7098232880) verifies the six forms and guards against stale currency actions while the selector is hidden. Regression coverage checks amount reset and draft retention across all six groups. Exact published HEAD and observed check results are recorded in RFC #96.
- [Branch reconciliation PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7098601639) brings the five commits through main `6468b62786d56edb1a70b7a5c90146e17566e23b` into Draft #97. The shared index preserves both Accounts and Manual Expo preview recovery entries. Exact published HEAD and checks are recorded in RFC #96.
- [Borderless Add Account fields PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7098953741) removes the outlines from the six main forms’ text fields. The Bank Linked Payment Modes bottom sheet keeps its outlined input. Exact HEAD and validation evidence are recorded in RFC #96.
- [Currency row PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7099073273) adds catalog symbols and a single horizontal row with Main selected on new drafts. [Account Settings card PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7099098074) groups Account Groups and Manage Accounts on a shared surface. Exact HEAD and checks are recorded in RFC #96.
- [Leading field icon PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7099510319) aligns the main Add Account inputs with decorative icons, a name placeholder and the selected draft currency symbol. Exact HEAD and checks are recorded in RFC #96.
- [Linked Payment Modes list PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7099730686) places compact Add in the heading and shows named draft rows with payment type, Edit and Remove icons. Exact HEAD and checks are recorded in RFC #96.
- [Symbol-only Currency PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7099810331) uses outlined currency symbols and a filled selected state in the existing single row. Exact HEAD and checks are recorded in RFC #96.
- [Compact Currency and Description PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7099965028) puts the selected tint-filled currency at the right edge of the label row and uses an inline Description placeholder with native wrapping. Exact HEAD and checks are recorded in RFC #96.
- [Shorter Linked Payment Modes Add PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100100853) applies a 32dp painted minimum height with the shared 48dp touch target. Exact HEAD and checks are recorded in RFC #96.
- [Single Bank Account Name PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100148939) uses the shared Account Name and Cash opening input for Bank. Linked Payment Modes stays available in the draft. Exact HEAD and checks are recorded in RFC #96.
- [Currency and field sizing PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100290763) sets 36dp currency boxes, exact code selection and a 46dp borderless input baseline. [Credit Card placement](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100318699) puts Currency just below Total Credit Limit. Exact HEAD and checks are recorded in RFC #96.
- [Single Auto Pay row PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100361542) puts a disabled Off switch below Credit Card Description. The repayment-account row is labeled [Payment](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100426277). Exact HEAD and checks are recorded in RFC #96.
- [Stable Currency selection PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100580606) keeps the configured symbol order and highlights the tapped box in place. This supersedes fixed right-side selection placement. Exact HEAD and checks are recorded in RFC #96.
- [Add Account text hierarchy PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100690697) distinguishes muted labels, placeholders, prominent values and primary leading icons. Exact HEAD and checks are recorded in RFC #96.
- [Amount symbol Currency picker PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100887525) replaces the inline boxes. Card symbols share one draft currency. Add Currency opens the existing Sub Currency setting. Exact HEAD and checks are recorded in RFC #96.
- [Shared 46dp input height PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7109719765) aligns borderless and outlined fields. Interactive currency symbols keep 48dp targets. Exact HEAD and checks are recorded in RFC #96.
- [Inline amount Currency PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7110102250) restores the symbol boxes at the right end of [one amount row per form](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7110155081) and removes the Currency sheet. Exact HEAD and checks are recorded in RFC #96.
- [Compact payment type tabs PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7111045650) adds one horizontal row of outlined choices in the existing Bank editor. Exact HEAD and checks are recorded in RFC #96.
- [Payment row icon and sheet PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7111219399) uses compact Edit/Delete, weight-200 payment symbols and Apply-only sheet actions. Exact HEAD and checks are recorded in RFC #96.
- [Add Account gutter PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7111341207) reduces the leading icon inset, aligns trailing Currency boxes and removes the visible amount-reset caption. Exact HEAD and checks are recorded in RFC #96.
- [Payment mode limits PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7111930485) caps Bank draft modes by type and places Edit and Delete side by side. Exact HEAD and checks are recorded in RFC #96.
- [Add Account footer PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7112024624) removes the visible Cancel action. Header Back remains available. Exact HEAD and checks are recorded in RFC #96.
- [Add Account bottom sheet PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7112159681) opens the form from Accounts +. The Group row and Bank payment editor open above the form in one modal host. Group drafts last until the parent sheet closes. Exact published HEAD and checks are recorded in RFC #96.
- [Group-first Add Account PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7123331800) opens the picker before the selected form. The form has transparent borderless fields and omits the Group row and preview sentence. Exact published HEAD and checks are recorded in RFC #96.
- [Add Account entrance PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7123681685) slides the selected form upward in the existing modal and respects Reduced Motion. Exact published HEAD and checks are recorded in RFC #96.
- [Add Account timing PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7123925491) slows the selected form to a 300 ms ease-in-out slide. The group picker uses the native modal slide. Exact published HEAD and checks are recorded in RFC #96.
- [Add Account screen PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7124239053) opens the editor screen before the Group picker, restores switching between group drafts and moves disabled Save into the top bar. Exact published HEAD and checks are recorded in RFC #96.
- [Add Account spacing PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7124570281) sets 16 dp editor padding, 12 dp field gaps and 36 dp round header backgrounds. [Save uses the owner-selected weight 300 SVG](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7124614466). Exact published HEAD and checks are recorded in RFC #96.
- [Inline Add Account rows PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-follow-up-decision--proceed) places Loan Direction, Wallet Type and Investment Type in right-side dropdowns and puts Payment From above Statement Date. The [task checkpoint](tasks/accounts/accounts-ui-foundation-20261123.md#2026-11-24--inline-add-account-rows) records validation and remaining device QA.
- [Account Group restoration PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-correction--proceed) restores the original Group row above the form and verifies the Add Account top bar against the prior layout.
- [Add Account input placement PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-input-placement-correction--proceed) restores the text input immediately after its icon and keeps the other controls on their established rows.
- [Add Account caption placement PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-reference-photo--proceed) aligns the small captions above their inputs in the column to the right of the icon.
- [Credit Card date rows PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-credit-card-date-rows--proceed) presents the editable monthly days with the reference labels. The caption-to-input gap is 4 dp.
- Owner follow-up on [PR #97](https://github.com/im-tnyx/Tio-Money/pull/97) sets the Add Account caption-to-input gap to 2 dp.
- [Loan and Investment date rows PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-loan-and-investment-date-layout--proceed) applies the same date-row layout to Loan and Investment, with editable day, month and year.
- [Account option popup PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-account-option-popup--proceed) replaces the Wallet, Loan and Investment option sheets with a compact card anchored to the dropdown.
- [Bank payment mode empty state PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-bank-payment-mode-empty-state--proceed) shows a link icon and guidance while the draft has no payment modes.

## 2026-11-23 — Manual Expo preview recovery (RFC #99)

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/99#issuecomment-7097257109) scopes owner-requested fresh manual restart and safe alternate port on `feat/manual-expo-preview-recovery` from verified main `f865969d200d70fbc8e84dd6a48d8020a155e42c`. [Task record](tasks/preview/manual-recovery-20261123.md). The [PR #100](https://github.com/im-tnyx/Tio-Money/pull/100) follow-up applies the same private, no-auto-forward policy to all managed Metro ports. Follow-up CI and live verification are pending.

## 2026-11-23 — Unified Expo preview Actions follow-up

- [RFC #87 technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/87#issuecomment-7095354699) tracks [Draft PR #95](https://github.com/im-tnyx/Tio-Money/pull/95). The unified workflow contains the manual choices and the automatic Codespaces job. The separate push signal stays secretless. [Task checkpoint](tasks/preview/unified-expo-live-refresh-20261123.md#2026-11-23--consolidate-the-preview-actions-entry). Live acceptance remains NOT_VERIFIED.

## 2026-11-23 — PR #88 Gate 10 review fixes (RFC #87)

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/87#issuecomment-7094686330) for EAS base SHA and Metro runtime compatibility. [Task checkpoint](tasks/preview/unified-expo-live-refresh-20261123.md#2026-11-23--gate-10-automated-review-fixes). Keep Ready for Review and require exact-HEAD CI. Live Codespaces and physical Android/iOS Fast Refresh remain NOT_VERIFIED.

## 2026-11-23 — PR #88 security remediation (RFC #87)

- [Owner-scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/87#issuecomment-7094088569) authorizes strict fail-closed per-platform verification and the four accompanying security fixes. [Remediation checkpoint](tasks/preview/unified-expo-live-refresh-20261123.md#2026-11-23--security-remediation-decision-and-validation). Verify required CI at the resulting Draft PR HEAD. Independent human review DEFERRED and live Codespaces/EAS/device acceptance NOT_RUN.

## 2026-11-23 — PR #88 branch reconciliation with main

- Owner requested branch alignment in project chat. [Draft PR #88](https://github.com/im-tnyx/Tio-Money/pull/88) integrates main `d8badc8bee842a20db9ea5c5866cb5db4b1e77a5` from prior PR HEAD `1b68936930ed0c627ca525ed6972885ba1336d5e`. [Task checkpoint](tasks/preview/unified-expo-live-refresh-20261123.md#2026-11-23--branch-reconciliation). Security findings remain open. Verify required CI on the resulting HEAD.

## 2026-11-23 — PR #88 review correction (RFC #87 addendum)

- Draft PR #88 self-audit at `53265db7a87a4a0a080c189107e45390048f0165` found old-starter `--preflight` incompatibility and PR-test/EAS-token same-runner exposure. [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/88#issuecomment-7091132864) bounds the fixes on `feat/unified-expo-preview-live-refresh`; task [record](tasks/preview/unified-expo-live-refresh-20261123.md). Trusted-main streamed preflight and a secretless EAS validation runner are implemented locally; exact new HEAD and CI still pending. Independent review DEFERRED; live Codespace/EAS/device NOT_RUN; merge prohibited without separate authorization.

## 2026-11-23 — Unified Expo PR Review and persistent Codespaces refresh (RFC #87)

- **Technical PROCEED:** [Issue #87](https://github.com/im-tnyx/Tio-Money/issues/87#issuecomment-7090616033), owner-requested scoped branch `feat/unified-expo-preview-live-refresh` from verified main `d200ed24117d525fe7a9af7cf8b2e6d4e75317c6`; active agent ChatGPT/GPT-6. Task [.ai/tasks/preview/unified-expo-live-refresh-20261123.md](tasks/preview/unified-expo-live-refresh-20261123.md). No merge, privileged dispatch, Codespace action, OTA/build or secrets/settings change authorized.
- **Review gate:** Consolidated manual form, Codespaces-only push worker, immutable bundle, healthy Metro reuse and fail-closed source-map probe in scoped feature branch. Partial local targeted tests and YAML/shell syntax PASS; full `npm run check` and `npm run preview:test` not verified locally due missing dependencies/full checkout. Exact-HEAD CI, independent security review and physical Android/iPhone acceptance remain pending; review disposition DEFERRED. Issue #71 and PR #65 security hold remain separate.

## 2026-11-23 — PR #90 Gate 3 documentation review passed (Issue #89)

- **Task:** [TM-DOC-IA-20261123-001](tasks/governance/documentation-information-architecture-20261123.md), [Draft PR #90](https://github.com/im-tnyx/Tio-Money/pull/90). No blockers found in docs-only self-review: 74 core + 17 secondary + 27 governance/task docs-anchor references matched, repo CI markdown links PASS. Protected main ruleset requires static + Governance; both previously PASS at `1cdf32d6`. Exact HEAD must revalidate after this checkpoint.
- **Concurrent #88:** Active Draft preview PR stays on its own branch (three files remain at docs root). Don't overwrite .ai/current.md additions if #88 lands. Independent GitHub reviewer not yet performed; RFR transition/review feedback pending; no PR #90 merge permission.
  
## 2026-11-23 — PR #80 latest owner choice: Android fade-only (slide removed)

- Owner superseded Android slide/slide+fade request due to right-edge white flash. [RFC #79](https://github.com/im-tnyx/Tio-Money/issues/79#issuecomment-7091987225), [assigned task](tasks/ui/settings-topbar-account-groups-20261122.md). Four detail routes share native `fade` on Android/iOS (iOS 160ms, Android OS-native duration); keep theme underlay, tabs fade, Reduced Motion and bottom sheet. Device QA required, PR #80 only, no merge or #71 trust approval. Exact new HEAD CI pending.

## 2026-11-23 — PR #80 Android Back white-edge mitigation (combined fade requested)

- Owner requests smooth Android Back, no white right-edge flash and a subtle fade along with slide. [RFC #79 decision](https://github.com/im-tnyx/Tio-Money/issues/79#issuecomment-7091913435) / [task](tasks/ui/settings-topbar-account-groups-20261122.md). Root Stack native underlay now matches theme canvas like Tabs; existing native Android slide, iOS fade, Reduced Motion and gestures kept. Expo Router native Stack lacks one-option slide+fade composition, so combined effect is NOT claimed; device QA still required. PR #80 only, no merge authority, main untouched, Issue #71 OPEN. Exact new HEAD/CI pending.

# 🧭 Current task index

## 2026-11-23 — Gate 2: PR #90 reconciled with PR #80 merged main (Issue #89)

- **Reconciliation:** Draft [PR #90](https://github.com/im-tnyx/Tio-Money/pull/90) safely integrated latest main `1d512cf4` (merged PR #80) using non-force two-parent docs-branch commit `bbecbcc1`. Retained PR #80 app/UI, eight task-index sections and Android fade-only documentation. Diff against main remains docs-only, 17 ahead / 0 behind.
- **Concurrent PR #88:** Remains Draft/untouched; preview docs still at root; independent PR #88 conflict with newer main is separate. [Task checkpoint](tasks/governance/documentation-information-architecture-20261123.md), [RFC #89](https://github.com/im-tnyx/Tio-Money/issues/89). Governance CI PASS at reconciled head, static in progress; this index write requires new exact-HEAD CI. Review DEFERRED, owner PR #90 merge authorization NOT_GRANTED, no main changes.

## 2026-11-23 — Documentation information architecture / Premium README (Issue #89)

- **Owner direction:** Start a tracked .ai task and reorganize the flat docs folder into coherent product, design, architecture, engineering, security, governance and history categories; keep historical audit/CI evidence outside README. **RFC:** [Issue #89](https://github.com/im-tnyx/Tio-Money/issues/89); [agent-recorded technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/89#issuecomment-7091498129).
- **Task:** [TM-DOC-IA-20261123-001](tasks/governance/documentation-information-architecture-20261123.md); scoped branch `docs/information-architecture-20261123` at main `d200ed24117d525fe7a9af7cf8b2e6d4e75317c6`. Docs-only, canonical decisions and history preserved, verify all moved-file links and actual CI. **PR #88/#80 touch shared documentation/index; avoid overwriting concurrent changes.**
- **Draft PR:** [#90 — category docs + product-first README](https://github.com/im-tnyx/Tio-Money/pull/90) opened on scoped branch; 18 canonical docs moved, Phase 0 historical checkpoint archived. 3 in-flight preview docs deliberately deferred for PR #88; exact-head CI and PR overlap reconciliation pending. No owner merge authorization.
- **Permissions:** Owner instructed work to start; no PR-specific merge authorization, no main modification, force push, security waiver or policy change. Independent review DEFERRED at task opening; current CI NOT_RUN.



## 2026-11-23 — PR #80 Settings detail animation parity (Currency + Account Groups)

- Owner approved **scoped implementation in PR #80 only** after spotting inconsistent Currency transitions. [RFC #79 decision](https://github.com/im-tnyx/Tio-Money/issues/79#issuecomment-7091695525) / [task](tasks/ui/settings-topbar-account-groups-20261122.md). Root Stack applies one `motion.detail` to Account Groups, Main Currency, Sub Currency, Sub Currency Detail; iOS native 160ms fade, Android slide with reverse Back, Reduced Motion respected. Tabs/bottom sheets and native swipe arbitration remain unchanged. Exact-new-HEAD CI, independent review disposition and device QA must be verified separately. No merge permission, protected-main or Issue #71 trust/security change.

## 2026-11-23 — PR #80 Android horizontal Stack slide + native Back

- **Owner feedback:** Android Back appeared unanimated; prefers slide to fade-from-bottom. Technical PROCEED in [Issue #79](https://github.com/im-tnyx/Tio-Money/issues/79#issuecomment-7091432351). Shared detail policy targets Android `slide_from_right` with inverse native pop, iOS 160ms fade and all five tab fades unchanged, OS Reduced Motion respected. Theme README/tests updated; real Android open/Back/gesture/Animator-scale QA pending. PR #80 only, no merge authorization or Issue #71 security waiver.

## 2026-11-23 — PR #80 Android motion tweak `fade_from_bottom`

- Owner requested Android smoothness correction, iOS unchanged; scoped PROCEED [Issue #79](https://github.com/im-tnyx/Tio-Money/issues/79#issuecomment-7091210809). Shared policy now selects native Android `fade_from_bottom`, iOS native 160ms `fade`, JS Tabs unchanged, OS Reduced Motion respected. Theme README and Phase0 tests updated. Native on-device perceptual QA pending; no protected-main change or PR merge authorization. Issue #71 OPEN.

## 2026-11-23 — PR #80 reusable navigation motion + Account Groups fade

- **Owner scope:** More crossfade and Account Groups detail fade share one theme motion contract; [RFC #79](https://github.com/im-tnyx/Tio-Money/issues/79#issuecomment-7090244141), assigned `.ai/tasks/ui/settings-topbar-account-groups-20261122.md`.
- **Implementation gate:** root single Reduced Motion provider, shared Tabs/Stack options, semantic 160ms aliases (Stack native duration iOS-only), theme README + Phase0 tests. Exact-HEAD CI, fresh review and device QA required. No merge permission; Issue #71 still OPEN.

## 2026-11-23 — PR #80 Codex P1 + Bugbot keyboard/input remediation

- Owner “Sahi kre”, scoped PROCEED https://github.com/im-tnyx/Tio-Money/issues/79#issuecomment-7085443402. Route/controller owns Back/rename/delete; shared single-line Android input centers; keyboard-aware Bottom Sheet no longer reapplies the 90% collapsed cap, default Currency/Theme unchanged.
- Task: .ai/tasks/ui/settings-topbar-account-groups-20261122.md. Exact-HEAD checks and physical device QA pending; review threads not pre-emptively cleared; Issue #71 remains OPEN. No PR merge authorization or protected main modification.

## 2026-11-23 — PR #80 owner-approved single-line 1–20 custom group names

- **Source:** Owner final **Go**, [Issue #79 RFC](https://github.com/im-tnyx/Tio-Money/issues/79#issuecomment-7085252621). Existing task \`.ai/tasks/ui/settings-topbar-account-groups-20261122.md\` remains assigned to GPT-6; PR #80 Ready for Review, source/input/domain tests scoped only.
- **Gate:** New exact-HEAD CI and iPhone/Android manual UI acceptance pending; prior HEAD required \`static\` failed closed on npm attestation, Issue #71 OPEN. Diagnostic PR #84 cannot waive it. No main changes, no merge authorization.

## 2026-11-23 — Draft PR #80 custom Account Group swipe Delete and tap Rename

- **Owner direction / RFC #79:** custom display-only groups reveal Delete on left swipe, and open the existing one-Save, keyboard-aware bottom sheet with a prefilled name for Rename on tap. Built-in groups remain read-only. Technical decisions and acceptance: [swipe](https://github.com/im-tnyx/Tio-Money/issues/79#issuecomment-7084481580), [rename](https://github.com/im-tnyx/Tio-Money/issues/79#issuecomment-7084496503).
- **Work in progress:** PR #80 branch `ui/settings-topbar-account-groups-20261122`, bounded local v1 preference edits and route-owned swipe controller; exact HEAD CI, independent device swipe/keyboard/a11y QA pending. No merge authorization, no main/security modifications; Issue #71 remains OPEN.
- **Assigned task:** `.ai/tasks/ui/settings-topbar-account-groups-20261122.md`.

## 2026-11-22 — PR #80 shared ActionButton visual 42dp, touch 48dp

- **Owner request / RFC #79:** all shared ActionButtons painted 42dp from central theme primitives, retain accessible 48dp touch region, preserve variants and statuses. See active task `.ai/tasks/ui/settings-topbar-account-groups-20261122.md`.
- **State:** Draft PR #80; exact-HEAD CI and owner preview needed; no merge/main/security changes. Separate Issue #71 remains OPEN and PR #65 remains HOLD.

## 2026-11-22 — Draft PR #80 Account Groups control refinement

- **Owner chat / RFC #79:** Eye action next to `+` with description visibility, max five persisted *display-only* user-defined names, remove introductory template banner; `home_storage` Google wght200 icon only Settings Account Groups row (not list). Controller/local non-finance preference, no ledger/account class schema. See `.ai/tasks/ui/settings-topbar-account-groups-20261122.md`.
- **Merge:** PR #80 remains DRAFT/unmerged, no new owner permission; exact-HEAD CI and owner Codespaces/Expo Go UI inspection pending this refinement. PR #65 security HOLD and Issue #71 separate.

## 2026-11-22 — Settings top bar and seven informational Account Groups (RFC #79)

- **Technical PROCEED:** Owner requested a new branch and UI preview with AGENTS.md/theme README. RFC https://github.com/im-tnyx/Tio-Money/issues/79; this is agent-transcribed instruction, not owner PR merge approval.
- **Branch:** `ui/settings-topbar-account-groups-20261122` from verified `main` `bb6638b56d2dea6d1e067806be009f500666e82c`; token-owned shared AppTopBar; Account Groups template-only seven entries; Theme copy; existing local persistence/finance unaffected.
- **Task:** `.ai/tasks/ui/settings-topbar-account-groups-20261122.md`; exact-HEAD CI and owner device preview **PENDING** until checked. Issue #71 remains separate and OPEN; PR #65 remains SECURITY HOLD. No main change, merge or privileged Codespaces run authorized.

## 2026-11-22 — Issue #71 Gate 5 synthetic test fixture correction

- **Observed red test:** Gate 5 initial HEAD `c0a0ae29` first HTTP-boundary job [137250698578](https://github.com/im-tnyx/Tio-Money/actions/runs/45036298022/job/137250698578) failed 2/11 synthetic checks (partial report order fixture and literal backslash-newline fixture source). This is diagnostic test code, **not** a new npm invalid attestation.
- **Correction:** Reindex only the partial fixture event to order 1; join generated JS with actual newlines. Keep historical failed run, original secure runtime behavior, first npm audit fail-closed, Issue #71 OPEN, PR #73 DRAFT/HOLD, PR #65 HOLD, main unchanged. Fresh exact-HEAD CI and agent review required.

## 2026-11-22 — Issue #71 Gate 5: eighth exact Babel HTTP target on Draft PR #73

- **Technical PROCEED:** Owner chat `Go next`, scoped [Issue #71 RFC](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7081014363), existing Draft PR #73 branch only. Active agent ChatGPT/GPT-6; no new PR, merge, risk waiver or protected-main write.
- **Root evidence:** First npm10 uninstrumented clean-a at parent `28d607b5` genuinely FAIL_CLOSED for `@babel/helpers@7.29.15`; full parent CI 9/10 with one red forensic job; post-failure public GET and distinct green instrumented audit do not reproduce old failed HTTP bytes. EAS lock blob `fa92a2b8` includes exact signed-registry URL/SRI for helpers.
- **Scoped change:** Extend existing first HTTP tap and sanitizer literal allowed exact Babel identities to eight, preserve existing REQUIRED two, 8MiB cap, no raw bodies, nonzero-first audit gate, and add adversarial URL/version/redaction and partial-capture fixtures; task/index only. Existing locked packages, workflows, perms, PR #65 and main unchanged.
- **Remaining gate:** Verify fresh exact-HEAD CI and agent comment review. Issue #71 OPEN, PR #73 Draft/HOLD, PR #65 Security HOLD; independent approved Sigstore TUF root, Babel publisher ref and historical cause remain UNVERIFIED.


## 2026-11-22 — Issue #71 Gate 4 first-failure HTTP coverage (Draft PR #73)

- **Technical PROCEED:** Owner chat `Go` after [Issue #71 historical comparison](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7080858530), scoped RFC [#71 Gate 4](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7080890333). One existing Draft PR #73, existing unprivileged isolated HTTP tap only; no new PR, no merge/risk waiver.
- **Implementation:** Literal seven exact EAS-lock historical Babel target identities for the first instrumented npm10 HTTP boundary; bounded hashes, non-200/fetch categories and sanitized partial incident evidence on an initial nonzero audit. Old `7.29.14` graphs excluded. Keep original audit fail-closed, no retry, no raw HTTP/credentials, no trust-policy changes. Existing root/EAS locks, privileged workflows, PR #65 and main untouched.
- **Gate:** Fresh exact-HEAD static/Governance/forensic CI and security review after the scoped commit; historical original failed HTTP bytes, causality, independent owner-approved Sigstore TUF bootstrap and exact authorized Babel publish workflow remain UNVERIFIED. #71 OPEN, #73 DRAFT/HOLD, #65 SECURITY HOLD.



## 2026-11-22 — npm10 HTTP JSON reader streaming-bound fix (Issue #71)

- **Authority/agent:** Owner's "Go" after read-only audit recommended the HTTP Boundary Diagnostic Fix, agent-transcribed [Issue #71 scoped PROCEED](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7080458729). Active agent ChatGPT/GPT-6; independent human security review DEFERRED (optional under actual rule).
- **Verified pre-fix HEAD:** Draft PR #73 a0ac978e8dfb76faf7d969adf1283c04d049cced, main 44f033b83921c660797d610a3befa744ab832f9f. Required static and Governance PASS; isolated http-boundary diagnostic FAIL_CLOSED after TARGET_RESPONSE_SEEN before TARGET_RESPONSE_HASHED. First CLI stdout was empty, invalid attestation package UNVERIFIED; not evidence of actual package compromise.
- **Root diagnostic defect:** Preloader set npm10 minipass-fetch response.size=8MiB as a maximum; that field triggers MinipassSized requiring exact response size. The previous synthetic Buffer mock never exercised the stream size check. New instrumented reader consumes decoded response.body async-iterably with explicit 8MiB incremental cap and fails closed for unreadable/oversized/malformed body. Sanitize only fixed error category; no raw body/credential/error text output. Tests now exercise real stream bodies, size-setter rejection, too-large chunks, malformed JSON, redaction.
- **Boundaries:** Instrumented decoded JSON bytes are NOT original historical uninstrumented HTTP wire bytes. Audit still single first attempt with no signature bypass/retry. Only scoped Draft #73 source/test/task/index edits; no app, lockfiles, PR #65, protected main, secrets, privileged workflow or ruleset changes. Post-fix exact HEAD and CI must be reverified. Issue #71 stays OPEN; PR #73 Draft; PR #65 Security HOLD; independent TUF trust anchor UNVERIFIED.


## 2026-11-22 — JSON response-boundary diagnostic correction (#71)

- **Observed:** `298b626f` tap stage TARGET_RESPONSE_SEEN then failed before hashing; all uninstrumented npm diagnostics and required static/Governance passed. Clone-based interception was a diagnostic bug, not npm attestation proof.
- **Fix:** Consume the actual targeted JSON response through bounded `buffer()`, hash before `JSON.parse`, return parsed object; no second HTTP GET or raw output. Local synthetic response fixture and syntax PASS. Instrumented behavior may alter timing/error handling; old failure HTTP still NOT_CAPTURED. Fresh CI required; #71 OPEN, #73 Draft, #65 HOLD.

## 2026-11-22 — HTTP tap path fix, distinct npm10 failure (#71)

- **Pre-fix head `6bb1c9cc`:** New instrumented job failed before capture due to npm executable symlink path; fix preloader module resolution with `realpathSync` and synthetic symlink test. Separate uninstrumented node22-clean-a genuinely failed `@babel/code-frame@7.29.7` attestation on unchanged EAS lock; node22-clean-b/npm11 and required static/Governance passed. First failed HTTP bytes remain NOT_CAPTURED.
- **Gate:** Fresh fixed-head CI is required. #71 OPEN, #73 Draft, #65 HOLD; no merge/risk acceptance or signature bypass. Independent human review DEFERRED.

## 2026-11-22 — Instrumented first npm10 HTTP boundary (#71)

- **Scope/decision:** Owner `Go`, continuing [Issue #71 RFC](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7079959825); Draft PR #73 only. Agent ChatGPT/GPT-6. A new isolated read-only job records bounded first target response fingerprints from npm10's bundled fetch boundary in one real `npm audit signatures` invocation. No raw payload/secret output, retries, mandatory Phase 0 changes, trust-policy switch or #65/main edit.
- **Limit:** Preload may alter timing; old failed HTTP response is unrecoverable. Green instrumented audit cannot resolve root cause. First nonzero audit remains FAIL_CLOSED; missing response UNVERIFIED. Exact-HEAD CI/review to verify after commit; independent human review DEFERRED (recommended, optional).

## 2026-11-22 — Sixth locked Babel provenance target (#71)

- **Owner direction / scope:** `Go follow agent.md`; bounded forensic decision in [Issue #71](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7079959825). Draft PR #73 only; active agent ChatGPT/GPT-6. Current required `static` first failure at HEAD `338a5e32` includes `@babel/types@7.29.15`, previously outside five-target proof.
- **Implementation:** Add exact committed EAS-lock `@babel/types` as sixth target to existing SRI/DSSE/TUF/OIDC/Rekor/registry ECDSA/frozen-pacote path with negative identity/redaction tests. Original first failing HTTP response remains NOT_CAPTURED; npm10 vs npm11 root cause and owner-approved out-of-band TUF root remain UNVERIFIED.
- **Gate:** Verify fresh HEAD CI and scope before handoff. #73 Draft, #65 HOLD, #71 OPEN; no merge, risk acceptance, signature bypass or main change. Independent human security review DEFERRED (recommended, optional under observed settings).


## 2026-11-22 — TUF OLPC canonical format correction, public roots v1→v16

- **Exact failed HEAD evidence:** dd9833f1 root v10's self-signature rejected by the standalone diagnostic because JSON.stringify escaped PEM newlines as \\n. TUF/OLPC canonical encoding signs literal newline bytes; the mismatch was in our diagnostic, not evidence of compromised root metadata.
- **New scoped check:** Strict TUF OLPC canonical JSON (only escape backslash/quote) + legacy SEC1 P256 and modern PEM public keys, full v1→v16 old+new signature threshold transitions, no root version skipping. Synthetic negative cases, safe source/version labels and fail-closed workflow.
- **Trust boundary unchanged:** Public root v1 sourced at immutable upstream Git commit, NOT independently owner-approved out-of-band ceremony bootstrap. Never promote chain continuity to trusted root config. Historical npm attestation causal root, exact Babel publisher policy and PR #65 Security HOLD remain open. Task [#71](https://github.com/im-tnyx/Tio-Money/issues/71); Draft #73 only.



## 2026-11-22 — Updated Sigstore root-chain boundary: v10 to v16 (#71)

- **Observed:** Draft PR #73 initial 1→16 root diagnostic first failed on legacy SEC1 hex key parsing; strict P256 decoding fixed it, then real historical v4→v5 failed TUF_SIGNATURE_THRESHOLD_NOT_MET despite signature IDs present. No threshold bypass. Official Sigstore docs describe a backward-incompatible historical root format and recommend a modern v10 bootstrap.
- **Next exact gate:** Verify modern root v10→v16 successor+predecessor ECDSA signature thresholds and v16 expiry/equality from immutable public upstream commit 25b222a48cda4aa88e1af85605bdd193f5619a60. Deliberately classify v4→v5 and owner-approved independent trust anchor UNVERIFIED. This is technical proof of internal continuity, NOT a trusted-root pin change.
- **State:** Issue #71 OPEN, PR #73 Draft, #65 SECURITY HOLD, main protected. Root chain must not be declared fully trusted or historical npm failure resolved; record new exact-head checks. Independent human reviewer optional, no merge authorization.



## 2026-11-22 — Sigstore TUF public root-chain signatures, Gate 3 (#71)

- **Owner/PROCEED:** Chat "Go next" after successful frozen-pacote Gate 2. Agent-transcribed security discussion [Issue #71](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7079714316); bounded forensic diagnostic on Draft PR #73. ChatGPT/GPT-6 acting agent; optional external human review not requested. No merge or root policy authorization.
- **Proposed check:** Strict upstream immutable Git source at 25b222a48cda4aa88e1af85605bdd193f5619a60, root_history v1-v16; independent ECDSA P-256 signatures, previous+new TUF root-role thresholds, version continuity, v16 matching current root and not expired. Negative fixtures fail-closed. Raw public keys and signed content not logged.
- **Critical status:** ROOT_CHAIN_SIGNATURES_VERIFIED_FROM_UNAPPROVED_BOOTSTRAP is deliberately distinct from an owner-approved *independently supplied out-of-band* trust anchor, still UNVERIFIED. Historical npm10 failed-HTTP root cause and exact publisher workflow ref also UNVERIFIED. No trust pin switch, EAS lock, app, privileged workflow, secret, ruleset, #65 or main mutation. Post-change current SHA/checks to be verified.



## 2026-11-22 — Gate 2: Controlled same-public-registry-response pacote comparison (#71)

- **Active agent:** ChatGPT/GPT-6; bounded PROCEED transcribed from owner's chat "Go next" after first-failure evidence; discussion [Issue #71](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7079157593). NOT PR-specific merge authorization, security risk acceptance or independent review.
- **Task:** [TM-SEC-SIGSTORE-20261122-001](tasks/security/npm-sigstore-forensics-20261122.md), Draft PR #73 only, base main `44f033b83921c660797d610a3befa744ab832f9f`; first-failure HEAD `e4e08e02` had npm10 real invalid-attestation and 6/7 checks green, one red. That evidence stays retained and unwaived.
- **New controlled gate:** Public npm full package packument and attestation bytes each read ONCE per exact locked Babel package, independent pinned registry ECDSA check, identical frozen bytes served locally to npm10+11 pinned bundled pacote. Output only source digests, package IDs, bounded verdicts; no raw blobs/certs/credentials/redirects, no package installation or EAS lock change.
- **Security decisions still OPEN:** Historical failing registry HTTP bytes NOT CAPTURED; same-response pacote test cannot establish full npm CLI causal root. Out-of-band Sigstore TUF root and exact approved publisher workflow ref UNVERIFIED. Keep Issue #71 OPEN, #73 Draft, #65 SECURITY HOLD. Post-change HEAD and CI must be freshly verified; no merge.



## 2026-11-22 — Issue #71 first-failure npm evidence gate, Draft PR #73

- **Task/owner direction:** [TM-SEC-SIGSTORE-20261122-001](tasks/security/npm-sigstore-forensics-20261122.md) and [Issue #71](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7079012893), agent-transcribed owner chat "Go" for narrowly scoped First-Failure Evidence Capture, not permission to merge or accept unknown risk. Active agent ChatGPT/GPT-6; independent human security reviewer SKIPPED (optional by owner).
- **Safe branch/scope:** [Draft PR #73](https://github.com/im-tnyx/Tio-Money/pull/73), branch security/issue-71-npm-sigstore-diagnostic; first-failure helper/synthetic tests, Phase 0 EAS signature TEST, no-secrets diagnostic/workflow/task record and this current index only. Original npm CLI stdout/stderr SHA-256 and exact lockfile package identity recorded on first failure; later public registry fingerprints distinctly AFTER_FIRST_NPM_CLI_FAILURE. No raw HTTP/DSSE/certificates/credentials, no retries or signature bypass. App, EAS/root lock, #65, protected main and ruleset unchanged.
- **Verified checkpoint BEFORE this index-only commit:** PR HEAD 6113cf79e542bc4de6859657f3e847f4c391341e, base protected main 44f033b83921c660797d610a3befa744ab832f9f, 0 commits behind, 7/7 native GitHub checks SUCCESS: required static and Governance, npm10 A/B, npm11, same-bundle, optional signal. App/preview tests and Metro Android/iOS PASS. The current index edit creates a NEW HEAD; its own exact-head CI must be rechecked rather than inheriting prior PASS.
- **Security disposition:** No live first-failure captured on the green checkpoint; first-failure code tested with safe negative fixtures, not historical HTTP reproduction. Historical npm attestation cause, owner-approved independent TUF trust anchor and exact Babel signing workflow ref remain UNVERIFIED. Issue #71 OPEN; PR #73 Draft/unmerged; PR #65 SECURITY HOLD. No merge, risk acceptance or protection bypass.


## 2026-11-22 — PR #76 root SECURITY.md (AGENTS.md governance checkpoint; OPEN)

- **Task & RFC:** [TM-SEC-POLICY-20261122-001](tasks/security/security-policy-20261122.md), [Issue #75](https://github.com/im-tnyx/Tio-Money/issues/75); owner requested gap remediation with [documented bounded PROCEED](https://github.com/im-tnyx/Tio-Money/issues/75#issuecomment-7078378710). Current working agent ChatGPT / GPT-6 (self-identified); previous agent `UNKNOWN_NOT_VERIFIED`, not inferred from GitHub author.
- **Branch and scope:** [PR #76](https://github.com/im-tnyx/Tio-Money/pull/76), `docs/security-policy-20261122`, protected base `main` `7d2bb686...`; previously inspected task-file commit `c69050a9...`, **index write generates a new HEAD**. Only root `SECURITY.md`, this scoped task and additive index entry are authorized. PR #65/#73 and main untouched.
- **Decision and gates:** No security email now; verified dedicated confidential intake is a **manual release BLOCKER before first external beta/public distribution** under [#77](https://github.com/im-tnyx/Tio-Money/issues/77), not a blocker to this documentation PR's review. Historical `c4656ada...` exact-HEAD `static`/`Governance`/`signal` PASS; **fresh checks after governance commits must be reverified**. Independent human review DEFERRED; agent `COMMENTED` is not `APPROVED`. **PR #76 owner merge authorization NOT_GRANTED**. No merge/setting changes/secret access.


## 2026-11-22 — PR #53 Sub Detail in-place Number Format (unmerged)

- **Owner requested / technical PROCEED:** [PR #53 discussion](https://github.com/im-tnyx/Tio-Money/pull/53#issuecomment-7068636655). Add same Millions/Lakhs/No Format policies as Main, but **expand inside the existing Sub Detail Bottom Sheet**; other setting taps or selection collapse the Format options.
- **Data/scope:** backward-compatible optional per-Sub `grouping` field, currency Auto defaults, per-Sub display isolation, no FX/ledger change, no extra modal and no sensitive provider data. [Task](tasks/product/more-currency-preferences-20261121.md).
- **Gate:** latest live PR HEAD CI, Android/iOS inline sheet/accessibility QA; owner PR #53 merge **NOT AUTHORIZED**.

## 2026-11-22 — PR #53 single Sub FX freshness footer (unmerged)

- **Owner revised UI:** [technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/53#issuecomment-7068449996). Move previous per-card right-side `Checked / Refresh now` to one **unboxed footer immediately below final selected Sub card**, left check-date/partial-unchecked and right manual `Refresh now`.
- **Multi-currency accuracy:** oldest known successful check or partial-unchecked, and refresh all eligible stale/cached/unavailable saved pairs through the existing deduplicated provider. No new polling/network host, and existing card height, swipe/Delete, details and ledger untouched.
- **Gate:** exact-head Phase 0/governance, actual device visual/a11y QA; owner PR #53 merge authorization NOT_GRANTED. [Task](tasks/product/more-currency-preferences-20261121.md).

## 2026-11-22 — PR #53 inline Sub FX stale-check indicator (unmerged)

- **Decision:** [owner-requested PROCEED](https://github.com/im-tnyx/Tio-Money/pull/53#issuecomment-7068050333) — small right-side `Checked / Refresh now` CTA in existing Sub card when today's *successful network check* is missing; provider publication date may lag (weekend), so never conflate the two.
- **Scope:** pure local calendar helper, typed controller/manual saved-pair action and existing dumb Sub screen (same card height), tests/docs only. No automatic foreground FX request or changes to provider endpoint, ledger, Auth, secrets, permissions or EAS.
- **Gate:** exact final-HEAD CI/governance, phone UI/swipe accessibility, no PR #53 merge permission. [Task](tasks/product/more-currency-preferences-20261121.md).

## 2026-11-22 — PR #53 Sub FX Refresh result auto-hides after 3 seconds (unmerged)

- **Owner direction / technical PROCEED:** [PR #53 discussion](https://github.com/im-tnyx/Tio-Money/pull/53#issuecomment-7067991690); successful `Checked / unchanged` or `Reference rate updated` feedback in the Sub Currency Detail Sheet disappears after 3000ms; errors remain until retry/dismiss.
- **Implementation:** controller-owned cancellable `useEffect` timer scoped to successful `refreshResult` identity, preserving loading spinner, cleanup and unchanged FX provider/cache/ledger. Added `TM-CUR-049` and fixed test formatting for prior no-gap change `TM-CUR-048`. [Task](tasks/product/more-currency-preferences-20261121.md).
- **Gate:** latest exact-HEAD Phase 0/governance and user on-device timing QA. PR #53 still OPEN, **MERGE NOT_AUTHORIZED**.

## 2026-11-22 — PR #53 Sub Currency compact UI refinement (unmerged)

- **Owner request / technical PROCEED:** [PR #53 UI discussion](https://github.com/im-tnyx/Tio-Money/pull/53#issuecomment-7067789782). Main selected label shown above Subs; valid Main required before Sub creation, default INR remains valid; picker removes redundant counter; FX source/publication date one line; 1.5dp refresh stroke, tighter rate/icon gap, 24dp shared overflowing-list trailing padding.
- **Scope:** existing `feat/more-currency-preferences-20261121` branch, Sub screens/VM/provider and domain guards, shared semantic sheet token, tests and docs only. No finance/FX network or EAS workflow change. Prior non-force `main` reconciliation `4ad6a78d` remains preserved.
- **Gate:** check **exact live PR HEAD** and fresh Phase 0 + governance, verify no `.github/` changes, review security/UX scope and new iOS/Android accessibility gestures. **PR #53 merge NOT_AUTHORIZED.**

## 2026-11-21 — PR #53 bounded Sub-only FX owner approval (latest checkpoint)

- **Owner decision:** [PR #53 approval](https://github.com/im-tnyx/Tio-Money/pull/53#issuecomment-7066644805) — Frankfurter v2 blended **reference** rate for saved Sub Currency display/refresh **only**, under TM-ADR-023 controls. Never ledger/transaction/account conversion, user identifiers or paid services. Not live trading quotes.
- **Scope:** PR #53 FX adapter/cache/controller now part of explicitly limited owner-approved feature; earlier no-network statements below are historical. Provider/network safeguards, source date/last-check disclosure and pair-only requests are in the [Currency Spec](../docs/product/CURRENCY-SPEC.md) and [ADR](../docs/governance/STAGE-1-FINANCE-ADRS.md).
- **Gate:** latest branch edits require exact-HEAD CI, physical iPhone/Android UX and trusted EAS preview scope resolution. No independent reviewer approval is assumed. **Owner PR #53 merge authorization NOT_GRANTED.**

## 2026-11-21 — More Currency preference foundation (RFC #52)

- **Owner UI update:** [RFC #54](https://github.com/im-tnyx/Tio-Money/issues/54) / [PR #53](https://github.com/im-tnyx/Tio-Money/pull/53) extends the unmerged currency slice to a dedicated Main Currency screen, More Currency section, Back/title/Change, inline Front/End selection, and Decimal/Number Format bottom sheets. Earlier green checks belong to an older SHA; exact final HEAD requires revalidation. No merge authorization.

- **Owner chat direction:** prioritize More → Main + optional Sub Currency before Accounts, Logs and Stats. Agent-recorded [RFC #52](https://github.com/im-tnyx/Tio-Money/issues/52) / [technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/52#issuecomment-7061682129) for **local, display-only preference/UI**, no approved FX provider/cross-currency ledger.
- **Task:** [TM-CURRENCY-PREF-20261121-001](tasks/product/more-currency-preferences-20261121.md), branch `feat/more-currency-preferences-20261121` from `main` `b49a4a90d653090e1b4ed4de7302dd6b9f2365c0`; scoped shared context, local kv-store, More modal and tests. Four finance routes untouched.
- **Gate:** validate exact PR HEAD CI/reviews and Android/iPhone QA separately. Independent review deferred, **MERGE_AUTHORIZATION=NOT_GRANTED**, no privileged preview, migrations, cloud or server.
 
---

## 2026-11-22 — Verified security-baseline PR #58 merge terminal

- **Actual GitHub state:** [PR #58](https://github.com/im-tnyx/Tio-Money/pull/58) **MERGED** through a protected, non-force squash at 2026-11-21T22:50:06Z (2026-11-22 04:20:06 IST); verified merged SHA **`7d595bf334a2fd81c4e9e220fda00226c38d6305`** equals protected `main` at inspection, source HEAD `d16b65aabef685a86c6fc616a4e0aae00b785e24`. Owner explicitly instructed “Go to merge 58” after exact-scope non-force main reconciliation; 3/3 exact-head CI SUCCESS, GitHub mergeability CLEAN, 0 unresolved review threads, no branch protection bypass. [Issue #57 terminal checkpoint](https://github.com/im-tnyx/Tio-Money/issues/57#issuecomment-7070466985).
- **Exact merged scope:** `.github/dependabot.yml` (weekly bounded **non-auto-merging** root npm + GitHub Actions update PR proposals) and [security baseline guide](../docs/security/SECURITY-BASELINE-SETUP.md). No app/FX/ledger/auth code, EAS isolated dependencies, root package dependencies, EAS/Codespaces trusted workflows, Expo Go QR-free tunnel, security settings, CodeQL activation, credentials or required-check rules changed. Dependabot alerts, CodeQL entitlement/setup and branch legacy admin settings were **NOT independently accessible/verified**, not declared secure.
- **Updated merged-head signal (later verified):** `.github/dependabot.yml` validation **SUCCESS** and both post-merge Dependabot version-update jobs **SUCCESS** on PR #58 merge SHA. Four bot PRs [#64](https://github.com/im-tnyx/Tio-Money/pull/64), [#65](https://github.com/im-tnyx/Tio-Money/pull/65), [#66](https://github.com/im-tnyx/Tio-Money/pull/66), [#67](https://github.com/im-tnyx/Tio-Money/pull/67) were opened **without auto-merge**, but their exact-head `static` CI **FAILS**: #64/#65 changed immutable workflow Action SHAs and broke pinned-SHA security regression assertions; #66/#67 are incompatible with Expo SDK 58's expected `react-native-svg@15.16.0` and `react@19.3.0`. Do not bypass tests, auto-merge, or alter trusted QR-free preview. Owner reports **one Moderate and one Low Dependabot alert**, but this connector cannot read alert/advisory records: GHSA, affected package/manifest and remediation are **NOT VERIFIED**; alerts not dismissed. Android/iPhone physical-device QA not observed. [Issue #57](https://github.com/im-tnyx/Tio-Money/issues/57) remains OPEN; PR #53 is separately OPEN, green CI but device/source review pending. No merge permission inherited.
- **Handoff:** Implementation in PR #58 **COMPLETED / MERGED**; administrative security setup verification and future bot-PR review **FOLLOW_UP_OPEN**. Current working agent ChatGPT (GPT-6), prior verified agent ChatGPT (GPT-6) from project task checkpoints; earlier provenance unknown. This record is staged in an **independent docs-only PR**, without independent authorization to merge that follow-up.

---

## 2026-11-22 — Verified PR #60 security merge terminal and follow-up

- **Actual GitHub terminal:** [PR #60](https://github.com/im-tnyx/Tio-Money/pull/60) **MERGED** via GitHub-protected non-force **squash** on 2026-11-21 22:35:30 UTC (2026-11-22 04:05:30 IST). Authenticated owner specifically requested renewed merge of the updated PR and accepted remaining Low risk (owner said up to 3; exact npm report was **2 Low entries**). Verified merge commit **`3c6cfac26ddf822dd4a9d087a4fa073c5bc6042b`** is actual `main` HEAD at terminal inspection; verified source PR head **`760a8a488bdbc2e860b1fe2ff8469703dff6b79c`**. This supersedes all earlier historical PR #60 OPEN/HOLD snapshots below. [Issue #59 terminal record](https://github.com/im-tnyx/Tio-Money/issues/59#issuecomment-7070298079).
- **Pre-merge validations:** same-HEAD `static`, `Governance / Python, links and commit attribution`, `signal` SUCCESS; zero unresolved review threads, branch rules respected, **no bypass**; isolated EAS CLI `27.4.1` signed/npm-ci official-registry graph had **0 Critical / 0 High / 0 Moderate / 2 Low**. Existing Android+iOS Metro exports passed. Codex quota review UNAVAILABLE (not APPROVED); independent review remains deferred and no false approval recorded.
- **Residual/next owner checks:** The 2 Low entries are one underlying `diff@7.0.0` GHSA + parent `eas-cli` metavulnerability. Owner accepted leaving these for a separate upstream-compatible remediation review; **no alert dismissed**. The original QR-free Android/iPhone Expo Go, root dependencies, Expo project IDs, Codespaces tunnel and both trusted preview Actions workflows were **not changed**. **Physical-device reopen/reconnect/refresh on Android and iPhone is NOT agent-observed and must be owner-rechecked via existing Actions**. No EAS build, OTA, privileged preview or post-merge workflow success was claimed; initial merged-HEAD runs query returned none. Verify merged-main scanning and current workflow results when available.
- **Handoff:** [security task TM-SEC-EAS-20261122-001](tasks/security/eas-cli-transitive-security-20261122.md) implementation **MERGED / follow-ups OPEN**, [Issue #59](https://github.com/im-tnyx/Tio-Money/issues/59) remains open for Low advisory and QR-free real-device recheck. PR #53/#58 and other branches unaffected. This docs-only sync is a **separate branch/PR** and has no authorization to auto-merge.

---

## 2026-11-22 — EAS CLI Moderate remediation completed (merge readiness in progress)

- **Owner direction:** Codex quota failure may be set aside as unavailable review, but all actual security findings/protections remain enforced. [PR #60](https://github.com/im-tnyx/Tio-Money/pull/60) remains **OPEN / unmerged**; owner conditional merge grant was before expanded major transitive changes, so request **renewed PR-specific merge consent** after final gates per [post-merge policy](../.github/POST-MERGE-SYNC.md).
- **Supersedes historical 17/14 Moderate snapshots:** Official npm unprivileged [diagnostic #44956163560](https://github.com/im-tnyx/Tio-Money/actions/runs/44956163560) **PASS**: `eas-cli 27.4.1`, signed/npm-ci reproducible 499-package tree, offline CLI command/load, **0 Critical, 0 High, 0 Moderate, 2 Low npm findings**. Two Low represent one `diff@7.0.0` GHSA plus `eas-cli` metavulnerability; compatible diff8 major patch blocked by `npm ci`. Full disposition in [task](tasks/security/eas-cli-transitive-security-20261122.md) and [Issue #59](https://github.com/im-tnyx/Tio-Money/issues/59).
- **Files and guardrails:** Exact npm-generated `.github/preview-eas-cli/package.json` and `package-lock.json` with 19 parent-scoped overrides and major transitive compatibility checks staged in PR #60. Existing root Expo SDK/lock, `eas.json`, Codespaces, QR-free Expo Go Android/iOS Actions flows, Expo project identity, privileges and workflows **unchanged**. Added persistent tests requiring 0 Moderate/High/Critical and signed EAS install/CLI help/function API loading, and replaced stale 500-package size assertion with known installed-version checks.
- **Pending to call merge-ready:** new final HEAD Static/Governance/signal success, current review threads and ruleset, residual Low owner risk decision and scope-change authorization; physical Expo Go device behavior cannot be inferred from Metro CI. **No merge, no preview/OTA/build dispatch, no alert dismissal and no bypass.** One-off Draft diagnostic [PR #62](https://github.com/im-tnyx/Tio-Money/pull/62) must close unmerged once evidence recorded.

---

## 2026-11-22 — PR #60 merge-gate readiness and one-off workflow cleanup

- Owner: **“Merge gate tak go”** for [PR #60](https://github.com/im-tnyx/Tio-Money/pull/60) only; **NOT approval to merge**. RFC [Issue #59](https://github.com/im-tnyx/Tio-Money/issues/59), task [TM-SEC-EAS-20261122-001](tasks/security/eas-cli-transitive-security-20261122.md). This is a newer checkpoint; prior dated snapshots below remain historical.
- Verified initial PR HEAD `2f0e01b0c92f996d090f06e002c110f8806b188a` against protected `main` `d765c97d71ba600b1838f34d180159855ac67dc1`, four successful checks, mergeable, zero unresolved review threads. Active `protect-main` ruleset requires PR and resolved threads, with zero required approvals and no named required CI contexts. Backend alerts/legacy protection visibility remains limited.
- **Merge hygiene:** One-off `.github/workflows/eas-cli-security-candidate.yml` was created solely to validate PR #60 and has a hardcoded `#60` gate, so **remove it before final review/merge**. Successful candidate audit evidence remains archived as [run #44952518985](https://github.com/im-tnyx/Tio-Money/actions/runs/44952518985), but its status is historical, not a new check after workflow deletion. The real patched isolated npm manifest/lockfile, audit helper and tests stay in PR. Root Expo Go dependencies, QR-free Codespaces process, EAS privileged workflow and credentials untouched.
- **Final gates outstanding:** check new exact HEAD static/governance/signal CI, check formal external review after Ready-for-Review, assess 17 Moderate+1 Low npm findings; owner-observed Android and iOS **without QR** reopen/reconnect/refresh and independent supply-chain review remain pending. Hold merge; don't weaken preview allowlist, security checks, protected rules or enable privileged preview. Owner permission for PR #53 doesn't apply to PR #60.

---

### 2026-11-22 — Verified EAS dependency candidate staged in Draft PR #60

- Owner **“Go next”** enabled bounded isolated EAS transitive dependency remediation, **not** merge/deployment. [Issue #59](https://github.com/im-tnyx/Tio-Money/issues/59); task [TM-SEC-EAS-20261122-001](tasks/security/eas-cli-transitive-security-20261122.md); [Draft PR #60](https://github.com/im-tnyx/Tio-Money/pull/60).
- Official-npm **unprivileged PR-only** [candidate run #44952056378, attempt 2](https://github.com/im-tnyx/Tio-Money/actions/runs/44952056378) validated original EAS 27.4.1 identity, npm install/audit signatures and 0 High, 0 Critical (17 Moderate and 1 Low remain). Initial runner attestation intermittency did not lead to a verification bypass.
- Proposed official npm-generated isolated `.github/preview-eas-cli/package.json` and `package-lock.json` staged on feature branch; initial staged candidate head `ef9c91fa23379a865f94003c991ec613ee140dc8`; 11 installed package version updates, 2 redundant Joi copies removed, no added packages. Read-only audit/test scripts and separate low-privilege candidate workflow included. **No root app/Expo SDK/QR-free Codespaces tunnel change, no trusted EAS workflow edit.**
- **Current gates:** Reverify final PR HEAD and CI **after** documentation updates; independently review supply chain; owner-observed Android+iOS Expo Go **without QR** must still PASS; Moderate/Low findings remain. PR #60 **DRAFT / NOT AUTHORIZED TO MERGE**; PR #53 and #58 separate. No branch protections or production credentials used.

---

## 2026-11-22 — Isolated EAS CLI security audit (Issue #59, Draft PR #60)

- **Active scoped task:** [TM-SEC-EAS-20261122-001](tasks/security/eas-cli-transitive-security-20261122.md); [RFC #59](https://github.com/im-tnyx/Tio-Money/issues/59); [Draft PR #60](https://github.com/im-tnyx/Tio-Money/pull/60). Owner Go permits bounded preparation while preserving **QR-free Android and iOS Expo Go testing**; **no merge authorization** for #60.
- **Verified branch/base:** `security/eas-cli-advisory-gate-59-20261122`, from `main` `d765c97d71ba600b1838f34d180159855ac67dc1`. Read-only advisory-floor script and regression tests added; **neither root Expo Go nor isolated EAS package manifests/lockfiles changed**.
- **Security status:** 17 High owner-reported transitive findings in `.github/preview-eas-cli/package-lock.json` are **NOT FIXED**. External npm registry DNS unavailable for full lockfile regeneration and signature verification; no device test performed by agent. Curated floors are guidance, not a clean audit. PR #53 and PR #58 independent and untouched.
- **Gates:** Exact-HEAD PR #60 CI, security review and provenance pending. A future candidate must use official registry npm resolver and signatures, keep EAS identity/trusted workflow intact, and obtain owner-observed Android/iOS no-QR reconnection PASS before separate PR-specific merge permission. No privileged preview dispatch, security alert dismissal or merge.

---


## 2026-11-21 — Docs audit readiness PR toward merge gate (Issue #50)

- **Current live GitHub finding at source inspection:** PR #1 and PR #24 already **MERGED**, no open PRs at task creation; older "PR #24 NOT MERGED" entries below are *historical snapshots*, not live merge status. Baseline `main` `57e564af8f526f9de69eaaf61f2fbc0c72731188`.
- **RFC / proceed:** [Issue #50](https://github.com/im-tnyx/Tio-Money/issues/50) and [agent technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/50#issuecomment-7061302891) authorize narrow factual docs reconciliation only. Owner requested progress to **merge gate**, **not merge authorization for an as-yet-unnumbered PR**.
- **Scoped task:** [TM-DOC-GATE-20261121-001](tasks/product/documentation-readiness-gate-20261121.md); new branch `docs/documentation-readiness-gate-20261121`; README current/historical labels and [readiness gap register](../docs/governance/DOCUMENTATION-READINESS.md), docs hub/index. Finance ADRs and Stage 2/3 security requirements remain BLOCKED and unimplemented.
- **PR:** [#51 — docs readiness](https://github.com/im-tnyx/Tio-Money/pull/51) opened non-draft at initial HEAD `0cee75263ada4acc1c38bdef366b9ee46f8a8820`; subsequent task/index checkpoint advances HEAD. Exact-new-HEAD CI/review checks required; do not reuse earlier green runs.
- **Safety:** Markdown-only; no `src`, ledger/migrations, CI, secrets, cloud/Auth or UI changes. Fresh PR exact-head checks, review threads, commit attribution and branch requirements must be verified; no merge, auto-merge or owner approval inferred.

---


## 2026-11-21 — PR #24 reconciled onto current main (UI ownership preserved)

**P2 normative money follow-up:** [RFC #23](https://github.com/im-tnyx/Tio-Money/issues/23#issuecomment-7060826772) expands PR #24 by **five Markdown-only agent/review-guide/template files** to remove universal-INR-paisee instructions; Stage 1 uses ISO-native safe-integer minor units with currency/exponent, while INR paise remains an explicitly INR-only case. Copilot current UI snapshot corrected. Codex at prior HEAD `f9de5b2...` **failed to complete** rather than passed; exact-new-HEAD CI and review must be repeated. PR #24 **not merged** and has **no owner merge authorization**.

**Current docs follow-up:** Corrected owner UI changes from the previous stale five-BlankScreen/1dp statements to the verified **four BlankScreen finance routes + MoreRoute/Appearance**, active SVG weight 300/inactive 200, 0dp icon-label gap, 160ms Reduced Motion-aware scene fade. Presentation-only theme/i18n hooks are allowed; domain/workflow/data logic remains controller/use-case/domain/repository-owned. The initial reconciliation SHA `150b98cd3adf69e5462c628d07a9afccfc337320` is historical after docs corrections; verify the final HEAD and CI/review. **No merge authorization.**

- **Owner Go:** safely reconcile PR #24, verify CI and review; this is **NOT merge authorization**. Current `main` `118830c94a7af78dd2c29fdf6d3f7ab561cf4c1a` includes independently merged Appearance, bottom-tab 300/200 SVG and 0dp gap, 160ms reduced-motion-aware crossfade, preview workflow and Codespaces task changes. Previous PR24 `a13ab70f8b90e9ecb7bcb77a61cf4e4bb652c3a2` is a historical pre-reconciliation HEAD.
- **Integration method:** non-force two-parent merge with first parent prior PR24 and second parent latest main, built from **new main's tree**; overlay only PR24's fifteen Markdown-owned blobs. This index retains **all original latest main handoff text** and prepends PR24 current checkpoint. No app source, theme, navigation, assets, tests, preview files or other agents' work touched.
- **New Codex P2:** previous docs described five blank routes and 1dp gap. Actual current main has **four blank finance tabs + MoreRoute/useMoreViewModel/MoreScreen**, selected 300/inactive 200 and 0dp; reconcile these historical assertions in next scoped docs-only commit. New HEAD CI/review and links must be verified. **PR #24 NOT MERGED.**

---

## 2026-11-21 — Verified post-merge source of truth + Stage 1 finance ADR planning

**2026-11-21 follow-up:** On prior HEAD `e8c53ba35391527e54b9c28a4905b778cd2b4efd`, Phase 0 static job initially failed an **isolated EAS CLI registry npm-ci test**; controlled failed-job rerun **PASS**. New minor-unit consistency patch updated AGENTS, feature boundary, Architecture and Test Plan only; CI/review must be reconfirmed on the next HEAD. PR #24 remains **NOT MERGED**.

**Latest PR checkpoint:** [PR #24 — Ready for Review](https://github.com/im-tnyx/Tio-Money/pull/24) opened to `main` from `docs/postmerge-stage1-finance-adrs-20261121`. First reviewed head `0929c4099feb34910e5099b677ed02e9654faad7` passed 3/3 GitHub checks and 16-file Markdown diff/link checks; a later task/handoff checkpoint commit advances branch head, therefore **new SHA checks/review are still required**. Owner merge authority **NOT GRANTED** for PR #24.


- **Verified live GitHub baseline:** `im-tnyx/Tio-Money` `main` = `f4332eb338ca75e27a5b35ff57511f522a4bb96a`. [PR #14](https://github.com/im-tnyx/Tio-Money/pull/14) merged at `582893d0915622623f8c6b3fb9da0f1bbb0a4a60`, [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) at `6187b7a7e4c59949547c21655accf50dec8d0dfd`, [PR #22](https://github.com/im-tnyx/Tio-Money/pull/22) at `f4332eb338ca75e27a5b35ff57511f522a4bb96a`. Their three task **top lifecycle rows** were reconciled; all dated older Draft/unmerged sections are historical only. No claim of a local Codespace `git pull`, device QA, file archival or new executable ledger.
- **Current scoped task:** [TM-FIN-ADR-20261121-001](tasks/product/post-merge-stage1-finance-adr-20261121.md) / [RFC #23](https://github.com/im-tnyx/Tio-Money/issues/23). Agent ChatGPT GPT-6 technical PROCEED **docs-only**. Branch `docs/postmerge-stage1-finance-adrs-20261121` created from verified main. Owner requested Stage 1 ADR clarification and confirmed **all screens must be dumb / no screen logic**.
- **New canonical contracts:** [11 — Stage 1 Finance ADRs](../docs/governance/STAGE-1-FINANCE-ADRS.md) maps TM-ADR-011–023 with settled technical invariants versus **explicit pending business/provider/security choices**. [12 — Dumb-Screen Boundaries](../docs/architecture/DUMB-SCREEN-BOUNDARIES.md) and owner [TM-DEC-011](../docs/governance/DECISIONS.md#tm-dec-011--strict-dumb-screen-presentation-only-rule) forbid any logic, routing, SQL, finance math or side effects inside screens. Current five blank tab routes were **read-only inspected** on main and only export BlankScreen; route layouts compose separate controllers/providers.
- **Scope:** Markdown only; do not alter Phase 0 source, bottom-navigation visual tokens/More-aligned disabled FAB, finance SQLite, cloud, auth or permissions. Finance ADR owner/provider/accounting choices remain **BLOCKED pending separate decisions**; source and negative CI enforcement are **NOT IMPLEMENTED** by these docs.
- **Handoff:** validate exact PR branch HEAD, all Markdown paths/anchors, zero co-author trailers, current GitHub checks/review. Independent finance/security review strongly recommended. **Owner merge authorization for this new PR NOT GRANTED**; no direct `main` write or merge.



---


## 2026-11-21 — PR #49 third interactive Expo Go task (Issue #48)

- **Owner follow-up:** Add a third selectable Codespaces task, **Expo Go Tunnel (Interactive)** (Expo Go `--tunnel --go`), alongside managed **Start Expo Project (Tunnel)** and branch-aware **Git Pull (FF-only)**. [Issue #48 technical addendum](https://github.com/im-tnyx/Tio-Money/issues/48#issuecomment-7060391801).
- **Safety:** Reuse managed launcher account verification via its new check-only mode; verified managed Metro stops before interactive CLI begins, never kill unowned port 8081. `CI=false npm run mobile` displays console; Ctrl+C stops it. No automatic Codespace wake, EAS, new token or mobile app change.
- **Gate:** [Draft PR #49](https://github.com/im-tnyx/Tio-Money/pull/49), fresh exact-head CI/review and live Codespaces/phone check pending. Merge authorization `NOT_GRANTED`; prior two-task evidence is superseded by this new scope.

---

## 2026-11-21 — Issue #48 Codespaces one-click Run Tasks

- **Scope/PROCEED:** [Issue #48](https://github.com/im-tnyx/Tio-Money/issues/48) records the user-requested VS Code **Start Expo Project (Tunnel)** (managed idempotent starter) and **Git Pull (FF-only)** (current checked-out tracking branch). Task: [TM-DEV-CODESPACES-TASKS-20261121](tasks/preview/codespaces-run-tasks-20261121.md).
- **Branch/base:** `chore/codespaces-run-tasks-20261121` from `main` `9d2f0c793442b76131834a9ffc0c1962734ab00d`. Only tracked VS Code task configuration, narrow gitignore exception, task tests, Codespaces guide and additive task checkpoint; no Expo/auth/preview workflow changes.
- **Gate:** Physical Codespaces Expo Go behavior and current-head CI `NOT_VERIFIED` at initial checkpoint. Review `DEFERRED`; explicit PR-specific merge permission `NOT_GRANTED`. Do not merge or enable automation.

---

## 2026-11-21 — Five-tab 160ms crossfade setup (Issue #46)

- **Owner-directed scope:** Implement a smooth **160ms screen-content crossfade** between Home/Trans./Stats./Account/More, take a new PR to merge gate only. Bar/FAB remain stationary and owner-approved (selected 300, inactive 200, icon-label gap 0dp, 24dp glyphs, 50dp bar baseline).
- **Task:** [TM-UI-TAB-CROSSFADE-20261121](tasks/ui/root-tab-crossfade-20261121.md). [RFC #46](https://github.com/im-tnyx/Tio-Money/issues/46) / [technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/46#issuecomment-7060225970). Base `main` `9d2f0c793442b76131834a9ffc0c1962734ab00d`, branch `feat/root-tab-crossfade-160ms-46`.
- **Boundaries:** Expo Router JS Tabs as scene host only, custom existing bar/FAB untouched, 160ms shared motion token and native Reduced Motion support. New exact-head CI/review and physical-device QA required; no native/data/dependency changes. No privileged preview, direct main write, or merge permission.

---

## 2026-11-21 — PR #45 bottom tab icon-label gap removed

- **Latest owner refinement:** Bottom tab selected SVG **300**, unselected SVG **200**, and **icon-label gap 0dp** (formerly 1dp). The central `navigationTokens.iconLabelGap=size.dp0` drives all five tabs through existing `RootTabBar`. Older 1dp notes below are historical and superseded.
- **Scope:** shared token, design-token regression, Theme and Google asset README, additive task checkpoint. Preserve 24dp icon size, 50dp bar baseline, typography, active colors, accessible tab semantics and disabled Add FAB. Do not add negative margins or touch navigation state.
- **Safety:** PR #45 remains review-ready but unmerged. Requires current-HEAD CI/review on latest change; no privileged `tio-preview`, EAS, force push, auto-merge or main commit. Owner only requested refinement.

---

## 2026-11-21 — PR #45 selected nav weight revised to 300 (Issue #44)

- **Latest owner decision:** Active bottom-tab icon is **300** (initial 400 was too heavy); inactive remains **200**. The former 400/200 checkpoint below is superseded; FAB remains independent at 400.
- **Scope:** Exact five upstream 300 selected SVGs and static JSON mapping; `navigationTokens.selectedIconWeight=300`, focused tests, theme/asset README and task checkpoint in existing PR #45. Preserve 24dp icon size, 50dp nav baseline, labels, colors, routes, safe areas and original 200 paths.
- **Gate:** Latest commit needs fresh Phase 0, Governance, Codex review on current HEAD and device visual acceptance; original no-findings review applies only to previous head. No `tio-preview`, EAS or merge. [Owner override](https://github.com/im-tnyx/Tio-Money/issues/44#issuecomment-7059814062).

---

## 2026-11-21 — Bottom nav selected 400 / unselected 200 (Issue #44)

- **Owner decision:** Bottom tab SVGs are official Material Symbols Outlined, **400 weight selected**, **200 unselected**. This supersedes the old maximum-200 rule only for selected bottom icons; 24dp size, colors, bar geometry, labels and disabled FAB remain unchanged.
- **RFC/PROCEED:** [Issue #44](https://github.com/im-tnyx/Tio-Money/issues/44) and [technical decision](https://github.com/im-tnyx/Tio-Money/issues/44#issuecomment-7059593229). **Task:** [TM-UI-NAV-WEIGHTS-20261121](tasks/ui/bottom-nav-icon-weights-20261121.md). Branch `feat/bottom-nav-selected-400-20261121` created from `main` `28af00b40020af4986bfd2843a22d88e6c584c0c`.
- **Scoped work:** Add five exact Google default-400 SVGs, keep existing 200 SVGs unchanged, use selected/unselected navigation token roles and controlled `RootTabIcon` props; update provenance, theme README and regression tests. No dependencies/native/finance/workflow changes, no privileged preview.
- **Gate:** Separate Draft PR, exact-head CI and review findings to be verified before Ready for Review. Owner requested **merge gate only**, explicit PR-specific merge permission **NOT_GRANTED**. Device visual QA pending.

---

## 2026-11-21 — Issue #42 reusable AppBottomSheet implementation started

- **Task:** [TM-UI-BOTTOM-SHEET-20261121-042](tasks/ui/shared-bottom-sheet-20261121.md); [Issue #42](https://github.com/im-tnyx/Tio-Money/issues/42) technical [PROCEED checkpoint](https://github.com/im-tnyx/Tio-Money/issues/42#issuecomment-7059311342) based on direct user instruction to start.
- **Base/branch:** merged `main` `001d5338836faeffdaf7450e66351d3d5b3f7868` → `feat/shared-app-bottom-sheet-42`. Extract common visual-only Modal chrome to `src/shared/ui/app-bottom-sheet.tsx`, centralize sheet geometry in shared tokens and retain Appearance radio content/state untouched. Add fixture, regression tests and guide.
- **Safety:** Never change `main` directly; no privileged Codespaces/EAS, new native capability, finance change, additional product flow or auto-merge. New Draft PR and exact-head CI required. Review disposition DEFERRED (optional UI); new merge permission **NOT_GRANTED**.

---

## 2026-11-21 — PR #18 remove outer top border and 24dp rounded corners

- **Owner change:** Delete bottom sheet **outer top border**, keep independent header divider. Use 24dp rounded top corners via new shared `radius.xl: size.dp24` token, not a hardcoded value. Retain centered Appearance title without X, compact handle, three radio rows and existing dismiss/persistence behavior.
- **Scope:** Appearance sheet, theme radius token, appearance/design-token regression tests, guide and assigned task checkpoint. Prior `8d301e13` Phase 0 failed Prettier on appearance test, so simplify its index assertion in the same scoped change. Require exact-head checks and iPhone/Android visual QA; no CI success presumed.
- **Security:** `tio-preview` is absent; preserve that through non-force guarded PR #18 branch update. No privileged preview, EAS, direct main merge or force push; no separate merge authorization.

---

## 2026-11-21 — PR #18 top border and 20dp rounded sheet corners

- **Owner revision:** A subtle 1dp outer top-only border plus more prominent 20dp top corner radii, using semantic tokens and current clipping. Keep the compact handle, 48dp centered Appearance title without X, divider, modes and dismissal unchanged.
- **Files:** Sheet presentation, appearance Phase 0 regression, feature documentation and assigned appearance task only. The previous HEAD `76319588` failed Phase 0 on test Prettier; simplify the offending escaped-string assertion as part of this scoped update.
- **Safety:** Guarded non-force update to PR #18 branch; never merge to main or dispatch Codespaces/EAS. Keep `tio-preview` absent. Fresh exact-head CI and real-device visual/accessibility acceptance required; independent UI review deferred and no merge authorization.

---

## 2026-11-21 — PR #18 title centered without X (same header height)

- **Owner revision:** Remove the visible X button and center `Appearance` in the existing 48dp minimum-height sheet header. This supersedes prior left-title/X arrangement without disturbing the restored handle, rounded top corners, header divider or mode radio rows.
- **UI-only change:** Remove close SVG and center title across available header width; preserve backdrop and Android Back dismiss plus add iOS VoiceOver accessibility escape. No changes to ViewModel, persistence, finance, navigation or CI workflows. Update Phase 0 structure regressions and linked [task](tasks/ui/more-appearance-20261120.md).
- **Safety/next gate:** Push only to PR #18 feature branch with exact-head non-force protection; keep `tio-preview` absent to prevent privileged Codespaces activation. New-head CI and device accessibility/visual testing required. Independent UI review deferred. No owner authorization to merge PR into main.

---

## 2026-11-21 — PR #18 slight title lift + rounded bottom-sheet top corners

- **Owner direction:** With compact handle restored, shift Appearance header row slightly up for visual alignment and restore rounded top corners. Preserve left title/X, divider, 40×4dp handle, choice radio rows, and persistence.
- **UI-only PROCEED:** Remove 4dp gap below the handle to lift header while retaining handle's 8dp top margin; use existing `theme.radius.md` (16dp) for top-left and top-right corners. Update existing regression assertions and [appearance task](tasks/ui/more-appearance-20261120.md). No new dependency, native/finance changes or feature logic.
- **Safety:** Exact-head non-force feature-branch update; `tio-preview` must be absent to avoid privileged Codespaces activation. Fresh CI and physical-device screenshot acceptance remain pending. No PR merge authorization or workflow dispatch.

---

## 2026-11-21 — PR #18 restore small top handle after compact sheet revision

- **Owner request:** The sheet is now sufficiently compact, restore its decorative top drag indicator. Preserve left-aligned Appearance header, right X, divider, flat top corners and existing radio rows.
- **Implementation scope:** Reinsert a centered token-driven handle (40×4dp; 8dp top and 4dp bottom margin), avoiding the former oversized header spacing. Update structural tests, guide and task record. Indicator remains non-interactive; no invented drag gesture. No theme/persistence/finance/CI workflow edit.
- **Safety/acceptance:** PR #18 branch-only non-force expected-head update; keep `tio-preview` absent during push to avoid unauthorized Codespaces activity. Exact-head CI and device visual QA remain required; independent UI review deferred. **No permission to merge PR #18 into main.**

---

## 2026-11-21 — PR #18 compact Appearance sheet owner screenshot refinement

- **Owner screenshot/request:** iPhone Appearance bottom sheet wastes vertical area before heading; move title left and minimize whitespace. UI-only technical `PROCEED` within [RFC #17](https://github.com/im-tnyx/Tio-Money/issues/17) and [task](tasks/ui/more-appearance-20261120.md), replacing the earlier centered-title choice.
- **Bounded change:** Remove decorative top drag handle/margin; left-align Appearance in compact 48dp-min header with accessible X on right and bottom divider. Reduce option vertical padding from `lg` to `md` while preserving 48dp minimum and all three radio options. Leave theme store and other tabs untouched; regression tests and guide updated.
- **Safety:** Branch-only non-force update with exact old HEAD guard. Remove any live `tio-preview` label before branch push; do not activate privileged Codespaces or merge PR into main. Exact-head CI and fresh device screenshot validation required; independent UI review deferred and no PR #18 merge approval.

---

## 2026-11-21 — PR #18 latest-main safe reconciliation after bottom-sheet header refinement

- **Owner action:** Reconcile [PR #18](https://github.com/im-tnyx/Tio-Money/pull/18) with current `main` without merging PR #18 into `main`. The PR head before reconciliation was `d6178ab26e0075302742b29ab60e88e37a4e13c5`; incoming main head `4614285071fd96e9010e2ca7f34653be1c2a61b4`. Both were based on `e0e4c617c2aea2b892baa9b5dd327d6a4483350d`.
- **Disjoint integration:** Incoming main adds only changes to `.github/workflows/tio-money-eas-pr-preview.yml` and `tests/preview/eas-preview-config.test.mjs`; preserve the current 24 PR feature paths and the latest bottom-sheet center title, X dismiss, divider and square top. Use an exact two-parent non-force branch merge (existing PR HEAD first, incoming main second), not a protected-main merge; verify branch is zero behind current main.
- **Controls:** Remove `tio-preview` before pushing to avoid unauthorized privileged Codespaces activation. Do not restore it automatically; no manual dispatch, EAS publish/build, force push or PR merge. Previous exact-head Phase 0 and Governance checks passed on `d6178ab26e0075302742b29ab60e88e37a4e13c5`; new merge-head CI, unresolved reviews and Android/iOS device QA must be checked independently.
- **Decision:** This is branch-only reconciliation under existing UI task/RFC #17; independent UI review deferred (optional), PR #18 stays Draft and **NOT MERGE AUTHORIZED**.

---

## 2026-11-21 — PR #18 Appearance row and bottom-sheet UI revision

- **Owner design:** [RFC #17 approved follow-up](https://github.com/im-tnyx/Tio-Money/issues/17#issuecomment-7050140344). After safe non-force reconciliation with latest `main` `a83c608c8cd6399712813d884e9179babb535ee6`, More → General Settings becomes unboxed section text with a full-width Appearance row/chevron; selection UI moves into a stateless native bottom sheet with the same radio rows/dividers.
- **Architecture:** `MoreScreen` and `AppearanceSheet` hold no mutable state; `useMoreViewModel` and typed `MoreUiState/MoreAction` own presentation transitions, existing global theme persistence untouched. Only English strings, feature code, tests and docs change. No new dependency, native app config, finance data or privileged workflow dispatch.
- **Preview safety:** `tio-preview` temporarily removed before branch commits to prevent automatic Codespaces activation. Draft PR #18 remains **NOT MERGE AUTHORIZED**. Original UI device QA does **not** prove revised bottom-sheet acceptance; exact-head CI and device recheck required.

---

## 2026-11-21 — PR #18 safe reconciliation with merged EAS/preview fixes (owner UI revision)

- **Owner request:** Reconcile branch `feat/more-general-settings-appearance` with latest `main` `a83c608c8cd6399712813d884e9179babb535ee6` **before** implementing accessible Appearance bottom sheet redesign. [RFC #17 decision](https://github.com/im-tnyx/Tio-Money/issues/17#issuecomment-7050140344), [original UI task](tasks/ui/more-appearance-20261120.md).
- **Merge method:** Non-force two-parent merge commit from former PR head `10ac52887451b6b774710a149720087bfe5987cd` and current `main` `a83c608c8cd6399712813d884e9179babb535ee6`. The original 17 feature paths were disjoint from main changes except this index; retain latest main for CI/workflows/finance docs, all existing PR #18 UI/source, tests and task docs, and additive current index records. Independent device QA applies to previous layout only; redesigned UI needs new device check.
- **Activation boundary:** `tio-preview` temporarily removed before branch push to prevent automatic privileged Codespaces SSH/Expo sync. No Codespaces manual dispatch, EAS publish/build, production change, force update, or main-branch merge authorized.
- **Review:** optional independent review DEFERRED; fresh exact-head CI, review findings, branch ancestry and UI test required. **PR #18 remains Draft / NOT MERGE AUTHORIZED.**

---

## 2026-11-21 — PR #18 appearance UI latest-main reconciliation

- **Owner request:** safely reconcile [PR #18](https://github.com/im-tnyx/Tio-Money/pull/18) with current `main`, **not** permission to merge into `main` or launch privileged Codespaces. [Task](tasks/ui/more-appearance-20261120.md), [RFC #17](https://github.com/im-tnyx/Tio-Money/issues/17).
- **Pre-reconciliation observation:** PR #18 `OPEN / DRAFT / NOT MERGED`, branch `feat/more-general-settings-appearance`, previous HEAD `7ed3a1c1c41eb2e730fb22e9e8d4b44e6cd5cf56`; `main` `0c295316940fc73e0c8e8bce127aaedede5d3d49` includes merged PR #21 diagnostic and PR #26 string input fix, plus finance documentation. The original UI commit has 17 changed files. All UI/theme/source/test paths are disjoint from changes in newer `main`; only this task index overlaps. The original appearance task/index and the latest `main` history must both be preserved.
- **Reconciliation plan:** trusted `main` tree is authoritative except the original PR #18 owned UI/theme/test/docs/task blobs and this merged index. Integrate with a **non-force two-parent commit** (old PR HEAD + newer `main`), never overwrite preview workflow, newer finance documentation, dependencies, native config, tokens, or ledger. Keep **Dumb MoreScreen**, `MoreRoute` / `useMoreViewModel`, global appearance state and persistent preference adapter unchanged.
- **Safety:** `tio-preview` label will be temporarily removed before branch push to avoid automatic privileged Codespace activation, and restored only after the triggered trusted worker safely skips. No privileged manual dispatch/SSH/EAS publishing or owner-editing Codespace mutation is authorized by this reconciliation.
- **Validation handoff:** this checkpoint is *pre-new-head* evidence. New exact-head CI, unresolved review findings, and device QA must be checked after update. Independent review optional by TM-DEC-002; no approval or test success is fabricated. **Owner PR #18 merge authorization NOT_GRANTED.**

---

## 2026-11-20 — More appearance UI preview candidate (new workstream)

**Task:** [TM-UI-APPEARANCE-20261120-001](tasks/ui/more-appearance-20261120.md), [RFC #17](https://github.com/im-tnyx/Tio-Money/issues/17). Owner requested a new `main`-based UI feature PR for **More → General Settings → Appearance (System / Light / Dark)**, also serving as the first controlled Codespaces PR preview candidate. Working branch `feat/more-general-settings-appearance` starts at `main` `fd154db417b1979d39f855317f252eed37c36e9d`. This is **new work**, distinct from existing documentation PRs #14/#16. Existing older entries below are historical checkpoints and do not represent current GitHub state. Actual exact-head CI, device QA, independent review and privileged workflow end-to-end operation are NOT_VERIFIED at branch kickoff. **NO PR merge authorization; NO Codespaces workflow dispatch/activation authorization.**


---

## 2026-11-21 — Dedicated Codespaces preview start HTTP 409 race (RFC #38)

- **Incident:** [Owner manual run #100](https://github.com/im-tnyx/Tio-Money/actions/runs/44870219796), trusted `main` `baeb77aef5ed16feec25cb4fc4b3f3209d357ee0`. PR #18 source and Codespace identity gates passed; pre-start GET saw non-`Available`, but POST /start returned `gh: The codespace is already running (HTTP 409)`. The workflow failed before SSH or Expo.
- **Task/RFC:** [TM-OPS-CODESPACES-START409-20261121-001](tasks/preview/codespaces-start-http409-20261121.md), [RFC #38](https://github.com/im-tnyx/Tio-Money/issues/38). Bounded technical `PROCEED` to correct idempotent state transitions on `fix/codespaces-start-http409-race`, based on verified `main`.
- **Fix:** Treat only the observed exact already-running HTTP 409 as a recoverable state race, then require repeated exact Codespace identity + `Available` polling; 403, other 409, deletion and timeout still fail closed. Add mocked branch-path tests.
- **Separate blocker:** [Run #99](https://github.com/im-tnyx/Tio-Money/actions/runs/44869882591) previously failed on **unowned Metro** after verified bundle import. That remains unverified/unresolved and is excluded from this PR.
- **Gate:** Fresh PR CI and independent security review pending. **Owner merge authorization NOT_GRANTED**. No privileged live Codespace dispatch or PR #18 source edits.

---

## 2026-11-21 — Codespaces SCP quoted-path regression after PR #35 (RFC #36)

- **Incident:** New owner-dispatched [Codespaces run #44828410270](https://github.com/im-tnyx/Tio-Money/actions/runs/44828410270) used `main` at `2f62f01b5869df4807452689f06ef561a2a9ae14` and failed `gh codespace cp`: remote SCP treated single quotes as filename characters. Authenticated bundle, immutable PR allowlist and Codespace identity passed. Not a new Expo UI compile failure.
- **Task/RFC:** [TM-OPS-CODESPACES-SCP-20261121-001](tasks/preview/codespaces-scp-quoted-path-20261121.md), [RFC #36](https://github.com/im-tnyx/Tio-Money/issues/36). Implementation `PROCEED` on `fix/codespaces-scp-literal-quote-preview`, fresh from verified `main`, but not authority to merge/deploy.
- **Fix:** For exact generated destination path from validated 40-hex SHA and positive decimal run ID, opt in to documented GitHub CLI `gh codespace cp --expand`; add regression and leave all owner/label, immutable snapshot, dedicated Codespace, hash, mode, cleanup and credential boundaries in place. No PR #18 application/source edit.
- **Status:** Draft implementation candidate; current-head CI and independent security review pending. **Owner PR merge authorization NOT_GRANTED; no trusted workflow dispatch authorized.**

---

## 2026-11-21 — Codespaces bundle integrity failure after PR #33 (RFC #34)

- **Task:** [TM-OPS-CODESPACES-BUNDLE-20261121-001](tasks/preview/codespaces-bundle-integrity-20261121.md), [RFC #34](https://github.com/im-tnyx/Tio-Money/issues/34); scoped `PROCEED` to fix trusted Codespaces preview in new branch `fix/codespaces-preview-bundle-transfer-integrity`, based on `main` `3f8b888342c947244bbec811c198be7b18ae81c2`.
- **Evidence:** New manual PR #18 Codespaces runs [#80](https://github.com/im-tnyx/Tio-Money/actions/runs/44825288224) and [#81](https://github.com/im-tnyx/Tio-Money/actions/runs/44825952573) passed immutable selection, bundle creation and dedicated identity, but remote import rejected the bundle size/mode/owner. Exact subcondition unknown, so no unsupported root cause claimed.
- **Bounded change:** replace base64-over-SSH upload with private-directory `gh codespace cp` transport, retain owner/main/label/source-only security gates; add file mode/UID/size/SHA-256 validation, exact commit check, cleanup and tests. No PR #18, EAS, finance, tokens, permissions, native or Codespace mutation.
- **Gate:** [Draft PR #35](https://github.com/im-tnyx/Tio-Money/pull/35) open; initial exact-head [Phase 0 #44827308287](https://github.com/im-tnyx/Tio-Money/actions/runs/44827308287) and [Governance #44827308350](https://github.com/im-tnyx/Tio-Money/actions/runs/44827308350) passed on source SHA `69df4bee9`, but subsequent formatting/handoff commits require fresh checks. Independent security review `DEFERRED` (recommended); **NO merge authorization** and **NO privileged workflow dispatch**. No runtime preview success claimed.

---

## 2026-11-21 — EAS PR REVIEW numeric dispatch input `18.0` failure (RFC #31)

- **Task:** [TM-EAS-DISPATCH-STRING-20261121-001](tasks/preview/eas-pr-dispatch-string-20261121.md), [RFC #31](https://github.com/im-tnyx/Tio-Money/issues/31), branch `fix/eas-pr-dispatch-string`. Owner requested a scoped fix to repeated `TIO MONEY EXPO PR REVIEW` failure on valid PR `18`. [Run #44810555603](https://github.com/im-tnyx/Tio-Money/actions/runs/44810555603) logged `PR_NUMBER=18.0` due to `workflow_dispatch.inputs.pr_number.type: number`; shell rejects non-integer before checkout.
- **Source base:** `main` `0ac1f6a23e2224b3c2e8d0e10a63699abc53a10e`. Fix `type: string` with strict `^[1-9][0-9]* validation and a static regression test; preserve manual-only owner/main/rerun gates, open **non-draft** PR and strict `src/*|assets/*` allowlist, EAS project identity, isolated token and OTA/build choices.
- **Safety:** PR #18 remains **Draft** with non-source docs/tests, so it is **not** eligible for OTA publication or internal EAS build even after this input fix. No EAS publish, build, privileged workflow dispatch, secret or Codespace mutation, PR #18 source edit or direct `main` write is authorized here.
- **Checkpoint:** new head CI / review / PR status not yet verified at task creation. Independent security review **DEFERRED**, optional under TM-DEC-002 but recommended. **Owner merge authorization NOT_GRANTED** for any new PR; live GitHub is authoritative.

---

## 2026-11-21 — PR #18 immutable compare API shape correction

- **Task:** [TM-OPS-PREVIEW-COMPARE-HEAD-20261121-001](tasks/preview/preview-compare-head-shape-20261121.md), [RFC #29](https://github.com/im-tnyx/Tio-Money/issues/29), branch `fix/preview-compare-head-commit-shape`. Source failure: [manual run #44806734241](https://github.com/im-tnyx/Tio-Money/actions/runs/44806734241) and [#44806945990](https://github.com/im-tnyx/Tio-Money/actions/runs/44806945990); PR-read/label gate passed, but snapshot validator assumed nonexistent `compare.head_commit`, despite GitHub Compare API returning `commits[]` and 17 files.
- **Starting `main`:** `cff662ebd00f5333c348a45c2bc7c196961ae4dd`. Narrow correction validates the **last returned commit SHA** plus a positive, fully returned `total_commits`; preserves exact base SHA, captured/current immutable PR head, file count, path safety and privileged worker gates. No change to PR #18, `tio-preview`, tokens, workflow permissions, owner SSH/Codespace, Android UI or finance docs.
- **Checkpoint:** prior to final fix PR SHA and exact-head CI. Independent review `DEFERRED` per optional TM-DEC-002, recommended for security-sensitive validator. No owner merge authorization for this fix PR; **no actual Codespace Preview success or manual privileged workflow run**. Validate live GitHub state before a future merge.

---

## 2026-11-21 — Codespaces preview labeled PR Issues API HTTP 403 (RFC #27)

- **Task:** [TM-OPS-CODESPACES-ISSUES-READ-20261121-001](tasks/preview/codespaces-preview-issues-read-20261121.md), [RFC #27](https://github.com/im-tnyx/Tio-Money/issues/27), branch `fix/codespaces-preview-issues-read`. [Manual run #44805243638](https://github.com/im-tnyx/Tio-Money/actions/runs/44805243638) received `INPUT_PR=18`, then HTTP 403 after PR metadata fetch at labeled `GET /issues`. GitHub documents `Issues: read` for that API; current trusted worker only granted Contents/Pull requests read. This is a narrow root-cause hypothesis backed by endpoint permissions, **not a verified successful Codespace run**.
- **Observed starting `main`:** `0c295316940fc73e0c8e8bce127aaedede5d3d49`. Proposed change grants only `issues: read`, retains PR uniqueness and all existing owner/main/immutable-sha, Codespace identity and source-path security gates. No `issues: write`, no PAT, no `pull_request_target`, no app source or PR #18 change.
- **Checkpoint:** recorded before new final PR SHA and CI results. Exact-head CI, review, and GitHub ruleset gates must be checked live. Independent review `DEFERRED`, optional under TM-DEC-002. **Owner merge authorization NOT_GRANTED.** No manual privileged workflow run authorized by this task; `main` and PR #18 stay untouched by branch work.

---

## 2026-11-21 — Codespaces manual preview input `18.0` regression (PR #26)

- **Task:** [TM-DEV-PREVIEW-INPUT-20261121-001](tasks/preview/codespaces-preview-input-20261121.md) · [RFC #25](https://github.com/im-tnyx/Tio-Money/issues/25) · [PR #26](https://github.com/im-tnyx/Tio-Money/pull/26) · branch `fix/codespaces-preview-dispatch-pr-string`. **Scope: PR dispatch parser only**, intended to fix [failed manual preview run #44798703853](https://github.com/im-tnyx/Tio-Money/actions/runs/44798703853), which received `INPUT_PR: 18.0` from the workflow's `type: number` input and rejected it before HTTP diagnostic.
- **Observed source before change:** `main` `097e014d7e2a2015230971751bd5c72ee91e6580` (PR #21 squash merged), `pr_number` workflow input `type: number`, strict `^[1-9][0-9]* shell guard. Proposed correction changes input metadata to `type: string` and adds regression tests, without relaxing validation or changing credentials/security gates.
- **Observed pre-index-update:** initial fix commit `e8483afdf17baf3c1ea2b574fd6bbf1e4b522338`; PR #26 **OPEN / DRAFT / NOT MERGED** when inspected. This index-only correction advances HEAD; new exact-head CI and review must be verified, not inferred from prior runs. Independent review disposition **DEFERRED** (optional under TM-DEC-002). No owner authorization to merge any new PR or run a privileged Codespace workflow; neither `main` nor PR #18 modified. The original GitHub PR-read 403, SSH and Expo tunnel remain unverified. Check GitHub for live branch/PR status rather than interpreting this as the current state.

---

## 2026-11-21 — PR #21 trusted Codespaces diagnostic, P3 index handoff

- **Task:** [TM-OPS-PR403-20261120-001](tasks/preview/preview-pr-read-403-20261120.md), [RFC #19](https://github.com/im-tnyx/Tio-Money/issues/19), [PR #21](https://github.com/im-tnyx/Tio-Money/pull/21) on `fix/preview-pr-read-403-diagnostics` → `main`. **OPEN / READY FOR REVIEW / NOT MERGED** when inspected; diagnostic-only, not an HTTP 403 repair.
- **Verified predecessor snapshot:** PR head `cd3b9b82133d3c19c9ac8b60590fd26c0a06061d` against `main` `f4332eb338ca75e27a5b35ff57511f522a4bb96a`, 0 behind, four prior changed paths. At that **previous head**, [Phase 0 CI](https://github.com/im-tnyx/Tio-Money/actions/runs/44793001234) and [AI governance CI](https://github.com/im-tnyx/Tio-Money/actions/runs/44793001467) were **SUCCESS**. **This P3 index correction creates a newer head: recheck exact-head CI rather than reusing those results.**
- **Review:** [Review #5997655461](https://github.com/im-tnyx/Tio-Money/pull/21#pullrequestreview-5997655461) is `COMMENTED`, not GitHub `APPROVED`; its [P3 index-registration finding](https://github.com/im-tnyx/Tio-Money/pull/21#discussion_r4646297484) is addressed by this checkpoint, pending new-head verification and thread disposition. Original P2 token-in-argv concern was addressed in the previous head via piped stdin `curl --config -`. Independent review is **optional under TM-DEC-002**, not a blanket gate. No independent approval is claimed.
- **Boundary:** Existing owner/main/label/immutable source gates and Codespace identity protections remain. Root GitHub PR-read HTTP 403 is **UNKNOWN**, and no successful live privileged diagnostic/SSH/device test has occurred. **Owner PR #21 merge permission NOT_GRANTED**; `main` was not modified by this branch update. Treat these SHA/status statements as an observed checkpoint and consult GitHub for the current state.

---

## 2026-11-20 — PR #22 ready-for-review checkpoint (reconciled on main)

- [PR #22](https://github.com/im-tnyx/Tio-Money/pull/22) **OPEN / Ready for Review / not merged**, targeting `main` at `6187b7a7e4c59949547c21655accf50dec8d0dfd`, reconciled HEAD `4e741cf716bcb6020d6e1128a28fc995fd00eb37` before this checkpoint. Original history preserved by non-force two-parent commit; GitHub diff exactly six Markdown files, 0 behind.
- At this verified commit, PR C's changed docs passed **143 local file links + 58 section-anchor occurrences**, zero missing. Live HTTP of 99 external links, on-device SQLite, encryption, Drive/iCloud and Supabase integration were **not tested**.
- Existing bottom tabs/floating Add geometry **frozen** (TM-DEC-010); implementation-plan legacy "FAB placement requires signoff" wording corrected, **without any UI code changes**. Current Add remains disabled.
- **This handoff commit advances SHA to trigger pull_request synchronize CI:** recheck exact-head checks and Codex review and any new findings. **No owner merge authorization for PR #22.**

---


## 2026-11-20 — PR #22 documentation reconciliation on merged main

- **Owner instruction:** safely reconcile [PR #22](https://github.com/im-tnyx/Tio-Money/pull/22), rerun CI and review; **no merge permission for #22**. PR #14 and [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) have already merged under their respective explicit owner authorizations.
- **Current `main` SHA:** `6187b7a7e4c59949547c21655accf50dec8d0dfd` (verified PR #16 squash merge). PR #22 historical head before non-force merge: `edf0aa8769dc93a8d6477ee60bd57e97d436d0f9`.
- **Technical decision / scope:** non-force two-parent PR #22 branch merge preserving all merged `main` files except PR C's six Markdown-owned paths: `docs/00-INDEX.md`, `docs/engineering/IMPLEMENTATION-TEST-PLAN.md`, `docs/governance/DECISIONS.md` (TM-DEC-010 bottom-tab freeze only), new `docs/product/BACKUP-SYNC-SPEC.md`, [Phase C task](tasks/product/local-first-delivery-gates-20261120.md) and this index. Retarget to `main` and run exact-head CI/review after verification.
- **Protected UI:** existing five bottom tabs, 50dp nav baseline + OS inset, icons/weight/spacing and More-aligned disabled FAB unchanged; no source, SQL, cloud or provider changes.
- **Review/merge gate:** financial, investment, encryption/backup and Supabase tenancy ADRs **not implemented**. No independent review or device tests claimed. **Owner PR #22 merge authorization NOT_GRANTED**.

---


## 2026-11-20 — PR #16 final merge-gate P3 cleanup

- **Owner requested merge-gate verification, not merge:** [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) was OPEN / Ready for Review (non-draft), targeting `main` `582893d0915622623f8c6b3fb9da0f1bbb0a4a60` at HEAD `b81f4813a43af9de408eeddf1a850752ce64b7ca`. Owner's GitHub review is `COMMENTED`, **not `APPROVED`**.
- **Two subsequent P3 findings:** Screen 03 still said Phase 0 shell not yet merged, and [task](tasks/product/local-first-technical-design-20261120.md) still said `RECONCILING` / Draft. Corrected with approved historical PR #1 merge and actual PR #16 lifecycle. No code, bottom-tabs or cloud change.
- **This branch edit requires new HEAD validation:** verify all PR CI and Codex status, resolve addressed P3 threads with documented evidence, preserve six Markdown scope and unchanged `main`; **PR #16 merge NOT AUTHORIZED**. PR #22 remains separate Draft requiring reconciliation.

---


## 2026-11-20 — PR #16 Codex P1 investment valuation review

- Codex automated review of `0b80af9a6d959e682ec0ece3dc1ff45c59223957` reported **P1**: non-posting market valuation cannot silently change **canonical journal-derived Net Worth**. [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) remains Ready for Review, **not merged**.
- Bounded docs correction in `docs/architecture/DATABASE-DESIGN.md` and `docs/architecture/TECH-ARCHITECTURE.md`: distinguish immutable posted Net Worth from a **separately labelled unposted portfolio valuation estimate**, ADR-gated balanced revaluation, tests `TM-DB-VAL-001` / `TM-ARCH-010`. No new tables/code/cloud/UI/nav.
- The commit created by this checkpoint requires new exact-head CI and P1 thread response/disposition. **Owner merge authorization NOT_GRANTED** for PR #16; dependent PR #22 remains untouched.

---


## 2026-11-20 — PR #16 follow-up review consistency correction

- Before this checkpoint: [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) was **OPEN / Ready for Review / main-based**, SHA `53886aed3e28c9402cfb8f9402e536c8f8f638af`, all three CI checks green. **Codex re-review requested**, but not yet finalized at observation.
- Manual review found legacy **SCREEN 06** had funded-only Wallet and universal opening form wording inconsistent with the merged PR #14 Bank-linked Wallet reference; `docs/design/SCREEN-SPEC.md` corrected these conditions. Historical PR #1 merge-state blurbs in Screen/Architecture were also corrected, with device QA still unverified. **No app code, bottom navigation or PR #22 files touched.**
- This task checkpoint commit advances the branch HEAD; **do not reuse old CI/Codex results**. Re-check exact-new-head actions, review threads and link integrity. PR #16 **merge authorization NOT_GRANTED**.

---


## 2026-11-20 — PR #16 reconciliation after PR #14 squash merge

**Verified follow-up:** [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) was retargeted to `main`, remains **OPEN / Ready for Review / NOT MERGED**. Reconciled merge commit `ec537534ee617b72e481aa14f3f810852bb5fa2a` (two parents: old PR B HEAD + new main). GitHub compare: 0 behind, six Markdown files only; source `main` unchanged. At that exact SHA, **314 internal Markdown file links and 85 section anchors** passed, 0 missing, no added whitespace or prohibited co-author trailers; **173 external URL occurrences were not HTTP-verified**. This checkpoint advances the branch HEAD to trigger `pull_request:synchronize` CI, so all CI/reviewer results must be rechecked on the new commit. PR #22 remains Draft and requires separate reconciliation; no branch edits or merge authorization for #22.


- **Owner requested:** safely reconcile [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) onto new `main`, rerun CI and review. This is **not** permission to merge PR #16.
- **Verified PR #14:** squash-merged to `main` at `582893d0915622623f8c6b3fb9da0f1bbb0a4a60`. Existing PR #16 branch HEAD before reconciliation: `c5dfec3722a62b6ee0cd5cc30586f1e3a92f745b`.
- **Integration:** non-force two-parent branch merge into PR #16 with `main` as second parent, main tree authoritative except PR B's **six owned Markdown paths**. Reconcile only Bank-linked Wallet non-ledger reference, Investment/Loan historical opening wording in docs 02–05; preserve original `main` index and PR #14 P2 fixes. **No application, SQL, theme, bottom-navigation or cloud changes.**
- **Documentation task:** [TM-DOC-ARCH-20261120-002](tasks/product/local-first-technical-design-20261120.md) tracks code exclusions, exact method, source and future ADR gates. [Draft PR #22](https://github.com/im-tnyx/Tio-Money/pull/22) is a dependent separate branch, **not edited**.
- **Gate:** PR #16 retarget to `main`, exact-head CI and review required; no independent approval assumed. **Owner merge authorization NOT_GRANTED** for PR #16 and PR #22.

---


## 2026-11-20 — PR #14 conditional merge authority / new Codex findings

- **Owner authorized** merge of `im-tnyx/Tio-Money` **PR #14** into `main`, **only if all current checks, protections, applicable reviews and outstanding findings are verified satisfied**. No authority for auto-merge, force-push, deletion or PR #16/#22.
- Latest reviewed `c6d9473d9fed0d83982e0cf4e93cb3e16626bfef` had three green GitHub check runs and `main` branch API showed `protected:false`, but **Codex added two unresolved P2** findings to `docs/product/PRD.md` after earlier preflight. Correct in original PR branch; verify exact new HEAD and review/comment status again.
- **Remediation:** add Bank-linked Wallet reference to first-run (after Bank exists) and Accounts add/edit/archive flows, without additional financial account/balance/postings. [Task](tasks/product/local-first-product-contract-20261120.md) records source and limitations. Current branch remains PR #14; dependent stacked PR #16/#22 require later reconciliation.
- **Pending at this checkpoint:** final CI, PR review findings, protections preflight and actual GitHub merge result. No merge is claimed here.

---


## 2026-11-20 — PR #14 opening-account P2 merge-gate remediation

- **Owner request:** bring [PR #14](https://github.com/im-tnyx/Tio-Money/pull/14) to merge gate (fix/review/CI; **not merge authorization**). Technical PROCEED remains bounded to finance-product documentation in [RFC #13](https://github.com/im-tnyx/Tio-Money/issues/13) and the [task](tasks/product/local-first-product-contract-20261120.md).
- **Before remediation:** PR A HEAD `659915ba8c9766082ccc945809b8879df3b5b6ce`; one unresolved non-independent [P2 review thread](https://github.com/im-tnyx/Tio-Money/pull/14#discussion_r4644772021): generic opening amount conflicts with bank-linked Wallet/no-asset and Investment/Loan opening semantics.
- **Proposed resolution:** group-conditional opening rules, explicit non-posting bank reference, single balanced opening equity for funded/card/loan/investment historical positions, zero-value no-op, six additional test IDs. Preserve all unapproved multi-currency/valuation/migration ADR blockers.
- **Branch constraints:** work only on PR #14 documentation branch; staged PR [#16](https://github.com/im-tnyx/Tio-Money/pull/16) and [#22](https://github.com/im-tnyx/Tio-Money/pull/22) depend on PR A and require later safe reconciliation. No merging of any PR, no `main` change, no device/code/SQL changes.
- **Gate record:** independently reviewed/CI and resolved status must be re-verified at exact updated HEAD; protection rules API not reliably readable; owner PR-specific merge authorization **NOT_GRANTED**.

---


## 2026-11-20 — Product contract PR #14 (newest read-only handoff)

| Task | Owner instruction / RFC | Work branch / PR | Status and gate |
| :--- | :--- | :--- | :--- |
| [`TM-DOC-PRODUCT-20261120-001`](tasks/product/local-first-product-contract-20261120.md) | Owner requested documentation start after local-first, account-group, Main/Sub Currency, backup-last and Supabase-opt-in decisions. [RFC #13](https://github.com/im-tnyx/Tio-Money/issues/13) records technical **PROCEED for docs only**, transcribed by ChatGPT GPT-6. | `docs/local-first-product-contract-20261120` → [Draft PR #14](https://github.com/im-tnyx/Tio-Money/pull/14) based on `main` `fd154db417b1979d39f855317f252eed37c36e9d` | **IN_REVIEW / unmerged**. 6 Markdown files initial commit `7265f8a3a4d232a07426f932c1c7b42fc20673a8`: 0 missing local document links; no forbidden co-author trailer. **Independent review DEFERRED** (not performed). CI for final new HEAD must be checked. **Owner PR-specific merge permission NOT_GRANTED**. |

**Live GitHub status verified 2026-11-20:** Governance [PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) **MERGED** with commit `5dbdbe047a542463f0de66b9c0c6e09ef7d2605a`; Phase 0 [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) **MERGED** with commit `e647f78ce200fed1323d80ea794396c371fba7bf`. Older entries in this index saying those PRs are open are **historical dated checkpoints**, not current status. Do not rewrite them or claim iPhone/SQLite QA was completed.

---

## 2026-11-20 — PR #7: latest-main reconciliation checkpoint (owner-requested)

**Live preflight:** [PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) remains OPEN / Ready for review, not merged. The approved reconciliation target is `main` at `5a72a112378fa14b168a02e9b18b41360ef79ed4`, including merged [PR #5](https://github.com/im-tnyx/Tio-Money/pull/5); prior PR #7 HEAD was `094b8b9225d9e5fa319af7bf6406bb047e067ee6`, 30 commits behind / 19 ahead. Owner requested merge-readiness and main synchronization in this chat; **owner authorization to merge PR #7 into main remains NOT_GRANTED**.

**Branch-only integration:** Construct a non-force, two-parent merge of current `main` into the PR #7 documentation branch. Preserve its 14 governance Markdown paths and all other source, Expo, EAS, SQLite, permissions, workflow, package and app files exactly from `main`. Only overlapping file `.ai/current.md` is integrated by retaining both the PR #7 current governance checkpoint and `main`'s later PR #5 EAS preview checkpoint. Earlier status statements below remain historical and are not assertions of current PR state. PR #7's two owner P3 review threads were resolved on previous HEAD; no GitHub formal `APPROVED` review is inferred. Independent additional review **DEFERRED** per optional-by-default policy.

**Gate:** exact-post-merge-HEAD CI, provenance/commit attribution, path scope and actual GitHub protections require new verification. Do **not** merge or auto-merge PR #7, invoke EAS publication, or alter PR #10 without separate authorization.

---

## 2026-11-20 — Governance PR #7 current review and main synchronization

**Live PR state at this checkpoint:** [PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) is **OPEN / READY FOR REVIEW** (`draft:false`), **NOT MERGED**. Its task `TM-GOV-CLEANUP-20261119-001` remains **IN_REVIEW**; owner merge authorization **NOT_GRANTED**. [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) and [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) are both merged; [PR #4](https://github.com/im-tnyx/Tio-Money/pull/4) subsequently merged Codespaces Stage A into `main` at `fdae8b4d23117a5be202ec04663ba22f3b21d1a5`. Earlier `DRAFT`/pre-merge statements below are *historical* checkpoints, not current statuses.

**Two owner P3 review findings:** [stale Draft handoff](https://github.com/im-tnyx/Tio-Money/pull/7#discussion_r4639327629) and [stale CI checkpoint](https://github.com/im-tnyx/Tio-Money/pull/7#discussion_r4639327644). This update records current `draft:false` and correctly attributes the previous checks to exact *pre-synchronization* HEAD `be0dd012a27c135b7cff2fce82062e5b5cf4a9a8`: [Phase 0 static #44686452585](https://github.com/im-tnyx/Tio-Money/actions/runs/44686452585) **SUCCESS**, [AI governance #44686452594](https://github.com/im-tnyx/Tio-Money/actions/runs/44686452594) **SUCCESS** (29/29 governance tests, Markdown links, 18 commit-message checks). These **are not results for any later HEAD**. Recheck current GitHub CI after each new commit; a reviewer's `COMMENTED` review is not `APPROVED` and the P3 threads must be independently verified/resolved, not silently dismissed.

**Integration boundary:** PR #7 preserves the new Codespaces preview files, Expo/source/config, and workflows from merged `main` unchanged. Only governance Markdown files differ in this PR. Independent new-head review is **DEFERRED** by optional review policy; no approval is claimed. No `main` write, merge of PR #7, force-push, auto-merge, or change to permissions/ledger is authorized.

---

## 2026-11-20 — Merge-gate staging: Android owner UI PASS, no merge authority

**Latest verified source before this docs-only gate checkpoint:** PR #1 `feat/phase-0-expo-foundation` → `main`, HEAD `ed0be0850b34d6f42140107aa5d7adb30eb77e47`, main `04e6aa8d657627516b8ce7de91bd8304fdcbcf90`. [Phase 0 CI #44602177612](https://github.com/im-tnyx/Tio-Money/actions/runs/44602177612) **SUCCESS** and [governance CI #44602177693](https://github.com/im-tnyx/Tio-Money/actions/runs/44602177693) **SUCCESS** on exactly that HEAD. The original Copilot Node-engine finding was checked against `package.json`, `package-lock.json`, locked Expo/RN engines and README, then replied to with [evidence](https://github.com/im-tnyx/Tio-Money/pull/1#discussion_r4634398174) and **administratively RESOLVED** on GitHub (one resolved review thread, zero known outstanding). This is `FIX_VERIFIED` from a source/CI self-audit, **not** independent approval; existing formal review is still `COMMENTED`. Latest-head independent review **DEFERRED** under optional-by-default policy; recommend for SQLite/native bootstrap.

**Android owner report:** Owner explicitly says current UI was checked on a real Android device and looks correct. Mark **`OWNER_REPORTED_ANDROID_UI_SMOKE_PASS`** (2026-11-20), refining the previous unspecified-device smoke report. Prior `ExpoSQLite` error is no longer being seen per owner; do not mark it active. This is not a complete Android QA matrix and does **not** prove DB `PRAGMA` settings, migration persistence, cold restart, accessibility, system light/dark, or iPhone execution. Android model, OS/Expo Go version, exact device-tested SHA and evidence logs/screenshots were not provided.

**Merge-gate decision: STAGED / HOLD — NOT AUTHORIZED TO MERGE.** Live PR reported `mergeable:true`, 237 ahead / 0 behind at inspected pre-doc SHA; full protection/rulesets endpoints returned 403 (not certifiable). The current Phase 0 UI is **five blank tabs and a disabled FAB** per TM-DEC-005; root `AGENTS.md` Section 7's active Add-editor language applies to the future finance feature, not this Phase 0 UI (scoped clarification; no AGENTS edit). Outstanding: full iPhone device QA, any remaining Android theme/accessibility/safe-area and actual SQLite FK/`user_version`/restart proof, verification of GitHub-required branch gates, exact-final-HEAD CI and a **fresh explicit owner instruction authorizing merge of `im-tnyx/Tio-Money` PR #1**. No merge, auto-merge, main write, PR #7 edit, force push, history rewrite or branch deletion; review after material new changes.

---

## 2026-11-20 pre-merge handoff — latest verified implementation source (not a merge)

| Task | PR/branch | Latest verified source | Acceptance / next action |
|---|---|---|---|
| **TM-P0-ALIGN-20261119-001** | [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) · `feat/phase-0-expo-foundation` → `main` | Before this docs-only checkpoint, HEAD `c90d1c00462de5e4a5b007a87dade6641a106f40`. [App CI #44600432345](https://github.com/im-tnyx/Tio-Money/actions/runs/44600432345) PASS; [Governance CI #44600432365](https://github.com/im-tnyx/Tio-Money/actions/runs/44600432365) PASS. Five blank tabs + disabled Google FAB; 24dp icon, 50dp nav baseline/FAB, 1dp label gap, 16dp FAB clearance. **OPEN / NOT MERGED.** | **Owner-reported device UI/no-`ExpoSQLite`-error smoke PASS** (platform/version not specified). Full two-platform, a11y, SQLite PRAGMA/migration/restart **NOT_VERIFIED**. One Copilot Node thread outdated/unresolved, fix evidenced. Independent latest-head review **DEFERRED**. Owner **merge permission for current scope NOT_GRANTED**; fresh explicit authorization required, followed by current HEAD/protections checks. [Task evidence](tasks/phase0/phase0-alignment-20261119.md). |
| **TM-GOV-20261118-001** | [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) | **MERGED** into `main` at `04e6aa8d657627516b8ce7de91bd8304fdcbcf90` (2026-11-19); prior 6/6 threads resolved | Preserve verified governance history, no inherited PR #1 merge authority. |
| **TM-GOV-CLEANUP-20261119-001** | [Draft PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) | **DRAFT / UNMERGED**, independent governance docs cleanup | PR #7 also edits `.ai/current.md` and `docs/governance/DECISIONS.md`; reconcile conflicts manually if ever integrated; do not edit PR #7 from Phase 0. |

Current working documentation agent ChatGPT GPT-6; prior verified Phase 0 assistant ChatGPT GPT-6 per conversation. Never infer agent identity, owner approval or physical QA from Git author. Source-sha results above are historical as soon as a doc-only commit advances the branch; rerun CI for the new HEAD. **Previous handoffs below are archived historical snapshots**, not latest merge authority.

---

## Historical verified handoff (2026-11-19) — superseded by the 2026-11-20 snapshot above

| Task | PR / branch | Verified status | Last tested source and next safe action |
|---|---|---|---|
| **TM-P0-ALIGN-20261119-001** | [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) · `feat/phase-0-expo-foundation` | **READY FOR REVIEW / OPEN / NOT MERGED**. Five blank selectable tabs + disabled floating `+` over More; shared theme/icon-size tokens and automatic OS light/dark; screens presentation-only. **Owner merge authorization NOT_GRANTED.** | Before this docs-only update, source HEAD `aaa09ad88fdcb9efa032f0f9b3c5e83f72785738`; [app CI #44562328304](https://github.com/im-tnyx/Tio-Money/actions/runs/44562328304) passed 24/24 tests and Android/iOS bundles; [governance CI #44562328037](https://github.com/im-tnyx/Tio-Money/actions/runs/44562328037) passed 29/29 tests. Recheck final docs HEAD. Physical QA of latest tokenized Android/iPhone, system light/dark and real-device SQLite **NOT_VERIFIED**; [Phase 0 task](tasks/phase0/phase0-alignment-20261119.md) and [doc-alignment RFC](https://github.com/im-tnyx/Tio-Money/pull/1#issuecomment-7015156188). |
| **TM-GOV-20261118-001** | [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) · `chore/ai-context-governance` | **COMPLETED / MERGED**, not archived. Actual `main` merge SHA `04e6aa8d657627516b8ce7de91bd8304fdcbcf90`, merged 2026-11-19 06:16:11 UTC; **6/6** review threads resolved when inspected. | Earlier no-permission/open-thread records below were correct only at their own timestamps. PR #2 had **separate owner authorization**; that authorization is **not transferable** to PR #1. [Governance task history](tasks/governance/ai-context-setup.md) remains unchanged. |
| **TM-GOV-CLEANUP-20261119-001** | [Draft PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) · `docs/governance-post-merge-reconciliation-20261119` | **DRAFT / NOT MERGED**; separate documentation reconciliation. **Owner merge authorization NOT_GRANTED.** | PR #7 also edits `docs/governance/DECISIONS.md` and `.ai/current.md`. Do not edit/merge PR #7 from Phase 0 work; eventual integration must reconcile its governance checkpoint with PR #1's later Ready-for-Review state without overwriting history. |

**Provenance and review:** Current documentation authoring agent ChatGPT GPT-6, verified from current session; prior Phase 0 working agent ChatGPT GPT-6 from recorded task, never inferred from Git author. Independent new-head review `DEFERRED` (optional policy); the original Node engine review thread on PR #1 remains **outdated but unresolved** in GitHub and requires a valid disposition. Live refs and actual configured GitHub checks/review protections always override this timestamped document. **No current PR #1 or PR #7 merge permission.**

## Archived pre-merge index snapshot (historical; not current status)

> **Historical task-index reconciliation snapshot (before PR #1 was marked Ready for Review).** Governance PR #2 was already merged at main `04e6aa8d657627516b8ce7de91bd8304fdcbcf90`; the older PR #1 Draft and PR #2 open/Not Granted rows below are retained only as earlier checkpoint statements, **not present-day PR status**. Latest verified table above and live GitHub refs take precedence.

> **Historical governance snapshot 2026-11-19T05:34:43.459Z UTC (before its checkpoint commit).** Compare live GitHub branches/PRs/checks before any write or merge. This multi-task index is not proof of current owner authorization. All earlier V2/CI checkpoints remain preserved in the task history.

| Task | Task file | Working branch | PR at snapshot | Verified owner / current agent | Status | Last verified checkpoint | Next safe action |
|---|---|---|---|---|---|---|---|
| `TM-P0-ALIGN-20261119-001` | [Phase 0 task/checkpoint](tasks/phase0/phase0-alignment-20261119.md) · [RFC/PROCEED](https://github.com/im-tnyx/Tio-Money/pull/1#issuecomment-7006286494) | `feat/phase-0-expo-foundation` | [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) — **DRAFT / NOT MERGED** | Current ChatGPT GPT-6; prior verified Phase 0 ChatGPT GPT-6 project assistant | **VALIDATING** — five empty tabs only, disabled floating FAB above More, no other app screens; device QA NOT_VERIFIED; **owner merge authorization NOT_GRANTED** | 2026-11-19; main integration `5d464a66f425dd93bfddcfdfe89fdfa5d330d5a5`; current tested HEAD and CI in PR | Verify new-HEAD app/governance checks, Android/iPhone Expo Go and SQLite startup, review thread disposition; keep draft |
| `TM-GOV-20261118-001` | [Governance task](tasks/governance/ai-context-setup.md) · [latest owner policy checkpoint](tasks/governance/ai-context-setup.md#owner-review-and-agent-merge-policy--2026-11-19) | `chore/ai-context-governance` | [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) — open, unmerged | Current ChatGPT (GPT-6); previous verified ChatGPT (GPT-6), 2026-11-18 checkpoint | **IN_REVIEW** — 6 historical/current reviewer threads unresolved; 1 latest inline-link P2 fixed pending independent verification; **owner merge permission NOT GRANTED** | `2026-11-19T05:34:43.459Z` UTC; pre-checkpoint HEAD `cb9fa85ead7e0c0a509cd90b87d51f2d3950d9f7` | [29 tests + Markdown and no-coauthor CI PASS](https://github.com/im-tnyx/Tio-Money/actions/runs/44465777121); optional independent re-review recommended, address any remaining blockers and seek **separate PR-specific owner authorization** before any merge |

## Parallel work discovered (not this task's ownership)

| Repository work | Live state at inspection | Authorship / agent evidence | Forbidden action |
|---|---|---|---|
| [Phase 0 Expo PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) on `feat/phase-0-expo-foundation` | **Open draft**, not merged; observed head `1c0f3e21d3e7938c1af3d5003ae640cfcd1cfe8f` | Working agent/model `UNKNOWN_NOT_VERIFIED`; PR author is not proof of model; some CI claimed in PR body but not independently rerun here | Do not edit its branch, change app code, merge or rewrite history |

**Latest owner policies:** [TM-DEC-002](../docs/governance/DECISIONS.md#tm-dec-002--independent-review-optional-by-default) — independent review **optional by default** (strongly recommended for financial, migration, security, privacy, auth and sensitive-platform changes); record `PERFORMED / SKIPPED / UNAVAILABLE / DEFERRED`, preserve known blockers and actual required GitHub reviews/checks. [TM-DEC-003](../docs/governance/DECISIONS.md#tm-dec-003--owner-authorized-agent-merge) — **agent merge permitted only after distinct owner authorization** explicitly naming repository, PR number, permission to merge and conditions, plus live-head/required-protection/blocker/scope verification. This connected-chat decision was [transcribed in PR #2](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-7000574123) by an agent, **not** an authenticated owner-authored merge approval. **PR #2 merge permission NOT GRANTED.** Strict no-`Co-authored-by:` policy, mandatory RFC/proceed and English-only MVP remain.

**Latest validation at pre-checkpoint HEAD `cb9fa85ead7e0c0a509cd90b87d51f2d3950d9f7`:** [Actual GitHub Actions run #44465777121](https://github.com/im-tnyx/Tio-Money/actions/runs/44465777121) **SUCCESS**: Python `py_compile`, **29/29 governance unittest cases**, supported Markdown `check-links` on PR checkout, **20 actual commit messages/zero prohibited co-author trailers**. Earlier [run #44465201294](https://github.com/im-tnyx/Tio-Money/actions/runs/44465201294) also passed 29 tests on helper fix `e238b7d`. New helper fixture covers inline non-Markdown relocation safety and optional review state gates. Independent review not claimed; 6 open threads remain and configured protected-branch requirements were not independently verified. This handoff commit advances HEAD; recheck its new CI run.

**Coordination:** Only the governance task above is assigned to this session. Treat Phase 0 as a separate, concurrently changing PR; its test and device-validation status must be checked from the PR/checks, never inferred from the index.

**Before the next write:** fetch live `main`, both branch HEADs, both PR states and changed paths. If these conflict with this snapshot, update the task evidence rather than silently assuming continuity.

[Agent contract](../AGENTS.md) · [Task protocol](tasks/README.md) · [Decisions](../docs/governance/DECISIONS.md)

## New preview task — additive checkpoint (2026-11-19)

| Task | Agent / ownership | Status | Next action |
|---|---|---|---|
| [`TM-DEV-PREVIEW-20261119-001`](tasks/preview/codespaces-expo-go-20261119.md) | ChatGPT GPT-6; new isolated `chore/codespaces-expo-go-stage-a` stacked over Phase 0; previous preview-task agent `UNKNOWN_NOT_VERIFIED` | [RFC Issue #3: agent Stage A PROCEED, Stage B BLOCKED](https://github.com/im-tnyx/Tio-Money/issues/3); stacked draft, device QA **NOT_VERIFIED**, merge **NOT_GRANTED** | Validate actual CI and physical Expo Go Android/iPhone; no privileged worker or merge without owner authority |

Older governance/Phase 0 rows above are historical snapshots, not overwritten by this separate preview-task addition. Verify live GitHub state.

**Preview validation follow-up, 2026-11-19:** [Task checkpoint](tasks/preview/codespaces-expo-go-20261119.md#2026-11-19-validation-checkpoint--current-working-chatgpt-gpt-6) · [stacked draft PR #4](https://github.com/im-tnyx/Tio-Money/pull/4) · [source CI SUCCESS on `b317ec8d`](https://github.com/im-tnyx/Tio-Money/actions/runs/44480886934) (16 Phase 0 + 8 preview tests and platform exports). Actual Codespace/tunnel, owner-authenticated EAS UUID and both physical phones **NOT_VERIFIED**. Stage B blocked; owner PR merge permission not granted. Historical earlier rows remain unchanged.

**Process fix + new source CI evidence (2026-11-19):** Preview [task checkpoint](tasks/preview/codespaces-expo-go-20261119.md#2026-11-19-owner-identity-and-managed-process-final-source-checkpoint); [source test run #44482368855](https://github.com/im-tnyx/Tio-Money/actions/runs/44482368855) **SUCCESS** at `fe2003707c53ab5ef615ce547971cc27ebfde209` (16 app + 8 preview tests, Node/Expo checks and both bundles). New checkpoint commit requires fresh head CI. No live Expo device/Codespace/EAS UUID verification, no merge authorization or Stage B activation.


## EAS preview-only task — separate stacked draft (2026-11-19)

| Task | Owner / agent | Branch / expected PR | Scope & next gate |
|---|---|---|---|
| [TM-EAS-PREVIEW-20261119-001](tasks/preview/eas-preview-updates-20261119.md) | ChatGPT GPT-6; previous EAS task agent UNKNOWN_NOT_VERIFIED; [scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/3#issuecomment-7004990185) | `feat/eas-preview-updates-foundation` **stacked on Stage A PR #4**, no merges | SDK 58 EAS preview configuration + manual owner-gated publish workflow *source only*. No EAS build/update/token or trusted worker activated. Independently review, test exact head, obtain separate owner approval before publishing or merging. |

## 2026-11-20 — PR #5 second external P2 re-review / security fix checkpoint

- **Task:** [EAS preview provenance and current P2 disposition](tasks/preview/eas-preview-updates-20261119.md#2026-11-20--second-independent-security-re-review-and-three-p2-repairs), PR [#5](https://github.com/im-tnyx/Tio-Money/pull/5), agent ChatGPT GPT-6; previous verified original preview agent GPT-6. Owner-supplied external reviewer assessed old head `8ca5346e`, found 3 P2; intended `REQUEST_CHANGES` but **no GitHub review posted**.
- **Source remediation:** original `eas-cli@latest` fixed; newly source-fixed rerun actor/attempt, pinned checkout/setup-node SHAs, and true **committed** isolated CLI lock (`eas-cli 27.4.1`, TypeScript peer 5.9.3, 528 lock entries/527 npm sha512 integrities). Real non-secret GitHub CI generated and `npm ci`+signature-validated the corrected lock. PR #5 publishing workflow remains manual-only, owner/main gated, JS/assets-only, Expo-token-only-at-publish; no EAS publish, native build or secrets were used.
- **Validation:** [source smoke run #44699552306](https://github.com/im-tnyx/Tio-Money/actions/runs/44699552306) was running at prior HEAD `a4f706602f0476d304cbcffaf93c3dbe67cca93e`; do not assume final outcome. The index update itself creates a fresh HEAD requiring actual current-head checks. Independent **re-review pending**, current GitHub-required merge gates and exact head must be rechecked. **Owner PR #5 merge authorization NOT_GRANTED**. PR #10 remains separately stacked/unmerged; do not alter it or its base under PR #5 work.
