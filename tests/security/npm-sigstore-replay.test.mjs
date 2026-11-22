import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { compareOneCapturedBundle, compareCapturedTargets,
  verifyReplayToolchainVersions, PINNED } from '../../scripts/security/npm-sigstore-replay.mjs';

function fixture() {
  const name = '@babel/helper-compilation-targets', version = '7.29.13';
  const bytes = Buffer.from('same-response-dummy-archive');
  const manifest = {
    version, integrity: 'sha512-' + createHash('sha512').update(bytes).digest('base64'),
    resolved: 'https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.29.13.tgz',
  };
  const envelope = {
    payloadType: 'application/vnd.in-toto+json',
    payload: Buffer.from(JSON.stringify({ subject: [{
      name: 'pkg:npm/%40babel/helper-compilation-targets@7.29.13',
      digest: { sha512: createHash('sha512').update(bytes).digest('hex') },
    }] })).toString('base64'),
    signatures: [{ sig: 'c2lnbmVk' }],
  };
  const bundle = { dsseEnvelope: envelope, verificationMaterial: {
    certificate: { rawBytes: 'Y2VydA==' },
    tlogEntries: [{ inclusionPromise: { signedEntryTimestamp: 'c2V0' } }],
  } };
  return { name, version, bytes, bundle, manifest,
    lock: { packages: { ['node_modules/' + name]: manifest } } };
}

test('both pinned npm toolchains require exact reviewed verifier versions', () => {
  verifyReplayToolchainVersions(PINNED.npm10, PINNED.npm10);
  verifyReplayToolchainVersions(PINNED.npm11, PINNED.npm11);
  assert.throws(() => verifyReplayToolchainVersions(
    { ...PINNED.npm10, sigstoreVerify: '1.0.0' }, PINNED.npm10),
  /REPLAY_UNREVIEWED_TOOLCHAIN_VERSION/);
});

test('one identical DSSE bundle is passed independently to both clients', async () => {
  const { bundle } = fixture();
  const inputs = [];
  const verifier = async b => { inputs.push(JSON.stringify(b)); };
  const sample = compareOneCapturedBundle(bundle, verifier, verifier, {}, {});
  const report = await sample.verifyBoth();
  assert.deepEqual(inputs, [JSON.stringify(bundle), JSON.stringify(bundle)]);
  assert.equal(report.npm10Sigstore, 'PASS');
  assert.equal(report.npm11Sigstore, 'PASS');
  assert.equal(report.sameCapturedBundleSha256, sample.payloadSha256);
});

test('one verifier rejection never becomes an overall PASS or secret disclosure', async () => {
  const { bundle } = fixture();
  const v10 = async () => { throw Error('private=DO-NOT-LOG'); };
  const v11 = async () => true;
  const result = await compareOneCapturedBundle(bundle, v10, v11, {}, {}).verifyBoth();
  assert.equal(result.npm10Sigstore, 'REJECTED');
  assert.equal(result.npm11Sigstore, 'PASS');
  assert.ok(!JSON.stringify(result).includes('DO-NOT-LOG'));
});

test('one captured public response reused across both pinned verifiers for each target', async () => {
  const f = fixture();
  let fetches = 0;
  const response = async () => { fetches++; return { attestations: [{
    predicateType: 'https://slsa.dev/provenance/v1', bundle: f.bundle,
  }] }; };
  const check = await compareCapturedTargets(f.lock, { [f.name]: f.version },
    async () => true, async () => true, '/tmp/tio-replay-fixture',
    response, async () => f.bytes);
  assert.equal(check.status, 'BOTH_PASS_SAMPLED_BUNDLES');
  assert.equal(fetches, 1);
  assert.equal(check.results[0].lockedCopies, 1);
  assert.equal(check.historicalRootCause, 'UNVERIFIED');
  assert.equal(check.actualNpmAuditCliOfflineReplay, 'NOT_PERFORMED');
  assert.equal(check.rawNetworkDataStoredOrUploaded, false);
});

test('missing signed Rekor promise and altered tarball cannot be falsely verified', async () => {
  const f = fixture();
  const bad = structuredClone(f.bundle);
  delete bad.verificationMaterial.tlogEntries[0].inclusionPromise;
  const response = async () => ({ attestations: [{
    predicateType: 'https://slsa.dev/provenance/v1', bundle: bad,
  }] });
  await assert.rejects(compareCapturedTargets(f.lock, { [f.name]: f.version },
    async () => true, async () => true, '/tmp/tio-replay-fixture',
    response, async () => f.bytes), /REPLAY_REKOR_PROMISE_MISSING/);
  await assert.rejects(compareCapturedTargets(f.lock, { [f.name]: f.version },
    async () => true, async () => true, '/tmp/tio-replay-fixture',
    async () => ({ attestations: [{
      predicateType: 'https://slsa.dev/provenance/v1', bundle: f.bundle,
    }] }), async () => Buffer.from('tampered')), /REPLAY_COMMITTED_SRI_MISMATCH/);
});
