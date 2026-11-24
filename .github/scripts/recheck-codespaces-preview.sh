#!/usr/bin/env bash
set -euo pipefail
: "${RUNNER_TEMP:?}" "${GITHUB_REPOSITORY:?}" "${TARGET_PR:?}" "${PR_SHA:?}" "${PR_BASE_SHA:?}"
gh api --paginate --slurp "repos/${GITHUB_REPOSITORY}/issues?state=open&labels=tio-preview&per_page=100" |
  jq -e --argjson number "$TARGET_PR" '
    [ .[][] | select(.pull_request != null) | .number ] == [$number]
  ' >/dev/null
gh api "repos/${GITHUB_REPOSITORY}/pulls/${TARGET_PR}" \
  > "$RUNNER_TEMP/preview-pr-after-paths.json"
jq -e --argjson number "$TARGET_PR" '
  .number == $number and
  .user.id == 271889561 and
  .head.repo.id == 1462654174 and
  .base.repo.id == 1462654174 and
  .base.repo.full_name == "im-tnyx/Tio-Money"
' "$RUNNER_TEMP/preview-pr-after-paths.json" >/dev/null
node .github/scripts/verify-pr-preview-pr-snapshot.mjs \
  "$RUNNER_TEMP/preview-pr.json" \
  "$RUNNER_TEMP/immutable-pr-compare.json" \
  "$RUNNER_TEMP/preview-pr-after-paths.json" \
  "$PR_SHA" "$PR_BASE_SHA" \
  > "$RUNNER_TEMP/preview-pr-changed-paths.txt"
count=0
rejected=0
while IFS= read -r path; do
  [[ -z "$path" ]] && continue
  count=$((count + 1))
  case "$path" in
    src/*|assets/*|tests/*|docs/*|.ai/*|README.md|DESIGN.md|CHANGELOG.md)
      ;;
    *)
      echo "::error::Unsafe or native/tooling-affecting preview path: $path"
      rejected=1
      ;;
  esac
done < "$RUNNER_TEMP/preview-pr-changed-paths.txt"
if [[ "$count" -eq 0 || "$rejected" -ne 0 ]]; then
  echo "::error::PR preview permits only app UI, tests and documentation; review native/tooling changes separately."
  exit 1
fi
