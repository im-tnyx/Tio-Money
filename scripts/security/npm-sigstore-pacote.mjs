// Issue #71 Gate 2: sample the *same public registry response bytes* once,
// then verify via two npm-bundled pacote registry/attestation paths.
// NOT the original failed npm CLI HTTP response, NOT a full npm audit replay.
// Raw packuments, keys and attestations are held in memory, never logged/uploaded.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash, createPublicKey } from 'node:crypto';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { get } from 'node:https';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AFFECTED, gitBlobSha1, verifyLock } from './npm-sigstore-diagnostic.mjs';
import { selectLockedTarget } from './npm-sigstore-proof.mjs';
import { checkRegistryPublication } from './npm-sigstore-registry.mjs';
import { PINNED as TOOLCHAINS } from './npm-sigstore-replay.mjs';
import { verifierVersions } from './npm-sigstore-metadata.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const LOCKFILE = join(ROOT, '.github/preview-eas-cli/package-lock.json');
const EXPECTED_LOCK_BLOB = 'fa92a2b84071c5cb974becffd6ac74dabf050989';
const ORIGIN = 'https://registry.npmjs.org';
const MAX_PACKUMENT = 8 * 1024 * 1024;
const MAX_ATTESTATIONS = 3 * 1024 * 1024;
const MAX_KEYS = 128 * 1024;
const KEY_ID = 'SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U';
const PIN = '+xkKRiEjRDUAy822UZYj5xeenzjYStTpNity0raLYsE=';


const sha256 = value => createHash('sha256').update(value).digest('hex');

export function checkedRegistryPath(raw, permittedPaths) {
  assert.ok(typeof raw === 'string' && raw.length < 320,
    'PACOTE_UNBOUNDED_REQUEST_PATH');
  const url = new URL(raw, 'http://127.0.0.1');
  assert.equal(url.search, '', 'PACOTE_REQUEST_QUERY_REJECTED');
  assert.equal(url.hash, '', 'PACOTE_REQUEST_FRAGMENT_REJECTED');
  const decoded = decodeURIComponent(url.pathname);
  assert.ok(!decoded.includes('%') && !decoded.includes('..') &&
    !decoded.includes('\\') && permittedPaths.has(decoded),
  'PACOTE_UNREVIEWED_REQUEST_PATH');
  return decoded;
}

export function inspectFrozenTarget(name, version, packument, attestations,
  publicKeys, lock) {
  assert.match(name, /^@babel\/[a-z0-9-]+$/, 'PACOTE_UNREVIEWED_PACKAGE');
  assert.match(version, /^\d+\.\d+\.\d+$/, 'PACOTE_UNREVIEWED_VERSION');
  assert.equal(packument?.name, name, 'PACOTE_PACKUMENT_NAME_CHANGED');
  const versioned = packument?.versions?.[version];
  assert.ok(versioned, 'PACOTE_VERSION_NOT_IN_PACKUMENT');
  const { manifest, copies } = selectLockedTarget(lock, name, version);
  checkRegistryPublication(versioned, publicKeys, lock, name, version);
  assert.equal(versioned.dist?.integrity, manifest.integrity,
    'PACOTE_COMMITTED_INTEGRITY_CHANGED');
  assert.equal(versioned.dist?.tarball, manifest.resolved,
    'PACOTE_COMMITTED_TARBALL_CHANGED');
  const attestationURL = new URL(versioned.dist?.attestations?.url);
  assert.equal(attestationURL.origin, ORIGIN, 'PACOTE_ATTESTATION_ORIGIN_CHANGED');
  assert.equal(attestationURL.search, '', 'PACOTE_ATTESTATION_QUERY_REJECTED');
  const expected = '/-/npm/v1/attestations/' +
    encodeURIComponent(name) + '@' + encodeURIComponent(version);
  assert.equal(decodeURIComponent(attestationURL.pathname),
    decodeURIComponent(expected), 'PACOTE_ATTESTATION_IDENTITY_CHANGED');
  assert.ok(Array.isArray(attestations?.attestations) &&
    attestations.attestations.length > 0 &&
    attestations.attestations.length <= 8,
  'PACOTE_MISSING_OR_EXCESSIVE_ATTESTATIONS');
  assert.equal(attestations.attestations.filter(x =>
    x?.predicateType?.startsWith('https://slsa.dev/provenance/')).length, 1,
  'PACOTE_SLSA_PROVENANCE_AMBIGUOUS');
  return {
    name, version, copies, integrity: manifest.integrity,
    packumentPath: '/' + name,
    attestationPath: decodeURIComponent(expected),
  };
}

export async function readPublicBytes(url, maxBytes) {
  assert.ok(url instanceof URL && url.origin === ORIGIN &&
    !url.username && !url.password && !url.search && !url.hash,
  'PACOTE_PUBLIC_REGISTRY_ONLY');
  assert.ok(Number.isInteger(maxBytes) && maxBytes > 0 &&
    maxBytes <= MAX_PACKUMENT, 'PACOTE_INVALID_RESPONSE_LIMIT');
  return new Promise((resolve, reject) => {
    const req = get(url, { timeout: 12000, headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'identity',
    } }, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error('PACOTE_SOURCE_HTTP_NON_200')); return;
      }
      const chunks = [];
      let total = 0;
      response.on('data', buf => {
        total += buf.length;
        if (total > maxBytes) {
          response.destroy(new Error('PACOTE_SOURCE_SIZE_EXCEEDED')); return;
        }
        chunks.push(buf);
      });
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', () => reject(new Error('PACOTE_SOURCE_STREAM_FAILED')));
    });
    req.on('timeout', () => req.destroy());
    req.on('error', () => reject(new Error('PACOTE_SOURCE_NETWORK_FAILED')));
  });
}

export function pinnedPublicKeys(keys) {
  assert.ok(Array.isArray(keys?.keys) && keys.keys.length >= 1 &&
    keys.keys.length <= 6, 'PACOTE_UNEXPECTED_KEY_COUNT');
  const current = keys.keys.filter(x => x?.keyid === KEY_ID);
  assert.equal(current.length, 1, 'PACOTE_CURRENT_PINNED_KEY_MISSING');
  const keyBytes = Buffer.from(current[0].key || '', 'base64');
  assert.equal(createHash('sha256').update(keyBytes).digest('base64'),
    PIN, 'PACOTE_PUBLIC_KEY_PIN_CHANGED');
  return keys.keys.map(value => {
    assert.ok(/^SHA256:[A-Za-z0-9+/=]{20,100}$/.test(value?.keyid || ''),
      'PACOTE_KEY_ID_UNREVIEWED');
    assert.equal(value.keytype, 'ecdsa-sha2-nistp256',
      'PACOTE_SIGNING_ALGORITHM_UNREVIEWED');
    const der = Buffer.from(value.key || '', 'base64');
    assert.ok(der.length > 64 && der.length < 512,
      'PACOTE_PUBLIC_KEY_SIZE_INVALID');
    const key = createPublicKey({ key: der, type: 'spki', format: 'der' });
    assert.equal(key.asymmetricKeyDetails?.namedCurve, 'prime256v1',
      'PACOTE_UNEXPECTED_KEY_CURVE');
    return {
      keyid: value.keyid, expires: value.expires,
      pemkey: key.export({ type: 'spki', format: 'pem' }),
    };
  });
}

export async function sampleOfficialPublicEvidence(lock, targets,
  read = readPublicBytes) {
  const entries = new Map();
  const digestRecords = [];
  const keyURL = new URL('/-/npm/v1/keys', ORIGIN);
  const keyBuf = await read(keyURL, MAX_KEYS);
  const keys = JSON.parse(keyBuf.toString('utf8'));
  const localKeys = pinnedPublicKeys(keys);
  for (const [name, version] of Object.entries(targets)) {
    const packPath = '/' + name;
    const packURL = new URL('/' + encodeURIComponent(name), ORIGIN);
    const packBytes = await read(packURL, MAX_PACKUMENT);
    const packument = JSON.parse(packBytes.toString('utf8'));
    const detail = packument?.versions?.[version]?.dist?.attestations?.url;
    assert.ok(typeof detail === 'string' && detail.length < 320,
      'PACOTE_LOCKED_ATTESTATION_URL_MISSING');
    const attURL = new URL(detail);
    assert.equal(attURL.origin, ORIGIN, 'PACOTE_UNTRUSTED_ATTESTATION_HOST');
    const attBytes = await read(attURL, MAX_ATTESTATIONS);
    const attestations = JSON.parse(attBytes.toString('utf8'));
    const target = inspectFrozenTarget(name, version, packument,
      attestations, keys, lock);
    assert.equal(packPath, target.packumentPath, 'PACOTE_INVALID_PACKUMENT_PATH');
    for (const [path, bytes] of [
      [target.packumentPath, packBytes],
      [target.attestationPath, attBytes],
    ]) {
      assert.ok(!entries.has(path), 'PACOTE_DUPLICATE_CAPTURED_PATH');
      entries.set(path, bytes);
    }
    digestRecords.push({
      name, version, lockedCopies: target.copies,
      packumentSha256: sha256(packBytes), attestationSha256: sha256(attBytes),
    });
  }
  return {
    entries, publicKeys: localKeys, keysetSha256: sha256(keyBuf),
    samples: digestRecords, sourced: 'PUBLIC_REGISTRY_SAMPLED_ONCE',
    originalFailedHttpResponseCaptured: false,
  };
}

export async function localFrozenRegistry(entries) {
  assert.ok(entries instanceof Map && entries.size > 0 && entries.size <= 12,
    'PACOTE_INVALID_CAPTURE_SET');
  const counts = new Map();
  const perClient = new Map();
  let activeClient = 'UNSET';
  let rejectedRequests = 0;
  const allowed = new Set(entries.keys());
  const server = createServer((req, res) => {
    let path;
    try {
      assert.equal(req.method, 'GET', 'PACOTE_ONLY_GET_ALLOWED');
      path = checkedRegistryPath(req.url || '', allowed);
    } catch {
      rejectedRequests++;
      res.writeHead(403, { 'Content-Length': '0' });
      res.end(); return;
    }
    const bytes = entries.get(path);
    counts.set(path, (counts.get(path) || 0) + 1);
    const key = activeClient + '|' + path;
    perClient.set(key, (perClient.get(key) || 0) + 1);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Content-Length': String(bytes.length),
    });
    res.end(bytes);
  });
  try {
    await new Promise((ok, fail) => {
      server.once('error', fail);
      server.listen(0, '127.0.0.1', ok);
    });
  } catch {
    server.close();
    throw new Error('PACOTE_LOOPBACK_BIND_FAILED');
  }
  const address = server.address();
  assert.ok(address && typeof address !== 'string', 'PACOTE_INVALID_LOOPBACK');
  return {
    registry: 'http://127.0.0.1:' + address.port + '/',
    counts, perClient,
    setClient: value => {
      assert.ok(value === 'npm10' || value === 'npm11',
        'PACOTE_UNREVIEWED_CLIENT_LABEL');
      activeClient = value;
    },
    getRejectedRequests: () => rejectedRequests,
    close: () => new Promise((ok, fail) =>
      server.close(err => err ? fail(new Error('PACOTE_LOOPBACK_CLOSE_FAILED')) : ok())),
  };
}

export function loadBundledPacote(globalRoot, npmVersion) {
  assert.ok(isAbsolute(globalRoot) && globalRoot.length < 500,
    'PACOTE_UNREVIEWED_GLOBAL_ROOT');
  const npmPackage = join(globalRoot, 'npm', 'package.json');
  const npmManifest = JSON.parse(readFileSync(npmPackage, 'utf8'));
  const expected = npmVersion === '10.9.2' ? TOOLCHAINS.npm10 :
    npmVersion === '11.19.1' ? TOOLCHAINS.npm11 : null;
  assert.ok(expected, 'PACOTE_UNREVIEWED_NPM_VERSION');
  const versions = verifierVersions(globalRoot);
  for (const [name, version] of Object.entries(expected)) {
    assert.equal(versions[name], version, 'PACOTE_BUNDLED_SIGSTORE_UNREVIEWED_' + name);
  }
  assert.equal(npmManifest.version, npmVersion,
    'PACOTE_NPM_VERSION_NOT_PINNED');
  const requireFromNpm = createRequire(npmPackage);
  const pacote = requireFromNpm('pacote');
  const pm = JSON.parse(readFileSync(join(globalRoot, 'npm',
    'node_modules', 'pacote', 'package.json'), 'utf8'));
  assert.match(pm.version, /^\d+\.\d+\.\d+$/, 'PACOTE_VERSION_UNAVAILABLE');
  assert.equal(typeof pacote.manifest, 'function', 'PACOTE_MANIFEST_UNAVAILABLE');
  return { pacote, pacoteVersion: pm.version, npmVersion };
}

export async function compareFrozenPacotePaths(fixture, clients, tmp,
  runManifest = (client, id, opts) => client.pacote.manifest(id, opts)) {
  assert.ok(isAbsolute(tmp), 'PACOTE_TEMP_ROOT_NOT_ABSOLUTE');
  assert.equal(clients.length, 2, 'PACOTE_REQUIRES_TWO_CLIENTS');
  const local = await localFrozenRegistry(fixture.entries);
  const results = [];
  try {
    const parsed = new URL(local.registry);
    const keyOption = '//' + parsed.host + parsed.pathname + ':_keys';
    for (const [name, index] of [['npm10', 0], ['npm11', 1]]) {
      const client = clients[index];
      local.setClient(name);
      const packages = [];
      for (const item of fixture.samples) {
        let status = 'REJECTED';
        const id = item.name + '@' + item.version;
        try {
          const options = {
            registry: local.registry,
            '@babel:registry': local.registry,
            [keyOption]: fixture.publicKeys,
            verifySignatures: true, verifyAttestations: true,
            fullMetadata: true, preferOffline: false, offline: false,
            fetchRetries: 0, fetchRetryFactor: 1, fetchRetryMintimeout: 100,
            cache: join(tmp, name, 'pacote-cache'),
            tufCache: join(tmp, name, 'tuf-cache'),
            tufForceCache: true,
          };
          const mani = await runManifest(client, id, options);
          assert.equal(mani?._id, id, 'PACOTE_RESULT_IDENTITY_MISMATCH');
          assert.ok(Array.isArray(mani?._signatures) &&
            mani._signatures.length > 0, 'PACOTE_SIGNED_METADATA_NOT_VERIFIED');
          assert.ok(mani?._attestations, 'PACOTE_ATTESTATION_NOT_VERIFIED');
          status = 'PASS';
        } catch {
          // Omit all library exceptions: some include signed bundles / certs.
          status = 'REJECTED';
        }
        packages.push({ packageId: id, status });
      }
      results.push({
        npm: client.npmVersion, pacote: client.pacoteVersion,
        client: name, packages,
      });
    }
    const hits = fixture.samples.map(item => {
      const target = '/' + item.name;
      const attest = '/-/npm/v1/attestations/' + item.name + '@' + item.version;
      return {
        packageId: item.name + '@' + item.version,
        capturedPackumentSha256: item.packumentSha256,
        capturedAttestationSha256: item.attestationSha256,
        npm10PackumentRequests: local.perClient.get('npm10|' + target) || 0,
        npm11PackumentRequests: local.perClient.get('npm11|' + target) || 0,
        npm10AttestationRequests: local.perClient.get('npm10|' + attest) || 0,
        npm11AttestationRequests: local.perClient.get('npm11|' + attest) || 0,
      };
    });
    // Each client must make a live in-process read of the same loopback bytes.
    const allReadTwice = hits.every(item =>
      item.npm10PackumentRequests === 1 && item.npm11PackumentRequests === 1 &&
      item.npm10AttestationRequests === 1 && item.npm11AttestationRequests === 1);
    const allPassed = results.every(x =>
      x.packages.every(y => y.status === 'PASS'));
    const valid = local.getRejectedRequests() === 0 && allReadTwice;
    const verdict = allPassed && valid ? 'BOTH_PASS_SAME_FIXTURE'
      : 'DIFFERENTIAL_REJECTION_OR_UNEXPECTED_HTTP';
    return {
      verdict, fixtureScope: 'ONE_PUBLIC_SAMPLE_PER_PACKAGE_REPLAYED_TO_BOTH_PACOTE_CLIENTS',
      historicFailureHttpBytes: 'NOT_CAPTURED',
      fullNpmCliAuditSignaturesReplayed: false,
      independentOutOfBandTufRootPin: 'UNVERIFIED',
      sameCapturedBytes: allReadTwice,
      unreviewedHttpRequests: local.getRejectedRequests(),
      evidence: hits, clients: results,
      publicKeysetSha256: fixture.keysetSha256,
      noRawNetworkResponsesOrCredentialsPublished: true,
    };
  } finally {
    await local.close();
  }
}

export async function main() {
  let temp;
  let stage = 'INIT';
  let outcome = 'FAIL_CLOSED';
  let report = null;
  try {
    stage = 'LOCK';
    const raw = readFileSync(LOCKFILE);
    assert.equal(gitBlobSha1(raw), EXPECTED_LOCK_BLOB,
      'PACOTE_IMMUTABLE_LOCK_CHANGED');
    const lock = JSON.parse(raw.toString('utf8'));
    verifyLock(lock, raw);
    stage = 'TOOLCHAINS';
    const npm10 = loadBundledPacote(process.env.NPM10_GLOBAL_ROOT || '', '10.9.2');
    const npm11 = loadBundledPacote(process.env.NPM11_GLOBAL_ROOT || '', '11.19.1');
    temp = mkdtempSync(join(tmpdir(), 'tm-public-fixture-'));
    stage = 'PUBLIC_CAPTURE';
    const fixture = await sampleOfficialPublicEvidence(lock, AFFECTED);
    stage = 'PACOTE_COMPARE';
    report = await compareFrozenPacotePaths(fixture, [npm10, npm11], temp);
    outcome = report.verdict;
    if (outcome !== 'BOTH_PASS_SAME_FIXTURE') process.exitCode = 1;
  } catch {
    // Never render URLs, raw npm errors, registry JSON, tokens, certs or stacks.
    report = { stage, outcome: 'UNVERIFIED_OR_REJECTED' };
    process.exitCode = 1;
  } finally {
    if (temp) rmSync(temp, { recursive: true, force: true });
    console.log(JSON.stringify({
      gate: 'TM-SEC-71-FROZEN-PACOTE', outcome, report,
      originalFirstFailureUnwaived: true, noSecretOrBundleOutput: true,
    }, null, 2));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
