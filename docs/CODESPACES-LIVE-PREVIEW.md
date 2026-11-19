# Tio Money — GitHub Codespaces / QR-free Expo Go development preview

> **Stage A source only (stacked draft PR). Actual Codespace tunnel and Android/iPhone phone behavior: NOT_VERIFIED. Stage B privileged automatic sync: NOT IMPLEMENTED.** This is a developer Metro session, not an installed release, permanent tunnel or always-on backend.

[Technical RFC and agent PROCEED](https://github.com/im-tnyx/Tio-Money/issues/3) · [Phase 0 PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) · [Phase 0 physical-device QA](07-PHASE-0-FOUNDATION-NOTES.md#manual-expo-go-and-real-sqlite-acceptance--not_verified)

## Architecture and scope

Tio Money's Phase 0 source uses Expo **SDK 58**, React Native **0.88.1**, Node `22.16.0` in `.nvmrc` and the committed npm lockfile. The developer container selects the compatible Node 22 Bookworm image family; it installs with `npm ci --no-audit --no-fund` and attempts the managed Expo starter after Codespace creation or resume. Keep SDK and React Native locked: no upgrade for preview.

The starter runs `npm run mobile` (`expo start --tunnel --go`), owns only the detached npm/Metro process it launches, verifies Linux `/proc` identity and project cwd, serializes operations with a per-user lock, checks the real `http://127.0.0.1:8081/status` response and validates the Expo Go tunnel URL from `/_expo/open?platform=ios&runtime=expo`. It refuses to take over or kill any unowned process. Operation timeouts are bounded; errors name a **private** local log, which may contain signed tunnel details. Never paste those logs into chat or CI. Metro port **8081** does not require a public Codespaces port forward for Expo's tunnel.

For SDK 58 the Expo tunnel is an **Expo-account-signed tunnel**; a legacy ngrok helper is neither needed nor installed. See [SDK 58's tunnel notes](https://expo.dev/changelog/sdk-58) and [Expo Go same-account instructions](https://docs.expo.dev/troubleshooting/expo-go-sign-in-required/).

## One-time owner setup (after agreeing the preview integration branch)

1. Check the chosen branch contains *both* the Expo app and these preview scripts. `main` currently has governance docs only; the active app is draft PR #1 on `feat/phase-0-expo-foundation`. The additive preview implementation is on `chore/codespaces-expo-go-stage-a` as a **stacked draft PR**. Coordinate with Phase 0 before choosing a branch. **Do not merge PR #1 just to create a Codespace.**
2. Open GitHub's **Code → Codespaces** for Tio Money; manually create **one** Codespace on the agreed app-containing preview branch. Do not create duplicates. Choose a modest machine and short idle timeout; do not assume a stopped Codespace costs nothing in retained storage.
3. If installation did not finish, run `npm ci --no-audit --no-fund` in the Codespace. Confirm `node -v` shows a compatible Node 22 release and `npx expo install --check` passes.
4. Run `npx expo login` *inside* the Codespace. Sign in privately using the method it provides. The first automatic `postStartCommand` can fail before login; this is expected and **must not** be treated as a healthy tunnel. Do not share Expo passwords, access tokens, Codespaces secrets or tunnel URLs in chat, Git or Actions logs.
5. Install an **SDK 58-compatible Expo Go** on your Android phone and iPhone; sign into Expo Go using the **same Expo account** as the Codespace CLI (required on a physical iPhone). An unavailable/older incompatible iOS Expo Go build is a blocker; do not claim success from account sign-in alone.
6. In the Codespace run `node scripts/start-codespace-expo.mjs`, then `node scripts/start-codespace-expo.mjs --status`. A successful starter message proves **local Metro and Expo CLI tunnel-link health only**, not physical reachability.
7. Inside Expo Go, look for **Tio Money** in **Projects / Recent Projects** and open it directly. Try that entry on later launches without a new QR scan. This is a best-effort account flow, **not** a guarantee that the entry persists, the link remains stable, or reconnects never occur.

**Fallback if Projects does not show Tio Money:** recover the **current** Expo Go link privately from the Codespace's Expo CLI session/log and open it on your own phone. Do not publish or transmit the signed link in a GitHub comment. If interactive CLI output is easier, first stop the managed server using `--stop`, then run `npm run mobile` in the Codespace terminal, open the Expo deep link and later stop that interactive process before returning to the managed starter. Never launch a second Metro against an occupied port.

## Session controls

| Command | Purpose |
|---|---|
| `node scripts/start-codespace-expo.mjs` | Start managed Metro/tunnel if absent; healthy project-owned server is reused without a duplicate |
| `node scripts/start-codespace-expo.mjs --status` | Fail unless project-owned Metro and an Expo Go tunnel both pass probes |
| `node scripts/start-codespace-expo.mjs --restart` | Stop only the verified managed process group and restart after checking Expo login |
| `node scripts/start-codespace-expo.mjs --stop` | Stop only a verified managed process; refuses to stop another process |
| `npm run mobile` | Manual, interactive CLI alternative **only after managed Metro stops** |

The Codespace must remain running while Metro serves the phone. JS/assets can Fast Refresh when connected; new native modules, native permission changes and custom SMS readers **cannot be loaded into Expo Go**. Codespace resume attempts an automatic Metro startup, but expired Expo authentication, failed install, port conflict or network outage require manual recovery. Tunnel URLs may change after stops/restarts.

## Recovery, cost and privacy

- Missing login: run `npx expo login` privately, then retry the starter. Sign into the same account on the phone.
- Failed install: rerun `npm ci --no-audit --no-fund` with the committed lockfile, inspect error and Node version. Do **not** regenerate package-lock blindly, alter SDKs or delete user work.
- Tunnel startup fails or times out: inspect `~/.cache/tio-money-expo-preview/metro.log` **privately** in the Codespace, fix authentication/network, run `--restart` and `--status`. The starter never prints signed tunnel URLs.
- Occupied port or foreign Metro: the starter refuses to kill it. Inspect the process manually; no `pkill` of unrelated development sessions.
- Stale PID / PID reused: identity/start-time/cwd and command must match, or the starter refuses termination. Stale records may be ignored but a busy port remains a hard blocker.
- Codespace stopped: restart the **same** Codespace in GitHub UI, check Metro, then reopen the Expo Go project/link. Rebuilding/replacing may require login again. Do not automatically provision more Codespaces.
- Phone errors: record OS, device, Expo Go version, application SHA and sanitized error only; do not publish bank, ledger, OTP or user data.

Codespaces computes are billed by active machine time with plan-specific monthly included usage; retained storage can still consume allowance. Set a short idle timeout and manually stop the Codespace when finished. See [GitHub billing](https://docs.github.com/en/billing/concepts/product-billing/github-codespaces) and [lifecycle](https://docs.github.com/en/codespaces/about-codespaces/understanding-the-codespace-lifecycle). The Expo tunnel endpoint is accessible to someone with its link; this is not a secure private financial backend.

## Stage B: proposed push-driven preview (BLOCKED, not activated)

Future dedicated preview branch: `dev/expo-preview` (**not created**). Desired design:

`approved preview push → unprivileged read-only signal → trusted default-branch workflow_run worker → exact repository / owner actor / branch / accepted SHA checks → restricted environment token → locate exactly one owner-created matching Codespace → reject dirty worktree/wrong origin/wrong branch/divergence → fast-forward only to accepted SHA → run npm ci when manifests change → safely refresh managed Metro → reopen Expo Go if necessary`.

The push signal must receive **no secrets**. Privileged runner must never execute PR-authored shell or checkout arbitrary untrusted source. Owner must configure a **fine-grained Codespaces token** and environment-restricted secret solely through GitHub secure UI, and must assess private-repo visibility/cost, main-branch workflow trust, protection/rulesets, environment restriction and actual available permissions. The connector could not read branch-protection settings (`403`); rulesets produced an account-plan `403`. **Do not treat this as an approved privileged gate.** No Stage B GitHub Actions YAML, token, environment or automatic wake/sync is added.

If security gates cannot be established, retain manual Codespaces startup indefinitely. No PR merge, deploy, branch deletion or GitHub settings changes follow from this proposal.

## Acceptance evidence

| Acceptance | Recorded status |
|---|---|
| Node starter helper tests, static checks, Android/iOS Metro export | Report tested HEAD and observed results in stacked PR; a source commit alone is not a PASS |
| Real signed Codespace Expo tunnel / Metro stop-resume | **NOT_VERIFIED** |
| **Android:** same-account Expo Go Projects reopen without QR if offered, navigation, refresh, stop/restart | **NOT_VERIFIED** — physical device not available to the agent |
| **iPhone:** SDK 58-compatible Expo Go, same-account login, Projects reopen, navigation/refresh, restart recovery | **NOT_VERIFIED** — physical device not available to the agent |
| Automatic Codespaces wake/sync after approved push | **NOT_IMPLEMENTED / BLOCKED** |

**Rollback:** use `--stop`, stop the owner-designated Codespace in GitHub UI and close/revert the preview-only stacked PR if rejected. Never reset/force-push or merge the app PR to work around preview problems.
