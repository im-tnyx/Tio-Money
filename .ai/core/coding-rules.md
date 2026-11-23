# 🧪 Coding and quality rules — quick route

**Canonical:** [Implementation and test plan](../../docs/engineering/IMPLEMENTATION-TEST-PLAN.md) · [Architecture](../../docs/architecture/TECH-ARCHITECTURE.md).

- Strict TypeScript: typed command/results, discriminated unions, checked monetary and date inputs. Avoid unchecked `any` in financial paths.
- For Stage 1 finance commands, parse decimal **input strings into validated native safe-integer ISO-currency-specific minor units** (INR uses paise; zero- and three-decimal currencies have different exponents). Couple amounts to immutable ISO currency/exponent; never use JS floats or generic 'paise' as the scale for all currencies. Keep exact per-currency balanced postings and transactional/idempotent event writes in pure domain/use cases. [TM-ADR-018](../../docs/governance/STAGE-1-FINANCE-ADRS.md#tm-adr-018--native-currency-accounting-and-fx) blocks mixed-currency postings until balancing/FX clearing/rounding is approved.
- Cross-feature calls use explicit public contracts. Do not import another feature's private screen, SQL or state. No circular dependencies or monolithic store.
- Bind SQL parameters; verify foreign keys and migrations; test rollback, idempotency, corrections, fees and credit-card liabilities.
- Reuse semantic theme/tokens, accessible components, centrally managed English UI strings and locale-independent stable IDs.
- Run relevant typecheck, lint, tests, builds and device QA for an implementation task; **record commands and observed outputs**, not predicted success.
- **Never add `Co-authored-by:` to a commit message**, including entries for Claude/Opus, Codex, Cursor or other agents; use [task provenance](../agents/README.md), not Git co-author attribution. Audit commits with the [stdlib helper](../../scripts/ai_context.py) in a full checkout.
- Do not add unrelated app implementation, lint rules, package changes or scaffolding on the AI-governance branch. [Feature boundary enforcement proposal](feature-boundaries.md) requires separate authorization.
