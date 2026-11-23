#!/usr/bin/env bash
# Trusted main-only probe. Output is a routing hint, never an authorization.
set -euo pipefail
readonly expected_sha="${1:-}"
readonly expected_remote="https://github.com/im-tnyx/Tio-Money"
readonly root="/workspaces/Tio-Money"
[[ "$expected_sha" =~ ^[0-9a-f]{40}$ ]] || exit 1
cd "$root"
origin="$(git remote get-url origin)"
origin="${origin%.git}"
case "$origin" in
  "$expected_remote"|git@github.com:im-tnyx/Tio-Money|ssh://git@github.com/im-tnyx/Tio-Money) ;;
  *) echo 'Refusing preview: unexpected repository origin.' >&2; exit 1 ;;
esac
if ! worktree="$(git status --porcelain=v1 --untracked-files=normal)"; then
  echo 'Refusing preview: unable to verify worktree status.' >&2
  exit 1
fi
[[ -z "$worktree" ]] || {
  echo 'Refusing preview: Codespace has unsaved work.' >&2
  exit 1
}
current_sha="$(git rev-parse HEAD)"
if [[ "$current_sha" == "$expected_sha" ]]; then
  echo 'EXACT_SHA'
else
  echo 'REFRESH_REQUIRED'
fi
