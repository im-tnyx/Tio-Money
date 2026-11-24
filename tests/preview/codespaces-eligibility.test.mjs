import assert from 'node:assert/strict';
import { test } from 'node:test';
import { authorizePreview } from '../../.github/scripts/authorize-codespaces-preview.mjs';

const owner = { login: 'im-tnyx', id: 271889561 };
const repo = { full_name: 'im-tnyx/Tio-Money', id: 1462654174, owner };
const head = 'a'.repeat(40);
const base = 'b'.repeat(40);
const mergeBase = 'c'.repeat(40);
const branch = 'feat/owner-preview';
const comparePath = `compare/${base}...${head}?per_page=100`;
function fixture(manual = false) {
  const run = {
    id: 8, workflow_id: 424672623, path: '.github/workflows/tio-money-preview-push-signal.yml',
    status: 'completed', conclusion: 'success', event: 'push', run_attempt: 1,
    actor: owner, triggering_actor: owner, repository: repo, head_repository: repo,
    head_branch: branch, head_sha: head,
  };
  const event = structuredClone(manual
    ? { repository: repo, sender: owner, inputs: { operation: 'codespaces_live', pr_number: '97', platform: 'all' } }
    : { repository: repo, action: 'completed', workflow_run: run });
  const context = {
    event: manual ? 'workflow_dispatch' : 'workflow_run', attempt: '1',
    ref: 'refs/heads/main', actor: owner.login, triggeringActor: owner.login,
  };
  const pr = structuredClone({
    number: 97, state: 'open', changed_files: 1, user: owner,
    head: { sha: head, ref: branch, repo }, base: { sha: base, ref: 'main', repo },
    labels: [{ name: 'tio-preview' }],
  });
  const compare = {
    base_commit: { sha: base }, merge_base_commit: { sha: mergeBase },
    total_commits: 1, commits: [{ sha: head }], files: [{ filename: 'src/preview.ts', status: 'modified' }],
  };
  const matches = [{ number: 97, state: 'open' }];
  const active = [{ number: 97, pull_request: {} }];
  const current = structuredClone(pr);
  const sourceRun = structuredClone(run);
  const responses = {
    'actions/runs/8': sourceRun,
    [`commits/${head}/pulls?per_page=100`]: matches,
    [comparePath]: compare,
    'issues?state=open&labels=tio-preview&per_page=100': active,
  };
  const api = (path, paginate) => {
    if (path === 'pulls/97') return seen++ === 0 ? pr : current;
    assert.ok(Object.hasOwn(responses, path), path);
    if (Array.isArray(responses[path])) assert.equal(paginate, true);
    return responses[path];
  };
  let seen = 0;
  return { event, context, pr, compare, sourceRun, matches, active, current, api, responses };
}
const approved = { number: 97, head, base, mergeBase };
const evaluate = (f, expected) => authorizePreview(f.event, f.context, f.api, expected);

for (const manual of [false, true]) {
  test(`owner ${manual ? 'manual' : 'push'} preview approves and revalidates exact SHA tuple`, () => {
    for (const expected of [undefined, approved]) {
      for (const draft of [true, false]) {
        const f = fixture(manual);
        f.pr.draft = f.current.draft = draft;
        if (expected) delete f.responses['actions/runs/8'];
        const { captured, compare, ...tuple } = evaluate(f, expected);
        assert.deepEqual(tuple, approved);
        assert.equal(captured.number, 97);
        assert.equal(compare.base_commit.sha, base);
      }
    }
  });
}

const denials = {
  'Dependabot PR': (f) => { f.pr.user = { login: 'dependabot[bot]', id: 123 }; },
  'unlabeled owner PR': (f) => { f.pr.labels = []; },
  'security workflow change': (f) => { f.compare.files[0].filename = '.github/workflows/signal.yml'; },
  'maintenance lockfile change': (f) => { f.compare.files[0].filename = 'package-lock.json'; },
  'fork PR': (f) => { f.pr.head.repo.id = 123; },
  'foreign base repository': (f) => { f.pr.base.repo = { ...repo, id: 123 }; },
  'non-main base': (f) => { f.pr.base.ref = 'release'; },
  'stale pushed SHA': (f) => { f.pr.head.sha = 'd'.repeat(40); },
  'mismatched signal branch': (f) => { f.event.workflow_run.head_branch += '-old'; },
  'ambiguous matching PRs': (f) => { f.matches.push({ number: 99, state: 'open' }); },
  'ambiguous active labels': (f) => { f.active.push({ number: 99, pull_request: {} }); },
  'unauthorized actor': (f) => { f.sourceRun.actor = { ...owner, id: 1 }; },
  'unauthorized triggering actor': (f) => { f.sourceRun.triggering_actor = { ...owner, id: 1 }; },
  'wrong signal workflow': (f) => { f.sourceRun.workflow_id = 12; },
  'wrong signal path': (f) => { f.sourceRun.path = '.github/workflows/other.yml'; },
  'failed signal': (f) => { f.sourceRun.conclusion = 'failure'; },
  'wrong trigger origin': (f) => { f.sourceRun.event = 'pull_request'; },
  'receiver rerun': (f) => { f.context.attempt = '2'; },
  'signal rerun': (f) => { f.sourceRun.run_attempt = 2; },
  'truncated comparison': (f) => { f.compare.total_commits = 2; },
  'rename from disallowed path': (f) => {
    Object.assign(f.compare.files[0], { status: 'renamed', previous_filename: '.github/config.yml' });
  },
  'PR closed after comparison': (f) => { f.current.state = 'closed'; },
  'label removed after comparison': (f) => { f.current.labels = []; },
  'head moves after comparison': (f) => { f.current.head.sha = 'd'.repeat(40); },
  'base moves after comparison': (f) => { f.current.base.sha = 'd'.repeat(40); },
};
for (const [name, change] of Object.entries(denials)) {
  test(`${name} cannot approve the privileged job`, () => {
    const f = fixture();
    change(f);
    assert.throws(() => evaluate(f));
  });
}

for (const reason of ['403', '500', 'timeout', 'malformed response']) {
  test(`API failure (${reason}) fails closed`, () => {
    const f = fixture();
    const query = f.api;
    f.api = (path, paginate) => {
      if (path === comparePath) throw new Error(reason);
      return query(path, paginate);
    };
    assert.throws(() => evaluate(f), { message: reason });
  });
}

test('manual triggering actor must be the owner', () => {
  const f = fixture(true);
  f.context.triggeringActor = 'other';
  assert.throws(() => evaluate(f), /Manual preview request denied/);
});

test('revalidation rejects drift from the approved tuple', () => {
  for (const field of ['number', 'head', 'base', 'mergeBase']) {
    assert.throws(() => evaluate(fixture(true), { ...approved, [field]: 'stale' }));
  }
});
