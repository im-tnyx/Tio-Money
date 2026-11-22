import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { test } from 'node:test';
import { dssePae, downloadRegistryTarball, downloadRegistryAttestations,
  verifyDsseWithPublicKey,
  verifySignedSubject, verifyTargetProofs, selectLockedTarget, selectVerifiedLockedTarget }
  from '../../scripts/security/npm-sigstore-proof.mjs';

test('DSSE PAE signature verifies against embedded leaf public key only', () => {
  const keys = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const envelope = {
    payloadType: 'application/vnd.in-toto+json',
    payload: Buffer.from('{"subject":[]}').toString('base64'),
  };
  envelope.signatures = [{ sig: sign('sha256', dssePae(envelope), keys.privateKey)
    .toString('base64') }];
  assert.equal(verifyDsseWithPublicKey(envelope, keys.publicKey), true);
  const tampered = { ...envelope, payload: Buffer.from('{"subject":[1]}').toString('base64') };
  assert.equal(verifyDsseWithPublicKey(tampered, keys.publicKey), false);
});

test('signed package subject name and digest must match actual tarball bytes', () => {
  const tarball = Buffer.from('synthetic-tarball');
  const digest = createHash('sha512').update(tarball).digest('hex');
  const statement = { subject: [{ name: 'pkg:npm/%40babel/generator@7.29.15',
    digest: { sha512: digest } }] };
  assert.equal(verifySignedSubject(statement, '@babel/generator', '7.29.15',
    tarball).sha512, digest);
  assert.throws(() => verifySignedSubject(statement, '@babel/generator', '7.29.14',
    tarball), /MISSING_OR_AMBIGUOUS_PACKAGE_SUBJECT/);
  statement.subject[0].digest.sha512 = 'f'.repeat(128);
  assert.throws(() => verifySignedSubject(statement, '@babel/generator', '7.29.15',
    tarball), /ATTESTED_SHA512_TARBALL_MISMATCH/);
});

test('cannot pass aggregate counts without exact per-package DSSE bundles', async () => {
  const bytes = Buffer.from('synthetic-tarball');
  const integrity = createHash('sha512').update(bytes).digest('base64');
  const name = '@babel/generator';
  const lock = { packages: { ['node_modules/' + name]: {
    version: '7.29.15', integrity: 'sha512-' + integrity,
    resolved: 'https://registry.npmjs.org/@babel/generator/-/generator-7.29.15.tgz',
  } } };
  const fetch = async () => bytes;
  await assert.rejects(verifyTargetProofs([], lock, { [name]: '7.29.15' }, fetch),
    /MISSING_OR_AMBIGUOUS_VERIFIED_PACKAGE/);
  const verified = [{ name, version: '7.29.15', attestations: {
    url: 'https://registry.npmjs.org/-/npm/v1/attestations/@babel/generator@7.29.15',
    bundles: [],
  } }];
  const emptyAttestations = async () => ({ attestations: [] });
  await assert.rejects(verifyTargetProofs(verified, lock, { [name]: '7.29.15' },
    fetch, emptyAttestations), /NO_PACKAGE_SPECIFIC_DSSE_BUNDLE/);
  lock.packages['node_modules/' + name].integrity = 'sha512-bogus';
  await assert.rejects(verifyTargetProofs(verified, lock, { [name]: '7.29.15' },
    fetch), /REGISTRY_TARBALL_SRI_MISMATCH/);
});

test('tarball downloader never follows unrelated registry URLs', async () => {
  await assert.rejects(downloadRegistryTarball('https://evil.invalid/archive.tgz'),
    /UNTRUSTED_TARBALL_ORIGIN/);
  await assert.rejects(downloadRegistryTarball(
    'https://registry.npmjs.org/@babel/generator/-/generator-7.29.15.tgz?token=x'),
  /TARBALL_URL_WITH_EXTRA_PARAMETERS/);
});


test('public attestation endpoint must match exact package and version', async () => {
  await assert.rejects(downloadRegistryAttestations(
    'https://attacker.invalid/-/npm/v1/attestations/@babel/generator@7.29.15',
    '@babel/generator', '7.29.15'), /UNTRUSTED_ATTESTATION_ORIGIN/);
  await assert.rejects(downloadRegistryAttestations(
    'https://registry.npmjs.org/-/npm/v1/attestations/@babel/generator@7.29.14',
    '@babel/generator', '7.29.15'), /ATTESTATION_PACKAGE_IDENTITY_MISMATCH/);
  await assert.rejects(downloadRegistryAttestations(
    'https://registry.npmjs.org/-/npm/v1/attestations/@babel/generator@7.29.15?token=1',
    '@babel/generator', '7.29.15'), /ATTESTATION_URL_WITH_EXTRA_PARAMETERS/);
});


test('registry key-signed publish evidence cannot replace Fulcio provenance', async () => {
  const name = '@babel/generator';
  const version = '7.29.15';
  const bytes = Buffer.from('synthetic-tarball');
  const digest = createHash('sha512').update(bytes).digest('hex');
  const lock = { packages: { ['node_modules/' + name]: {
    version, integrity: 'sha512-' + createHash('sha512').update(bytes).digest('base64'),
    resolved: 'https://registry.npmjs.org/@babel/generator/-/generator-7.29.15.tgz',
  } } };
  const statement = { subject: [{ name: 'pkg:npm/%40babel/generator@7.29.15',
    digest: { sha512: digest } }] };
  const envelope = {
    payloadType: 'application/vnd.in-toto+json',
    payload: Buffer.from(JSON.stringify(statement)).toString('base64'),
    signatures: [{ sig: Buffer.from('fake').toString('base64') }],
  };
  const verified = [{ name, version, attestations: { url:
    'https://registry.npmjs.org/-/npm/v1/attestations/@babel/generator@7.29.15' } }];
  const fetchTarball = async () => bytes;
  const fetchAttestations = async () => ({ attestations: [{
    predicateType: 'https://github.com/npm/attestation/tree/main/specs/publish/v0.1',
    bundle: { dsseEnvelope: envelope,
      verificationMaterial: { publicKey: { hint: 'npm-registry' } } },
  }] });
  await assert.rejects(verifyTargetProofs(verified, lock, { [name]: version },
    fetchTarball, fetchAttestations), /MISSING_FULCIO_PROVENANCE_BUNDLE/);
});


test('fourth target signed subject digest binds only to exact tarball and identity', () => {
  const name = '@babel/helper-compilation-targets';
  const version = '7.29.13';
  const bytes = Buffer.from('synthetic-compilation-targets-archive');
  const digest = createHash('sha512').update(bytes).digest('hex');
  const signed = { subject: [{ name: 'pkg:npm/%40babel/helper-compilation-targets@7.29.13',
    digest: { sha512: digest } }] };
  assert.equal(verifySignedSubject(signed, name, version, bytes).sha512, digest);
  assert.throws(() => verifySignedSubject(signed, name, version, Buffer.from('different')),
    /ATTESTED_SHA512_TARBALL_MISMATCH/);
  assert.throws(() => verifySignedSubject(signed, name, '7.29.14', bytes),
    /MISSING_OR_AMBIGUOUS_PACKAGE_SUBJECT/);
});


test('nested code-frame 7.29.7 is selected, never unrelated root 7.23.5', () => {
  const name = '@babel/code-frame';
  const match = {
    version: '7.29.7', integrity: 'sha512-' + 'a'.repeat(64),
    resolved: 'https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz',
  };
  const copies = { packages: {
    ['node_modules/' + name]: { ...match, version: '7.23.5' },
    ['node_modules/@babel/core/node_modules/' + name]: match,
    ['node_modules/@babel/traverse/node_modules/' + name]: { ...match },
  } };
  const result = selectLockedTarget(copies, name, '7.29.7');
  assert.equal(result.copies, 2);
  assert.equal(result.manifest.version, '7.29.7');
  const wrong = structuredClone(copies);
  wrong.packages['node_modules/@babel/traverse/node_modules/' + name].integrity =
    'sha512-' + 'b'.repeat(64);
  assert.throws(() => selectLockedTarget(wrong, name, '7.29.7'),
    /INCONSISTENT_NESTED_TARGET_SRI/);
  assert.throws(() => selectLockedTarget(copies, name, '7.99.99'),
    /MISSING_EXACT_LOCKED_TARGET/);
});


test('npm11 verified entries must match all three nested code-frame copies exactly', () => {
  const name = '@babel/code-frame', version = '7.29.7';
  const match = { version, integrity: 'sha512-' + 'a'.repeat(64),
    resolved: 'https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz' };
  const lock = { packages: {
    ['node_modules/' + name]: { ...match, version: '7.23.5' },
    ['node_modules/@babel/core/node_modules/' + name]: match,
    ['node_modules/@babel/traverse/node_modules/' + name]: { ...match },
    ['node_modules/@babel/template/node_modules/' + name]: { ...match },
  } };
  const url = 'https://registry.npmjs.org/-/npm/v1/attestations/@babel/code-frame@7.29.7';
  const entries = Array.from({ length: 3 }, () => ({
    name, version, attestations: { url },
  }));
  const result = selectVerifiedLockedTarget(entries, lock, name, version);
  assert.equal(result.copies, 3);
  assert.equal(result.manifest.version, version);
  assert.throws(() => selectVerifiedLockedTarget(entries.slice(0, 2), lock, name, version),
    /VERIFIED_NESTED_COPY_COUNT_MISMATCH/);
  const altered = structuredClone(entries);
  altered[2].attestations.url = url + '-spoofed';
  assert.throws(() => selectVerifiedLockedTarget(altered, lock, name, version),
    /INCONSISTENT_NESTED_ATTESTATION_URL/);
});
