# TM-OPS-CODESPACES-BUNDLE-20261121-001 — Private verified Codespaces preview transfer

| Field | Observed |
|---|---|
| Repository | `im-tnyx/Tio-Money` |
| RFC / technical proceed | [RFC #34](https://github.com/im-tnyx/Tio-Money/issues/34), 2026-11-21; agent-documented `PROCEED` following owner chat request to fix in a new PR |
| State | `VALIDATING` on feature branch; not merged |
| Working branch | `fix/codespaces-preview-bundle-transfer-integrity` |
| Base | `main` `3f8b888342c947244bbec811c198be7b18ae81c2` |
| Owner merge authorization | `NOT_GRANTED` |
| Privileged workflow dispatch | `NOT_GRANTED` |
| Independent security review | `DEFERRED` until exact-head CI; strongly recommended |
| Implementing agent | ChatGPT GPT-6 (not commit author or reviewer) |
| Prior verified agent | `UNKNOWN_NOT_VERIFIED` |
| PR | [Draft PR #35](https://github.com/im-tnyx/Tio-Money/pull/35); OPEN / NOT MERGED |

## Observed failure and scope

Manual Codespaces runs [#80](https://github.com/im-tnyx/Tio-Money/actions/runs/44825288224) and [#81](https://github.com/im-tnyx/Tio-Money/actions/runs/44825952573) passed immutable PR validation, trusted bundle creation and Codespace identity, then rejected the remote bundle on size, mode or owner. Exact failing condition was not logged. PR #33 had already merged the change from remote unauthenticated `git fetch` to trusted-runner bundle transfer. **Never claim that stdin transfer was proved responsible.**

Allowed: only trusted Codespaces workflow, trusted `sync-pr-codespaces-preview.sh`, targeted regression tests, and this task/index. No changes to PR #18, application, finance database, Expo configuration, dependencies, secrets, permissions or any editing Codespace.

## Technical decision and validation

- Retain immutable PR SHA, owner, `tio-preview` label, main-bound PR, safe changed-file allowlist, dedicated Codespace ID, and privileged job restrictions.
- Use official `gh codespace cp` to transfer the verified bundle into an exclusively created run-scoped private 0700 directory. Prevent reused destination; avoid forwarding the repository token.
- Verify non-symlink regular file, expected UID, mode 0600, bounded size, SHA-256, `git bundle verify`, and imported exact commit SHA. Keep remote cleanup confined to the owned private transfer directory.
- Regression test valid transfer, SHA mismatch, empty content, symlink, permissive modes; verify unchanged policy gates and no remote `git fetch`.
- `npm run check`, CI and independent security review are pending at this checkpoint. Successful CI alone does not prove physical Codespaces tunnel. Manual privileged workflow must be performed separately by owner after authorized merge.
- Rollback: keep PR unmerged; if merged under separate authority, revert the bounded workflow/script/test commit with non-force reviewed follow-up.


## 2026-11-21 — Implementation and exact-head checkpoint

- PR [#35](https://github.com/im-tnyx/Tio-Money/pull/35) opened as DRAFT against `main`; five changed paths, zero commits behind and no PR #18 source changes at inspection. Branch source commit `69df4bee947235dde3e1a91dd58344323b2849f5`.
- At that SHA, [Phase 0 #44827308287](https://github.com/im-tnyx/Tio-Money/actions/runs/44827308287) **SUCCESS**: locked dependency install, Expo compatibility, strict TypeScript/ESLint/format, unit + preview tests, Android/iOS Metro and default SMS permission scan. [AI governance #44827308350](https://github.com/im-tnyx/Tio-Money/actions/runs/44827308350) **SUCCESS**: Python, regression, local Markdown links, forbidden coauthor trailer scan.
- Subsequent branch-only formatting commit `cd23a749ec14058d4c0bf3ee5d7edcfb272a1726` requires **new exact HEAD CI**. Never treat prior success as approval for later SHA.
- No real Codespace SSH file copy or Expo tunnel was run by the implementation agent. Security review `DEFERRED` (recommended for trusted workflow), owner merge authorization `NOT_GRANTED`, privileged Codespaces workflow dispatch `NOT_GRANTED`.

## Handoff

- Confirm exact PR HEAD, current `main` ancestry, workflow/test CI, no forbidden `Co-authored-by` trailers, review threads and actual required GitHub protections.
- Independently examine OpenSSH argv handling, `gh codespace cp`, run-scoped path creation, file ownership/permissions, hash verification and failure cleanup before merge.
- This task records *implementation permission only*, not approval to merge or dispatch Codespaces.
