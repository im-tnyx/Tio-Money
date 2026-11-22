import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { checkedRegistryPath, inspectFrozenTarget,
  compareFrozenPacotePaths } from '../../scripts/security/npm-sigstore-pacote.mjs';

const id = '@babel/helper-module-transforms';
const version = '7.29.13';
const integ = 'sha512-' + Buffer.from('fixture-sri').toString('base64');
const tarball = 'https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.29.13.tgz';
const publicKeyset = { keys: [] };
const attestationPath = '/-/npm/v1/attestations/' + id + '@' + version;
const packumentPath = '/' + id;
const first = Buffer.from('{"sample":"packument"}', 'utf8');
const second = Buffer.from('{"sample":"attestations"}', 'utf8');

test('only exact reviewed public GET paths can be served; path traversal fails', () => {
  const allowed = new Set([packumentPath, attestationPath]);
  assert.equal(checkedRegistryPath('/%40babel%2Fhelper-module-transforms', allowed),
    packumentPath);
  assert.equal(checkedRegistryPath(attestationPath, allowed), attestationPath);
  assert.throws(() => checkedRegistryPath('/%40evil%2Fpackage', allowed),
    /PACOTE_UNREVIEWED_REQUEST_PATH/);
  assert.throws(() => checkedRegistryPath('/%2e%2e/secret', allowed));
  assert.throws(() => checkedRegistryPath(attestationPath + '?auth=secret', allowed),
    /PACOTE_REQUEST_QUERY_REJECTED/);
});

test('exact package + locked digest required before any frozen replay', () => {
  const lock = { packages: { ['node_modules/' + id]: {
    version, integrity: integ, resolved: tarball,
  } } };
  const packument = { name: id, versions: {
    [version]: { name: id, version, dist: {
      integrity: integ, tarball,
      attestations: { url: 'https://registry.npmjs.org' + attestationPath },
      signatures: [{ keyid: 'SHA256:unknown', sig: 'c2ln' }],
    } },
  } };
  // This must reject even before trying to validate any raw sigstore material:
  assert.throws(() => inspectFrozenTarget(id, version, packument,
    { attestations: [{ predicateType: 'https://slsa.dev/provenance/v1' }] },
    publicKeyset, lock));
});

test('same in-memory fixture served to BOTH clients, rejection is fail-closed', async () => {
  const samples = [{
    name: id, version,
    packumentSha256: createHash('sha256').update(first).digest('hex'),
    attestationSha256: createHash('sha256').update(second).digest('hex'),
  }];
  const fixture = {
    entries: new Map([[packumentPath, first], [attestationPath, second]]),
    publicKeys: [], keysetSha256: 'f'.repeat(64), samples,
  };
  let good = 0;
  const run = async (_client, requested, opts) => {
    good++;
    assert.equal(requested, id + '@' + version);
    assert.equal(opts.verifySignatures, true);
    assert.equal(opts.verifyAttestations, true);
    return { _id: requested, _signatures: [{ keyid: 'fixture' }],
      _attestations: { url: 'fixture' } };
  };
  // The mock does not issue loopback requests, so missing reads MUST block.
  const notVerified = await compareFrozenPacotePaths(fixture, [
    { npmVersion: '10.9.2', pacoteVersion: '1.2.3' },
    { npmVersion: '11.19.1', pacoteVersion: '2.3.4' },
  ], '/tmp/tm-frozen-tests', run);
  assert.equal(good, 2);
  assert.equal(notVerified.verdict, 'DIFFERENTIAL_REJECTION_OR_UNEXPECTED_HTTP');
  assert.equal(notVerified.sameCapturedBytes, false);
  assert.equal(notVerified.originalFirstFailureUnwaived, undefined);
  assert.equal(notVerified.noRawNetworkResponsesOrCredentialsPublished, true);
});

test('client exceptions never disclose sensitive data or count as PASS', async () => {
  const fixture = {
    entries: new Map([[packumentPath, first], [attestationPath, second]]),
    publicKeys: [], keysetSha256: 'f'.repeat(64),
    samples: [{ name: id, version, packumentSha256: 'a'.repeat(64),
      attestationSha256: 'b'.repeat(64) }],
  };
  const r = await compareFrozenPacotePaths(fixture, [
    { npmVersion: '10.9.2', pacoteVersion: '1.2.3' },
    { npmVersion: '11.19.1', pacoteVersion: '2.3.4' },
  ], '/tmp/tm-frozen-tests', async () => {
    throw new Error('token=never-publish-secret');
  });
  assert.equal(r.verdict, 'DIFFERENTIAL_REJECTION_OR_UNEXPECTED_HTTP');
  assert.equal(r.clients[0].packages[0].status, 'REJECTED');
  assert.ok(!JSON.stringify(r).includes('never-publish-secret'));
});


test('positive frozen replay requires both client paths to GET the same memory bytes', async () => {
  const fixture = {
    entries: new Map([[packumentPath, first], [attestationPath, second]]),
    publicKeys: [], keysetSha256: 'd'.repeat(64),
    samples: [{ name: id, version, packumentSha256:
      createHash('sha256').update(first).digest('hex'),
    attestationSha256: createHash('sha256').update(second).digest('hex') }],
  };
  const captured = [];
  const mimicPacote = async (_client, requested, opts) => {
    for (const url of [new URL('/%40babel%2Fhelper-module-transforms', opts.registry),
      new URL(attestationPath, opts.registry)]) {
      const response = await fetch(url);
      assert.equal(response.status, 200);
      captured.push(await response.text());
    }
    return { _id: requested, _signatures: [{ keyid: 'synthetic' }],
      _attestations: { url: 'synthetic' } };
  };
  const result = await compareFrozenPacotePaths(fixture, [
    { npmVersion: '10.9.2', pacoteVersion: '1.2.3' },
    { npmVersion: '11.19.1', pacoteVersion: '2.3.4' },
  ], '/tmp/tm-positive-frozen-test', mimicPacote);
  assert.equal(result.verdict, 'BOTH_PASS_SAME_FIXTURE');
  assert.equal(result.sameCapturedBytes, true);
  assert.deepEqual(captured, [
    first.toString(), second.toString(), first.toString(), second.toString(),
  ]);
  assert.equal(result.unreviewedHttpRequests, 0);
  assert.equal(result.evidence[0].npm10AttestationRequests, 1);
  assert.equal(result.evidence[0].npm11AttestationRequests, 1);
});
