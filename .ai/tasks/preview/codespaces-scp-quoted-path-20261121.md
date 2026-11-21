# TM-OPS-CODESPACES-SCP-20261121-001 — Fix literal-quoted SCP preview path

| Field | Value |
|---|---|
| Repository | `im-tnyx/Tio-Money` |
| RFC | [Issue #36](https://github.com/im-tnyx/Tio-Money/issues/36) |
| Decision | `PROCEED` for scoped implementation, 2026-11-21 (agent-documented from owner chat) |
| State | `VALIDATING`, not merged |
| Branch | `fix/codespaces-scp-literal-quote-preview` |
| Base `main` SHA | `2f62f01b5869df4807452689f06ef561a2a9ae14` (PR #35 squash merge) |
| Working agent | ChatGPT GPT-6; distinct from Git author and reviewers |
| Independent review | `DEFERRED` until exact-head CI, recommended for privileged preview workflow |
| Merge authorization | `NOT_GRANTED` |
| Privileged preview dispatch | `NOT_GRANTED` |
| PR | Pending creation; check GitHub for live status |

## Evidence

The first manual preview after merging PR #35, [run #44828410270](https://github.com/im-tnyx/Tio-Money/actions/runs/44828410270), selected owner-authored PR #18 at `3a10f2f859e80800d7a0cf5556525c6c5905e0f2`, passed immutable source, allowlist, trusted-runner Git bundle and dedicated Codespace identity checks. The attempted `gh codespace cp` to a private path failed at SCP:

```text
/usr/bin/scp: dest open "'/tmp/tio-money-preview-.../source.bundle'": No such file or directory
```

The remote filename is being wrapped in literal apostrophes by the CLI/SFTP layer. The observed error closely matches [cli/cli #6148](https://github.com/cli/cli/issues/6148) and [#12775](https://github.com/cli/cli/issues/12775). The [official GitHub CLI manual](https://cli.github.com/manual/gh_codespace_cp) documents `--expand` for remotely interpreted paths. This is an SCP-path failure, not app/UI CI, authentication, or an actual verified remote hash mismatch.

## Scoped remediation and security contract

Change **only** the trusted Codespaces workflow's one `gh codespace cp` command to `--expand` with an explicit non-user-supplied path. Preserve the existing strict 40-char hexadecimal `TARGET_SHA` and positive decimal `GITHUB_RUN_ID` validation, derived `/tmp/tio-money-preview-${TARGET_SHA}-${GITHUB_RUN_ID}/source.bundle`, exclusive private 0700 remote directory, validated 0600 copied file, matching owner and SHA-256, exact commit `git bundle verify`, cleanup, owner/PR/label/scope checks, Codespace identity and permissions. No additional remote shell expansion or token forwarding.

Update `tests/preview/pr-codespaces-workflow.test.mjs` to assert the permitted CLI argv and validated path. Tests cover the previous SCP literal quote regression. Static tests cannot establish real remote SFTP compatibility.

**Exclusions:** app/UI, PR #18, financial ledger, dependencies, secrets, workflow credentials, Expo account settings, EAS publish/build, direct `main` writes, force operations, privileged dispatch and merge. Previous PR #35 remains merged and unchanged.

## Acceptance and handoff

- `npm run check` from GitHub Phase 0, AI governance checks and changed file/commit attribution scan must pass at exact PR HEAD.
- Confirm fresh PR has 0 behind `main`, no conflicts, no blocking review findings, optional independent security review disposition.
- Keep new PR Draft until reviewed, do not merge without separate owner permission. Owner may start a brand-new manual workflow for PR #18 only **after** successful authorized merge.
- Real success requires a completed Codespaces SCP upload, hash-verified source import and Expo tunnel; not claimed in this implementation.
- Rollback: leave draft unmerged, or revert only scoped change under separately authorized protected-main process.
