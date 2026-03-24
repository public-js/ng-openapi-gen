import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const allowedModes = new Set(['patch', 'minor', 'major', 'beta']);
const mode = process.argv[2];

if (!allowedModes.has(mode)) {
  console.error(`Unsupported release mode "${mode}". Use one of: ${[...allowedModes].join(', ')}`);
  process.exit(1);
}

const branch = process.env.GITHUB_REF_NAME ?? exec('git', ['rev-parse', '--abbrev-ref', 'HEAD']);

if (mode === 'beta' && branch !== 'beta') {
  console.error('The "beta" release mode is only allowed from the beta branch.');
  process.exit(1);
}

if (mode !== 'beta' && branch !== 'main') {
  console.error(`Stable releases must run from the main branch, received "${branch}".`);
  process.exit(1);
}

const currentVersion = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
const versionArgs = getVersionArgs(mode, currentVersion);

exec('npm', ['version', ...versionArgs, '--no-git-tag-version']);
exec('npx', ['conventional-changelog', '-p', 'conventionalcommits', '-i', 'CHANGELOG.md', '-s', '-r', '0']);

const nextVersion = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
console.log(nextVersion);

function getVersionArgs(releaseMode, version) {
  if (releaseMode !== 'beta') {
    return [releaseMode];
  }

  return version.includes('-rc.') ? ['prerelease', '--preid', 'rc'] : ['prepatch', '--preid', 'rc'];
}

function exec(command, args) {
  return execFileSync(command, args, {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'inherit'],
  }).trim();
}
