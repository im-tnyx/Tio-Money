# Trusted Codespaces PR read: HTTP 403 incident and diagnostic

Incident: [manual worker run #44756820633](https://github.com/im-tnyx/Tio-Money/actions/runs/44756820633), 2026-11-20.

**Observed:** `GET /repos/im-tnyx/Tio-Money/pulls/18` returned `gh: Resource not accessible by integration (HTTP 403)`. The GitHub Actions job reported `Contents: read` and `PullRequests: read`. This happened **before** the Codespace identity/credential gate, remote start, SSH or Expo tunnel. Separate EAS workflows also hit PR metadata failures, but their current rule additionally forbids draft PRs. Expo login `tnyx-23` is unrelated.

**Important:** The root cause is **NOT YET VERIFIED**. The GitHub response's accepted-permissions header was not present in earlier logs. Do not increase token permissions, replace the built-in `GITHUB_TOKEN` with a personal token, reuse the lifecycle `CODESPACES_TOKEN` for PR reads, disable path gates, or make the repository public on speculation.

## Diagnostic-only proposed change

The first selected PR metadata GET in `.github/workflows/tio-money-codespaces-pr-preview.yml` uses the **same existing read-only `GITHUB_TOKEN`**, and on non-200 responses prints only the HTTP status and allowlisted, printable, length-bounded response headers:

- `X-Accepted-GitHub-Permissions`
- `X-GitHub-Request-Id`
- `X-GitHub-Api-Version-Selected`

Token handling P2 mitigation (2026-11-20): the Authorization header enters curl through a piped stdin config (`curl --config -`), not a token-bearing command-line argument or an on-disk config. No auth request headers, token, arbitrary server headers or response body are logged. A source self-audit recorded the earlier token-in-argv finding; an independent security review is still recommended. It refuses Codespace activation until a valid PR response passes the original owner/main/label and immutable snapshot checks.

## Investigation after a separately authorized merge and fresh manual dispatch

1. Inspect the new run's `Resolve exactly one owner-selected immutable PR head` logs and its three whitelisted diagnostic headers.
2. Compare `X-Accepted-GitHub-Permissions` with the workflow's actual `GITHUB_TOKEN` read-only permissions. GitHub documents that pull request reads normally need `Pull requests: read`.
3. If an authentic GitHub API response denies access despite effective read permission, verify repository `Settings → Actions → General → Workflow permissions` and account or platform policy, then seek GitHub Support with the request ID (not any token).
4. Decide a **separate minimal fix** and review it. Do not use broad `write` access or privileged PAT fallback by default.
5. Once metadata validation succeeds, continue normal Codespace allowlist/identity/SSH/Expo Go acceptance. Never re-run old attempt #1 because this trusted worker enforces `github.run_attempt == '1'`.

The diagnostic alone is **not** proof of correction. EAS publishing and build-preview are outside this change. This PR does not change `main` without owner-specific merge authorization. Owner's Appearance PR #18 remains separate and unmerged.

RFC: [#19](https://github.com/im-tnyx/Tio-Money/issues/19).

## Latest-main reconciliation

Safely reconciled this diagnostic branch with `main` at `f4332eb338ca75e27a5b35ff57511f522a4bb96a` using a **non-force two-parent merge commit**; all changes from the newer main (documentation product work) are retained. This branch's reviewable PR diff stays limited to the diagnostic workflow, its unit test and task/docs. Neither reconciliation nor test pass is authorization to merge.
