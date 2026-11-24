import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const APPROVED_CHECKOUT_SHA = '3d3c42e5aac5ba805825da76410c181273ba90b1';

// Checkout v7.0.1 official tag and commit signature were independently verified.
// Every future upstream revision must receive a new security review.
const WORKFLOWS = [
  '.github/workflows/ai-governance-checks.yml',
  '.github/workflows/phase-0-checks.yml',
  '.github/workflows/tio-money-eas-pr-preview.yml',
];

for (const path of WORKFLOWS) {
  test(path + ' uses exact reviewed checkout and no persisted credentials', () => {
    const workflow = readFileSync(join(ROOT, path), 'utf8');
    const matches = [...workflow.matchAll(/^\s*(?:-\s*)?uses:\s*actions\/checkout@([^\s#]+)/gm)];
    const expected = path.endsWith('tio-money-eas-pr-preview.yml') ? 4 : 1;
    assert.equal(matches.length, expected, 'Expected reviewed checkout steps: ' + path);
    assert.doesNotMatch(workflow, /allow-unsafe-pr-checkout\s*:/,
      'Never bypass checkout v7 fork-PR restrictions: ' + path);

    // Only the checkout step counts: a later step must not satisfy the assertion.
    for (const match of matches) {
      assert.equal(match[1], APPROVED_CHECKOUT_SHA, 'Unapproved checkout action SHA: ' + path);
      const step = workflow.slice(match.index).split(/\n(?=      - (?:name|uses):)/m)[0];
      assert.match(step, /^\s+persist-credentials:\s*false\s*$/m,
        'Checkout must not persist workflow token: ' + path);
    }
  });
}

test('trusted preview checkout refs and separate authorization remain intact', () => {
  const read = (path) => readFileSync(join(ROOT, path), 'utf8');
  const workflow = read(WORKFLOWS[2]);
  const selection = workflow.indexOf('  select:');
  const codespaces = workflow.slice(workflow.indexOf('  codespaces_live:'), selection);
  const eas = workflow.slice(selection);
  const governance = read(WORKFLOWS[0]);

  const eligibility = workflow.slice(workflow.indexOf('  codespaces_eligibility:'), workflow.indexOf('  codespaces_live:'));
  assert.ok(eligibility.includes('ref: ' + '$' + '{{ github.sha }}'));
  assert.ok(codespaces.includes('ref: ' + '$' + '{{ github.sha }}'));
  assert.ok(eas.includes('ref: ' + '$' + '{{ steps.pr.outputs.head_sha }}'));
  assert.ok(eas.includes('if [[ "$(git rev-parse HEAD)" != "$PR_SHA" ]]'));
  const validation = eas.slice(eas.indexOf('  validate:'), eas.indexOf('  preview:'));
  const publishing = eas.slice(eas.indexOf('  preview:'));
  assert.doesNotMatch(validation, /^    environment:|secrets\.EXPO_TOKEN/m);
  assert.match(validation, /npm run check/);
  assert.match(publishing, /needs: \[select, validate\]/);
  assert.match(publishing, /PR advanced since secretless validation/);
  assert.doesNotMatch(publishing, /npm run check/);
  assert.ok(governance.includes('submodules: false'));
  assert.doesNotMatch(codespaces, /^\s*pull_request_target:/m);
  assert.doesNotMatch(eas, /^\s*pull_request_target:/m);
});
