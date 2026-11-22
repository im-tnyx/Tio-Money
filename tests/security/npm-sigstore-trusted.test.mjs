import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { enforcePinnedVerifier, trustedVerificationOptions,
  verifyTrustedTargetProvenance, observeVerifiedPublisherSource } from '../../scripts/security/npm-sigstore-trusted.mjs';

const name = '@babel/helper-compilation-targets';
const version = '7.29.13';
const bytes = Buffer.from('synthetic-trusted-target-bytes');
const digest = createHash('sha512').update(bytes).digest('hex');
const lock = { packages: { ['node_modules/' + name]: {
  version, resolved: 'https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.29.13.tgz',
  integrity: 'sha512-' + createHash('sha512').update(bytes).digest('base64'),
} } };
const verified = [{ name, version, attestations: {
  url: 'https://registry.npmjs.org/-/npm/v1/attestations/@babel/helper-compilation-targets@7.29.13',
} }];
const certificate = { rawBytes: Buffer.from('fixture').toString('base64') };
function fixture() {
  return { attestations: [{
    predicateType: 'https://slsa.dev/provenance/v1',
    bundle: {
      dsseEnvelope: {
        payloadType: 'application/vnd.in-toto+json',
        payload: Buffer.from(JSON.stringify({ subject: [{
          name: 'pkg:npm/%40babel/helper-compilation-targets@7.29.13',
          digest: { sha512: digest },
        }] })).toString('base64'),
        signatures: [{ sig: Buffer.from('fixture').toString('base64') }],
      },
      verificationMaterial: {
        certificate, tlogEntries: [{
          inclusionPromise: { signedEntryTimestamp: 'c2lnbmVk' },
        }],
      },
    },
  }] };
}
const temp = '/tmp/tio-sigstore-test';
const fetchTarball = async () => bytes;
const fetchAttestations = async () => fixture();

test('trusted verifier version is pinned to patched npm11-bundled Sigstore', () => {
  const v = { sigstore: '4.1.1', sigstoreVerify: '3.1.1', sigstoreTuf: '4.0.2' };
  assert.doesNotThrow(() => enforcePinnedVerifier(v));
  assert.throws(() => enforcePinnedVerifier({ ...v, sigstoreVerify: '3.1.0' }),
    /TRUST_VERIFIER_VERSION_UNREVIEWED/);
  assert.throws(() => enforcePinnedVerifier({ ...v, sigstore: '4.1.0' }),
    /TRUST_VERIFIER_VERSION_UNREVIEWED/);
});

test('signer policy requires Babel workflow SAN, GitHub OIDC and both CT/Rekor gates', () => {
  const p = trustedVerificationOptions(temp);
  assert.equal(p.certificateIssuer, 'https://token.actions.githubusercontent.com');
  const pattern = new RegExp(p.certificateIdentityURI);
  assert.ok(pattern.test('https://github.com/babel/babel/.github/workflows/release.yml@refs/heads/main'));
  assert.equal(pattern.test('https://github.com/evil/repo/.github/workflows/release.yml@refs/heads/main'), false);
  assert.equal(pattern.test('https://github.com/babel/babel/.github/workflows/release.yml@refs/heads/main?unsafe'), false);
  assert.equal(p.ctlogThreshold, 1);
  assert.equal(p.tlogThreshold, 1);
  assert.equal(p.tufForceCache, false);
  assert.throws(() => trustedVerificationOptions('relative-path'),
    /PRIVATE_TUF_CACHE_PATH_REQUIRED/);
});

test('trusted-root policy applied and tarball subject verified before verifier', async () => {
  let calls = 0;
  const verifier = async (_bundle, payload, opts) => {
    calls += 1;
    assert.equal(payload, undefined);
    assert.equal(opts.tlogThreshold, 1);
    assert.equal(opts.ctlogThreshold, 1);
    assert.equal(opts.certificateIssuer, 'https://token.actions.githubusercontent.com');
  };
  const got = await verifyTrustedTargetProvenance(verified, lock, { [name]: version },
    verifier, temp, fetchTarball, fetchAttestations);
  assert.equal(calls, 1);
  assert.equal(got.length, 1);
  assert.equal(got[0].committedSri, 'PASS');
  assert.equal(got[0].independentOutOfBandTufRootPin, 'UNVERIFIED');
  assert.equal(got[0].independentRegistryPublishKeySignature, 'UNVERIFIED');
});

test('TUF/Rekor evidence absence or corrupt subject cannot be called PASS', async () => {
  const noPromise = async () => {
    const d = fixture();
    delete d.attestations[0].bundle.verificationMaterial.tlogEntries[0].inclusionPromise;
    return d;
  };
  await assert.rejects(verifyTrustedTargetProvenance(verified, lock, { [name]: version },
    async () => true, temp, fetchTarball, noPromise),
  /TRUST_MISSING_SIGNED_REKOR_TIMESTAMP/);
  const badDigest = async () => {
    const d = fixture();
    const e = d.attestations[0].bundle.dsseEnvelope;
    const statement = JSON.parse(Buffer.from(e.payload, 'base64').toString());
    statement.subject[0].digest.sha512 = 'f'.repeat(128);
    e.payload = Buffer.from(JSON.stringify(statement)).toString('base64');
    return d;
  };
  await assert.rejects(verifyTrustedTargetProvenance(verified, lock, { [name]: version },
    async () => true, temp, fetchTarball, badDigest),
  /ATTESTED_SHA512_TARBALL_MISMATCH/);
});

test('untrusted result never leaks thrown verifier text or allows partial success', async () => {
  await assert.rejects(verifyTrustedTargetProvenance(verified, lock, { [name]: version },
    async () => { throw new Error('token=private-never-emit'); },
    temp, fetchTarball, fetchAttestations), err => {
    assert.match(err.message, /TRUSTED_PROVENANCE_CRYPTO_OR_IDENTITY_REJECTED/);
    assert.ok(!err.message.includes('private-never-emit'));
    return true;
  });
  await assert.rejects(verifyTrustedTargetProvenance([], lock, { [name]: version },
    async () => true, temp, fetchTarball, fetchAttestations),
  /MISSING_OR_AMBIGUOUS_VERIFIED_PACKAGE/);
});


test('trusted verification uses exact nested @babel/code-frame version and signed subject', async () => {
  const name = '@babel/code-frame', version = '7.29.7';
  const tarball = Buffer.from('synthetic-code-frame-tarball');
  const digest = createHash('sha512').update(tarball).digest('hex');
  const v = { version,
    integrity: 'sha512-' + createHash('sha512').update(tarball).digest('base64'),
    resolved: 'https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz' };
  const nested = { packages: {
    ['node_modules/' + name]: { ...v, version: '7.23.5' },
    ['node_modules/@babel/core/node_modules/' + name]: v,
    ['node_modules/@babel/template/node_modules/' + name]: { ...v },
  } };
  const verified = Array.from({ length: 2 }, () => ({ name, version, attestations: {
    url: 'https://registry.npmjs.org/-/npm/v1/attestations/@babel/code-frame@7.29.7',
  } }));
  const bundle = {
    dsseEnvelope: { payloadType: 'application/vnd.in-toto+json',
      payload: Buffer.from(JSON.stringify({ subject: [{
        name: 'pkg:npm/%40babel/code-frame@7.29.7',
        digest: { sha512: digest },
      }] })).toString('base64'), signatures: [{ sig: 'c2ln' }] },
    verificationMaterial: { certificate: { rawBytes: 'Y2VydA==' },
      tlogEntries: [{ inclusionPromise: { signedEntryTimestamp: 'c2V0' } }] },
  };
  let verifierCount = 0;
  const check = await verifyTrustedTargetProvenance(verified, nested, { [name]: version },
    async () => { verifierCount += 1; }, temp, async () => tarball,
    async () => ({ attestations: [{ predicateType: 'https://slsa.dev/provenance/v1',
      bundle }] }));
  assert.equal(verifierCount, 1);
  assert.equal(check[0].name, name);
  assert.equal(check[0].committedSri, 'PASS');
  nested.packages['node_modules/@babel/template/node_modules/' + name].integrity = 'sha512-fake';
  await assert.rejects(verifyTrustedTargetProvenance(verified, nested, { [name]: version },
    async () => {}, temp, async () => tarball,
    async () => ({ attestations: [{ predicateType: 'https://slsa.dev/provenance/v1', bundle }] })),
  /INCONSISTENT_NESTED_TARGET_SRI/);
});


// Public source identity observations do not change the existing accepted SAN
// policy. Test the exact workflow/ref, source SHA and run URI shape, then reject
// malicious/unexpected fields without echoing them into GitHub Actions logs.
const sampleSource = (ref, sha = 'a'.repeat(40)) => ({
  predicate: {
    buildDefinition: {
      externalParameters: { workflow: {
        repository: 'https://github.com/babel/babel',
        path: '.github/workflows/release.yml',
        ref,
      } },
      resolvedDependencies: [{
        uri: 'git+https://github.com/babel/babel@' + ref,
        digest: { gitCommit: sha },
      }],
    },
    runDetails: { metadata: {
      invocationId: 'https://github.com/babel/babel/actions/runs/123456789/attempts/1',
    } },
  },
});

test('signed Babel release sample exposes only exact allowlisted public workflow, SHA and run', () => {
  const ref = 'refs/tags/v7.29.15';
  const san = 'URI:https://github.com/babel/babel/.github/workflows/release.yml@' + ref;
  const observation = observeVerifiedPublisherSource(san, sampleSource(ref));
  assert.equal(observation.exactReleaseWorkflowSanStatus, 'OBSERVED_IN_VERIFIED_CERT_SAMPLE');
  assert.equal(observation.signedSlsaWorkflowStatus, 'OBSERVED_IN_SIGNED_SAMPLE');
  assert.equal(observation.signedSourceCommitStatus, 'OBSERVED_IN_SIGNED_SAMPLE');
  assert.equal(observation.signedRunIdentityStatus, 'OBSERVED_IN_SIGNED_SAMPLE');
  assert.equal(observation.refAgreement, 'MATCH');
  assert.equal(observation.signedSourceCommit, 'a'.repeat(40));
  assert.equal(observation.releaseWorkflowSan, san.slice(4));
  assert.equal(observation.npmRegisteredTrustedPublisher, 'UNVERIFIED');
  assert.equal(observation.sourceCommitMatchesOfficialReleaseTree, 'UNVERIFIED');
  assert.equal(observation.rootBootstrapSeparatelyApproved, false);
});

test('signed/public identity mismatch is observed, never treated as approval', () => {
  const signed = sampleSource('refs/tags/v7.29.13');
  const san = 'URI:https://github.com/babel/babel/.github/workflows/release.yml@refs/heads/release';
  const observation = observeVerifiedPublisherSource(san, signed);
  assert.equal(observation.refAgreement, 'MISMATCH');
  assert.equal(observation.npmRegisteredTrustedPublisher, 'UNVERIFIED');
});

test('unknown SAN, unexpected workflow/ref and untrusted strings are redacted', () => {
  const secret = 'token=never-disclose-this';
  const source = sampleSource('refs/heads/../unsafe', secret);
  source.predicate.runDetails.metadata.invocationId =
    'https://evil.example/actions/runs/12?token=' + secret;
  const result = observeVerifiedPublisherSource(
    'URI:https://evil.example/' + secret, source);
  assert.equal(result.exactReleaseWorkflowSanStatus, 'UNVERIFIED');
  assert.equal(result.signedSlsaWorkflowStatus, 'UNVERIFIED');
  assert.equal(result.signedSourceCommitStatus, 'UNVERIFIED');
  assert.equal(result.signedRunIdentityStatus, 'UNVERIFIED');
  assert.equal(result.refAgreement, 'UNVERIFIED');
  assert.ok(!JSON.stringify(result).includes(secret));
  const noCert = observeVerifiedPublisherSource('', sampleSource('refs/tags/v7.29.7'));
  assert.equal(noCert.exactReleaseWorkflowSanStatus, 'UNVERIFIED');
  assert.equal(noCert.signedSlsaWorkflowStatus, 'OBSERVED_IN_SIGNED_SAMPLE');
});
