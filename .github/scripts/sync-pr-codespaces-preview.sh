#!/usr/bin/env bash
# Trusted script sent over SSH from the default-branch Actions checkout.
# This file is never loaded from a feature PR by the Actions runner.
set -euo pipefail

readonly project_root="/workspaces/Tio-Money"
readonly expected_remote="https://github.com/im-tnyx/Tio-Money"
readonly target_sha="${1:-}"
readonly pr_number="${2:-}"
readonly bundle_path="${3:-}"
readonly cache_dir="${HOME}/.cache/tio-money-expo-preview"
readonly dependency_marker="${cache_dir}/preview-dependency-manifests.sha256"

if [[ ! "$target_sha" =~ ^[0-9a-f]{40}$ || ! "$pr_number" =~ ^[1-9][0-9]*$ ]]; then
  echo "Refusing preview: exact SHA and numeric PR number are required." >&2
  exit 1
fi

if [[ ! -d "$project_root/.git" && ! -f "$project_root/.git" ]]; then
  echo "Refusing preview: expected Tio-Money Codespace checkout is missing." >&2
  exit 1
fi

cd "$project_root"
actual_remote="$(git remote get-url origin)"
actual_remote="${actual_remote%.git}"
if [[ "$actual_remote" != "$expected_remote" &&
      "$actual_remote" != "git@github.com:im-tnyx/Tio-Money" &&
      "$actual_remote" != "ssh://git@github.com/im-tnyx/Tio-Money" ]]; then
  echo "Refusing preview: origin is not the approved Tio-Money repository." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain=v1 --untracked-files=normal)" ]]; then
  echo "Refusing preview: Codespace has unsaved work. Commit/push or save it safely first." >&2
  exit 1
fi

if [[ ! "$bundle_path" =~ ^/tmp/tio-money-preview-${target_sha}-[1-9][0-9]*\.bundle$ || ! -f "$bundle_path" || -L "$bundle_path" ]]; then
  echo "Refusing preview: missing or unexpected immutable source bundle." >&2
  exit 1
fi
trap 'rm -f -- "$bundle_path"' EXIT
# Reject malformed, oversized or non-private temporary files before import.
bundle_bytes="$(stat -c '%s' -- "$bundle_path")"
if (( bundle_bytes < 1 || bundle_bytes > 134217728 )) ||
   [[ "$(stat -c '%a' -- "$bundle_path")" != "600" ||
      "$(stat -c '%u' -- "$bundle_path")" != "$(id -u)" ]]; then
  echo "Refusing preview: source bundle size, permissions or ownership invalid." >&2
  exit 1
fi
before_sha="$(git rev-parse HEAD)"
echo "Importing selected PR #${pr_number} immutable commit ${target_sha} from trusted runner."
git bundle verify "$bundle_path" >/dev/null
git fetch --no-tags "$bundle_path" "refs/tio-preview/selected"
fetched_sha="$(git rev-parse FETCH_HEAD^{commit})"
if [[ "$fetched_sha" != "$target_sha" ]]; then
  echo "Refusing preview: fetched commit did not match GitHub's accepted SHA." >&2
  exit 1
fi

if [[ "$before_sha" != "$target_sha" ]]; then
  # Stop only this project's verified managed Metro (never pkill other servers).
  node scripts/start-codespace-expo.mjs --stop
  # This is a preview-only checkout. No force, reset, stash, deletion or push.
  git -c advice.detachedHead=false switch --detach "$target_sha"
fi

# A preview may already contain dependencies from another branch. Reinstall
# only when manifests differ, or when npm's lock state is absent.
mkdir -p "$cache_dir"
current_hash="$(sha256sum package.json package-lock.json | sha256sum | cut -d ' ' -f 1)"
stored_hash=""
if [[ -f "$dependency_marker" ]]; then stored_hash="$(cat "$dependency_marker")"; fi

if [[ "$current_hash" != "$stored_hash" || ! -f node_modules/.package-lock.json ]]; then
  echo "Installing preview dependencies from the committed lockfile."
  npm ci --no-audit --no-fund
  printf '%s\n' "$current_hash" > "$dependency_marker"
fi

# The current branch's managed starter checks the exact Expo CLI account and
# the real signed tunnel. It never outputs a signed Expo Go deep link.
node scripts/start-codespace-expo.mjs
node scripts/start-codespace-expo.mjs --status
echo "Tio Money PR #${pr_number} preview serving exact source ${target_sha}."
