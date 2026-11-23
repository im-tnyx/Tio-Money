#!/usr/bin/env bash
# Trusted script sent over SSH from the default-branch Actions checkout.
# This file is never loaded from a feature PR by the Actions runner.
set -euo pipefail

readonly project_root="/workspaces/Tio-Money"
readonly expected_remote="https://github.com/im-tnyx/Tio-Money"
readonly target_sha="${1:-}"
readonly pr_number="${2:-}"
readonly bundle_path="${3:-}"
readonly expected_bundle_sha256="${4:-}"
readonly cache_dir="${HOME}/.cache/tio-money-expo-preview"
readonly dependency_marker="${cache_dir}/preview-dependency-manifests.sha256"

if [[ ! "$target_sha" =~ ^[0-9a-f]{40}$ || ! "$pr_number" =~ ^[1-9][0-9]*$ ||
      ! "$expected_bundle_sha256" =~ ^[0-9a-f]{64}$ ]]; then
  echo "Refusing preview: exact SHA, numeric PR and trusted SHA-256 are required." >&2
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

if ! worktree="$(git status --porcelain=v1 --untracked-files=normal)"; then
  echo 'Refusing preview: unable to verify worktree status.' >&2
  exit 1
fi
if [[ -n "$worktree" ]]; then
  echo "Refusing preview: Codespace has unsaved work. Commit/push or save it safely first." >&2
  exit 1
fi

# Trusted source runs inside the Codespace, but this validator needs no GitHub token.
# Keep each failure gate explicit and do not log the bundle contents or digest.
validate_preview_bundle() {
  local path="$1" target="$2" expected="$3"
  local dir="${path%/*}" current_uid dir_mode dir_owner file_mode file_owner size actual_hash
  current_uid="$(id -u)"

  if [[ ! "$path" =~ ^/tmp/tio-money-preview-${target}-[1-9][0-9]*/source\.bundle$ ||
        ! -d "$dir" || -L "$dir" || ! -f "$path" || -L "$path" ]]; then
    echo "Refusing preview: unexpected or non-regular bundle path." >&2
    return 1
  fi
  dir_mode="$(stat -c '%a' -- "$dir")"
  dir_owner="$(stat -c '%u' -- "$dir")"
  if [[ "$dir_mode" != "700" || "$dir_owner" != "$current_uid" ]]; then
    echo "Refusing preview: private bundle directory mode or owner invalid." >&2
    return 1
  fi
  size="$(stat -c '%s' -- "$path")"
  file_mode="$(stat -c '%a' -- "$path")"
  file_owner="$(stat -c '%u' -- "$path")"
  if (( size < 1 || size > 134217728 )); then
    echo "Refusing preview: bundle size outside 1..134217728 bytes." >&2
    return 1
  fi
  if [[ "$file_mode" != "600" ]]; then
    echo "Refusing preview: bundle must have mode 600." >&2
    return 1
  fi
  if [[ "$file_owner" != "$current_uid" ]]; then
    echo "Refusing preview: bundle owner does not match import user." >&2
    return 1
  fi
  actual_hash="$(sha256sum -- "$path")"
  actual_hash="${actual_hash%% *}"
  if [[ "$actual_hash" != "$expected" ]]; then
    echo "Refusing preview: bundle SHA-256 mismatch." >&2
    return 1
  fi
}

# Validate the private path and permissions before registering any cleanup.
validate_preview_bundle "$bundle_path" "$target_sha" "$expected_bundle_sha256"
readonly bundle_dir="${bundle_path%/*}"
trap 'rm -f -- "$bundle_path"; rmdir -- "$bundle_dir" 2>/dev/null || true' EXIT
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
  # A healthy Metro continues watching this detached worktree. The managed
  # helper refuses ambiguous ownership or a foreign server before mutation.
  # The trusted-main worker rechecked Metro ownership and port immediately
  # before this script. Old eligible PRs may not implement --preflight.
  # This is a preview-only checkout. No force, reset, stash, deletion or push.
  worktree="$(git status --porcelain=v1 --untracked-files=normal)"
  test -z "$worktree"
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

echo "Tio Money PR #${pr_number} checkout synchronized to ${target_sha}."
