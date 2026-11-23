// GitHub compare files are anchored to immutable commit SHAs, not a moving
// /pulls/{number}/files list. Recheck the PR snapshot after fetching the diff.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SHA = /^[0-9a-f]{40}$/;

export function requireImmutablePRChangedPaths(captured, compare, current, headSha, baseSha) {
  if (!SHA.test(headSha) || !SHA.test(baseSha)) {
    throw new Error('Invalid captured PR commit SHAs.');
  }
  if (!captured || !current || captured.state !== 'open' || current.state !== 'open' ||
      captured.number !== current.number ||
      captured.head?.sha !== headSha || current.head?.sha !== headSha ||
      captured.base?.sha !== baseSha || current.base?.sha !== baseSha ||
      captured.head?.ref !== current.head?.ref ||
      captured.head?.ref === 'main' ||
      captured.changed_files !== current.changed_files ||
      captured.user?.login !== 'im-tnyx' || current.user?.login !== 'im-tnyx' ||
      captured.base?.ref !== 'main' || current.base?.ref !== 'main' ||
      captured.head?.repo?.full_name !== 'im-tnyx/Tio-Money' ||
      current.head?.repo?.full_name !== 'im-tnyx/Tio-Money' ||
      !current.labels?.some((label) => label.name === 'tio-preview')) {
    throw new Error('PR changed after immutable head selection or is not eligible.');
  }

  // GitHub Compare API returns an ordered "commits" array, not "head_commit".
  // Fail closed on empty or paginated/truncated commit results: the final
  // returned commit must attest the captured immutable PR head.
  if (compare?.base_commit?.sha !== baseSha ||
      !Number.isSafeInteger(compare?.total_commits) ||
      compare.total_commits < 1 ||
      !Array.isArray(compare.commits) ||
      compare.commits.length !== compare.total_commits ||
      compare.commits.at(-1)?.sha !== headSha ||
      !Array.isArray(compare.files) ||
      compare.files.length !== captured.changed_files ||
      compare.files.length < 1 || compare.files.length > 100) {
    throw new Error('Immutable PR comparison does not match captured commits and file count.');
  }

  const paths = [];
  for (const file of compare.files) {
    if (!file || typeof file.filename !== 'string' ||
        (['renamed', 'copied'].includes(file.status) && typeof file.previous_filename !== 'string')) {
      throw new Error('Incomplete changed-file record.');
    }
    for (const path of [file?.filename, file?.previous_filename].filter((x) => x != null)) {
      if (typeof path !== 'string' || !path || /[\r\n]/.test(path) || path.split('/').some((part) => !part || part === '.' || part === '..')) {
        throw new Error('Invalid or ambiguous changed file path.');
      }
      paths.push(path);
    }
  }
  return paths;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [capturedPath, comparePath, currentPath, headSha, baseSha] = process.argv.slice(2);
    if (!capturedPath || !comparePath || !currentPath) {
      throw new Error('Missing immutable PR evidence files.');
    }
    const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
    const paths = requireImmutablePRChangedPaths(
      read(capturedPath), read(comparePath), read(currentPath), headSha, baseSha,
    );
    for (const path of paths) process.stdout.write(`${path}\n`);
  } catch (error) {
    console.error(`::error::Immutable PR allowlist denied: ${error.message}`);
    process.exitCode = 1;
  }
}
