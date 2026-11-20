// Trusted-main gate: a variable naming a Codespace is not authorization to
// disrupt an editing workspace. Match independent GitHub-owned identity and
// explicit owner-applied preview-only intent before wake or SSH.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PREVIEW_ONLY_DISPLAY_NAME = 'Tio Money PR Preview Only';
export const KNOWN_EDITING_CODESPACE = 'automatic-orbit-jjxwq55wqr5gcj7gj';

export function requireDedicatedPreviewCodespace(metadata, expectedName, expectedId) {
  if (typeof expectedName !== 'string' ||
      expectedName.length > 128 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(expectedName)) {
    throw new Error('Invalid dedicated preview Codespace name.');
  }
  // Even a mistakenly relabeled or allowlisted owner editing Codespace fails.
  if (expectedName === KNOWN_EDITING_CODESPACE || metadata?.name === KNOWN_EDITING_CODESPACE) {
    throw new Error('Owner editing Codespace is never an eligible preview target.');
  }
  if (typeof expectedId !== 'string' ||
      !/^[1-9][0-9]*$/.test(expectedId) ||
      !Number.isSafeInteger(Number(expectedId))) {
    throw new Error('Missing or invalid preview-only Codespace ID allowlist.');
  }
  if (!metadata || typeof metadata !== 'object' ||
      metadata.name !== expectedName ||
      metadata.id !== Number(expectedId) ||
      metadata.display_name !== PREVIEW_ONLY_DISPLAY_NAME ||
      metadata.repository?.full_name !== 'im-tnyx/Tio-Money' ||
      metadata.owner?.login !== 'im-tnyx') {
    throw new Error('Codespace does not match the dedicated preview-only name, ID, label, owner and repository allowlist.');
  }
  return expectedName;
}

// The GitHub worker runs the same exported predicate tested below; no test-only shortcut.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [file, expectedName, expectedId] = process.argv.slice(2);
    if (!file) throw new Error('Missing Codespace API metadata file.');
    const metadata = JSON.parse(readFileSync(file, 'utf8'));
    requireDedicatedPreviewCodespace(metadata, expectedName, expectedId);
    console.log('Dedicated preview-only Codespace identity verified.');
  } catch (error) {
    console.error(`::error::Preview isolation gate denied: ${error.message}`);
    process.exitCode = 1;
  }
}
