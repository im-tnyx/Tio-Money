# 🧪 Coding and quality rules — quick route

**Canonical:** [Implementation and test plan](../../docs/06-IMPLEMENTATION-TEST-PLAN.md) · [Architecture](../../docs/05-TECH-ARCHITECTURE.md).

- Strict TypeScript: typed command/results, discriminated unions, checked monetary and date inputs. Avoid unchecked `any` in financial paths.
- Parse decimal amount strings to safe integer paise. Keep calculations in pure domain functions; preserve debit/credit balance and atomic event writes.
- Cross-feature calls use explicit public contracts. Do not import another feature's private screen, SQL or state. No circular dependencies or monolithic store.
- Bind SQL parameters; verify foreign keys and migrations; test rollback, idempotency, corrections, fees and credit-card liabilities.
- Reuse semantic theme/tokens, accessible components, centrally managed English UI strings and locale-independent stable IDs.
- Run relevant typecheck, lint, tests, builds and device QA for an implementation task; **record commands and observed outputs**, not predicted success.
- **Never add `Co-authored-by:` to a commit message**, including entries for Claude/Opus, Codex, Cursor or other agents; use [task provenance](../agents/README.md), not Git co-author attribution. Audit commits with the [stdlib helper](../../scripts/ai_context.py) in a full checkout.
- Do not add unrelated app implementation, lint rules, package changes or scaffolding on the AI-governance branch. [Feature boundary enforcement proposal](feature-boundaries.md) requires separate authorization.
