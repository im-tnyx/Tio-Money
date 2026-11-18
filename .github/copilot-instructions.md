# Tio Money — concise Copilot instructions

Read [root AGENTS.md](../AGENTS.md) before any edit or review; then the [multi-task index](../.ai/current.md), one assigned task and its persistent [technical discussion](../.ai/discussions/README.md). Verify live branch, PR HEAD, canonical documents and actual code rather than treating summaries or chat as GitHub truth.

- A technical RFC and recorded `PROCEED` decision are mandatory before substantial implementation. **Owner implementation signoff is optional for ordinary bounded work**; restricted security, privacy and financial changes retain their own gates. **Every merge requires separate explicit owner authorization**. Never edit or merge directly into `main`.
- Preserve feature ownership, public APIs, domain purity, SQLite adapter boundaries and the **single canonical ledger**. Integer paise; one `+` Income/Expense/Transfer editor; transfer principal is not spending, optional transfer fee is; credit cards are liabilities, not assets.
- Preserve offline-first behavior, English-only MVP/no language selector, native SMS restrictions in Expo Go and iPhone SMS inbox limitations. No invented Auth, Supabase, cloud backup, encryption, permissions or real-device test claims.
- **Never add any Git `Co-authored-by:` trailer**, including Claude/Opus, Codex, Cursor or ChatGPT. Never spoof the Git author. Record verifiable agent identity only in task/handoff notes.
- In review, inspect actual changed diff, tested SHA, outstanding prior threads, privacy/security, link/archival/state-gate fixtures and real CI evidence; follow [REVIEW_GUIDE.md](REVIEW_GUIDE.md). A bot `COMMENTED` or quota-limited review is not formal approval; never claim a test or permission was verified without evidence.
