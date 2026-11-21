<div align="center">

# 💱 10 · Currency Preferences & Exchange-Rate Contract

### Always preserve original money; refresh conversion quotes when users need them.

![Status](https://img.shields.io/badge/STATUS-DRAFT%20FOR%20REVIEW-7357E8?style=flat-square)

[🏠 Project](../README.md) · [📚 Docs Hub](00-INDEX.md) · [🎯 PRD](01-PRD.md) · [📌 Decisions](DECISIONS.md)

</div>

---

> [!IMPORTANT]
> **Incremental implementation underway (RFC [#52](https://github.com/im-tnyx/Tio-Money/issues/52)):** A More → Currency **local display-preferences** module (Main default INR, optional distinct Sub) is being built on an unmerged feature branch. **No FX provider, live exchange rate, converted totals, cross-currency ledger entry, SQLite ledger migration or rate-refresh integration is approved/implemented.** The existing [Ledger Draft](04-DATABASE-DESIGN.md) is **INR-only** (`CHECK(currency = 'INR')`) and assumes integer paise; **do not code mixed-currency accounting under that schema**. Owner direction: [TM-DEC-008](DECISIONS.md#tm-dec-008--main-and-optional-sub-currency-with-refresh-on-use), [RFC #13](https://github.com/im-tnyx/Tio-Money/issues/13). A finance ADR is required before changing the journal.

**2026-11-21 finance decision split:** [TM-ADR-018](11-STAGE-1-FINANCE-ADRS.md#tm-adr-018--native-currency-accounting-and-fx) accepts per-currency exactness and forbids silent mixed-currency booking; actual balanced clearing/gain/rounding and cross-currency transfers remain **BLOCKED for implementation**. [TM-ADR-023](11-STAGE-1-FINANCE-ADRS.md#tm-adr-023--fx-quote-provider-and-privacy) accepts privacy, source/timestamp and refresh-on-use while **specific rate provider, license and supported codes** remain unapproved. Controllers/services fetch quotes; **screens may only render a provided rate ViewModel**, per [TM-DEC-011](DECISIONS.md#tm-dec-011--strict-dumb-screen-presentation-only-rule).

**Preference foundation only:** a local versioned kv-store key and root-provided global hook let future finance controllers consume the same selection. Initial curated ISO-labelled codes are **display settings**, not a list approved for financial posting/FX quotes. Existing four finance screens remain blank. A Main/Sub collision clears Sub. Rate and accounting requirements below remain blocked by TM-ADR-018/023.

## 01 · Main and Sub Currency behavior

| Preference | Required contract |
| :--- | :--- |
| Main Currency | Exactly one ISO 4217 code (default `INR`), chosen in Settings for primary display/reporting |
| Sub Currency | Optional **single** ISO 4217 code, **different from Main**, enabled only when the user chooses a different currency |
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
| Open app / resume foreground with active Sub Currency | Refresh attempt for the active pair |
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
