// Issue #71: metadata-only registry trust and verifier comparison; no raw error output.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { get } from 'node:https';
import { join } from 'node:path';

const REGISTRY_KEYS = 'https://registry.npmjs.org/-/npm/v1/keys';

function manifestVersion(path) {
  try {
    const value = JSON.parse(readFileSync(path, 'utf8')).version;
    return /^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(value) ? value : 'UNVERIFIED';
  } catch {
    return 'UNVERIFIED';
  }
}

export function verifierVersions(globalRoot) {
  assert.ok(typeof globalRoot === 'string' && globalRoot.length > 0, 'INVALID_GLOBAL_NPM_ROOT');
  const root = join(globalRoot, 'npm', 'node_modules');
  const sigstore = join(root, 'sigstore');
  const verifyNested = manifestVersion(join(sigstore, 'node_modules', '@sigstore', 'verify',
    'package.json'));
  const verifyRoot = manifestVersion(join(root, '@sigstore', 'verify', 'package.json'));
  return {
    sigstore: manifestVersion(join(sigstore, 'package.json')),
    sigstoreVerify: verifyNested !== 'UNVERIFIED' ? verifyNested : verifyRoot,
    sigstoreTuf: manifestVersion(join(root, '@sigstore', 'tuf', 'package.json')),
    npmCliVerificationLibraryVersionSource: 'installed-package-manifest',
  };
}

export function redactRegistrySigningKeys(document) {
  assert.ok(Array.isArray(document?.keys) && document.keys.length > 0,
    'REGISTRY_KEY_METADATA_MISSING');
  return document.keys.map((key) => {
    assert.match(key?.keyid || '', /^SHA256:[A-Za-z0-9+/=]+$/, 'UNEXPECTED_KEY_ID_FORMAT');
    return {
      keyid: key.keyid,
      expires: typeof key.expires === 'string' ? key.expires : null,
      keytype: typeof key.keytype === 'string' ? key.keytype : null,
      scheme: typeof key.scheme === 'string' ? key.scheme : null,
      publicKeyMaterialRetained: false,
    };
  }).sort((a, b) => a.keyid.localeCompare(b.keyid));
}

export async function fetchRegistrySigningKeyMetadata() {
  return new Promise((resolve, reject) => {
    const req = get(REGISTRY_KEYS, { timeout: 20000,
      headers: { Accept: 'application/json' } }, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error('REGISTRY_KEY_METADATA_HTTP_NOT_200'));
        return;
      }
      let size = 0;
      const chunks = [];
      response.on('data', (chunk) => {
        size += chunk.length;
        if (size > 128 * 1024) {
          response.destroy(new Error('REGISTRY_KEY_METADATA_SIZE_LIMIT'));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => {
        try {
          resolve(redactRegistrySigningKeys(JSON.parse(Buffer.concat(chunks).toString('utf8'))));
        } catch {
          reject(new Error('REGISTRY_KEY_METADATA_INVALID_JSON'));
        }
      });
      response.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error('REGISTRY_KEY_METADATA_TIMEOUT')));
    req.on('error', reject);
  });
}

const escapeRegex = (s) => s.replace(/[.*+?^$()|[\]{}\\]/g, '\\$&');
const codes = ['EINTEGRITY', 'EATTESTATION', 'EINVALIDATTESTATION',
  'EINVALIDSIGNATURE', 'EMISSINGSIGNATURE', 'ECONNRESET',
  'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND', 'E403', 'E404'];

export function identifyInvalidPackages(raw, lock) {
  const value = String(raw || '').slice(0, 1024 * 1024).replace(/\x1b\[[0-9;]*m/g, '');
  const count = /(\d+)\s+packages?\s+(?:have|has)\s+invalid attestations?/i.exec(value);
  const lines = value.split(/\r?\n/);
  const header = lines.findIndex((line) => /\b(?:have|has)\s+invalid attestations?\s*:/i.test(line));
  const section = header >= 0 ? lines.slice(header + 1, header + 24).join('\n') : '';
  const tracked = new Set();
  for (const [path, meta] of Object.entries(lock?.packages || {})) {
    if (!path.startsWith('node_modules/') || typeof meta.version !== 'string') continue;
    const name = path.split('node_modules/').at(-1);
    if (typeof name !== 'string' || name.length > 150 || !/^[a-z0-9@/._-]+$/i.test(name)) continue;
    const packageId = name + '@' + meta.version;
    if (section && new RegExp('(?:^|\\s)' + escapeRegex(packageId) +
      '(?:\\s|\\(|$)').test(section)) {
      tracked.add(packageId);
    }
  }
  return {
    reportedInvalidPackageIds: [...tracked].sort(),
    packageIdentityStatus: tracked.size ? 'REPORTED_IN_INVALID_ATTESTATION_LIST' : 'UNVERIFIED',
    invalidAttestationCount: count ? Number(count[1]) : null,
    npmErrorCodes: codes.filter((code) =>
      new RegExp('(?:^|[^A-Z0-9_])' + escapeRegex(code) + '(?:$|[^A-Z0-9_])', 'i')
        .test(value)),
    rawOutputRetained: false,
  };
}
