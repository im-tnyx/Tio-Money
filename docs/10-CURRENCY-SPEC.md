<div align="center">

# 💱 10 · Currency Preferences & Exchange-Rate Contract

### Always preserve original money; refresh conversion quotes when users need them.

![Status](https://img.shields.io/badge/STATUS-DRAFT%20FOR%20REVIEW-7357E8?style=flat-square)

[🏠 Project](../README.md) · [📚 Docs Hub](00-INDEX.md) · [🎯 PRD](01-PRD.md) · [📌 Decisions](DECISIONS.md)

</div>

---

> [!IMPORTANT]
> **Merged PR #53 scope (verified 2026-11-22):** More → Currency saves Main and up to five optional Sub preferences locally. The owner [explicitly approved](https://github.com/im-tnyx/Tio-Money/pull/53#issuecomment-7066644805) **Frankfurter v2 blended reference rates only for the saved Sub Currency display/refresh**, conditional on [TM-ADR-023](11-STAGE-1-FINANCE-ADRS.md#tm-adr-023--fx-quote-provider-and-privacy) privacy/security controls. The rate is the latest *published indicative reference*, **not a real-time executable exchange rate**. No ledger conversion, posted FX, account valuation, balances, reports, bank operations, Auth/cloud or paid provider are authorized. The [Ledger Draft](04-DATABASE-DESIGN.md) remains INR-only; no mixed-currency accounting is implemented or approved. This is a historical implementation decision, not new merge authorization. Older local-only/no-network statements below describe superseded initial scope, not the current code.

**2026-11-21 finance decision split:** [TM-ADR-018](11-STAGE-1-FINANCE-ADRS.md#tm-adr-018--native-currency-accounting-and-fx) accepts per-currency exactness and forbids silent mixed-currency booking; actual balanced clearing/gain/rounding and cross-currency transfers remain **BLOCKED for implementation**. [TM-ADR-023](11-STAGE-1-FINANCE-ADRS.md#tm-adr-023--fx-quote-provider-and-privacy) conditionally approves **Frankfurter v2 blended rates for saved Sub Currency display only**; other uses, unsupported pairs and provider-specific datasets remain unapproved. Controllers/services fetch quotes; **screens may only render a provided rate ViewModel**, per [TM-DEC-011](DECISIONS.md#tm-dec-011--strict-dumb-screen-presentation-only-rule).

**Unmerged PR #53 display UI refinement (2026-11-21):** More groups Main Currency and Sub Currency in one card; each opens a dedicated screen. Sub Currency offers None or a different currency directly on its screen without a bottom sheet. Main Currency has Back/centered title/Change and large sample, Front/End inline radio buttons, Decimal Point, Indian/International Number Format and Large Numbers shared bottom sheets. This is a pure, versioned local display preference (with legacy Main/Sub values preserved), not an FX or canonical ledger-format change. [RFC #54](https://github.com/im-tnyx/Tio-Money/issues/54). Exact-head CI and on-device a11y acceptance are pending.

**Currency-dependent format default (PR #53):** On a real **Main Currency change**,
the grouping preference returns to **Auto**: INR displays Indian lakh/crore
separators (e.g. `12,34,567.89`), every other currently selectable currency
displays international million grouping (e.g. `1,234,567.89`). Users can
override to Millions, Lakhs or No Format in the existing Format bottom sheet;
the override remains effective until they select a different Main Currency.
Selecting the same currency again preserves an existing manual choice.
Unit Position, Decimal Point and optional Sub Currency settings do not change
except that a Sub equal to the new Main is cleared. This affects display
preferences only, never the exact native ledger amount or FX behavior.

**Preference + approved Sub-only reference display:** a local versioned kv-store key and root-provided global hook share saved choices; the app-scoped optional Sub-only FX controller displays validated date-stamped quotes. The curated ISO-labelled codes are **display settings**, not a promise of supported provider pairs or approved financial posting. Existing four finance screens remain blank. A Main/Sub collision clears Sub. Rate and accounting requirements below remain blocked by TM-ADR-018/023.

### 2026-11-22 — Sub Currency detail screen navigation (latest PR #53 decision)

Opening **More → Sub Currency** continues to show the dedicated Sub list screen.
Tapping a saved Sub card now pushes a **native full-screen detail route**
`/currency/sub-detail?code=ISO` (validated against the saved Sub list),
**not a detail bottom sheet**. The detail page uses the same Back navigation
pattern as Main Currency. The list's Add Currency picker stays a bottom sheet;
swipe-to-Delete and the single list FX freshness footer are preserved.

On the saved Sub detail screen, Unit Position remains the Main-style inline
segmented setting. **Decimal point** opens a separate radio bottom sheet with
None / 1.0 / 1.00 / 1.000. **Format** opens a separate radio bottom sheet
with Millions / Lakhs / No Format. Both use the shared `AppBottomSheet`,
close on selection/backdrop/native Back and persist only that saved Sub's
existing versioned display preferences. There is no inline Format accordion,
decimal +/- stepper, or nested detail modal. Refresh, reference FX source/date,
cached/offline indication, successful check feedback and six-decimal raw quote
remain presentation-only, with no posting, ledger, network-host or permission changes.

To avoid Main/Sub UI divergence, `MainCurrencyOptionSheet` and
`SubCurrencyDetailOptionSheet` use the **same**
`CurrencyRadioChoiceSheet` (which composes the existing `AppBottomSheet`
and accessibility/scroll/safe-area behavior). They provide their own
selections and callbacks; Main preferences and each saved Sub's preferences
remain independently persisted. Main's Change Currency picker also continues
to use this shared radio UI. This is a presentation-only reuse, not a
cross-currency mutation or navigation change.

This latest owner direction **supersedes older inline Sub detail sheet,
+/- decimal and in-sheet Format accordion instructions below**; those remain
historical records, not the currently intended UI. Android/iPhone no-QR Expo Go
visual/a11y and native Back/gesture acceptance remain required before merge.

**2026-11-22 — post-merge Currency UI parity follow-up:** [Issue #81](https://github.com/im-tnyx/Tio-Money/issues/81) tracks Sub list bottom safe-area/padding alignment with Main, the Sub limit + affordance, controller-owned swipe/FX presentation, and checked-at visibility. Current UI retains a six-decimal *indicative reference* quote on Sub detail, which must not be mistaken for a booked balance. PR #53 is MERGED; earlier "unmerged" and single-Sub/inline-detail sections elsewhere on this page are historical unless explicitly superseded. Shared top-bar adoption is deferred to the separately owned PR #80, and optional Large Numbers remains a distinct unimplemented proposal, not a silently implemented setting.

## 01 · Main and Sub Currency behavior

| Preference | Required contract |
| :--- | :--- |
| Main Currency | Exactly one ISO 4217 code (default `INR`), chosen in Settings for primary display/reporting |
| Sub Currency | Up to **five optional distinct** curated ISO codes, each different from Main; selected Sub display settings persist independently |
| Same code selected | Reject/disable Sub Currency; do not create needless 1:1 FX fetch |
| Disabled Sub Currency | All new account/transaction choices use Main Currency unless a documented currency-migration flow handles historical secondary accounts |
| Existing account currency | **Never silently rewrite** because the display preference changed; preserve original journal currency and amounts |
| Historical records | Always preserve source currency, original exact amount and event date; projections must declare FX rate basis |
| Network access | Only needed for pair quotes; original-currency local entries remain functional offline |

**Initial product UX:** Main/Sub form is in Settings. Show rate **as 1 Sub = X Main** with base/quote, source, published-at or effective-at time, last fetched-at, and a stale/error label. Display only a supported pair; unsupported pairs are an explicit error. Changing Main/Sub does not automatically reinterpret old holdings.

## 02 · Refresh-on-use policy (not a 24-hour timer)

**Owner requirement:** attempt to fetch the **latest available published rate whenever the user uses a currency-dependent feature**. A new rate is not guaranteed if the provider has not published an update.

| Trigger | Required behavior |
| :--- | :--- |
| Cold-open app with saved Sub Currency | Refresh once per selected unique Sub/Main pair; no automatic resume timer |
| Select or change Sub Currency / Main Currency | Request fresh rate for the newly selected distinct pair |
| Open conversion view or perform conversion | Request fresh rate before presenting a quote as fresh |
| Enter multi-currency-aware transaction or report | Refresh attempt; show quoted time and stale fallback when applicable |
| User presses Refresh Now | Force a new request; report errors truthfully |
| Repeated rerenders/keystrokes | **No request loop**; deduplicate simultaneous in-flight requests, tie to user actions, not component renders |

Implementation may collapse concurrent identical requests, apply network timeouts and handle provider rate limits transparently. It must **not** silently substitute a fixed 24-hour refresh window for user actions. If the provider limits requests, show the throttle/fallback status rather than claim a live response. No automatic background polling or push feed is implied.

## 03 · Offline, error and stale-state contract

1. **Online success:** store the latest valid rate with pair, source, precision, publication timestamp and fetch timestamp in **local SQLite** cache; show updated status.
2. **Offline/time-out/provider error:** use a **last-known valid** cached rate if available and prominently mark it **Cached · last updated ...**; a stale quote is an estimate, not a guaranteed transaction rate.
3. **No valid cache:** show **Rate unavailable**; never present a fictional rate or silently treat non-identical currencies as 1:1.
4. **Invalid response / zero or negative / mismatched pair:** reject without replacing valid cache, record a non-sensitive diagnostic, surface a recoverable message.
5. **Concurrent refreshes:** prevent an older response overwriting a newer selected pair/rate; cancel/ignore stale results on pair change.
6. **No Sub Currency:** no FX network call required.

The internet exception does **not** imply sending account balances, identifiers, transactions or loan/card information to the exchange-rate provider. **Only the selected currency pair** is permitted in the app-supplied FX request payload; do not add account, user, locale, merchant, analytics or transaction context. Ordinary transport metadata (such as IP address) must be evaluated during provider/privacy review, not treated as approved optional request fields. Review provider privacy, costs, license and reliability before implementation.

## 04 · Money accounting and precision boundaries

- **Original amount invariant:** a ₹5,000 bank event stays ₹5,000 INR even when user switches Main to USD. The display may show a converted estimate alongside the original.
- **Booked minor units:** INR uses paise; other ISO currencies vary (e.g. JPY has zero minor decimals; some currencies use three). **Every booked amount must be a validated safe integer in that currency's native minor unit**, coupled to immutable ISO code and exponent. Decimal strings may be used **only for user input, exchange rates or non-posting calculations** before exact validated conversion into native integer postings; they are **not an alternate booked ledger representation**. Never sum booked totals using JS floating point.
- **Rates:** decimal strings / exact decimal arithmetic with explicit source, quote direction and chosen rounding. Do not invert a rounded quote repeatedly.
- **Reporting modes:** distinguish **historical converted cashflow** (transaction-date or accepted fixed rate) from **current valuation estimates** (latest published rate). A changing latest rate must not silently restate already-posted income/expense reports.
- **Single-currency journal rule today:** current INR-only balanced journal remains authoritative **until a new approved multi-currency double-entry model** is designed. Cross-currency transfers need principal, two currency legs, FX clearing, fee, and gain/loss/rounding treatment; **BLOCKED pending ADR**.
- **Net worth:** cannot sum ₹, $, € numeric values directly; use a disclosed, reproducible conversion policy with rate timestamp and missing-rate handling. Historical snapshots must be reconstructible.

**Illustrative non-posting display:** if the provider quotes `1 USD = 85 INR` (example only, **not a real or current rate**), a `USD 10` account may display `≈ INR 850`; original `USD 10` remains unchanged. Do not use illustrative rates in the actual app or financial ledger.

## 05 · Proposed logical boundaries (not executable schema)

`currency_preferences`: Main code, optional distinct Sub code, opt-in state, updated time.

`fx_rate_cache`: pair, base/quote, exact rate string, provider identity, effective/published time, fetched time, validation/status; indexed by pair and accepted version.

`money_amount`: original amount and ISO currency, currency-specific minor-unit precision; ledger conversion only through the future reviewed domain model.

`FxRateProvider`: provider adapter returning authenticated/validated quote metadata; `FxRateCache`: local last-known quote; `FxConversionProjection`: pure, precise display calculation; `Ledger` must never blindly accept converted floating-point amount.

These are concept names for future architecture review, **not permission to create tables, a network integration or a Supabase client**.

## 06 · Acceptance test IDs (future implementation gates)

| ID | Expected behavior |
| :--- | :--- |
| `TM-FX-001` | Main INR and Sub disabled make no FX request |
| `TM-FX-002` | Same Main and Sub cannot be selected simultaneously |
| `TM-FX-003` | Opening currency-aware screen/foreground triggers a rate fetch attempt |
| `TM-FX-004` | Changing pair requests the correct pair; stale response cannot overwrite new selection |
| `TM-FX-005` | Conversion/report entry attempts refresh, not only a daily timer |
| `TM-FX-006` | No network with cache shows rate + source/time + **stale** label |
| `TM-FX-007` | No network and no cache shows **unavailable**, not 0 or 1 |
| `TM-FX-008` | Network quote never changes original transaction amount or currency |
| `TM-FX-009` | Currencies with distinct minor units follow correct precision and tested rounding |
| `TM-FX-010` | No sensitive account/ledger data is included in FX request |
| `TM-FX-011` | Same action/in-flight response is deduplicated and errors are recoverable |
| `TM-FX-012` | Cross-currency journal and reproducible net-worth reports are **blocked until ADR/test coverage** |

## 07 · Blocking ADRs and follow-on documentation

1. **Accounting ADR:** supported Stage 1 currencies, account currency eligibility, cross-currency transfer support or explicit first-release prohibition, balanced journal model, FX clearing/gain/loss and date-effective reporting.
2. **Rate provider ADR:** authoritative source(s), currency coverage, request latency/SLA, costs, license, HTTP security, rate timestamp semantics, rate limiting, fallback strategy and no leakage of finance data.
3. **Currency-change ADR:** main/sub preference changes when existing secondary-currency assets/liabilities exist, handling archived pairs and historic data.
4. **Security/privacy ADR:** certificate/HTTPS and request controls, no embedded secret keys, rate validation, provider availability and release telemetry policy.

**Stage separation:** Stage 1 network is FX-only. **Stage 2** Google Drive/iCloud backup and **Stage 3** optional Supabase/Auth are not implemented and require separate docs and security gates.

[← Docs Hub](00-INDEX.md) · [Account Groups →](08-ACCOUNT-GROUPS-SPEC.md)

### Sub Currency route — PR #53 (2026-11-21)

More → Sub Currency navigates to `/currency/sub` instead of a bottom
sheet. The screen has the same 50dp safe-area-aware title bar as Main Currency,
an icon-only Back action, a Plus picker button and a conditional Pencil button. `None` is always
available; Main Currency cannot be selected as Sub. Choices save through the
existing local preferences provider. The picker closes only after successful saving; failures stay visible.
Back returns to More. A Main/Sub collision
continues to auto-clear Sub. This change does not add FX quotes, network calls,
data migrations, finance ledger operations or new persisted keys.

### Sub Currency add/edit controls — PR #53 (2026-11-21)

The 50dp top bar displays Back | Sub Currency | Pencil (only when a
Sub is saved) | Plus. All icons use the shared 24dp role and 48dp
touch size. Plus opens a shared bottom sheet containing None and the
curated currencies other than Main. A saved Sub appears in the screen
body. Pencil toggles an editing state exposing Remove. The existing
single optional Sub preference is preserved; choosing another code
replaces the current Sub until multi-Sub persistence/accounting is
specified and reviewed. Synchronous storage failure leaves the picker
open with an error. No new storage key, ledger mutation or FX call.

### Multi Sub Currency + indicative FX on Sub screen only — PR #53 (2026-11-21)

Up to **five different Sub Currencies** may be added by selecting a currency
once in the Plus bottom sheet. Main code and previously selected codes do
not appear in the sheet. No exchange rate or Save button appears in the
picker. The selected Sub Currency list **on the dedicated Sub Currency
screen** shows a separate `USD 1.00 = INR 92.680507`-style reference
quote below each row; the number here is strictly a synthetic example,
not a live quote. The quote is fetched against the CURRENT Main code,
including after Main changes. Source and published date are displayed;
when unavailable the UI does not invent a value.

Pencil enters editing, replacing Back with a top-left **X Cancel**.
Cancel stops editing without deleting or leaving the screen; individual
Remove actions delete only their target Sub. The 5-code limit and
uniqueness are enforced in the preference data layer.

The v2 preference reads v1 and preserves a saved Sub at position 1;
new preference writes use the separate v2 key, leaving legacy v1
unchanged. FX is a display-only reference quote; neither ledger, balance
nor journal amounts are converted. Provider choice for Sub-only indicative rates is now owner-approved subject to
TM-ADR-023 conditions; device QA, commercial/privacy review of the deployed
environment and trusted preview integration remain release gates.

### Sub Currency deletion — swipe-only UI supersedes Pencil/Edit (2026-11-21)

This latest owner-approved UI requirement supersedes the historical
Pencil/X/left-minus descriptions above. Sub Currency has a 50dp
Back | centered title | Plus header, without an edit mode. Each saved
currency remains independently tappable to open its detail bottom sheet.
A left swipe reveals a semantic red Delete action with white text;
swiping itself never deletes. Right swipe and tapping outside the revealed
action dismiss it. A screen-reader-accessible Delete action remains
available on each currency row without showing another destructive icon.
The existing per-currency remove operation, maximum of five Sub
Currencies, Main/Sub uniqueness, stored preferences and finance
boundaries are unchanged. Physical Android/iOS QA remains pending.

### Sub Currency detail inline Decimal Point control — 2026-11-21

This newer owner UI requirement replaces the nested decimal-choice modal only
within the Sub Currency **detail** bottom sheet. The row has accessible
minus and plus buttons with a center sample **1 / 1.0 / 1.00 / 1.000**;
the lower and upper bounds are disabled. The chosen 0–3 decimal digit
precision persists only for the individual Sub, and its detail comparison
preview updates without dismissing the sheet. Main Currency retains the
original choice bottom sheet unchanged.

The detail sheet still composes the existing shared AppBottomSheet and
Front/End selector. It names the Main Currency above its conversion
preview; caption/value columns align, source/effective date is visible
when a quote exists, the Exchange Rate refresh row stays compact, the
Unit Position control sits at the right edge, and both panels share
the semantic card surface/dividers. No new network endpoint, account
or ledger data operation or FX-provider approval is implied.

### FX lifecycle and opt-in policy — PR #53, 2026-11-21

**Latest owner direction supersedes unconditional screen-open/network
refresh rules in section 02 for this MVP.** The global FX rate controller
mounts once after local database initialization. If saved Sub Currency
selection is empty, it must not read rates or call the FX provider.
Only selected and distinct Sub/Main pairs are eligible (maximum 5).

On a cold app launch with saved Subs, request each selected pair once.
Adding/removing a Sub or changing Main updates eligible pairs and makes
requests only for the new effective selection. Display settings changes,
route navigation, opening the Sub screen, repeated renders and idle app
time do not trigger requests. Users can explicitly press Refresh at any
time for a currently saved Sub pair, with in-flight deduplication and
visible spinner/status. Automatic background polling and a fixed timer are
out of scope; a future finance feature may define additional purpose-specific
checks after a separate review.

The SQLite-backed, versioned local key-value cache stores **only** a
validated pair quote, Frankfurter source and fetched timestamp. On cold
start a cached quote may render immediately but is explicitly labeled
**Cached** until a successful online verification; on failure preserve
last valid pair and show an unavailable/cached state, never a fictional
conversion. Invalid, mismatched or future-dated cache payloads are ignored.
Removing all Sub selections ends all new FX requests; original ledger
amounts never change. A subsequent explicit owner decision **approved**
Frankfurter blended v2 only for this Sub Currency reference display.
See [TM-ADR-023](11-STAGE-1-FINANCE-ADRS.md#tm-adr-023--fx-quote-provider-and-privacy)
for its conditional privacy/security/accuracy constraints. Never label the
blended daily reference as a guaranteed live bank/trade rate. The adapter
rejects future/invalid dates and times out after 8 seconds. The compact Sub
detail UI shows a **single line** with source, provider publication date,
and **Cached** state where applicable. The independent last-fetched timestamp
remains in the local cache, but is not repeated as a second visible date line
under the owner's 2026-11-22 UI refinement.

### 2026-11-22 — Sub Currency UI refinement (unmerged PR #53)

The selected **Main Currency** code/label is visible in a compact row
above the Sub list. Add Sub is disabled when Main is invalid or absent;
the app's persisted default Main **INR is a valid selection** and does
not require a second onboarding confirmation. Pure domain preference
operations also refuse to create a Sub for an invalid Main, and changing
Main to an existing Sub removes that conflicting Sub per the prior rule.
The Add picker omits redundant `1/5` text while retaining the five-item
limit and limit-reached notice. Sub detail exposes one source/published-date
line (and Cached status), a fine 1.5dp refresh glyph with an unchanged
48dp tap target, and reduced exchange-value/refresh visual gap.
Shared `AppBottomSheet` uses 24dp overflow-only trailing padding
with native safe-area protection intact. No finance posting, provider
protocol, API fields, permissions or data retention policy changes.
[Owner-directed technical discussion](https://github.com/im-tnyx/Tio-Money/pull/53#issuecomment-7067789782).

### 2026-11-22 — Sub card Last checked / Refresh now inline hint (unmerged PR #53)

A saved Sub Currency card has an **inline right-aligned compact two-line action**
that appears when its last **successful reference-rate verification** is not
on the device's current local calendar date, or when the current rate
state is cached/unavailable after a failed check. Show the locally persisted
last-check date (`Checked 21 Nov` or `Not checked`) and a tappable
`Refresh now` at the right, with no extra card height; preserve 48dp
minimum touch target, left-side one-line currency/rate labels, swipe-to-delete
and accessible button semantics. While retrying it reads `Checking…`
and is disabled. Successful same-day verification clears the hint, and
failure retains a retry affordance.

**Publication vs verification:** `ReferenceRate.date` is the **provider's
published/effective date**. Weekend and holiday quotes may retain Friday's
publication date even after a successful Sunday check; such a successful
verification still counts as **checked today**. Use validated `fetchedAt`
and local calendar day for the hint, not publication date; never invent
a newer reference rate or claim trading-price freshness. Returning from
background updates only the screen hint clock; no provider call is triggered
by navigation/foreground. Manual retry uses the existing deduplicated
Sub/Main-only provider action, subject to TM-ADR-023 privacy constraints.
This is a non-posting presentation-only feature. [Owner-requested
technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/53#issuecomment-7068050333).

### 2026-11-22 — One unboxed Sub Currency freshness footer (owner revision, PR #53)

The owner [revised the previous inline-per-card hint](https://github.com/im-tnyx/Tio-Money/pull/53#issuecomment-7068449996):
**a single unboxed row** appears only **immediately below the last selected
Sub Currency card**, with `Checked D MMM` left and `Refresh now` right.
It is not inside a card, not repeated between cards and does not alter
any Sub card's height. The row disappears when every selected Sub/Main
pair is verified on today's device-local date. If some pairs were never
checked, the left caption reads `Some not checked` (or `Not checked`
if none have a valid local fetched timestamp), instead of falsely giving
a global all-checked date. Otherwise it shows the **oldest** validated
last-check date across selected Sub pairs so a newer rate cannot mask a
stale one. Provider publication date is separate and may be older
during weekends/holidays. A single `Refresh now` action retries **all
eligible stale/cached/unavailable saved pairs**, excluding already
loading pairs, via the existing deduplicated pair-only FX provider;
it is disabled and shows `Checking…` until the batch settles. On
partial failure the row stays available. No auto-refresh is added by
screen opening, polling or foregrounding. Keep minimum 48dp
accessible touch height, safe area and swipe/Delete gestures; network
scope, FX quote precision, cache and finance ledger remain unchanged.
Tests: `TM-CUR-051`, `TM-CUR-052`, plus previous daily/pair tests.

### 2026-11-22 — Per-Sub Number Format inline accordion (unmerged PR #53)

[Owner-requested technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/53#issuecomment-7068636655).
The **Sub Currency Detail** sheet offers the same display-only Number
Format choices as Main: `Millions Format (1,000,000)`, `Lakhs Format
(10,00,000)` and `No Format (1000000)`. Unlike Main's separately
opened format-choice sheet, tapping the Sub **Format** row expands its
choices **in place inside the already open AppBottomSheet**; selecting a
radio option saves the per-Sub preference and closes the accordion.
Tapping Position, Decimal +/- or Refresh closes the expanded choices
and keeps the same sheet. Opening a different Sub or dismissing the
detail also resets expansion.

The selected Sub uses a **per-currency grouping override**
`subDisplay[ISO].grouping`, independently of Main and all other
saved Subs. Missing/legacy values mean `auto`: INR -> Indian Lakhs,
all other supported currencies -> International Millions. Existing
versioned local v1/v2 records with no grouping are accepted, with no
migration or loss of prior Unit Position/Decimal Point. Unknown
grouping values fail validation. UI-only large-number previews honor
the selected grouping, unit position and decimal digits. The provider's
published FX rate, six-decimal raw rate display and all financial
postings remain untouched; no new sheet, API, polling or provider
permissions. Minimum radio touch target 48dp, screen-reader selected
state, contrast and overflowing-sheet Safe Area remain required.
Regression tests: `TM-CUR-053`, `TM-CUR-054`, `TM-CUR-055`.
