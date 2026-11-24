import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireImmutablePRChangedPaths } from './verify-pr-preview-pr-snapshot.mjs';

const repository = 'im-tnyx/Tio-Money';
const repositoryId = 1462654174;
const owner = 'im-tnyx';
const ownerId = 271889561;
const signalId = 424672623;
const signalPath = '.github/workflows/tio-money-preview-push-signal.yml';
const sha = /^[0-9a-f]{40}$/;
const positive = /^[1-9][0-9]*$/;
const allowed = /^(?:(?:src|assets|tests|docs|\.ai)\/.+|README\.md|DESIGN\.md|CHANGELOG\.md)$/;
const sameRepo = (repo) => repo?.id === repositoryId && repo.full_name === repository;
const isOwner = (user) => user?.id === ownerId && user.login === owner;

function requireCondition(condition, reason) {
  if (!condition) throw new Error(reason);
}

function requirePR(pr, number) {
  requireCondition(pr?.number === number && pr.state === 'open' && isOwner(pr.user) &&
    sameRepo(pr.head?.repo) && sameRepo(pr.base?.repo) && pr.base.ref === 'main' &&
    typeof pr.head.ref === 'string' && pr.head.ref && pr.head.ref !== 'main' &&
    sha.test(pr.head.sha) && sha.test(pr.base.sha) &&
    Array.isArray(pr.labels) && pr.labels.some((label) => label?.name === 'tio-preview'),
  'PR identity or label denied.');
}

export function authorizePreview(event, context, api, expected) {
  requireCondition(sameRepo(event?.repository) && isOwner(event.repository.owner) &&
    context.ref === 'refs/heads/main' && context.attempt === '1',
  'Repository, trusted ref or attempt denied.');

  let number;
  let pushed;
  if (context.event === 'workflow_dispatch') {
    requireCondition(isOwner(event.sender) && context.actor === owner &&
      context.triggeringActor === owner && event.inputs?.operation === 'codespaces_live' &&
      typeof event.inputs.pr_number === 'string' && positive.test(event.inputs.pr_number) && ['all', 'ios', 'android'].includes(event.inputs.platform),
    'Manual preview request denied.');
    number = Number(event.inputs.pr_number);
  } else {
    pushed = event.workflow_run;
    requireCondition(context.event === 'workflow_run' && event.action === 'completed' &&
      Number.isSafeInteger(pushed?.id) && pushed.id > 0, 'Preview event denied.');
    requireCondition(pushed.run_attempt === 1 && sameRepo(pushed.head_repository) &&
      isOwner(pushed.actor) && typeof pushed.head_branch === 'string' &&
      pushed.head_branch && pushed.head_branch !== 'main' && sha.test(pushed.head_sha),
    'Push signal metadata denied.');
    // The privileged runner reuses the immutable event already verified by the
    // eligibility job. Its own token needs only live PR, label and compare reads.
    if (!expected) {
      const run = api(`actions/runs/${pushed.id}`);
      requireCondition(run?.id === pushed.id && run.workflow_id === signalId && run.path === signalPath &&
        run.event === 'push' && run.status === 'completed' && run.conclusion === 'success' &&
        run.run_attempt === 1 && sameRepo(run.repository) && sameRepo(run.head_repository) &&
        isOwner(run.actor) && isOwner(run.triggering_actor) &&
        run.head_branch === pushed.head_branch && run.head_sha === pushed.head_sha,
      'Push signal identity, origin or attempt denied.');
    }
    const matches = api(`commits/${pushed.head_sha}/pulls?per_page=100`, true)
      .filter((pr) => pr.state === 'open');
    requireCondition(matches.length === 1, 'Expected exactly one open PR for the push SHA.');
    number = matches[0].number;
  }
  requireCondition(Number.isSafeInteger(number) && number > 0, 'Invalid PR number.');
  const captured = api(`pulls/${number}`);
  requirePR(captured, number);
  const { head, base } = captured;
  requireCondition(!pushed || (pushed.head_sha === head.sha && pushed.head_branch === head.ref), 'Stale push.');
  requireCondition(!expected || (expected.number === number && expected.head === head.sha &&
    expected.base === base.sha), 'Approved PR moved.');
  const compare = api(`compare/${base.sha}...${head.sha}?per_page=100`);
  requireCondition(sha.test(compare?.merge_base_commit?.sha) &&
    (!expected || expected.mergeBase === compare.merge_base_commit.sha), 'Merge base mismatch.');
  const active = api('issues?state=open&labels=tio-preview&per_page=100', true)
    .filter((issue) => issue.pull_request);
  requireCondition(active.length === 1 && active[0].number === number, 'Active preview is ambiguous or missing.');
  const current = api(`pulls/${number}`);
  requirePR(current, number);
  const paths = requireImmutablePRChangedPaths(captured, compare, current, head.sha, base.sha);
  requireCondition(paths.every((path) => allowed.test(path)), 'Disallowed preview path.');

  return { number, head: head.sha, base: base.sha, mergeBase: compare.merge_base_commit.sha, captured, compare };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const env = process.env;
    const expected = process.argv[2] === '--revalidate' ? {
      number: Number(env.APPROVED_PR), head: env.APPROVED_HEAD,
      base: env.APPROVED_BASE, mergeBase: env.APPROVED_MERGE_BASE,
    } : undefined;
    const api = (path, paginate) => {
      const args = paginate ? ['--paginate', '--slurp'] : [];
      const json = JSON.parse(execFileSync('gh', ['api', ...args, `repos/${repository}/${path}`], {
        encoding: 'utf8', timeout: 20_000, maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
      }));
      if (!paginate) return json;
      if (!Array.isArray(json) || json.length === 0 || !json.every(Array.isArray)) {
        throw new Error('Incomplete API pagination.');
      }
      return json.flat();
    };
    const result = authorizePreview(JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, 'utf8')), {
      event: env.GITHUB_EVENT_NAME, ref: env.GITHUB_REF, attempt: env.GITHUB_RUN_ATTEMPT,
      actor: env.GITHUB_ACTOR, triggeringActor: env.TRIGGERING_ACTOR,
    }, api, expected);
    if (expected) {
      writeFileSync(join(env.RUNNER_TEMP, 'preview-pr.json'), JSON.stringify(result.captured), { mode: 0o600 });
      writeFileSync(join(env.RUNNER_TEMP, 'immutable-pr-compare.json'), JSON.stringify(result.compare), { mode: 0o600 });
    }
    appendFileSync(env.GITHUB_OUTPUT, [
      'approved=true', `pr_number=${result.number}`, `head_sha=${result.head}`,
      `base_sha=${result.base}`, `merge_base=${result.mergeBase}`, '',
    ].join('\n'));
  } catch {
    console.error('::error::Codespaces preview authorization failed.');
    process.exitCode = 1;
  }
}
