// Issue #72: TEMPORARY NEGATIVE MERGE-GATE PROBE — DO NOT MERGE.
// Deliberately fails static Phase 0 CI in this isolated PR only.
// No credentials, external calls, app changes, or privileged workflows.
import assert from 'node:assert/strict';
import { test } from 'node:test';

test('issue 72: required static check blocks an intentionally failing pull request', () => {
  assert.fail('ISSUE_72_NEGATIVE_CI_PROBE_INTENTIONAL_FAILURE_DO_NOT_MERGE');
});
