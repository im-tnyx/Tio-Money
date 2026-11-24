import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { authorizePreview } from '../../.github/scripts/authorize-codespaces-preview.mjs';

const dependabot = { login: 'dependabot[bot]', id: 49699333 };
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
    [`git/ref/heads/${branch}`]: { ref: `refs/heads/${branch}`, object: { sha: head, type: 'commit' } },
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
        assert.deepEqual(tuple, { approved: true, ...approved });
        assert.equal(captured.number, 97);
        assert.equal(compare.base_commit.sha, base);
      }
    }
  });
}

function asDependabotPush(f) {
  f.pr.user = dependabot;
  f.event.workflow_run.actor = dependabot;
  f.sourceRun.actor = f.sourceRun.triggering_actor = dependabot;
}

test('ordinary automatic requests emit explicit non-approval without an approval tuple', () => {
  for (const author of [owner, dependabot]) {
    const f = fixture();
    f.pr.user = author;
    f.pr.labels = [];
    f.compare.files[0].filename = 'package-lock.json';
    delete f.responses[comparePath];
    assert.deepEqual(evaluate(f), { approved: false });
  }
  const f = fixture();
  asDependabotPush(f);
  f.pr.labels = [];
  assert.deepEqual(evaluate(f), { approved: false });
});

test('an owner push without an open PR is a no-op only at the current branch SHA', () => {
  for (const sha of [head, base]) {
    const f = fixture();
    f.matches.length = 0;
    f.responses[`git/ref/heads/${branch}`].object.sha = sha;
    if (sha === head) assert.deepEqual(evaluate(f), { approved: false });
    else assert.throws(() => evaluate(f), /Stale or invalid push ref/);
  }
});

test('missing labels fail for manual requests and privileged revalidation', () => {
  for (const [manual, expected] of [[true, undefined], [false, approved]]) {
    const f = fixture(manual);
    f.pr.labels = [];
    assert.throws(() => evaluate(f, expected), /PR identity or label denied/);
  }
});

test('CLI distinguishes approval, successful no-op and API failure in job outputs', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tio-preview-eligibility-'));
  try {
    const eventFile = join(dir, 'event.json');
    const output = join(dir, 'output');
    const script = fileURLToPath(new URL('../../.github/scripts/authorize-codespaces-preview.mjs', import.meta.url));
    writeFileSync(join(dir, 'gh'), `#!${process.execPath}
const path = process.argv.at(-1).replace('repos/im-tnyx/Tio-Money/', '');
const responses = JSON.parse(process.env.TEST_RESPONSES);
if (!Object.hasOwn(responses, path)) process.exit(1);
const value = responses[path];
process.stdout.write(JSON.stringify(process.argv.includes('--slurp') ? [value] : value));
`, { mode: 0o700 });
    for (const outcome of ['approved', 'skip', 'error']) {
      const f = fixture();
      if (outcome !== 'approved') f.pr.labels = [];
      if (outcome !== 'error') f.responses['pulls/97'] = f.pr;
      writeFileSync(eventFile, JSON.stringify(f.event));
      writeFileSync(output, '');
      const result = spawnSync(process.execPath, [script], { env: {
        PATH: dir + delimiter + process.env.PATH,
        GITHUB_EVENT_PATH: eventFile, GITHUB_OUTPUT: output,
        GITHUB_EVENT_NAME: 'workflow_run', GITHUB_REF: 'refs/heads/main', GITHUB_RUN_ATTEMPT: '1',
        TEST_RESPONSES: JSON.stringify(f.responses),
      } });
      assert.equal(result.status, outcome === 'error' ? 1 : 0, outcome);
      const actual = readFileSync(output, 'utf8');
      if (outcome === 'approved') assert.match(actual, /^approved=true\npr_number=97\n/);
      else assert.equal(actual, outcome === 'skip' ? 'approved=false\n' : '');
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

const denials = {
  'Dependabot PR': (f) => { f.pr.user = { login: 'dependabot[bot]', id: 123 }; },
  'labeled Dependabot push': asDependabotPush,
  'Dependabot push for another author': (f) => {
    asDependabotPush(f);
    f.pr.user = owner;
    f.pr.labels = [];
  },
  'unlabeled stale push': (f) => { f.pr.labels = []; f.pr.head.sha = base; },
  'unlabeled malformed PR': (f) => { f.pr.labels = []; f.pr.changed_files = null; },
  'malformed labels': (f) => { f.pr.labels = [{}]; },
  'malformed PR associations': (f) => { f.matches.push({ number: 98 }); },
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
